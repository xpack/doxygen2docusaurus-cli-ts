import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractDocVariableListType, VariableListPairDataModel } from '../../doxygen/data-model/compounds/docvarlistentrytype-dm.js';
/**
 * Renderer for Doxygen variable list container elements.
 *
 * @remarks
 * Creates HTML definition list structure for variable lists containing
 * term-description pairs. Provides the outer container for organised
 * presentation of variable documentation.
 *
 * @public
 */
export declare class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a variable list container to formatted output lines.
     *
     * @remarks
     * Creates an HTML definition list wrapper around variable list entries.
     * Each child element represents a term-description pair within the
     * structured list format.
     *
     * @param element - The variable list container element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the definition list structure
     */
    renderToLines(element: AbstractDocVariableListType, type: string): string[];
}
/**
 * Renderer for individual variable list entry pairs.
 *
 * @remarks
 * Converts term-description pairs into HTML definition list items.
 * Handles both single-line and multi-line descriptions with appropriate
 * formatting for readable documentation output.
 *
 * @public
 */
export declare class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a variable list entry pair to formatted output lines.
     *
     * @remarks
     * Creates HTML definition term and description elements from the
     * variable list entry. Handles multi-line descriptions by splitting
     * content across multiple lines within the definition element.
     *
     * @param element - The variable list pair element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings for the term-description pair
     */
    renderToLines(element: VariableListPairDataModel, type: string): string[];
}
//# sourceMappingURL=docvariablelisttype.d.ts.map