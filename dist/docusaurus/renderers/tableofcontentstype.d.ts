import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractDocTocListType } from '../../doxygen/data-model/compounds/tableofcontentstype-dm.js';
/**
 * Renderer for Doxygen table of contents list elements.
 *
 * @remarks
 * Generates HTML unordered list structure for table of contents entries
 * with anchor links. Creates navigation aids for structured document
 * browsing and section jumping functionality.
 *
 * @public
 */
export declare class TocListLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a table of contents list to formatted output lines.
     *
     * @remarks
     * Creates an HTML unordered list with anchor links for each table of
     * contents item. Generates permalink anchors and processes content
     * for navigation list presentation.
     *
     * @param element - The table of contents list element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the navigation list
     */
    renderToLines(element: AbstractDocTocListType, type: string): string[];
}
//# sourceMappingURL=tableofcontentstype.d.ts.map