import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractRefType } from '../../doxygen/data-model/compounds/reftype-dm.js';
/**
 * Renderer for reference type elements in documentation cross-references.
 *
 * @remarks
 * Handles the rendering of reference elements that link to other documented
 * entities, creating appropriate hyperlinks with permalinks when targets
 * are available. Used for cross-referencing between documentation elements.
 *
 * @public
 */
export declare class RefTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a reference element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen reference elements into HTML anchor tags with
     * appropriate permalinks to the referenced entities. Falls back to
     * plain text when no permalink is available for the target.
     *
     * @param element - The reference element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element: AbstractRefType, type: string): string[];
}
//# sourceMappingURL=reftype.d.ts.map