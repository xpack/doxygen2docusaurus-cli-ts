import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractDocXRefSectType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for Doxygen cross-reference section elements.
 *
 * @remarks
 * Generates HTML structure for cross-reference sections with titles and
 * descriptions. Creates definition lists with linked titles and detailed
 * content for documentation cross-references.
 *
 * @public
 */
export declare class DocXRefSectLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a cross-reference section to formatted output lines.
     *
     * @remarks
     * Creates an HTML definition list structure with the cross-reference
     * title as a linked term and the description as the definition content.
     * Generates a permalink for the cross-reference section.
     *
     * @param element - The cross-reference section element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the cross-reference section
     */
    renderToLines(element: AbstractDocXRefSectType, type: string): string[];
}
//# sourceMappingURL=docxrefsecttype.d.ts.map