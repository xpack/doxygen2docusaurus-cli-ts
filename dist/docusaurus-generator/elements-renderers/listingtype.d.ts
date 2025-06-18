import { AbstractCodeLineType, AbstractHighlightType, AbstractListingType } from '../../data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export declare class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractListingType, type: string): string[];
}
export declare class CodeLineTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractCodeLineType, type: string): string[];
}
export declare class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    knownClasses: Record<string, string>;
    renderToLines(element: AbstractHighlightType, type: string): string[];
}
