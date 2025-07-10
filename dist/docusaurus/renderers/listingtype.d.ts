import { type AbstractHighlightType, type AbstractListingTypeBase } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export declare class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractListingTypeBase, type: string): string[];
}
export declare class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    knownClasses: Record<string, string>;
    renderToLines(element: AbstractHighlightType, type: string): string[];
}
//# sourceMappingURL=listingtype.d.ts.map