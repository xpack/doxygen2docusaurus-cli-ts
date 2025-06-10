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

import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js'
import { DescriptionTypeTextRenderer, DocAnchorTypeLinesRenderer, DocEmptyTypeLinesRenderer, DocMarkupTypeTextRenderer, DocParamListTypeTextRenderer, DocParaTypeTextRenderer, DocRefTextTypeTextRenderer, DocSimpleSectTypeTextRenderer, DocURLLinkTextRenderer, FormulaRenderer, ImageRenderer, SpTypeTextRenderer, VerbatimRenderer } from './descriptiontype.js'
import { ListingTypeLinesRenderer, CodeLineTypeLinesRenderer, HighlightTypeLinesRenderer } from './listingtype.js'
import { DocListTypeLinesRenderer } from './doclisttype.js'
import { DocS1TypeLinesRenderer, DocS2TypeLinesRenderer, DocS3TypeLinesRenderer, DocS4TypeLinesRenderer, DocS5TypeLinesRenderer, DocS6TypeLinesRenderer } from './docinternalstype.js'
import { DocTitleTypeLinesRenderer } from './doctitletype.js'
import { DocVariableListTypeTextRenderer, VariableListPairLinesRenderer } from './docvariablelisttype.js'
import { DocXRefSectTextRenderer } from './docxrefsecttype.js'
import { IncTypeLinesRenderer } from './inctype.js'
import { LinkedTextTypeTextRenderer } from './linkedtexttype.js'
import { ParamTypeLinesRenderer } from './paramtype.js'
import { RefTextTypeTextRenderer } from './reftexttype.js'
import { RefTypeLinesRenderer } from './reftype.js'
import { Workspace } from '../workspace.js'
import { SubstringDocMarkupTypeRenderer } from './substringtype.js'
import { DocEntryTypeTextRenderer, DocRowTypeLinesRenderer, DocTableTypeLinesRenderer } from './doctabletype.js'

// ----------------------------------------------------------------------------

export class Renderers {
  elementLinesRenderers: Map<string, ElementLinesRendererBase> = new Map()
  elementTextRenderers: Map<string, ElementTextRendererBase> = new Map()

  constructor (workspace: Workspace) {
    // Add renderers for the parsed xml elements (in alphabetical order).

    this.elementLinesRenderers.set('AbstractCodeLineType', new CodeLineTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocAnchorType', new DocAnchorTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocListType', new DocListTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocRowType', new DocRowTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect1Type', new DocS1TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect2Type', new DocS2TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect3Type', new DocS3TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect4Type', new DocS4TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect5Type', new DocS5TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocSect6Type', new DocS6TypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocTableType', new DocTableTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractDocTitleType', new DocTitleTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractHighlightType', new HighlightTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractIncType', new IncTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractListingType', new ListingTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractParamType', new ParamTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractProgramListingType', new ListingTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('AbstractRefType', new RefTypeLinesRenderer(workspace))
    this.elementLinesRenderers.set('VariableListPairDataModel', new VariableListPairLinesRenderer(workspace))
    // console.log(this.elementGenerators.size, 'element generators')

    this.elementTextRenderers.set('AbstractDescriptionType', new DescriptionTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocEmptyType', new DocEmptyTypeLinesRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocEntryType', new DocEntryTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocFormulaType', new FormulaRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocImageType', new ImageRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocMarkupType', new DocMarkupTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocParaType', new DocParaTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocParamListType', new DocParamListTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocRefTextType', new DocRefTextTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocSimpleSectType', new DocSimpleSectTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocURLLink', new DocURLLinkTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocVariableListType', new DocVariableListTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractDocXRefSectType', new DocXRefSectTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractLinkedTextType', new LinkedTextTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractRefTextType', new RefTextTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractSpType', new SpTypeTextRenderer(workspace))
    this.elementTextRenderers.set('AbstractVerbatimType', new VerbatimRenderer(workspace))
    this.elementTextRenderers.set('SubstringDocMarkupType', new SubstringDocMarkupTypeRenderer(workspace))
  }

  getElementLinesRenderer (element: Object): ElementLinesRendererBase | undefined {
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

  getElementTextRenderer (element: Object): ElementTextRendererBase | undefined {
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
}

// ----------------------------------------------------------------------------
