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

import { DataModel } from '../data-model/types.js'
import { PluginOptions } from '../plugin/options.js'
import { Groups } from './view-model/groups-vm.js'
import { CollectionBase } from './view-model/collection-base.js'
import { Classes } from './view-model/classes-vm.js'
import { DoxygenFileOptions } from '../docusaurus-generator/view-model/options.js'
import { ElementLinesGeneratorBase } from './elements-generators/element-generator-base.js'
import { DescriptionTypeGenerator, DocAnchorTypeGenerator, DocEmptyTypeGenerator, DocMarkupTypeGenerator, DocParamListTypegenerator, DocParaTypeGenerator, DocRefTextTypeGenerator, DocSimpleSectTypeGenerator, DocURLLinkGenerator, SpTypeGenerator } from './elements-generators/descriptiontype.js'
import { ListingTypeGenerator, CodeLineTypeGenerator, HighlightTypeGenerator } from './elements-generators/listingtype.js'
import { DocListTypeGenerator } from './elements-generators/doclisttype.js'
import { DocS1TypeGenerator, DocS2TypeGenerator, DocS3TypeGenerator, DocS4TypeGenerator, DocS5TypeGenerator, DocS6TypeGenerator } from './elements-generators/docinternalstype.js'
import { DocTitleTypeGenerator } from './elements-generators/doctitletype.js'
import { DocVariableListTypeGenerator, VariableListPairGenerator } from './elements-generators/docvariablelisttype.js'
import { DocXRefSectGenerator } from './elements-generators/docxrefsecttype.js'
import { IncTypeGenerator } from './elements-generators/inctype.js'
import { LinkedTextTypeGenerator } from './elements-generators/linkedtexttype.js'
import { ParamTypeGenerator } from './elements-generators/paramtype.js'
import { RefTextTypeGenerator } from './elements-generators/reftexttype.js'
import { RefTypeGenerator } from './elements-generators/reftype.js'
import { escapeMdx, getPermalinkAnchor, stripPermalinkAnchor } from '../docusaurus-generator/utils.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { CompoundDefDataModel } from '../data-model/compounds/compounddef-dm.js'
import { Namespaces } from './view-model/namespaces-vm.js'
import { FilesAndFolders } from './view-model/files-and-folders-vm.js'
import { Pages } from './view-model/pages-vm.js'

// ----------------------------------------------------------------------------

export class Workspace {
  // The data parsed from the Doxygen XML files.
  dataModel: DataModel
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  // groups, classes, namespaces, files, pages.
  viewModel: Map<string, CollectionBase>

  // The many options used by Doxygen during build.
  doxygenOptions: DoxygenFileOptions

  // Like `/api/` (with heading and trailing slashes)
  permalinkBaseUrl: string

  collectionNamesByKind: Record<string, string> = {
    group: 'groups',
    namespace: 'namespaces',
    class: 'classes',
    struct: 'classes',
    file: 'files',
    dir: 'files',
    page: 'pages'
  }

  elementGenerators: Map<string, ElementLinesGeneratorBase> = new Map()

  dataObjectsById: Map<string, CompoundBase> = new Map()

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

    // Create the view-model objects.
    this.viewModel = new Map()

    this.viewModel.set('groups', new Groups(this))
    this.viewModel.set('namespaces', new Namespaces(this))
    this.viewModel.set('classes', new Classes(this))
    this.viewModel.set('files', new FilesAndFolders(this))
    this.viewModel.set('pages', new Pages(this))

    for (const compoundDef of this.dataModel.compoundDefs) {
      let added = false
      const collectionName = this.collectionNamesByKind[compoundDef.kind]
      if (collectionName !== undefined) {
        const collection = this.viewModel.get(collectionName)
        if (collection !== undefined) {
          const item = collection.addChild(compoundDef)
          this.dataObjectsById.set(compoundDef.id, item)
          added = true
        }
      }
      if (!added) {
        // console.error(util.inspect(compoundDef, { compact: false, depth: 999 }))
        console.error('compoundDef', compoundDef.kind, 'not implemented yet in', this.constructor.name)
      }
    }

    // The relevant part of the permalink, like 'api', with the trailing slash.
    this.permalinkBaseUrl = `/${this.pluginOptions.outputFolderPath.replace(/^docs[/]/, '')}/`

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
    this.elementGenerators.set('AbstractDocXRefSectType', new DocXRefSectGenerator(this))
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
  }

  // --------------------------------------------------------------------------

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

    const renderer: ElementLinesGeneratorBase | undefined = this.getElementRenderer(element)
    if (renderer === undefined) {
      // The error was displayed in getElementRenderer().
      return []
    }

    return renderer.renderToMdxLines(element)
  }

  renderElementsToMdxText (elements: Object[] | undefined): string {
    return this.renderElementsToMdxLines(elements).join('\n')
  }

  renderElementToMdxText (element: Object | undefined): string {
    return this.renderElementToMdxLines(element).join('\n')
  }

  private getElementRenderer (element: Object): ElementLinesGeneratorBase | undefined {
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
    const dataObject: CompoundBase | undefined = this.dataObjectsById.get(refid)
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
