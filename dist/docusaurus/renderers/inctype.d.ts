import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractIncType } from '../../doxygen/data-model/compounds/inctype-dm.js';
/**
 * Renderer for include directive elements in documentation.
 *
 * @remarks
 * Handles the rendering of #include statements found in source code,
 * converting them to appropriate HTML output with proper link generation
 * when the included file is documented.
 *
 * @public
 */
export declare class IncTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders an include element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen include elements into HTML format with appropriate
     * angle brackets or quotes, and creates links to documented files
     * when available. Handles both local includes (quotes) and system
     * includes (angle brackets).
     *
     * @param element - The include element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element: AbstractIncType, type: string): string[];
}
//# sourceMappingURL=inctype.d.ts.map