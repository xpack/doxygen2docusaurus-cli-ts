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

import { DataModel } from '../doxygen-xml-parser/index.js'
import { DefValDataModel } from '../data-model/compounds/linkedtexttype-dm.js'
import { PluginOptions } from '../plugin/options.js'
import { SidebarItem } from '../plugin/types.js'
import { Class, Classes } from './view-model/classes-vm.js'
import { Files } from './view-model/files-vm.js'
import { Folders } from './view-model/folders-vm.js'
import { Groups } from './view-model/groups-vm.js'
import { Namespaces } from './view-model/namespaces-vm.js'
import { DoxygenFileOptions } from './view-model/options.js'
import { Pages } from './view-model/pages-vm.js'
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
import { escapeHtml, getPermalinkAnchor, stripPermalinkAnchor } from './utils.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { AbstractMemberDefType, MemberDefDataModel } from '../data-model/compounds/memberdeftype-dm.js'
import { SectionDefDataModel } from '../data-model/compounds/sectiondeftype-dm.js'
import { LocationDataModel } from '../data-model/compounds/locationtype-dm.js'
import { AbstractCompoundDefType, CompoundDefDataModel } from '../data-model/compounds/compounddef-dm.js'
import { RefTextDataModel } from '../data-model/compounds/reftexttype-dm.js'
import { AbstractRefType } from '../data-model/compounds/reftype-dm.js'
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, Sect1DataModel } from '../data-model/compounds/descriptiontype-dm.js'
import { TemplateParamListDataModel } from '../data-model/compounds/templateparamlisttype-dm.js'

// ----------------------------------------------------------------------------

export class DocusaurusGenerator {
  // The data parsed from the Doxygen XML files.
  dataModel: DataModel
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  doxygenOptions: DoxygenFileOptions

  // A map of compound definitions, indexed by their id.
  compoundDefsById: Map<string, AbstractCompoundDefType> = new Map()

  memberDefsById: Map<string, AbstractMemberDefType> = new Map()

  dataObjectsById: Map<string, CompoundBase> = new Map()

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

  currentCompoundDef: CompoundDefDataModel | undefined

  componentNames: string[]

  // --------------------------------------------------------------------------

  constructor ({
    dataModel,
    pluginOptions
  }: {
    dataModel: DataModel
    pluginOptions: PluginOptions
  }) {
    // console.log('DocusaurusGenerator.constructor()')
    this.dataModel = dataModel
    this.pluginOptions = pluginOptions

    // Create the data-model objects.
    this.groups = new Groups(this.dataModel.compoundDefs)
    this.namespaces = new Namespaces(this.dataModel.compoundDefs)
    this.folders = new Folders(this.dataModel.compoundDefs)
    this.files = new Files(this.dataModel.compoundDefs, this.folders)
    this.classes = new Classes(this.dataModel.compoundDefs)
    this.pages = new Pages(this.dataModel.compoundDefs)

    this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile.options)

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
    this.elementGenerators.set('VariableListPairDataModel', new VariableListPairGenerator(this))

    // Plugin defined components (in alphabetical order).
    this.componentNames = [
      'CodeLine',
      'DoxygenPage',
      'GeneratedByDoxygen',
      'Highlight',
      'IncludesList',
      'IncludesListItem',
      'MemberDefinition',
      'MembersIndex',
      'MembersIndexItem',
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
    for (const compoundDef of this.dataModel.compoundDefs) {
      // console.log(compoundDef.id)
      if (this.compoundDefsById.has(compoundDef.id)) {
        console.warn('compound already in map', compoundDef.id, 'in', this.compoundDefsById.get(compoundDef.id)?.compoundName)
      } else {
        this.compoundDefsById.set(compoundDef.id, compoundDef)
      }
    }
    console.log(this.compoundDefsById.size, 'compound definitions')
  }

  createMemberDefsMap (): void {
    for (const compoundDef of this.dataModel.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName, compoundDef.id)
      if (compoundDef.sectionDefs !== undefined) {
        for (const sectionDef of compoundDef.sectionDefs) {
          if (sectionDef.memberDefs !== undefined) {
            // console.log('  ', sectionDef.kind)
            for (const memberDef of sectionDef.memberDefs) {
              const compoundId = stripPermalinkAnchor(memberDef.id)
              if (compoundId !== compoundDef.id) {
                // Skip member definitions from different compounds.
                // Hopefully they are defined properly there.
                // console.log('member from another compound', compoundId, 'skipped')
              } else {
                // console.log('    ', memberDef.kind, memberDef.id)
                if (this.memberDefsById.has(memberDef.id)) {
                  console.warn('member already in map', memberDef.id, 'in', this.memberDefsById.get(memberDef.id)?.name)
                } else {
                  this.memberDefsById.set(memberDef.id, memberDef)
                }
              }
            }
          }
        }
      }
    }
    console.log(this.memberDefsById.size, 'member definitions')
  }

  createDataObjectsMaps (): void {
    for (const name of ['groups', 'namespaces', 'folders', 'files', 'classes', 'pages']) {
      for (const [id, object] of (this as any)[name].membersById) {
        this.dataObjectsById.set(id, object)
      }
    }
    for (const compoundDef of this.dataModel.compoundDefs) {
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

    for (const compoundDef of this.dataModel.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName)

      const dataObject: CompoundBase | undefined = this.dataObjectsById.get(compoundDef.id)
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

    for (const compoundDef of this.dataModel.compoundDefs) {
      if (compoundDef.kind === 'page' && compoundDef.id === 'indexpage') {
        // This is the @mainpage. We diverge from Doxygen and generate
        // the API main page differently, with the list of topics and
        // this page detailed description. Therefore it is not generated
        // as a regular page and must be skipped at this stage.
        continue
      }

      this.currentCompoundDef = compoundDef

      const dataObject: CompoundBase | undefined = this.dataObjectsById.get(compoundDef.id)
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
    text += `<DoxygenPage version="${this.dataModel.doxygenindex.version}">\n`
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
    const dataObject: CompoundBase | undefined = this.dataObjectsById.get(refid)
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
      const compoundId = stripPermalinkAnchor(refid)
      // console.log('compoundId:', compoundId)
      if (compoundId === this.currentCompoundDef?.id) {
        permalink = `#${getPermalinkAnchor(refid)}`
      } else {
        permalink = `${this.getPagePermalink(compoundId)}/#${getPermalinkAnchor(refid)}`
      }
    } else {
      console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink')
    }

    assert(permalink !== undefined && permalink.length > 1)
    return permalink
  }

  getXrefPermalink (id: string): string {
    // console.log('1', id, this.currentCompoundDef.id)
    const pagePart = id.replace(/_1.*/, '')
    const anchorPart = id.replace(/.*_1/, '')
    // console.log('2', part1, part2)
    if (this.currentCompoundDef !== undefined && pagePart === this.currentCompoundDef.id) {
      return `#${anchorPart}`
    } else {
      return `/${this.pluginOptions.outputFolderPath}/pages/${pagePart}/#${anchorPart}`
    }
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
   * @param templateParamList
   * @returns
   */
  collectTemplateParameters ({
    templateParamList,
    withDefaults = false
  }: {
    templateParamList: TemplateParamListDataModel | undefined
    withDefaults?: boolean
  }): string[] {
    if (templateParamList?.params === undefined) {
      return []
    }

    const templateParameters: string[] = []

    for (const param of templateParamList.params) {
      // console.log(util.inspect(param, { compact: false, depth: 999 }))
      assert(param.type !== undefined)

      let paramString = ''
      for (const child of param.type.children) {
        if (typeof child === 'string') {
          paramString += child
        } else if (child as object instanceof RefTextDataModel) {
          paramString += (child as RefTextDataModel).text
        }
        if (param.declname !== undefined) {
          paramString += ` ${param.declname}`
        }

        if (withDefaults) {
          if (param.defval !== undefined) {
            const defval: DefValDataModel = param.defval
            assert(defval.children.length === 1)
            if (typeof defval.children[0] === 'string') {
              paramString += ` = ${defval.children[0]}`
            } else if (defval.children[0] as object instanceof RefTextDataModel) {
              paramString += ` = ${(defval.children[0] as RefTextDataModel).text}`
            }
          }
        }
      }

      templateParameters.push(paramString)
    }

    return templateParameters
  }

  isTemplate (templateParamList: TemplateParamListDataModel | undefined): boolean {
    return (templateParamList?.params ?? []).length > 0
  }

  collectTemplateParameterNames (templateParamList: TemplateParamListDataModel): string[] {
    if (templateParamList?.params === undefined) {
      return []
    }

    const templateParameterNames: string[] = []

    for (const param of templateParamList.params) {
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
      } else if (param.type.children[0] as object instanceof RefTextDataModel) {
        paramString = (param.type.children[0] as RefTextDataModel).text
      }
      paramName = paramString.replace(/class /, '')
      templateParameterNames.push(paramName)
    }
    return templateParameterNames
  }

  renderTemplateParametersMdx ({
    templateParamList,
    withDefaults = false
  }: {
    templateParamList: TemplateParamListDataModel | undefined
    withDefaults?: boolean
  }): string {
    let result = ''

    if (templateParamList?.params !== undefined) {
      const templateParameters: string[] = this.collectTemplateParameters({
        templateParamList,
        withDefaults
      })
      if (templateParameters.length > 0) {
        result += `<${templateParameters.join(', ')}>`
      }
    }
    return result
  }

  renderTemplateParameterNamesMdx (templateParamList: TemplateParamListDataModel | undefined): string {
    let result = ''

    if (templateParamList?.params !== undefined) {
      const templateParameterNames: string[] = this.collectTemplateParameterNames(templateParamList)
      if (templateParameterNames.length > 0) {
        result += `<${templateParameterNames.join(', ')}>`
      }
    }
    return result
  }

  renderBriefDescriptionMdx ({
    briefDescription,
    morePermalink
  }: {
    briefDescription: BriefDescriptionDataModel | undefined
    morePermalink?: string | undefined
  }): string {
    let result: string = ''

    if (briefDescription === undefined) {
      return result
    }

    const description: string = this.renderElementMdx(briefDescription)
    if (description.length > 0) {
      result += '\n'
      result += description
      if (morePermalink !== undefined && morePermalink.length > 0) {
        result += ` <Link to="${morePermalink}">`
        result += 'More...'
        result += '</Link>'
      }
    }

    return result
  }

  renderDetailedDescriptionMdx ({
    detailedDescription,
    todo = '',
    showHeader = true
  }: {
    detailedDescription: DetailedDescriptionDataModel | undefined
    todo?: string
    showHeader?: boolean
  }): string {
    let result: string = ''

    let hasSect1 = false
    if (detailedDescription !== undefined) {
      for (const child of detailedDescription?.children) {
        if (child instanceof Sect1DataModel) {
          hasSect1 = true
          break
        }
      }
    }

    const description: string = this.renderElementMdx(detailedDescription).trim()
    if (showHeader && !hasSect1) {
      if (description.length > 0 || todo.length > 0) {
        result += '\n'
        result += '## Description {#details}\n'
      }
    }

    // Deviate from Doxygen and do not repeat the brief in the detailed section.
    // console.log(util.inspect(compoundDef.detailedDescription, { compact: false, depth: 999 }))
    result += '\n'
    if (description.length > 0) {
      result += description
      result += '\n'
    } else if (todo.length > 0) {
      result += `TODO: add <code>@details</code> to <code>${todo}</code>`
      result += '\n'
    }
    return result
  }

  // --------------------------------------------------------------------------

  renderSectionDefsMdx (compoundDef: CompoundDefDataModel): string {
    let result: string = ''

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += this.renderSectionDefMdx({
          sectionDef,
          compoundDef
        })
      }
    }

    return result
  }

  renderSectionDefMdx ({
    sectionDef,
    compoundDef
  }: {
    sectionDef: SectionDefDataModel
    compoundDef: CompoundDefDataModel
  }): string {
    let result = ''

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs === undefined) {
      return ''
    }

    // TODO: filter out members defined in other compounds.
    let memberDefs = sectionDef.memberDefs

    result += '\n'
    result += '<SectionDefinition>\n'

    const sectionLabels: string[] = []

    if ((compoundDef.kind === 'class' || compoundDef.kind === 'struct') && sectionDef.kind === 'public-func') {
      const classs = this.dataObjectsById.get(compoundDef.id) as Class
      const constructors: MemberDefDataModel[] = []
      let destructor: MemberDefDataModel | undefined
      const methods = []
      for (const memberDef of sectionDef.memberDefs) {
        // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
        if (memberDef.name === classs.unqualifiedName) {
          constructors.push(memberDef)
        } else if (memberDef.name.replace('~', '') === classs.unqualifiedName) {
          assert(destructor === undefined)
          destructor = memberDef
        } else {
          methods.push(memberDef)
        }
      }

      if (constructors.length > 0) {
        result += '\n'
        result += '## Constructors\n'

        for (const constructor of constructors) {
          result += this.renderMemberDefMdx({ memberDef: constructor, compoundDef, sectionLabels, isFunction: true })
        }
      }

      if (destructor !== undefined) {
        result += '\n'
        result += '## Destructor\n'

        result += this.renderMemberDefMdx({ memberDef: destructor, compoundDef, sectionLabels, isFunction: true })
      }

      memberDefs = methods
    }

    result += '\n'
    result += `## ${escapeHtml(header)}\n`

    const isFunction: boolean = sectionDef.kind === 'public-func'

    for (const memberDef of memberDefs) {
      result += this.renderMemberDefMdx({ memberDef, compoundDef, sectionLabels, isFunction })
    }

    result += '\n'
    result += '</SectionDefinition>\n'

    return result
  }

  private renderMemberDefMdx ({
    memberDef,
    compoundDef,
    sectionLabels,
    isFunction
  }: {
    memberDef: MemberDefDataModel
    compoundDef: CompoundDefDataModel
    sectionLabels: string[]
    isFunction: boolean
  }): string {
    // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    let result = ''

    const labels: string[] = [...sectionLabels]
    if (memberDef.inline?.valueOf()) {
      labels.push('inline')
    }
    if (memberDef.explicit?.valueOf()) {
      labels.push('explicit')
    }
    if (memberDef.nodiscard?.valueOf()) {
      labels.push('nodiscard')
    }
    if (memberDef.constexpr?.valueOf()) {
      labels.push('constexpr')
    }
    if (memberDef.prot === 'protected') {
      labels.push('protected')
    }
    if (memberDef.staticc?.valueOf()) {
      labels.push('static')
    }
    if (memberDef.virt !== undefined && memberDef.virt === 'virtual') {
      labels.push('virtual')
    }
    // WARNING: there is no explicit attribute for 'delete'.
    if (memberDef.argsstring?.endsWith('=delete')) {
      labels.push('delete')
    }
    if (memberDef.strong?.valueOf()) {
      labels.push('strong')
    }

    // WARNING: could not find how to generate 'inherited'.

    // Validation checks.
    // const passed via the prototype.
    if (memberDef.mutable?.valueOf()) {
      console.error(util.inspect(memberDef, { compact: false, depth: 999 }))
      console.error(memberDef.constructor.name, 'mutable not yet rendered in', this.constructor.name)
    }

    const templateParamList = memberDef.templateparamlist ?? compoundDef.templateParamList
    const templateParameters = this.renderTemplateParametersMdx({ templateParamList, withDefaults: true })

    const id = getPermalinkAnchor(memberDef.id)
    const name = memberDef.name + (isFunction ? '()' : '')

    result += '\n'
    result += `### ${escapeHtml(name)} {#${id}}\n`

    // console.log(memberDef.kind)
    switch (memberDef.kind) {
      case 'function':
      case 'typedef':
      case 'variable':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          const type = this.renderElementMdx(memberDef.type).trim()

          let trailingType = false
          if ((this.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
              (type.includes('&lt;') && type.includes('&gt;'))
            )
          )) {
            trailingType = true
          }

          if (memberDef.kind !== 'typedef') {
            // console.log(name)
            // console.log()
            // console.log(memberDef.definition)
            // console.log(type, memberDef.qualifiedName)
            // if (trailingType) {
            //   console.log(memberDef)
            // }
          } else {
            // console.log()
            // console.log(memberDef.definition)
            // // console.log(`template <${templateParameters.join(', ')}>`)
            // console.log(memberDef)
          }

          // if (memberDef.name === 'value_') {
          //   console.log(memberDef)
          // }

          assert(memberDef.definition !== undefined)
          let prototype = escapeHtml(memberDef.definition)
          if (memberDef.kind === 'function') {
            prototype += ' ('

            if (memberDef.params !== undefined) {
              const params: string[] = []
              for (const param of memberDef.params) {
                params.push(this.renderElementMdx(param))
              }
              prototype += params.join(', ')
            }

            prototype += ')'
          }

          if (memberDef.initializer !== undefined) {
            prototype += ` ${this.renderElementMdx(memberDef.initializer)}`
          }

          if (memberDef.constt?.valueOf()) {
            prototype += ' const'
          }

          result += '\n'
          result += '<MemberDefinition'
          if (templateParameters.length > 0) {
            const template = escapeHtml(`template ${templateParameters}`)
            result += `\n  template={<>${template}</>}`
          }
          result += `\n  prototype={<>${prototype}</>}`
          if (labels.length > 0) {
            result += `\n labels = {["${labels.join('", "')}"]}`
          }
          result += '>'

          result += this.renderBriefDescriptionMdx({
            briefDescription: memberDef.briefDescription
          })

          const detailedDescription: string = this.renderElementMdx(memberDef.detailedDescription).trim()
          if (detailedDescription.length > 0) {
            result += '\n'
            result += detailedDescription
            result += '\n'
          }

          result += this.renderLocationMdx(memberDef.location)

          result += '</MemberDefinition>\n'
        }

        break

      case 'enum':
        {
          let prototype = 'enum '
          if (memberDef.strong?.valueOf()) {
            prototype += 'class '
          }
          prototype += escapeHtml(memberDef.qualifiedName ?? '?')
          result += '\n'
          result += '<MemberDefinition'
          result += `\n  prototype={<>${prototype}</>}`
          if (labels.length > 0) {
            result += `\n labels = {["${labels.join('", "')}"]}`
          }
          result += '>'

          result += this.renderBriefDescriptionMdx({
            briefDescription: memberDef.briefDescription
          })

          result += this.renderEnumMdx(memberDef)

          const detailedDescription: string = this.renderElementMdx(memberDef.detailedDescription).trim()
          if (detailedDescription.length > 0) {
            result += '\n'
            result += detailedDescription
            result += '\n'
          }

          result += this.renderLocationMdx(memberDef.location)

          result += '</MemberDefinition>\n'
        }

        break

      default:
        result += '\n'
        result += '<MemberDefinition>'
        console.warn('memberDef', memberDef.kind, memberDef.name, 'not implemented yet in', this.constructor.name, 'renderMemberDefMdx')
    }

    return result
  }

  renderEnumMdx (memberDef: MemberDefDataModel): string {
    let result: string = ''

    // TODO: add CSS and tweak sizes and alignment.
    result += '\n'
    result += '<dl>\n'
    result += '<dt class="doxyEnumerationValues"><b>Enumeration values</b></dt>\n'
    result += '<dd>\n'
    result += '<table class="doxyEnumerationTable">\n'
    if (memberDef.enumvalues !== undefined) {
      for (const enumValue of memberDef.enumvalues) {
        const briefDescription: string = this.renderElementMdx(enumValue.briefDescription).trim().replace(/[.]$/, '')
        const permalink = this.getPermalink({ refid: enumValue.id, kindref: 'member' })
        let value = enumValue.name
        if (enumValue.initializer !== undefined) {
          value += ' '
          value += this.renderElementMdx(enumValue.initializer)
        }
        result += '  <tr>\n'
        result += `    <td class="doxyEnumerationField"><Link id="${permalink}"/>${value}</td>\n`
        result += `    <td class="doxyEnumerationDescription">${briefDescription}</td>\n`
        result += '  </tr>\n'
      }
    }
    result += '</table>\n'
    result += '</dd>\n'
    result += '</dl>\n'
    return result
  }

  renderGeneratedFrom (compoundDef: CompoundDefDataModel): string {
    let result: string = ''

    const locationSet: Set<string> = new Set()

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        if (sectionDef.memberDefs !== undefined) {
          for (const memberDef of sectionDef.memberDefs) {
            if (memberDef.location !== undefined) {
              const file = memberDef.location.file
              locationSet.add(file)
              if (memberDef.location.bodyfile !== undefined) {
                locationSet.add(memberDef.location.bodyfile)
              }
            }
          }
        }
      }
    }

    if (locationSet.size > 0) {
      result += '\n'
      result += '<hr/>\n'
      result += `The documentation for this ${compoundDef.kind} was generated from the following file${locationSet.size > 1 ? 's' : ''}:\n`

      result += '<ul>\n'

      const sortedFiles = [...locationSet].sort()
      for (const fileName of sortedFiles) {
        const file = this.files.membersByPath.get(fileName)
        assert(file !== undefined)
        const permalink = this.getPagePermalink(file.compoundDef.id)
        result += `<li><Link to="${permalink}">${path.basename(fileName) as string}</Link></li>\n`
      }
      result += '</ul>\n'
    }

    return result
  }

  renderLocationMdx (location: LocationDataModel | undefined): string {
    let result: string = ''

    if (location !== undefined) {
      // console.log(location.file)
      const file = this.files.membersByPath.get(location.file)
      assert(file !== undefined)
      const permalink = this.getPagePermalink(file.compoundDef.id)

      result += '\n'
      if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
        result += 'Declaration at line '
        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
        result += `<Link to="${permalink}/#${lineAttribute}">${escapeHtml(location.line?.toString() ?? '?')}</Link>`
        result += ' of file '
        result += `<Link to="${permalink}">${escapeHtml(path.basename(location.file) as string)}</Link>`

        const definitionFile = this.files.membersByPath.get(location.bodyfile)
        assert(definitionFile !== undefined)
        const definitionPermalink = this.getPagePermalink(definitionFile.compoundDef.id)

        result += ', definition at line '
        const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`
        result += `<Link to="${definitionPermalink}/#${lineStart}">${escapeHtml(location.bodystart?.toString() ?? '?')}</Link>`
        result += ' of file '
        result += `<Link to="${definitionPermalink}">${escapeHtml(path.basename(location.bodyfile) as string)}</Link>`
        result += '.\n'
      } else {
        result += 'Definition at line '
        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
        result += `<Link to="${permalink}/#${lineAttribute}">${escapeHtml(location.line?.toString() ?? '?')}</Link>`
        result += ' of file '
        result += `<Link to="${permalink}">${escapeHtml(path.basename(location.file) as string)}</Link>`
        result += '.\n'
      }
    }

    return result
  }

  // --------------------------------------------------------------------------

  renderInnerIndicesMdx ({
    compoundDef,
    suffixes
  }: {
    compoundDef: CompoundDefDataModel
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
        result += `## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index\n`

        result += '\n'
        result += '<MembersIndex>\n'

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
          result += `<MembersIndexItem itemLeft="${itemLeft}" itemRight={${itemRight}}>\n`

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
          result += '</MembersIndexItem>\n'
        }

        result += '\n'
        result += '</MembersIndex>\n'
      }
    }

    return result
  }

  renderSectionDefIndicesMdx (compoundDef: CompoundDefDataModel): string {
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
    sectionDef: SectionDefDataModel
    compoundDef: CompoundDefDataModel
  }): string {
    let result = ''

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs !== undefined || sectionDef.members !== undefined) {
      result += '\n'
      result += `## ${escapeHtml(header)} Index\n`

      result += '\n'
      result += '<MembersIndex>\n'

      if (sectionDef.memberDefs !== undefined) {
        for (const memberDef of sectionDef.memberDefs) {
          result += this.renderMemberDefIndexMdx({ memberDef, sectionDef, compoundDef })
        }
      }

      if (sectionDef.members !== undefined) {
        for (const member of sectionDef.members) {
          const memberDef = this.memberDefsById.get(member.refid)
          assert(memberDef !== undefined)

          result += this.renderMemberDefIndexMdx({ memberDef, sectionDef, compoundDef })
        }
      }

      result += '\n'
      result += '</MembersIndex>\n'
    }
    return result
  }

  renderMemberDefIndexMdx ({
    memberDef,
    sectionDef,
    compoundDef
  }: {
    memberDef: MemberDefDataModel
    sectionDef: SectionDefDataModel
    compoundDef: CompoundDefDataModel
  }): string {
    // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    let result = ''

    const permalink = this.getPermalink({ refid: memberDef.id, kindref: 'member' })
    assert(permalink !== undefined && permalink.length > 1)

    const name = escapeHtml(memberDef.name)

    let itemLeft = ''
    let itemRight = `<Link to="${permalink}">${name}</Link>`

    const templateParamList = memberDef.templateparamlist ?? compoundDef.templateParamList
    const templateParameters = this.renderTemplateParametersMdx({ templateParamList, withDefaults: true })

    switch (memberDef.kind) {
      case 'typedef':
        // if (memberDef.name.includes('value_type')) {
        //   console.log(memberDef)
        //   console.log(templateParameters)
        // }

        itemLeft = 'using'
        if (memberDef.type !== undefined) {
          itemRight += ' = '
          itemRight += this.renderElementMdx(memberDef.type).trim()
        }
        break

      case 'function':

        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          const type = this.renderElementMdx(memberDef.type).trim()

          let trailingType = false
          if ((this.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
              (type.includes('&lt;') && type.includes('&gt;'))
            )
          )) {
            trailingType = true
          }

          // if (trailingType) {
          //   console.log()
          //   console.log('ttt-name:', memberDef.definition)
          //   console.log('ttt-type:', typeCured)
          //   console.log('ttt-param:', templateParameters.join(', '))
          //   console.log()
          // }

          // if (memberDef.staticc?.valueOf()) {
          //   itemLeft += 'static '
          // }
          if (memberDef.constexpr?.valueOf() && !type.includes('constexpr')) {
            itemLeft += 'constexpr '
          }

          if (memberDef.argsstring !== undefined) {
            itemRight += ' '
            itemRight += escapeHtml(memberDef.argsstring)
          }
          if (trailingType) {
            if (!itemLeft.includes('auto')) {
              itemLeft += 'auto '
            }
            // WARNING: Doxygen shows this, but the resulting line is too long.
            itemRight += escapeHtml(' -> ')
            itemRight += type
          } else {
            itemLeft += type
          }

          if (memberDef.initializer !== undefined) {
            itemRight += ' '
            itemRight += this.renderElementMdx(memberDef.initializer)
          }
        }
        break

      case 'variable':
        itemLeft += this.renderElementMdx(memberDef.type).trim()
        if (memberDef.initializer !== undefined) {
          itemRight += ' '
          itemRight += this.renderElementMdx(memberDef.initializer)
        }
        break

      case 'enum':
        itemLeft = 'enum'
        if (memberDef.strong?.valueOf()) {
          itemLeft += ' class'
        }
        break

      default:
        console.error('member kind', memberDef.kind, 'not implemented yet in', this.constructor.name, 'renderMethodDefIndexMdx')
    }

    result += '\n'
    result += '<MembersIndexItem'
    // if (this.isTemplate(templateParamList)) {
    //   const template = escapeHtml(`template ${templateParameters}`)
    //   result += `\n  template={<>${template}</>}`
    // }

    if (itemLeft.length > 0) {
      if (itemLeft.includes('<') || itemLeft.includes('&')) {
        result += `\n  itemLeft={<>${itemLeft}</>}`
      } else {
        result += `\n  itemLeft="${itemLeft}"`
      }
    } else {
      result += '\n  itemLeft="&nbsp;"'
    }
    if (itemRight.includes('<') || itemRight.includes('&')) {
      result += `\n  itemRight={<>${itemRight}</>}`
    } else {
      result += `\n  itemRight="${itemRight}"`
    }
    result += '>'

    result += this.renderBriefDescriptionMdx({
      briefDescription: memberDef.briefDescription,
      morePermalink: permalink
    })

    result += '\n'
    result += '</MembersIndexItem>'

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

  getHeaderByKind (sectionDef: SectionDefDataModel): string {
    const headersByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Public Member Typedefs',
      'public-func': 'Public Member Functions',
      'public-attrib': 'Public Member Attributes',
      // 'public-slot': 'Member ?',
      'public-static-func': 'Public Static Functions',
      'public-static-attrib': 'Public Static Attributes',

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

  renderIncludesIndexMdx (compoundDef: CompoundDefDataModel): string {
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

  renderClassIndexMdx (compoundDef: CompoundDefDataModel): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))
    let result: string = ''

    const classs = this.classes.membersById.get(compoundDef.id)
    assert(classs !== undefined)

    const permalink = this.getPagePermalink(compoundDef.id)

    const itemLeft = compoundDef.kind
    const itemRight = `<Link to="${permalink}">${escapeHtml(classs.indexName)}</Link>`

    result += '\n'
    result += `<MembersIndexItem itemLeft="${itemLeft}" itemRight={${itemRight}}>\n`

    const briefDescription: string = this.renderElementMdx(compoundDef.briefDescription).trim()
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ` <Link to="${permalink}#details">`
      result += 'More...'
      result += '</Link>\n'
    }
    result += '</MembersIndexItem>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
