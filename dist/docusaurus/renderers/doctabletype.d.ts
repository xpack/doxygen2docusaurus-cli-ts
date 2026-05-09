import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import type { AbstractDocCaptionType, AbstractDocEntryType, AbstractDocRowType, AbstractDocTableType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for Doxygen document table elements.
 *
 * @remarks
 * Converts Doxygen table structures to HTML table format with optional
 * captions. Processes table rows and maintains styling through CSS
 * classes for consistent documentation presentation.
 *
 * @public
 */
export declare class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document table element to formatted output lines.
     *
     * @remarks
     * Creates HTML table structure with optional caption and processes
     * all table rows. Applies CSS classes for styling and maintains
     * proper table markup for documentation display.
     *
     * @param element - The document table element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the table structure
     */
    renderToLines(element: AbstractDocTableType, type: string): string[];
}
/**
 * Renderer for Doxygen document table caption elements.
 *
 * @remarks
 * Generates HTML caption elements for table titles and descriptions.
 * Processes caption content to provide contextual information about
 * table contents and purpose within documentation.
 *
 * @public
 */
export declare class DocCaptionLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document caption element to formatted output lines.
     *
     * @remarks
     * Creates HTML caption element containing the processed caption content.
     * Renders child elements to build complete caption text with proper
     * markup and formatting preservation.
     *
     * @param element - The document caption element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array containing the HTML caption element
     */
    renderToLines(element: AbstractDocCaptionType, type: string): string[];
}
/**
 * Renderer for Doxygen document table row elements.
 *
 * @remarks
 * Generates HTML table row structure containing table entries.
 * Processes all entry elements within the row to build complete
 * table row markup for documentation display.
 *
 * @public
 */
export declare class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document table row element to formatted output lines.
     *
     * @remarks
     * Creates HTML table row tags around rendered table entries.
     * Processes entry elements to generate the complete row structure
     * with proper table markup.
     *
     * @param element - The document table row element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the table row
     */
    renderToLines(element: AbstractDocRowType, type: string): string[];
}
/**
 * Renderer for Doxygen document table entry elements.
 *
 * @remarks
 * Converts table cell elements to HTML table data or header cells
 * with appropriate attributes. Handles cell spanning, alignment,
 * and styling attributes for flexible table presentation.
 *
 * @public
 */
export declare class DocEntryTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a document table entry element to a formatted string.
     *
     * @remarks
     * Creates HTML table cell (td or th) with attributes including
     * colspan, rowspan, alignment, and styling. Processes cell content
     * and applies appropriate markup based on header status.
     *
     * @param element - The document table entry element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted HTML table cell string
     */
    renderToString(element: AbstractDocEntryType, type: string): string;
}
//# sourceMappingURL=doctabletype.d.ts.map