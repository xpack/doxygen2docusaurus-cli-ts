import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractParamType } from '../../doxygen/data-model/compounds/paramtype-dm.js';
/**
 * Renderer for parameter type elements in function documentation.
 *
 * @remarks
 * Handles the rendering of function and method parameters as parsed from
 * Doxygen XML, converting them into formatted output that includes type
 * information, parameter names, and default values when available.
 *
 * @public
 */
export declare class ParamTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a parameter element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen parameter elements into formatted text including
     * type information, parameter names, array specifications, and default
     * values. Handles both declaration and definition name variants.
     *
     * @param element - The parameter element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element: AbstractParamType, type: string): string[];
}
//# sourceMappingURL=paramtype.d.ts.map