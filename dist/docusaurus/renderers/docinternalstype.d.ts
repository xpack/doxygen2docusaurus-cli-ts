import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractDocSect1Type, AbstractDocSect2Type, AbstractDocSect3Type, AbstractDocSect4Type, AbstractDocSect5Type, AbstractDocSect6Type } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Renderer for Doxygen level-1 section elements.
 *
 * @remarks
 * Converts Doxygen section elements to Docusaurus markdown format.
 * Generates H2 headings with optional anchor IDs for table of contents
 * integration and cross-referencing within documentation.
 *
 * @public
 */
export declare class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-1 section element to formatted output lines.
     *
     * @remarks
     * Creates markdown H2 heading with optional anchor for the section title
     * and renders child elements. Removes trailing periods from titles and
     * includes anchor links when section IDs are available.
     *
     * @param element - The level-1 section element to render
     * @param type - The rendering context type
     * @returns Array of markdown lines for the section
     */
    renderToLines(element: AbstractDocSect1Type, type: string): string[];
}
/**
 * Renderer for Doxygen level-2 section elements.
 *
 * @remarks
 * Converts Doxygen subsection elements to Docusaurus markdown format.
 * Generates H3 headings with optional anchor IDs for hierarchical
 * documentation structure and navigation support.
 *
 * @public
 */
export declare class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-2 section element to formatted output lines.
     *
     * @remarks
     * Creates markdown H3 heading with optional anchor for the subsection
     * title and renders child elements. Maintains consistent formatting
     * with parent section renderer patterns.
     *
     * @param element - The level-2 section element to render
     * @param type - The rendering context type
     * @returns Array of markdown lines for the subsection
     */
    renderToLines(element: AbstractDocSect2Type, type: string): string[];
}
/**
 * Renderer for Doxygen level-3 section elements.
 *
 * @remarks
 * Converts Doxygen sub-subsection elements to Docusaurus markdown format.
 * Generates H4 headings with optional anchor IDs for deep hierarchical
 * documentation structure and comprehensive navigation.
 *
 * @public
 */
export declare class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-3 section element to formatted output lines.
     *
     * @remarks
     * Creates markdown H4 heading with optional anchor for the sub-subsection
     * title and renders child elements. Follows established patterns for
     * consistent documentation hierarchy.
     *
     * @param element - The level-3 section element to render
     * @param type - The rendering context type
     * @returns Array of markdown lines for the sub-subsection
     */
    renderToLines(element: AbstractDocSect3Type, type: string): string[];
}
/**
 * Renderer for Doxygen level-4 section elements.
 *
 * @remarks
 * Converts deep Doxygen section elements to Docusaurus markdown format.
 * Generates H5 headings with optional anchor IDs for detailed documentation
 * hierarchies and fine-grained content organisation.
 *
 * @public
 */
export declare class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-4 section element to formatted output lines.
     *
     * @remarks
     * Creates markdown H5 heading with optional anchor for deep section
     * titles and renders child elements. Maintains hierarchy consistency
     * for complex documentation structures.
     *
     * @param element - The level-4 section element to render
     * @param type - The rendering context type
     * @returns Array of markdown lines for the deep section
     */
    renderToLines(element: AbstractDocSect4Type, type: string): string[];
}
/**
 * Renderer for Doxygen level-5 section elements.
 *
 * @remarks
 * Converts very deep Doxygen section elements to Docusaurus markdown format.
 * Generates H6 headings with optional anchor IDs for extremely detailed
 * documentation hierarchies and comprehensive content structuring.
 *
 * @public
 */
export declare class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-5 section element to formatted output lines.
     *
     * @remarks
     * Creates markdown H6 heading with optional anchor for very deep section
     * titles and renders child elements. Supports maximum depth documentation
     * organisation for complex technical content.
     *
     * @param element - The level-5 section element to render
     * @param type - The rendering context type
     * @returns Array of markdown lines for the very deep section
     */
    renderToLines(element: AbstractDocSect5Type, type: string): string[];
}
/**
 * Renderer for Doxygen level-6 section elements.
 *
 * @remarks
 * Converts the deepest Doxygen section elements to Docusaurus format.
 * Uses bold text formatting instead of headers due to markdown limitations
 * at this depth level while maintaining anchor functionality.
 *
 * @public
 */
export declare class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a level-6 section element to formatted output lines.
     *
     * @remarks
     * Creates bold text with optional anchor for maximum depth sections
     * and renders child elements. Uses alternative formatting since
     * markdown heading levels are exhausted at this depth.
     *
     * @param element - The level-6 section element to render
     * @param type - The rendering context type
     * @returns Array of formatted lines for the deepest section
     */
    renderToLines(element: AbstractDocSect6Type, type: string): string[];
}
//# sourceMappingURL=docinternalstype.d.ts.map