import { ElementStringRendererBase } from './element-renderer-base.js';
import { type AbstractReferenceType } from '../../doxygen/data-model/compounds/referencetype-dm.js';
/**
 * Renderer for reference elements in documentation cross-references.
 *
 * @remarks
 * Handles the rendering of cross-reference elements that link to other
 * documented members, creating appropriate hyperlinks with proper
 * permalinks for navigation within the documentation.
 *
 * @public
 */
export declare class ReferenceTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a reference element to a formatted string with hyperlinks.
     *
     * @remarks
     * Converts Doxygen reference elements into HTML anchor tags with
     * appropriate permalinks to the referenced members. Handles both
     * forward references and reverse references whilst sanitising
     * anonymous namespace names for display.
     *
     * @param element - The reference element to render
     * @param type - The rendering context type
     * @returns Formatted HTML string with hyperlink
     */
    renderToString(element: AbstractReferenceType, type: string): string;
}
//# sourceMappingURL=referencetype.d.ts.map