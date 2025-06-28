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
import { BlockquoteLinesRenderer, ComputerOutputDataModelStringRenderer, DescriptionTypeLinesRenderer, DocAnchorTypeLinesRenderer, DocEmptyTypeStringRenderer, DocMarkupTypeStringRenderer, DocParamListTypeLinesRenderer, DocParaTypeLinesRenderer, DocRefTextTypeStringRenderer, DocSimpleSectTypeLinesRenderer, DocURLLinkStringRenderer, EmojiStringRenderer, FormulaStringRenderer, HeadingLinesRenderer, HtmlOnlyStringRenderer, ImageStringRenderer, PreformattedStringRenderer, SpTypeStringRenderer, VerbatimStringRenderer } from './descriptiontype.js';
import { ListingTypeLinesRenderer, HighlightTypeLinesRenderer } from './listingtype.js';
import { DocListTypeLinesRenderer } from './doclisttype.js';
import { DocS1TypeLinesRenderer, DocS2TypeLinesRenderer, DocS3TypeLinesRenderer, DocS4TypeLinesRenderer, DocS5TypeLinesRenderer, DocS6TypeLinesRenderer } from './docinternalstype.js';
import { DocTitleTypeLinesRenderer } from './doctitletype.js';
import { DocVariableListTypeLinesRenderer, VariableListPairLinesRenderer } from './docvariablelisttype.js';
import { DocXRefSectLinesRenderer as DocXRefSectStringRenderer } from './docxrefsecttype.js';
import { IncTypeLinesRenderer } from './inctype.js';
import { LinkedTextTypeStringRenderer } from './linkedtexttype.js';
import { ParamTypeLinesRenderer } from './paramtype.js';
import { RefTextTypeStringRenderer } from './reftexttype.js';
import { RefTypeLinesRenderer } from './reftype.js';
import { SubstringDocMarkupTypeRenderer } from './substringtype.js';
import { DocCaptionLinesRenderer, DocEntryTypeStringRenderer, DocRowTypeLinesRenderer, DocTableTypeLinesRenderer } from './doctabletype.js';
import { TocListLinesRenderer } from './tableofcontentstype.js';
import { ReferenceTypeStringRenderer } from './referencetype.js';
// ----------------------------------------------------------------------------
export class Renderers {
    constructor(workspace) {
        // Add renderers for the parsed xml elements (in alphabetical order).
        this.elementLinesRenderers = new Map();
        this.elementStringRenderers = new Map();
        this.elementLinesRenderers.set('VariableListPairDataModel', new VariableListPairLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDescriptionType', new DescriptionTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocAnchorType', new DocAnchorTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocBlockQuoteType', new BlockquoteLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocCaptionType', new DocCaptionLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocHeadingType', new HeadingLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocListType', new DocListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocParamListType', new DocParamListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocParaType', new DocParaTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocRowType', new DocRowTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect1Type', new DocS1TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect2Type', new DocS2TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect3Type', new DocS3TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect4Type', new DocS4TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect5Type', new DocS5TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSect6Type', new DocS6TypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocSimpleSectType', new DocSimpleSectTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTableType', new DocTableTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTitleType', new DocTitleTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocTocListType', new TocListLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocVariableListType', new DocVariableListTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractDocXRefSectType', new DocXRefSectStringRenderer(workspace));
        this.elementLinesRenderers.set('AbstractHighlightType', new HighlightTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractIncType', new IncTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractListingTypeBase', new ListingTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractParamType', new ParamTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractProgramListingType', new ListingTypeLinesRenderer(workspace));
        this.elementLinesRenderers.set('AbstractRefType', new RefTypeLinesRenderer(workspace));
        // console.log(this.elementGenerators.size, 'element generators')
        this.elementStringRenderers.set('ComputerOutputDataModel', new ComputerOutputDataModelStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocEmptyType', new DocEmptyTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocEntryType', new DocEntryTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractEmojiType', new EmojiStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocFormulaType', new FormulaStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocHtmlOnlyType', new HtmlOnlyStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocImageType', new ImageStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocMarkupType', new DocMarkupTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocRefTextType', new DocRefTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractDocURLLink', new DocURLLinkStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractLinkedTextType', new LinkedTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractPreformattedType', new PreformattedStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractReferenceType', new ReferenceTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractRefTextType', new RefTextTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractSpType', new SpTypeStringRenderer(workspace));
        this.elementStringRenderers.set('AbstractVerbatimType', new VerbatimStringRenderer(workspace));
        this.elementStringRenderers.set('SubstringDocMarkupType', new SubstringDocMarkupTypeRenderer(workspace));
    }
    getElementLinesRenderer(element) {
        let elementClass = element.constructor;
        while (elementClass.name !== '') {
            // console.log(elementClass.name)
            // console.log(this.elementGenerators)
            const elementGenerator = this.elementLinesRenderers.get(elementClass.name);
            if (elementGenerator !== undefined) {
                return elementGenerator;
            }
            elementClass = Object.getPrototypeOf(elementClass);
        }
        return undefined;
    }
    getElementTextRenderer(element) {
        let elementClass = element.constructor;
        while (elementClass.name !== '') {
            // console.log(elementClass.name)
            // console.log(this.elementGenerators)
            const elementGenerator = this.elementStringRenderers.get(elementClass.name);
            if (elementGenerator !== undefined) {
                return elementGenerator;
            }
            elementClass = Object.getPrototypeOf(elementClass);
        }
        return undefined;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=renderers.js.map