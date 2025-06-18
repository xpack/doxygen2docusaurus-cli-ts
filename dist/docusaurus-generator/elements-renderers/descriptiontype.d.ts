import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractDescriptionType, AbstractDocAnchorType, AbstractDocEmptyType, AbstractDocFormulaType, AbstractDocHeadingType, AbstractDocImageType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractEmojiType, AbstractSpType, AbstractVerbatimType } from '../../data-model/compounds/descriptiontype-dm.js';
import { AbstractDocHtmlOnlyType } from '../../data-model/compounds/compounddef-dm.js';
export declare class DescriptionTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDescriptionType, type: string): string;
}
export declare class DocParaTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocParaType, type: string): string;
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
export declare class DocSimpleSectTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocSimpleSectType, type: string): string;
}
export declare class SpTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractSpType, type: string): string;
}
export declare class DocEmptyTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocEmptyType, type: string): string;
}
export declare class DocParamListTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocParamListType, type: string): string;
}
export declare class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocAnchorType, type: string): string[];
}
export declare class VerbatimStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractVerbatimType, type: string): string;
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
export declare class HeadingStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocHeadingType, type: string): string;
}
export declare class EmojiStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractEmojiType, type: string): string;
}
