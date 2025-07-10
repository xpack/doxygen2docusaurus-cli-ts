import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractDocAnchorType, type AbstractDocBlockQuoteType, AbstractDocEmptyType, AbstractDocFormulaType, type AbstractDocHeadingType, AbstractDocImageType, AbstractDocMarkupType, type AbstractDocParamListType, type AbstractDocParaType, AbstractDocRefTextType, type AbstractDocSimpleSectType, AbstractDocURLLink, AbstractEmojiType, type AbstractPreformattedType, type AbstractSpType, type AbstractVerbatimType, type AbstractDescriptionType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { AbstractDocHtmlOnlyType } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { AbstractDataModelBase } from '../../doxygen/data-model/types.js';
export declare class DescriptionTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDescriptionType, type: string): string[];
}
export declare class DocParaTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocParaType, type: string): string[];
    isParagraph(element: string | AbstractDataModelBase): boolean;
}
export declare class DocURLLinkStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocURLLink, type: string): string;
}
export declare class DocMarkupTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocMarkupType, type: string): string;
}
export declare class ComputerOutputDataModelStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocMarkupType, type: string): string;
}
export declare class DocRefTextTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocRefTextType, type: string): string;
}
export declare class DocSimpleSectTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocSimpleSectType, type: string): string[];
}
export declare class SpTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractSpType, type: string): string;
}
export declare class DocEmptyTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocEmptyType, type: string): string;
}
export declare class DocParamListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocParamListType, type: string): string[];
}
export declare class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocAnchorType, type: string): string[];
}
export declare class VerbatimStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractVerbatimType, type: string): string;
}
export declare class PreformattedStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractPreformattedType, type: string): string;
}
export declare class FormulaStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocFormulaType, type: string): string;
}
export declare class ImageStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocImageType, type: string): string;
}
export declare class HtmlOnlyStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocHtmlOnlyType, type: string): string;
}
export declare class HeadingLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocHeadingType, type: string): string[];
}
export declare class EmojiStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractEmojiType, type: string): string;
}
export declare class BlockquoteLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocBlockQuoteType, type: string): string[];
}
