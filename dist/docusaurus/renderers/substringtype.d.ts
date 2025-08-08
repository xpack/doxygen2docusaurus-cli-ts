import { ElementStringRendererBase } from './element-renderer-base.js';
import type { SubstringDocMarkupType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for Doxygen substring markup elements.
 *
 * @remarks
 * Simple passthrough renderer for substring content within documentation
 * markup. Extracts and returns the raw substring value without additional
 * processing or formatting transformations.
 *
 * @public
 */
export declare class SubstringDocMarkupTypeRenderer extends ElementStringRendererBase {
    /**
     * Renders a substring markup element to its string value.
     *
     * @remarks
     * Directly returns the substring content without modification. Provides
     * straightforward text extraction for simple markup elements that do
     * not require complex rendering logic.
     *
     * @param element - The substring markup element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The unmodified substring content
     */
    renderToString(element: SubstringDocMarkupType, type: string): string;
}
//# sourceMappingURL=substringtype.d.ts.map