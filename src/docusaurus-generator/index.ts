/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */

// ----------------------------------------------------------------------------

import assert from 'assert'
import * as fs from 'fs/promises'
import * as util from 'node:util'
import path from 'path'

import { AbstractCompoundDefType, CompoundDef } from '../doxygen-xml-parsers/compounddef-parser.js'
import { DoxygenData } from '../doxygen-xml-parsers/index.js'
import { DefVal } from '../doxygen-xml-parsers/linkedtexttype-parser.js'
import { RefText } from '../doxygen-xml-parsers/reftexttype-parser.js'
import { PluginOptions } from '../plugin/options.js'
import { SidebarItem } from '../plugin/types.js'
import { Classes } from './data-model/classes-dm.js'
import { Files } from './data-model/files-dm.js'
import { Folders } from './data-model/folders-dm.js'
import { Groups } from './data-model/groups-dm.js'
import { Namespaces } from './data-model/namespaces-dm.js'
import { DoxygenFileOptions } from './data-model/options.js'
import { Pages } from './data-model/pages-dm.js'
import { CodeLineTypeGenerator, DescriptionTypeGenerator, DocAnchorTypeGenerator, DocEmptyTypeGenerator, DocMarkupTypeGenerator, DocParamListTypegenerator, DocParaTypeGenerator, DocRefTextTypeGenerator, DocSimpleSectTypeGenerator, DocURLLinkGenerator, HighlightTypeGenerator, ListingTypeGenerator, SpTypeGenerator } from './elements-generators/descriptiontype.js'
import { DocS1TypeGenerator, DocS2TypeGenerator, DocS3TypeGenerator, DocS4TypeGenerator, DocS5TypeGenerator, DocS6TypeGenerator } from './elements-generators/docinternalstype.js'
import { DocListTypeGenerator } from './elements-generators/doclisttype.js'
import { DocTitleTypeGenerator } from './elements-generators/doctitletype.js'
import { DocVariableListTypeGenerator, VariableListPairGenerator } from './elements-generators/docvariablelisttype.js'
import { DocXRefSectType } from './elements-generators/docxrefsecttype.js'
import { ElementGeneratorBase } from './elements-generators/element-generator-base.js'
import { IncTypeGenerator } from './elements-generators/inctype.js'
import { LinkedTextTypeGenerator } from './elements-generators/linkedtexttype.js'
import { ParamTypeGenerator } from './elements-generators/paramtype.js'
import { RefTextTypeGenerator } from './elements-generators/reftexttype.js'
import { RefTypeGenerator } from './elements-generators/reftype.js'
import { PageGeneratorBase as GeneratorBase } from './pages-generators/base.js'
import { ClassPageGenerator } from './pages-generators/class.js'
import { FileGenerator } from './pages-generators/file.js'
import { FolderGenerator } from './pages-generators/folder.js'
import { GroupGenerator } from './pages-generators/group.js'
import { NamespaceGenerator } from './pages-generators/namespace.js'
import { PageGenerator } from './pages-generators/page.js'
import { Sidebar } from './sidebar.js'
import { FrontMatter } from './types.js'
import { escapeHtml } from './utils.js'
import { DataModelBase } from './data-model/base-dm.js'
import { AbstractRefType } from '../doxygen-xml-parsers/reftype-parser.js'
import { AbstractMemberDefType, MemberDef } from '../doxygen-xml-parsers/memberdeftype-parser.js'
import { SectionDef } from '../doxygen-xml-parsers/sectiondeftype-parser.js'

// ----------------------------------------------------------------------------

export class DocusaurusGenerator {
  // The data parsed from the Doxygen XML files.
  doxygenData: DoxygenData
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  doxygenOptions: DoxygenFileOptions

  // A map of compound definitions, indexed by their id.
  compoundDefsById: Map<string, AbstractCompoundDefType> = new Map()

  memberDefsById: Map<string, AbstractMemberDefType> = new Map()

  dataObjectsById: Map<string, DataModelBase> = new Map()

  groups: Groups
  namespaces: Namespaces
  folders: Folders
  files: Files
  classes: Classes
  pages: Pages

  // kind: DoxCompoundKind
  permalinkPrefixesByKind: { [key: string]: string } = {
    class: 'classes',
    struct: 'structs',
    union: 'unions',
    interface: 'interfaces',
    protocol: 'protocols',
    category: 'categories',
    exception: 'exceptions',
    service: 'services',
    singleton: 'singletons',
    module: 'modules',
    type: 'types',
    file: 'files',
    namespace: 'namespaces',
    group: 'groups',
    page: 'pages',
    example: 'examples',
    dir: 'folders',
    concept: 'concepts'
  }

  pageGenerators: Map<string, GeneratorBase> = new Map()

  elementGenerators: Map<string, ElementGeneratorBase> = new Map()

  currentCompoundDef: CompoundDef | undefined

  componentNames: string[]

  // --------------------------------------------------------------------------

  constructor ({
    doxygenData, pluginOptions
  }: {
    doxygenData: DoxygenData
    pluginOptions: PluginOptions
  }) {
    // console.log('DocusaurusGenerator.constructor()')
    this.doxygenData = doxygenData
    this.pluginOptions = pluginOptions

    // Create the data-model objects.
    this.groups = new Groups(this.doxygenData.compoundDefs)
    this.namespaces = new Namespaces(this.doxygenData.compoundDefs)
    this.folders = new Folders(this.doxygenData.compoundDefs)
    this.files = new Files(this.doxygenData.compoundDefs, this.folders)
    this.classes = new Classes(this.doxygenData.compoundDefs)
    this.pages = new Pages(this.doxygenData.compoundDefs)

    this.doxygenOptions = new DoxygenFileOptions(this.doxygenData.doxyfile.options)

    // Add generators for the top pages, grouped by 'kind'.
    this.pageGenerators.set('group', new GroupGenerator(this))
    this.pageGenerators.set('namespace', new NamespaceGenerator(this))
    this.pageGenerators.set('class', new ClassPageGenerator(this))
    this.pageGenerators.set('struct', new ClassPageGenerator(this))
    const fileGenerator = new FileGenerator(this)
    this.pageGenerators.set('file', fileGenerator)
    const folderGenerator = new FolderGenerator(this)
    folderGenerator.fileGenerator = fileGenerator
    this.pageGenerators.set('dir', folderGenerator)
    this.pageGenerators.set('page', new PageGenerator(this))

    // Add generators for the parsed xml elements (in alphabetical order).
    this.elementGenerators.set('AbstractCodeLineType', new CodeLineTypeGenerator(this))
    this.elementGenerators.set('AbstractDescriptionType', new DescriptionTypeGenerator(this))
    this.elementGenerators.set('AbstractDocAnchorType', new DocAnchorTypeGenerator(this))
    this.elementGenerators.set('AbstractDocEmptyType', new DocEmptyTypeGenerator(this))
    this.elementGenerators.set('AbstractDocListType', new DocListTypeGenerator(this))
    this.elementGenerators.set('AbstractDocMarkupType', new DocMarkupTypeGenerator(this))
    this.elementGenerators.set('AbstractDocParamListType', new DocParamListTypegenerator(this))
    this.elementGenerators.set('AbstractDocParaType', new DocParaTypeGenerator(this))
    this.elementGenerators.set('AbstractDocRefTextType', new DocRefTextTypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect1Type', new DocS1TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect2Type', new DocS2TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect3Type', new DocS3TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect4Type', new DocS4TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect5Type', new DocS5TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSect6Type', new DocS6TypeGenerator(this))
    this.elementGenerators.set('AbstractDocSimpleSectType', new DocSimpleSectTypeGenerator(this))
    this.elementGenerators.set('AbstractDocTitleType', new DocTitleTypeGenerator(this))
    this.elementGenerators.set('AbstractDocVariableListType', new DocVariableListTypeGenerator(this))
    this.elementGenerators.set('AbstractDocURLLink', new DocURLLinkGenerator(this))
    this.elementGenerators.set('AbstractDocXRefSectType', new DocXRefSectType(this))
    this.elementGenerators.set('AbstractHighlightType', new HighlightTypeGenerator(this))
    this.elementGenerators.set('AbstractIncType', new IncTypeGenerator(this))
    this.elementGenerators.set('AbstractLinkedTextType', new LinkedTextTypeGenerator(this))
    this.elementGenerators.set('AbstractListingType', new ListingTypeGenerator(this))
    this.elementGenerators.set('AbstractParamType', new ParamTypeGenerator(this))
    this.elementGenerators.set('AbstractProgramListingType', new ListingTypeGenerator(this))
    this.elementGenerators.set('AbstractRefTextType', new RefTextTypeGenerator(this))
    this.elementGenerators.set('AbstractRefType', new RefTypeGenerator(this))
    this.elementGenerators.set('AbstractSpType', new SpTypeGenerator(this))
    this.elementGenerators.set('VariableListPair', new VariableListPairGenerator(this))

    // Plugin defined components (in alphabetical order).
    this.componentNames = [
      'CodeLine',
      'DoxygenPage',
      'GeneratedByDoxygen',
      'Highlight',
      'IncludesList',
      'IncludesListItem',
      'MemberDefinition',
      'MembersList',
      'MembersListItem',
      'ParametersList',
      'ParametersListItem',
      'ProgramListing',
      'SectionDefinition',
      'SectionUser',
      'TreeTable',
      'TreeTableRow',
      'XrefSect'
    ]
  }

  async generate (): Promise<void> {
    this.createCompoundDefsMap()
    this.createMemberDefsMap()
    this.createDataObjectsMaps()
    this.validatePermalinks()

    await this.prepareOutputFolder()
    await this.generatePages()
    await this.writeSidebar()
  }

  // --------------------------------------------------------------------------

  /**
   * @brief Create a map of all compoundDefs, by id.
   */
  createCompoundDefsMap (): void {
    // console.log('DocusaurusGenerator.createCompoundDefsMap()')
    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.id)
      this.compoundDefsById.set(compoundDef.id, compoundDef)
    }
    console.log(this.compoundDefsById.size, 'compound definitions')
  }

  createMemberDefsMap (): void {
    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.id)
      if (compoundDef.sectionDefs !== undefined) {
        for (const sectionDef of compoundDef.sectionDefs) {
          if (sectionDef.memberDefs !== undefined) {
            for (const memberDef of sectionDef.memberDefs) {
              this.memberDefsById.set(memberDef.id, memberDef)
            }
          }
        }
      }
      console.log(this.memberDefsById.size, 'member definitions')
    }
  }

  createDataObjectsMaps (): void {
    for (const name of ['groups', 'namespaces', 'folders', 'files', 'classes', 'pages']) {
      for (const [id, object] of (this as any)[name].membersById) {
        this.dataObjectsById.set(id, object)
      }
    }
    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.id)
      if (!this.dataObjectsById.has(compoundDef.id)) {
        console.error('compoundDef', compoundDef.id, 'not yet processed in', this.constructor.name, 'createDataObjectsMaps')
      }
    }
  }

  /**
   * @brief Validate the uniqueness of permalinks.
   */
  validatePermalinks (): void {
    assert(this.pluginOptions.outputFolderPath)
    // const outputFolderPath = this.options.outputFolderPath

    const pagePermalinksById: Map<string, string> = new Map()
    const pagePermalinksSet: Set<string> = new Set()

    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName)

      const dataObject: DataModelBase | undefined = this.dataObjectsById.get(compoundDef.id)
      if (dataObject === undefined) {
        console.error('compoundDef', compoundDef.id, 'not yet processed in', this.constructor.name, 'validatePermalinks')
        continue
      }

      const permalink = dataObject.relativePermalink
      assert(permalink !== undefined)
      // console.log('permalink:', permalink)

      if (pagePermalinksById.has(compoundDef.id)) {
        console.error('Permalink clash for id', compoundDef.id)
      }
      if (pagePermalinksSet.has(permalink)) {
        console.error('Permalink clash for permalink', permalink, 'id:', compoundDef.id)
      }
      pagePermalinksById.set(compoundDef.id, permalink)
      pagePermalinksSet.add(permalink)
    }
  }

  async writeSidebar (): Promise<void> {
    const sidebar = new Sidebar(this)

    const sidebarItems: SidebarItem[] = sidebar.createItems()
    // console.log('sidebarItems:', util.inspect(sidebarItems, { compact: false, depth: 999 }))
    const jsonString = JSON.stringify(sidebarItems, null, 2)

    assert(this.pluginOptions.outputFolderPath)
    assert(this.pluginOptions.sidebarFileName)
    const filePath = path.join(this.pluginOptions.outputFolderPath, this.pluginOptions.sidebarFileName)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(this.pluginOptions.outputFolderPath), { recursive: true })

    console.log(`Writing sidebar file ${filePath as string}...`)
    await fs.writeFile(filePath, jsonString, 'utf8')
  }

  // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  async prepareOutputFolder (): Promise<void> {
    assert(this.pluginOptions.outputFolderPath)
    const outputFolderPath = this.pluginOptions.outputFolderPath
    try {
      await fs.access(outputFolderPath)
      // Remove the folder if it exist.
      console.log(`Removing existing folder ${outputFolderPath}...`)
      await fs.rm(outputFolderPath, { recursive: true, force: true })
    } catch (err) {
      // The folder does not exist, nothing to do.
    }
    // Create the folder as empty.
    await fs.mkdir(outputFolderPath, { recursive: true })
  }

  // https://nodejs.org/en/learn/manipulating-files/working-with-file-descriptors-in-nodejs
  async generatePages (): Promise<void> {
    // console.log('DocusaurusGenerator.generatePages()')
    console.log('Generating Docusaurus pages (object -> url)...')

    assert(this.pluginOptions.outputFolderPath)
    const outputFolderPath = this.pluginOptions.outputFolderPath

    for (const compoundDef of this.doxygenData.compoundDefs) {
      if (compoundDef.kind === 'page' && compoundDef.id === 'indexpage') {
        // This is the @mainpage. We diverge from Doxygen and generate
        // the API main page differently, with the list of topics and
        // this page detailed description. Therefore it is not generated
        // as a regular page and must be skipped at this stage.
        continue
      }

      this.currentCompoundDef = compoundDef

      const dataObject: DataModelBase | undefined = this.dataObjectsById.get(compoundDef.id)
      assert(dataObject !== undefined)

      const permalink = dataObject.relativePermalink
      assert(permalink !== undefined)
      console.log(`${compoundDef.kind}: ${compoundDef.compoundName.replaceAll(/[ ]*/g, '') as string}`, '->', `${outputFolderPath}/${permalink}...`)

      const docusaurusId = this.dataObjectsById.get(compoundDef.id)?.docusaurusId
      assert(docusaurusId !== undefined)

      const fileName = `${docusaurusId}.mdx`
      // console.log('fileName:', fileName)
      const filePath = `${outputFolderPath}/${fileName}`

      const frontMatter: FrontMatter = {
        title: `${dataObject.pageTitle ?? compoundDef.compoundName}`,
        slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'reference', `${compoundDef.kind}`]
      }

      let bodyText = `TODO ${compoundDef.compoundName}\n`
      const docusaurusGenerator = this.pageGenerators.get(compoundDef.kind)
      if (docusaurusGenerator !== undefined) {
        bodyText = await docusaurusGenerator.renderMdx(compoundDef, frontMatter)
      } else {
        // console.error(util.inspect(compoundDef, { compact: false, depth: 999 }))
        console.error('page generator for', compoundDef.kind, 'not implemented yet in', this.constructor.name, 'generatePages')
        // TODO: enable it after implementing folders & files
        // continue
      }

      await this.writeFile({
        filePath,
        frontMatter,
        bodyText
      })

      this.currentCompoundDef = undefined
    }

    {
      // Home page for the API reference.
      // It diverts from Doxygen, since it renders the list of topics and
      // the main page.
      const filePath = `${outputFolderPath}/index.mdx`

      const projectBrief = this.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
      const permalink = '' // The root of the API sub-site.

      const frontMatter: FrontMatter = {
        title: `${projectBrief} API Reference`,
        slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'reference']
      }

      const docusaurusGenerator = this.pageGenerators.get('group')
      assert(docusaurusGenerator !== undefined)
      const bodyText = await docusaurusGenerator.renderIndexMdx()

      await this.writeFile({
        filePath,
        frontMatter,
        bodyText
      })
    }

    {
      const filePath = `${outputFolderPath}/namespaces/index.mdx`
      const permalink = 'namespaces'

      const frontMatter: FrontMatter = {
        title: 'The Namespaces Reference',
        slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'namespaces', 'reference']
      }

      const docusaurusGenerator = this.pageGenerators.get('namespace')
      assert(docusaurusGenerator !== undefined)
      const bodyText = await docusaurusGenerator.renderIndexMdx()

      await this.writeFile({
        filePath,
        frontMatter,
        bodyText
      })
    }

    {
      const filePath = `${outputFolderPath}/classes/index.mdx`
      const permalink = 'classes'

      const frontMatter: FrontMatter = {
        title: 'The Classes Reference',
        slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'reference']
      }

      const docusaurusGenerator = this.pageGenerators.get('class')
      assert(docusaurusGenerator !== undefined)
      const bodyText = await docusaurusGenerator.renderIndexMdx()

      await this.writeFile({
        filePath,
        frontMatter,
        bodyText
      })
    }

    {
      const filePath = `${outputFolderPath}/folders/index.mdx`
      const permalink = 'folders'

      const frontMatter: FrontMatter = {
        title: 'The Folders & Files Reference',
        slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'folders', 'reference']
      }

      const docusaurusGenerator = this.pageGenerators.get('dir')
      assert(docusaurusGenerator !== undefined)
      const bodyText = await docusaurusGenerator.renderIndexMdx()

      await this.writeFile({
        filePath,
        frontMatter,
        bodyText
      })
    }
  }

  async writeFile ({
    filePath,
    bodyText,
    frontMatter
  }: {
    filePath: string
    bodyText: string
    frontMatter: FrontMatter
  }): Promise<void> {
    let text = ''
    text += `<DoxygenPage version="${this.doxygenData.doxygenindex.version}">\n`
    text += '\n'
    const trimmedBodyText = bodyText.trim()
    text += trimmedBodyText
    text += '\n'

    text += '\n'
    text += '</DoxygenPage>\n'

    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    let frontMatterText = ''
    frontMatterText += '---\n'
    frontMatterText += '\n'
    frontMatterText += '# DO NOT EDIT!\n'
    frontMatterText += '# Automatically generated via docusaurus-plugin-doxygen by Doxygen.\n'
    frontMatterText += '\n'
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterText += `${key}:\n`
        for (const arrayValue of frontMatter[key] as string[]) {
          frontMatterText += `  - ${arrayValue}\n`
        }
      } else if (typeof value === 'boolean') {
        frontMatterText += `${key}: ${value ? 'true' : 'false'}\n`
      } else {
        frontMatterText += `${key}: ${value}\n`
      }
    }
    frontMatterText += '\n'

    // Skip date, to avoid unnecessary git commits.
    // frontMatterText += `date: ${formatDate(new Date())}\n`
    // frontMatterText += '\n'
    frontMatterText += '---\n'
    frontMatterText += '\n'

    if (text.includes('<Link')) {
      frontMatterText += 'import Link from \'@docusaurus/Link\'\n'
    }

    // Theme components.
    if (text.includes('<CodeBlock')) {
      frontMatterText += 'import CodeBlock from \'@theme/CodeBlock\'\n'
    }
    if (text.includes('<Admonition')) {
      frontMatterText += 'import Admonition from \'@theme/Admonition\'\n'
    }

    // Add includes for the plugin components.
    for (const componentName of this.componentNames) {
      if (text.includes(`<${componentName}`)) {
        frontMatterText += `import ${componentName} from '@xpack/docusaurus-plugin-doxygen/components/${componentName}'\n`
      }
    }

    frontMatterText += '\n'

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(frontMatterText)
    await fileHandle.write(text)

    await fileHandle.close()
  }

  getPagePermalink (refid: string): string {
    const dataObject: DataModelBase | undefined = this.dataObjectsById.get(refid)
    assert(dataObject !== undefined)

    const pagePermalink = dataObject.relativePermalink
    if (pagePermalink === undefined) {
      console.error('refid', refid, 'has no permalink')
    }

    assert(pagePermalink !== undefined)
    return `/${this.pluginOptions.outputFolderPath}/${pagePermalink}`
  }

  getPermalink ({
    refid,
    kindref
  }: {
    refid: string
    kindref: string
  }): string {
    // console.log(refid, kindref)
    let permalink: string | undefined
    if (kindref === 'compound') {
      permalink = this.getPagePermalink(refid)
    } else if (kindref === 'member') {
      const compoundId = this.stripPermalinkAnchor(refid)
      // console.log('compoundId:', compoundId)
      if (compoundId === this.currentCompoundDef?.id) {
        permalink = `#${this.getPermalinkAnchor(refid)}`
      } else {
        permalink = `${this.getPagePermalink(compoundId)}#${this.getPermalinkAnchor(refid)}`
      }
    } else {
      console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink')
    }

    assert(permalink !== undefined && permalink.length > 1)
    return permalink
  }

  stripPermalinkAnchor (refid: string): string {
    // No idea why g is also used.
    return refid.replace(/_1[0-9a-fg]*$/, '')
  }

  getPermalinkAnchor (refid: string): string {
    return refid.replace(/^.*_1/, '')
  }

  getXrefPermalink (id: string): string {
    return `/${this.pluginOptions.outputFolderPath}/pages/${id.replace(/_1.*/, '')}/#${id.replace(/.*_1/, '')}`
  }

  getElementRenderer (element: Object): ElementGeneratorBase | undefined {
    let elementClass = element.constructor
    while (elementClass.name !== '') {
      const elementGenerator = this.elementGenerators.get(elementClass.name)
      if (elementGenerator !== undefined) {
        return elementGenerator
      }
      elementClass = Object.getPrototypeOf(elementClass)
    }

    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error('no element generator for', element.constructor.name, 'in', this.constructor.name, 'getElementRenderer')
    return undefined
  }

  renderElementMdx (element: Object | undefined): string {
    if (element === undefined) {
      return ''
    }

    if (typeof element === 'string') {
      return escapeHtml(element)
    }

    if (Array.isArray(element)) {
      let result = ''
      for (const elementOfArray of element) {
        result += this.renderElementMdx(elementOfArray)
      }
      return result
    }

    const renderer: ElementGeneratorBase | undefined = this.getElementRenderer(element)
    if (renderer === undefined) {
      // The error was displayed in getElementRenderer().
      return ''
    }

    return renderer.renderMdx(element)
  }

  renderElementsMdx (elements: Object[] | undefined): string {
    if (elements === undefined) {
      return ''
    }

    let result = ''
    for (const element of elements) {
      result += this.renderElementMdx(element)
    }

    return result
  }

  /**
   * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
   * @param compoundDef
   * @returns
   */
  collectTemplateParameters ({
    compoundDef,
    withDefaults = false
  }: {
    compoundDef: CompoundDef
    withDefaults?: boolean
  }): string[] {
    if (compoundDef.templateParamList?.params === undefined) {
      return []
    }

    const templateParameters: string[] = []

    for (const param of compoundDef.templateParamList.params) {
      // console.log(util.inspect(param, { compact: false, depth: 999 }))
      assert(param.type !== undefined)
      assert(param.type.children.length === 1)
      assert(typeof param.type.children[0] === 'string')

      let paramString = ''

      if (typeof param.type.children[0] === 'string') {
        paramString += param.type.children[0]
      } else if (param.type.children[0] as object instanceof RefText) {
        paramString += (param.type.children[0] as RefText).text
      }
      if (param.declname !== undefined) {
        paramString += ` ${param.declname}`
      }

      if (withDefaults) {
        if (param.defval !== undefined) {
          const defval: DefVal = param.defval
          assert(defval.children.length === 1)
          if (typeof defval.children[0] === 'string') {
            paramString += ` = ${defval.children[0]}`
          } else if (defval.children[0] as object instanceof RefText) {
            paramString += ` = ${(defval.children[0] as RefText).text}`
          }
        }
      }

      templateParameters.push(paramString)
    }

    return templateParameters
  }

  collectTemplateParameterNames (compoundDef: CompoundDef): string[] {
    if (compoundDef.templateParamList?.params === undefined) {
      return []
    }

    const templateParameterNames: string[] = []

    for (const param of compoundDef.templateParamList.params) {
      // console.log(util.inspect(param, { compact: false, depth: 999 }))
      assert(param.type !== undefined)
      assert(param.type.children.length === 1)
      assert(typeof param.type.children[0] === 'string')
      let paramName = ''
      let paramString = ''

      // declname or defname?
      if (param.declname !== undefined) {
        paramString = param.declname
      } else if (typeof param.type.children[0] === 'string') {
        // Extract the parameter name, passed as `class T`.
        paramString = param.type.children[0]
      } else if (param.type.children[0] as object instanceof RefText) {
        paramString = (param.type.children[0] as RefText).text
      }
      paramName = paramString.replace(/class /, '')
      templateParameterNames.push(paramName)
    }
    return templateParameterNames
  }

  renderTemplateParametersMdx ({
    compoundDef,
    withDefaults = false
  }: {
    compoundDef: CompoundDef
    withDefaults?: boolean
  }): string {
    let result = ''

    if (compoundDef.templateParamList?.params !== undefined) {
      const templateParameters: string[] = this.collectTemplateParameters({ compoundDef, withDefaults })
      if (templateParameters.length > 0) {
        result += `&lt; ${templateParameters.join(', ')} &gt;`
      }
    }
    return result
  }

  renderTemplateParameterNamesMdx (compoundDef: CompoundDef): string {
    let result = ''

    if (compoundDef.templateParamList?.params !== undefined) {
      const templateParameterNames: string[] = this.collectTemplateParameterNames(compoundDef)
      if (templateParameterNames.length > 0) {
        result += `&lt; ${templateParameterNames.join(', ')} &gt;`
      }
    }
    return result
  }

  renderBriefDescriptionMdx (compoundDef: CompoundDef): string {
    let result: string = ''
    const briefDescription: string = this.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      result += '\n'
      result += briefDescription
      result += ' <a href="#details">More...</a>\n'
    }
    return result
  }

  renderDetailedDescriptionMdx ({
    compoundDef,
    todo,
    showHeader = true
  }: {
    compoundDef: CompoundDef
    todo: string
    showHeader?: boolean
  }): string {
    let result: string = ''

    if (showHeader) {
      result += '\n'
      result += '## Description {#details}\n'
    }

    // Deviate from Doxygen and do not repeat the brief in the detailed section.
    // console.log(util.inspect(compoundDef.detailedDescription, { compact: false, depth: 999 }))
    result += '\n'
    const detailedDescription: string = this.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0) {
      result += detailedDescription
      result += '\n'
    } else {
      result += `TODO: add <code>@details</code> to <code>${todo}</code>`
      result += '\n'
    }
    return result
  }

  // --------------------------------------------------------------------------

  renderInnerIndicesMdx ({
    compoundDef,
    suffixes
  }: {
    compoundDef: CompoundDef
    suffixes: string[]
  }): string {
    let result: string = ''

    for (const innerKey of Object.keys(compoundDef)) {
      if (innerKey.startsWith('inner')) {
        const suffix = innerKey.substring(5)
        if (!suffixes.includes(suffix)) {
          console.warn(innerKey, 'not processed for', compoundDef.compoundName, 'in renderInnerIndicesMdx')
          continue
        }
      }
    }

    for (const suffix of suffixes) {
      const innerKey = `inner${suffix}`
      const innerObjects = (compoundDef as any)[innerKey] as AbstractRefType[]

      if (innerObjects !== undefined && innerObjects.length > 0) {
        result += '\n'
        result += `## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index`

        result += '\n'
        result += '<MembersList>\n'

        for (const innerObject of innerObjects) {
          // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
          const innerDataObject = this.dataObjectsById.get(innerObject.refid)
          assert(innerDataObject !== undefined)

          const innerCompoundDef = innerDataObject.compoundDef
          assert(innerCompoundDef !== undefined)

          const permalink = this.getPagePermalink(innerObject.refid)

          const kind = innerCompoundDef.kind

          const itemLeft = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind)
          const itemRight = `<Link to="${permalink}">${escapeHtml(innerDataObject.indexName)}</Link>`

          result += '\n'
          result += `<MembersListItem itemLeft="${itemLeft}" itemRight={${itemRight}}>\n`

          const briefDescription: string = this.renderElementMdx(innerCompoundDef.briefDescription).trim()
          if (briefDescription.length > 0) {
            result += briefDescription
            if (!['Namespaces', 'Dirs', 'Files'].includes(suffix)) {
              result += ` <Link to="${permalink}#details">`
              result += 'More...'
              result += '</Link>'
            }
            result += '\n'
          }
          result += '</MembersListItem>\n'
        }

        result += '\n'
        result += '</MembersList>\n'
      }
    }

    return result
  }

  renderSectionDefIndicesMdx (compoundDef: CompoundDef): string {
    let result: string = ''

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += this.renderSectionDefIndexMdx({
          sectionDef,
          compoundDef
        })
      }
    }

    return result
  }

  renderSectionDefIndexMdx ({
    sectionDef,
    compoundDef
  }: {
    sectionDef: SectionDef
    compoundDef: CompoundDef
  }): string {
    let result = ''

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs !== undefined) {
      result += '\n'
      result += `## ${escapeHtml(header)} Index\n`

      result += '\n'
      result += '<MembersList>\n'

      const memberDefs = sectionDef.memberDefs

      for (const memberDef of memberDefs) {
        result += this.renderMemberDefIndexMdx({ memberDef, sectionDef, compoundDef })
      }

      result += '\n'
      result += '</MembersList>\n'

      if (sectionDef.members !== undefined) {
        console.warn(sectionDef.constructor.name, 'members after memberDefs? in', this.constructor.name, 'renderSectionDefIndexMdx')
      }
    } else if (sectionDef.members !== undefined) {
      result += '\n'
      result += `## ${escapeHtml(header)}\n`

      result += '\n'
      result += '<MembersList>\n'

      for (const member of sectionDef.members) {
        const memberDef = this.memberDefsById.get(member.refid)
        assert(memberDef !== undefined)

        result += this.renderMemberDefIndexMdx({ memberDef, sectionDef, compoundDef })
      }

      result += '\n'
      result += '</MembersList>\n'
    }
    return result
  }

  renderMemberDefIndexMdx ({
    memberDef,
    sectionDef,
    compoundDef
  }: {
    memberDef: MemberDef
    sectionDef: SectionDef
    compoundDef: CompoundDef
  }): string {
    let result = ''

    const morePermalink = this.getPermalinkAnchor(memberDef.id)
    assert(morePermalink !== undefined && morePermalink.length > 1)

    const name = escapeHtml(memberDef.name)
    let itemLeft = ''
    let itemRight = `<Link to="#${morePermalink}">${name}</Link>`

    switch (memberDef.kind) {
      case 'typedef':
        itemLeft = 'using'
        if (memberDef.type !== undefined) {
          itemRight += ' = '
          itemRight += this.renderElementMdx(memberDef.type).trim()
        }
        break

      case 'function':
        itemLeft = this.renderElementMdx(memberDef.type).trim()
        if (memberDef.argsstring !== undefined) {
          itemRight += ' '
          itemRight += escapeHtml(memberDef.argsstring)
        }
        break

      case 'variable':
        itemLeft = this.renderElementMdx(memberDef.type).trim()
        break

      case 'enum':
        itemLeft = this.renderElementMdx(memberDef.type).trim()
        break

      default:
        console.error('member kind', memberDef.kind, 'not implemented yet in', this.constructor.name, 'renderMethodDefIndexMdx')
    }

    result += '\n'
    if (itemLeft.length > 0) {
      if (itemLeft.includes('<') || itemLeft.includes('&')) {
        result += `<MembersListItem itemLeft={<>${itemLeft}</>} itemRight={<>${itemRight}</>}>\n`
      } else {
        result += `<MembersListItem itemLeft="${itemLeft}" itemRight={<>${itemRight}</>}>\n`
      }
    } else {
      result += `<MembersListItem itemLeft="&nbsp;" itemRight={<>${itemRight}</>}>\n`
    }

    const briefDescription: string = this.renderElementMdx(memberDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      // Not really needed, there is no details section, displayed for consistency.
      result += ` <Link to="#${morePermalink}">`
      result += 'More...'
      result += '</Link>'
      result += '\n'
    }

    result += '</MembersListItem>\n'

    return result
  }

  // --------------------------------------------------------------------------

  // <xsd:simpleType name="DoxSectionKind">
  //   <xsd:restriction base="xsd:string">
  //     <xsd:enumeration value="user-defined" />
  //     <xsd:enumeration value="public-type" />
  //     <xsd:enumeration value="public-func" />
  //     <xsd:enumeration value="public-attrib" />
  //     <xsd:enumeration value="public-slot" />
  //     <xsd:enumeration value="signal" />
  //     <xsd:enumeration value="dcop-func" />
  //     <xsd:enumeration value="property" />
  //     <xsd:enumeration value="event" />
  //     <xsd:enumeration value="public-static-func" />
  //     <xsd:enumeration value="public-static-attrib" />
  //     <xsd:enumeration value="protected-type" />
  //     <xsd:enumeration value="protected-func" />
  //     <xsd:enumeration value="protected-attrib" />
  //     <xsd:enumeration value="protected-slot" />
  //     <xsd:enumeration value="protected-static-func" />
  //     <xsd:enumeration value="protected-static-attrib" />
  //     <xsd:enumeration value="package-type" />
  //     <xsd:enumeration value="package-func" />
  //     <xsd:enumeration value="package-attrib" />
  //     <xsd:enumeration value="package-static-func" />
  //     <xsd:enumeration value="package-static-attrib" />
  //     <xsd:enumeration value="private-type" />
  //     <xsd:enumeration value="private-func" />
  //     <xsd:enumeration value="private-attrib" />
  //     <xsd:enumeration value="private-slot" />
  //     <xsd:enumeration value="private-static-func" />
  //     <xsd:enumeration value="private-static-attrib" />
  //     <xsd:enumeration value="friend" />
  //     <xsd:enumeration value="related" />
  //     <xsd:enumeration value="define" />
  //     <xsd:enumeration value="prototype" />
  //     <xsd:enumeration value="typedef" />
  //     <xsd:enumeration value="enum" />
  //     <xsd:enumeration value="func" />
  //     <xsd:enumeration value="var" />
  //   </xsd:restriction>
  // </xsd:simpleType>

  getHeaderByKind (sectionDef: SectionDef): string {
    const headersByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Member Typedefs',
      'public-func': 'Member Functions',
      'public-attrib': 'Member Attributes',
      // 'public-slot': 'Member ?',
      'public-static-func': 'Static Functions',
      'public-static-attrib': 'Static Attributes',

      // 'signal': '',
      // 'dcop-func': '',
      // 'property': '',
      // 'event': '',

      'package-type': 'Package Member Typedefs',
      'package-func': 'Package Member Functions',
      'package-attrib': 'Package Member Attributes',
      'package-static-func': 'Package Static Functions',
      'package-static-attrib': 'Package Static Attributes',

      'protected-type': 'Protected Member Typedefs',
      'protected-func': 'Protected Member Functions',
      'protected-attrib': 'Protected Member Attributes',
      // 'protected-slot': 'Protected ?',
      'protected-static-func': 'Protected Static Functions',
      'protected-static-attrib': 'Protected Static Attributes',

      'private-type': 'Private Member Typedefs',
      'private-func': 'Private Member Functions',
      'private-attrib': 'Private Member Attributes',
      // 'private-slot': 'Private ?',
      'private-static-func': 'Private Static Functions',
      'private-static-attrib': 'Private Static Attributes',

      // 'friend': '',
      // 'related': '',
      // 'define': '',
      // 'prototype': '',

      typedef: 'Typedefs',
      enum: 'Enumerations',
      func: 'Functions',
      var: 'Variables'

    }

    const header = headersByKind[sectionDef.kind]
    if (header === undefined) {
      console.error(sectionDef, { compact: false, depth: 999 })
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name, 'getHeaderByKind')
      return ''
    }

    return header.trim()
  }

  // --------------------------------------------------------------------------

  renderIncludesIndexMdx (compoundDef: CompoundDef): string {
    let result: string = ''

    if (compoundDef.includes !== undefined) {
      result += '\n'
      result += '## Included Headers\n'

      result += '\n'
      result += '<IncludesList>\n'
      for (const include of compoundDef.includes) {
        result += this.renderElementMdx(include)
      }
      result += '</IncludesList>\n'
    }

    return result
  }

  renderClassIndexMdx (compoundDef: CompoundDef): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))
    let result: string = ''

    const classs = this.classes.membersById.get(compoundDef.id)
    assert(classs !== undefined)

    const permalink = this.getPagePermalink(compoundDef.id)

    const itemLeft = compoundDef.kind
    const itemRight = `<Link to="${permalink}">${escapeHtml(classs.indexName)}</Link>`

    result += '\n'
    result += `<MembersListItem itemLeft="${itemLeft}" itemRight={${itemRight}}>\n`

    const briefDescription: string = this.renderElementMdx(compoundDef.briefDescription).trim()
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ` <Link to="${permalink}#details">`
      result += 'More...'
      result += '</Link>\n'
    }
    result += '</MembersListItem>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
