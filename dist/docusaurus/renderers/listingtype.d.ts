import { type AbstractHighlightType, type AbstractListingTypeBase } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
/**
 * Renderer for program listing elements in documentation.
 *
 * @remarks
 * Handles the rendering of source code listings as parsed from Doxygen XML,
 * converting them into formatted HTML output with syntax highlighting and
 * line numbering. Supports both full program listings and member-specific
 * code segments.
 *
 * @public
 */
export declare class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a program listing element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen program listing elements into HTML with appropriate
     * CSS classes, line numbers, and syntax highlighting. Handles anchor
     * generation for navigation and cross-referencing.
     *
     * @param element - The listing element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element: AbstractListingTypeBase, type: string): string[];
}
/**
 * Renderer for syntax highlighting elements in code listings.
 *
 * @remarks
 * Handles the rendering of syntax-highlighted code segments by converting
 * Doxygen highlight elements into HTML spans with appropriate CSS classes.
 * Optimised for direct HTML generation to improve build performance.
 *
 * @public
 */
export declare class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Mapping of Doxygen highlight classes to CSS class names.
     *
     * @remarks
     * Maps Doxygen's built-in highlight types to corresponding CSS classes
     * for consistent syntax highlighting across different code elements.
     */
    knownClasses: Record<string, string>;
    /**
     * Renders a syntax highlight element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen highlight elements into HTML span elements with
     * appropriate CSS classes for syntax highlighting. Handles unknown
     * highlight types by falling back to a default class.
     *
     * @param element - The highlight element to render
     * @param type - The rendering context type
     * @returns Array containing the formatted HTML span
     */
    renderToLines(element: AbstractHighlightType, type: string): string[];
}
//# sourceMappingURL=listingtype.d.ts.map