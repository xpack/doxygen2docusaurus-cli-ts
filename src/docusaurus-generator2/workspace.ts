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

import * as util from 'node:util'
import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import path from 'node:path'

import { DataModel } from '../data-model/types.js'
import { PluginOptions } from '../plugin/options.js'
import { Groups } from './view-model/groups-vm.js'
import { CollectionBase } from './view-model/collection-base.js'
import { Classes } from './view-model/classes-vm.js'
import { DoxygenFileOptions } from '../docusaurus-generator/view-model/options.js'
import { ElementLinesRendererBase, ElementTextRendererBase } from './elements-generators/element-renderer-base.js'
import { DescriptionTypeTextRenderer, DocAnchorTypeLinesRenderer, DocEmptyTypeLinesRenderer, DocMarkupTypeTextRenderer, DocParamListTypeLinesRenderer, DocParaTypeTextRenderer, DocRefTextTypeTextRenderer, DocSimpleSectTypeTextRenderer, DocURLLinkTextRenderer, SpTypeTextRenderer } from './elements-generators/descriptiontype.js'
import { ListingTypeLinesRenderer, CodeLineTypeLinesRenderer, HighlightTypeLinesRenderer } from './elements-generators/listingtype.js'
import { DocListTypeLinesRenderer } from './elements-generators/doclisttype.js'
import { DocS1TypeLinesRenderer, DocS2TypeLinesRenderer, DocS3TypeLinesRenderer, DocS4TypeLinesRenderer, DocS5TypeLinesRenderer, DocS6TypeLinesRenderer } from './elements-generators/docinternalstype.js'
import { DocTitleTypeLinesRenderer } from './elements-generators/doctitletype.js'
import { DocVariableListTypeTextRenderer, VariableListPairLinesRenderer } from './elements-generators/docvariablelisttype.js'
import { DocXRefSectTextRenderer } from './elements-generators/docxrefsecttype.js'
import { IncTypeLinesRenderer } from './elements-generators/inctype.js'
import { LinkedTextTypeTextRenderer } from './elements-generators/linkedtexttype.js'
import { ParamTypeLinesRenderer } from './elements-generators/paramtype.js'
import { RefTextTypeTextRenderer } from './elements-generators/reftexttype.js'
import { RefTypeLinesRenderer } from './elements-generators/reftype.js'
import { escapeMdx, getPermalinkAnchor, stripPermalinkAnchor } from '../docusaurus-generator/utils.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { CompoundDefDataModel } from '../data-model/compounds/compounddef-dm.js'
import { Namespaces } from './view-model/namespaces-vm.js'
import { FilesAndFolders } from './view-model/files-and-folders-vm.js'
import { Pages } from './view-model/pages-vm.js'
import { FrontMatter } from '../docusaurus-generator/types.js'
import { pluginName } from '../plugin/docusaurus.js'
import { AbstractMemberDefType } from '../data-model/compounds/memberdeftype-dm.js'

// ----------------------------------------------------------------------------

export class Workspace {
  // The data parsed from the Doxygen XML files.
  dataModel: DataModel
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  collectionNamesByKind: Record<string, string> = {
    group: 'groups',
    namespace: 'namespaces',
    class: 'classes',
    struct: 'classes',
    file: 'files',
    dir: 'files',
    page: 'pages'
  }

  // The key is one of the above collection names.
  // groups, classes, namespaces, files, pages.
  viewModel: Map<string, CollectionBase>

  // The many options used by Doxygen during build.
  doxygenOptions: DoxygenFileOptions

  // Like `/api/` (with heading and trailing slashes)
  permalinkBaseUrl: string

  // The order of collections in the sidebar.
  sidebarCollectionNames: string[] = ['groups', 'namespaces', 'classes', 'files', 'pages']

  // View model objects.
  compoundsById: Map<string, CompoundBase> = new Map()

  // TODO: change to member view model objects
  memberDefsById: Map<string, AbstractMemberDefType> = new Map()

  elementLinesRenderers: Map<string, ElementLinesRendererBase> = new Map()
  elementTextRenderers: Map<string, ElementTextRendererBase> = new Map()

  currentCompoundDef: CompoundDefDataModel | undefined

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

    this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile.options)

    // The relevant part of the permalink, like 'api', with the trailing slash.
    this.permalinkBaseUrl = `${this.pluginOptions.outputFolderPath.replace(/^docs[/]/, '')}/`

    // Create the view-model objects.
    this.viewModel = new Map()

    this.viewModel.set('groups', new Groups(this))
    this.viewModel.set('namespaces', new Namespaces(this))
    this.viewModel.set('classes', new Classes(this))
    this.viewModel.set('files', new FilesAndFolders(this))
    this.viewModel.set('pages', new Pages(this))

    // Add generators for the parsed xml elements (in alphabetical order).
    this.elementLinesRenderers.set('AbstractCodeLineType', new CodeLineTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocAnchorType', new DocAnchorTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocListType', new DocListTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocParamListType', new DocParamListTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect1Type', new DocS1TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect2Type', new DocS2TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect3Type', new DocS3TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect4Type', new DocS4TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect5Type', new DocS5TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocSect6Type', new DocS6TypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractDocTitleType', new DocTitleTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractHighlightType', new HighlightTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractIncType', new IncTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractListingType', new ListingTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractParamType', new ParamTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractProgramListingType', new ListingTypeLinesRenderer(this))
    this.elementLinesRenderers.set('AbstractRefType', new RefTypeLinesRenderer(this))
    this.elementLinesRenderers.set('VariableListPairDataModel', new VariableListPairLinesRenderer(this))
    // console.log(this.elementGenerators.size, 'element generators')

    this.elementTextRenderers.set('AbstractDescriptionType', new DescriptionTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocEmptyType', new DocEmptyTypeLinesRenderer(this))
    this.elementTextRenderers.set('AbstractDocMarkupType', new DocMarkupTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocParaType', new DocParaTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocRefTextType', new DocRefTextTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocSimpleSectType', new DocSimpleSectTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocURLLink', new DocURLLinkTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocVariableListType', new DocVariableListTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractDocXRefSectType', new DocXRefSectTextRenderer(this))
    this.elementTextRenderers.set('AbstractLinkedTextType', new LinkedTextTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractRefTextType', new RefTextTypeTextRenderer(this))
    this.elementTextRenderers.set('AbstractSpType', new SpTypeTextRenderer(this))

    for (const compoundDef of this.dataModel.compoundDefs) {
      let added = false
      const collectionName = this.collectionNamesByKind[compoundDef.kind]
      if (collectionName !== undefined) {
        const collection = this.viewModel.get(collectionName)
        if (collection !== undefined) {
          // Create the compound object and add it to the parent collection.
          const compound = collection.addChild(compoundDef)
          // Also add it to the global compounds map.
          this.compoundsById.set(compoundDef.id, compound)
          added = true
        }
      }
      if (!added) {
        // console.error(util.inspect(compoundDef, { compact: false, depth: 999 }))
        console.error('compoundDef', compoundDef.kind, 'not implemented yet in', this.constructor.name)
      }
    }
  }

  // --------------------------------------------------------------------------

  async writeFile ({
    filePath,
    bodyLines,
    frontMatter,
    title
  }: {
    filePath: string
    bodyLines: string[]
    frontMatter: FrontMatter
    title?: string
  }): Promise<void> {
    const lines: string[] = []

    lines.push('')
    lines.push(`<DoxygenPage version="${this.dataModel.doxygenindex.version}">`)
    lines.push('')
    lines.push(...bodyLines)
    lines.push('')
    lines.push('</DoxygenPage>')

    const text = lines.join('\n')

    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    const frontMatterLines: string[] = []

    frontMatterLines.push('---')
    frontMatterLines.push('')
    frontMatterLines.push('# DO NOT EDIT!')
    frontMatterLines.push('# Automatically generated via docusaurus-plugin-doxygen by Doxygen.')
    frontMatterLines.push('')
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterLines.push(`${key}:`)
        for (const arrayValue of frontMatter[key] as string[]) {
          frontMatterLines.push(`  - ${arrayValue}`)
        }
      } else if (typeof value === 'boolean') {
        frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`)
      } else {
        frontMatterLines.push(`${key}: ${value}`)
      }
    }
    frontMatterLines.push('')

    // Skip date, to avoid unnecessary git commits.
    // frontMatterText += `date: ${formatDate(new Date())}\n`
    // frontMatterText += '\n'
    frontMatterLines.push('---')
    frontMatterLines.push('')

    if (text.includes('<Link')) {
      frontMatterLines.push('import Link from \'@docusaurus/Link\'')
    }

    // Theme components.
    if (text.includes('<CodeBlock')) {
      frontMatterLines.push('import CodeBlock from \'@theme/CodeBlock\'')
    }
    if (text.includes('<Admonition')) {
      frontMatterLines.push('import Admonition from \'@theme/Admonition\'')
    }

    frontMatterLines.push('')

    const componentNames = [
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

    // Add includes for the plugin components.
    for (const componentName of componentNames) {
      if (text.includes(`<${componentName}`)) {
        frontMatterLines.push(`import ${componentName} from '${pluginName}/components/${componentName}'`)
      }
    }

    frontMatterLines.push('')
    if (frontMatter.title === undefined && title !== undefined) {
      frontMatterLines.push(`# ${title}`)
      frontMatterLines.push('')
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(frontMatterLines.join('\n'))
    await fileHandle.write(text)

    await fileHandle.close()
  }

  // --------------------------------------------------------------------------

  private getElementLinesRenderer (element: Object): ElementLinesRendererBase | undefined {
    let elementClass = element.constructor
    while (elementClass.name !== '') {
      // console.log(elementClass.name)
      // console.log(this.elementGenerators)
      const elementGenerator = this.elementLinesRenderers.get(elementClass.name)
      if (elementGenerator !== undefined) {
        return elementGenerator
      }
      elementClass = Object.getPrototypeOf(elementClass)
    }

    return undefined
  }

  private getElementTextRenderer (element: Object): ElementTextRendererBase | undefined {
    let elementClass = element.constructor
    while (elementClass.name !== '') {
      // console.log(elementClass.name)
      // console.log(this.elementGenerators)
      const elementGenerator = this.elementTextRenderers.get(elementClass.name)
      if (elementGenerator !== undefined) {
        return elementGenerator
      }
      elementClass = Object.getPrototypeOf(elementClass)
    }

    return undefined
  }

  renderElementsToMdxLines (elements: Object[] | undefined): string[] {
    if (!Array.isArray(elements)) {
      return []
    }

    const lines: string[] = []

    for (const element of elements) {
      lines.push(...this.renderElementToMdxLines(element))
    }

    return lines
  }

  renderElementToMdxLines (element: Object | undefined): string[] {
    if (element === undefined) {
      return []
    }

    if (typeof element === 'string') {
      return [escapeMdx(element)]
    }

    if (Array.isArray(element)) {
      const lines: string[] = []
      for (const elementOfArray of element) {
        lines.push(...this.renderElementToMdxLines(elementOfArray))
      }
      return lines
    }

    const renderer: ElementLinesRendererBase | undefined = this.getElementLinesRenderer(element)
    if (renderer === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error('no element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxLines')
      assert(false)
      // return []
    }

    return renderer.renderToMdxLines(element)
  }

  renderElementsToMdxText (elements: Object[] | undefined): string {
    if (elements === undefined) {
      return ''
    }

    let text = ''
    for (const element of elements) {
      text += this.renderElementToMdxText(element)
    }

    return text
  }

  renderElementToMdxText (element: Object | undefined): string {
    if (element === undefined) {
      return ''
    }

    if (typeof element === 'string') {
      return escapeMdx(element)
    }

    if (Array.isArray(element)) {
      let text = ''
      for (const elementOfArray of element) {
        text += this.renderElementToMdxText(elementOfArray)
      }
      return text
    }

    const textRenderer: ElementTextRendererBase | undefined = this.getElementTextRenderer(element)
    if (textRenderer !== undefined) {
      return textRenderer.renderToMdxText(element)
    }

    // console.warn('trying element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText')
    const linesRenderer: ElementLinesRendererBase | undefined = this.getElementLinesRenderer(element)
    if (linesRenderer !== undefined) {
      return linesRenderer.renderToMdxLines(element).join('\n')
    }

    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error('no element text renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText')
    return ''
  }

  // --------------------------------------------------------------------------

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

  getPagePermalink (refid: string): string {
    const dataObject: CompoundBase | undefined = this.compoundsById.get(refid)
    assert(dataObject !== undefined)

    const pagePermalink = dataObject.relativePermalink
    if (pagePermalink === undefined) {
      console.error('refid', refid, 'has no permalink')
    }

    assert(pagePermalink !== undefined)
    return `/${this.pluginOptions.outputFolderPath}/${pagePermalink}`
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
}

// ----------------------------------------------------------------------------
