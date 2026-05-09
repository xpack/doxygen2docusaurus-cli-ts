import { ElementStringRendererBase } from './element-renderer-base.js';
import type { AbstractRefTextType } from '../../doxygen/data-model/compounds/reftexttype-dm.js';
/**
 * Renderer for Doxygen reference text elements with linking functionality.
 *
 * @remarks
 * Converts reference text elements into HTML anchor tags when a valid
 * permalink is available, otherwise renders as plain text. Provides
 * cross-reference functionality for Doxygen elements.
 *
 * @public
 */
export declare class RefTextTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a reference text element to a formatted string with linking.
     *
     * @remarks
     * Generates an HTML anchor tag when a valid permalink exists for the
     * referenced element, otherwise renders the text content directly.
     * Logs warnings for unsupported attributes that are not yet implemented.
     *
     * @param element - The reference text element to render
     * @param type - The rendering context type
     * @returns The formatted HTML string with optional link
     */
    renderToString(element: AbstractRefTextType, type: string): string;
}
//# sourceMappingURL=reftexttype.d.ts.map