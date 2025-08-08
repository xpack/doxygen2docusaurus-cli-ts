import { ElementStringRendererBase } from './element-renderer-base.js';
import type { AbstractLinkedTextType } from '../../doxygen/data-model/compounds/linkedtexttype-dm.js';
/**
 * Renderer for Doxygen linked text elements containing mixed content.
 *
 * @remarks
 * Handles complex text structures that contain both character data and
 * reference elements. Renders child elements recursively to build the
 * complete text output with embedded links.
 *
 * @public
 */
export declare class LinkedTextTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a linked text element to a formatted string.
     *
     * @remarks
     * Processes all child elements in sequence to generate the complete
     * text output with embedded references and mixed content. Maintains
     * the original order of text and reference elements.
     *
     * @param element - The linked text element to render
     * @param type - The rendering context type
     * @returns The formatted string with mixed content
     */
    renderToString(element: AbstractLinkedTextType, type: string): string;
}
//# sourceMappingURL=linkedtexttype.d.ts.map