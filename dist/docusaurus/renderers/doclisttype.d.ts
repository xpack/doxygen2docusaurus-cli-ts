import { ElementLinesRendererBase } from './element-renderer-base.js';
import { type AbstractDocListType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for list type elements in documentation.
 *
 * @remarks
 * Handles the rendering of both ordered and unordered lists as parsed from
 * Doxygen XML, converting them into appropriate HTML markup with proper
 * styling classes and list type attributes.
 *
 * @public
 */
export declare class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a list element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen list elements into HTML lists (ul/ol) with appropriate
     * CSS classes and type attributes. Handles both itemised (unordered) and
     * ordered lists, including special check-style formatting when needed.
     *
     * @param element - The list element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element: AbstractDocListType, type: string): string[];
}
//# sourceMappingURL=doclisttype.d.ts.map