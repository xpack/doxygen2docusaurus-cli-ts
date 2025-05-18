import { AbstractCodeLineType, AbstractHighlightType, AbstractListingType } from '../../data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export declare class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractListingType): string[];
}
export declare class CodeLineTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractCodeLineType): string[];
}
export declare class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    knownClasses: string[];
    renderToMdxLines(element: AbstractHighlightType): string[];
}
