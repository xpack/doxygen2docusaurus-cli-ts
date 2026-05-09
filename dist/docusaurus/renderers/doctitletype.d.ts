import { ElementLinesRendererBase } from './element-renderer-base.js';
import { type AbstractDocTitleType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for Doxygen document title elements.
 *
 * @remarks
 * Handles title and term elements within documentation structures.
 * Supports polymorphic rendering for different title types while
 * providing error handling for unrecognised element variations.
 *
 * @public
 */
export declare class DocTitleTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document title element to formatted output lines.
     *
     * @remarks
     * Processes title and term data models by rendering their child elements.
     * Logs errors for unrecognised title types that require implementation
     * support for complete documentation coverage.
     *
     * @param element - The document title element to render
     * @param type - The rendering context type
     * @returns Array containing the rendered title text
     */
    renderToLines(element: AbstractDocTitleType, type: string): string[];
}
//# sourceMappingURL=doctitletype.d.ts.map