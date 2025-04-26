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
import path from 'path'
import * as util from 'node:util'

import { AbstractCompoundDefType, CompoundDef } from '../doxygen-xml-parser/compounddef.js'
import { DoxygenData } from '../doxygen-xml-parser/index.js'
import { PluginOptions } from '../plugin/options.js'
import { SidebarItem } from '../plugin/types.js'
import { Classes } from './data-model/classes.js'
import { Files } from './data-model/files.js'
import { Folders } from './data-model/folders.js'
import { Groups } from './data-model/groups.js'
import { Namespaces } from './data-model/namespaces.js'
import { DoxygenFileOptions } from './data-model/options.js'
import { CodeLineTypeGenerator, DescriptionTypeGenerator, DocAnchorTypeGenerator, DocEmptyTypeGenerator, DocMarkupTypeGenerator, DocParamListTypegenerator, DocParaTypeGenerator, DocRefTextTypeGenerator, DocSimpleSectTypeGenerator, DocURLLinkGenerator, HighlightTypeGenerator, ListingTypeGenerator, SpTypeGenerator } from './elements-generators/descriptiontype.js'
import { ElementGeneratorBase } from './elements-generators/element-generator-base.js'
import { PageGeneratorBase as GeneratorBase } from './pages-generators/base.js'
import { GroupGenerator } from './pages-generators/group.js'
import { Sidebar } from './sidebar.js'
import { FrontMatter } from './types.js'
import { RefTypeGenerator } from './elements-generators/reftype.js'
import { NamespaceGenerator } from './pages-generators/namespace.js'
import { ClassPageGenerator } from './pages-generators/class.js'
import { Pages } from './data-model/pages.js'
import { IncTypeGenerator } from './elements-generators/inctype.js'
import { DocListTypeGenerator } from './elements-generators/doclisttype.js'
import { ParamTypeGenerator } from './elements-generators/paramtype.js'
import { LinkedTextTypeGenerator } from './elements-generators/linkedtexttype.js'
import { RefTextTypeGenerator } from './elements-generators/reftexttype.js'
import { RefText } from '../doxygen-xml-parser/reftexttype.js'
import { DefVal } from '../doxygen-xml-parser/linkedtexttype.js'
import { FileGenerator } from './pages-generators/file.js'
import { FolderGenerator } from './pages-generators/folder.js'
import { DocS1TypeGenerator, DocS2TypeGenerator, DocS3TypeGenerator, DocS4TypeGenerator, DocS5TypeGenerator, DocS6TypeGenerator } from './elements-generators/docinternalstype.js'
import { DocTitleTypeGenerator } from './elements-generators/doctitletype.js'
import { DocXRefSectType } from './elements-generators/docxrefsecttype.js'
import { PageGenerator } from './pages-generators/page.js'
import { escapeHtml } from './utils.js'
import { DataModelBase } from './data-model/base-dm.js'

// ----------------------------------------------------------------------------

export class DocusaurusGenerator {
  // The data parsed from the Doxygen XML files.
  doxygenData: DoxygenData
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  doxygenOptions: DoxygenFileOptions
  // A map of compound definitions, indexed by their id.
  compoundDefsById: Map<string, AbstractCompoundDefType> = new Map()
  // Permalinks are relative to the Docusaurus baseUrl folder.
  pagePermalinksById: Map<string, string> = new Map()
  pagePermalinksSet: Set<string> = new Set()
  // docusaurusIdsById: Map<string, string> = new Map()

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
    this.createDataObjectsMaps()
    this.createPermalinksMap()

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
        console.error('compoundDef', compoundDef.id, 'not yet processed in', this.constructor.name)
      }
    }
  }

  /**
   * @brief Create a map of permalinks for all compoundDefs.
   */
  createPermalinksMap (): void {
    // console.log('DocusaurusGenerator.createPermalinksMap()')
    assert(this.pluginOptions.outputFolderPath)
    // const outputFolderPath = this.options.outputFolderPath
    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName)

      const dataObject = this.dataObjectsById.get(compoundDef.id)
      if (dataObject === undefined) {
        console.error('compoundDef', compoundDef.id, 'not yet processed in', this.constructor.name)
        continue
      }

      const permalink = dataObject.relativePermalink
      assert(permalink !== undefined)
      console.log('permalink:', permalink)
      if (this.pagePermalinksById.has(compoundDef.id)) {
        console.error('Permalink clash for id', compoundDef.id)
      }
      if (this.pagePermalinksSet.has(permalink)) {
        console.error('Permalink clash for permalink', permalink, 'id:', compoundDef.id)
      }
      this.pagePermalinksById.set(compoundDef.id, permalink)
      this.pagePermalinksSet.add(permalink)
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

      const permalink = this.pagePermalinksById.get(compoundDef.id)
      assert(permalink !== undefined)
      console.log(`${compoundDef.kind}: ${compoundDef.compoundName}`, '->', `${outputFolderPath}/${permalink}...`)

      const docusaurusId = this.dataObjectsById.get(compoundDef.id)?.docusaurusId
      assert(docusaurusId !== undefined)

      const fileName = `${docusaurusId}.mdx`
      // console.log('fileName:', fileName)
      const filePath = `${outputFolderPath}/${fileName}`

      const frontMatter: FrontMatter = {
        title: `${compoundDef.compoundName}`,
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
        console.error('page generator for', compoundDef.kind, 'not implemented yet in', this.constructor.name)
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
    const pagePermalink = this.pagePermalinksById.get(refid)
    if (pagePermalink === undefined) {
      console.error('refid', refid, 'has no permalink')
      console.error('pagePermalinksById', this.pagePermalinksById)
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
      console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name)
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
    console.error('no element generator for', element.constructor.name, 'in', this.constructor.name)
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

  renderNamespacesIndexMdx (compoundDef: CompoundDef): string {
    let result: string = ''

    if (compoundDef.innerNamespaces !== undefined && compoundDef.innerNamespaces.length > 0) {
      result += '\n'
      result += '## Namespaces\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerNamespace of compoundDef.innerNamespaces) {
        const namespace = this.namespaces.membersById.get(innerNamespace.refid)
        const permalink = this.getPagePermalink(innerNamespace.refid)

        const itemRight = `<Link to="${permalink}">${namespace?.summaryName}</Link>`

        result += '\n'
        result += `<MembersListItem itemLeft="namespace" itemRight={${itemRight}}>\n`

        const compoundDef = this.compoundDefsById.get(innerNamespace.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.renderElementMdx(compoundDef.briefDescription)
        result += briefDescription

        result += '\n'
        result += '</MembersListItem>\n'
      }
      result += '\n'
      result += '</MembersList>\n'
    }
    return result
  }

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

  renderClassSummaryMdx (compoundDef: CompoundDef): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))
    let result: string = ''

    const permalink = this.getPermalink({ refid: compoundDef.id, kindref: 'compound' })

    let className = escapeHtml(compoundDef.compoundName)
    // In some cases the name already includes the template parameters.
    if (!compoundDef.compoundName.includes('<')) {
      const templateParameterNames = this.renderTemplateParameterNamesMdx(compoundDef)
      // console.log('templateParameterNames:', templateParameterNames)
      className += templateParameterNames
    }
    const itemRight = `<Link to="${permalink}">${className}</Link>`

    result += '\n'
    result += `<MembersListItem itemLeft="class" itemRight={<>${itemRight}</>}>\n`

    const briefDescription: string = this.renderElementMdx(compoundDef.briefDescription)
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
