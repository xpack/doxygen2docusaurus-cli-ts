import type { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import type { Workspace } from '../workspace.js';
import type { DataModelElement } from '../../doxygen/data-model/types.js';
/**
 * Central registry and coordinator for all rendering functionality.
 *
 * The Renderers class manages the registration and lookup of specialised
 * renderer objects that convert Doxygen data model elements into
 * Docusaurus-compatible Markdown output.
 *
 * @public
 */
export declare class Renderers {
    /** Map of element types to their corresponding line-based renderers. */
    elementLinesRenderers: Map<string, ElementLinesRendererBase>;
    /** Map of element types to their corresponding string-based renderers. */
    elementStringRenderers: Map<string, ElementStringRendererBase>;
    /**
     * Registers all available renderers with the rendering system.
     *
     * Initialises and maps all specialised renderer instances to their
     * corresponding data model element types, enabling proper conversion
     * of XML elements to Markdown format.
     *
     * @param workspace - The workspace context containing configuration and data.
     */
    registerRenderers(workspace: Workspace): void;
    /**
     * Retrieves a line-based renderer for the specified element.
     *
     * @remarks
     * Searches through the element's class hierarchy to find a registered
     * line-based renderer. Uses prototype chain traversal to support
     * inheritance-based renderer selection for abstract types.
     *
     * @param element - The element object to find a renderer for
     * @returns The corresponding line-based renderer, or undefined if none found
     */
    getElementLinesRenderer(element: object): ElementLinesRendererBase | undefined;
    /**
     * Retrieves a string-based renderer for the specified element.
     *
     * @remarks
     * Searches through the element's class hierarchy to find a registered
     * string-based renderer. Uses prototype chain traversal to support
     * inheritance-based renderer selection for abstract types.
     *
     * @param element - The element object to find a renderer for
     * @returns The corresponding string-based renderer, or undefined if not found
     */
    getElementTextRenderer(element: object): ElementStringRendererBase | undefined;
    /**
     * Renders a string with appropriate escaping for the target format.
     *
     * @remarks
     * Applies format-specific character escaping to ensure proper rendering
     * in different output contexts. Handles HTML entity escaping for HTML
     * output and Markdown character escaping for Markdown output.
     *
     * @param element - The string to render and escape
     * @param type - The target format ('text', 'markdown', 'html')
     * @returns The properly escaped string for the target format
     */
    renderString(element: string, type: string): string;
    /**
     * Renders an array of elements to formatted output lines.
     *
     * @remarks
     * Processes each element in the array through the appropriate renderer
     * and concatenates the resulting lines. Handles undefined arrays
     * gracefully by returning empty arrays.
     *
     * @param elements - Array of elements to render, or undefined
     * @param type - The rendering context type
     * @returns Array of formatted output lines from all elements
     */
    renderElementsArrayToLines(elements: DataModelElement[] | undefined, type: string): string[];
    /**
     * Renders a single element or element array to formatted output lines.
     *
     * @remarks
     * Determines the appropriate renderer based on element type and delegates
     * rendering. Handles strings, arrays, and objects with fallback logic
     * between line and string renderers. Provides error handling for
     * unrecognised element types.
     *
     * @param element - The element to render (single, array, or undefined)
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderElementToLines(element: DataModelElement | DataModelElement[] | undefined, type: string): string[];
    /**
     * Renders an array of elements to a concatenated string.
     *
     * @remarks
     * Processes each element in the array through string rendering and
     * concatenates all results into a single string. Handles undefined
     * arrays by returning empty strings.
     *
     * @param elements - Array of elements to render, or undefined
     * @param type - The rendering context type
     * @returns Concatenated string from all rendered elements
     */
    renderElementsArrayToString(elements: DataModelElement[] | undefined, type: string): string;
    /**
     * Renders a single element or element array to a formatted string.
     *
     * @remarks
     * Determines the appropriate renderer based on element type and delegates
     * string rendering. Prioritises string renderers over line renderers
     * with fallback conversion. Handles strings, arrays, and objects with
     * comprehensive error handling.
     *
     * @param element - The element to render (single, array, or undefined)
     * @param type - The rendering context type
     * @returns The formatted string representation
     */
    renderElementToString(element: DataModelElement | DataModelElement[] | undefined, type: string): string;
    /**
     * Renders a member index item to formatted HTML table rows.
     *
     * @remarks
     * Generates HTML table rows for member documentation indices with
     * support for templates, types, names, and descriptions. Creates
     * structured layouts with appropriate CSS classes for consistent
     * member presentation.
     *
     * @param params - Object containing member index rendering parameters
     * @param params.template - Optional template text for member display
     * @param params.type - Optional type information for the member
     * @param params.name - The member name (required)
     * @param params.childrenLines - Optional description lines for the member
     * @returns Array of HTML table row strings
     */
    renderMembersIndexItemToHtmlLines({ template, type, name, childrenLines, }: {
        template?: string | undefined;
        type?: string | undefined;
        name: string;
        childrenLines?: string[] | undefined;
    }): string[];
    /**
     * Renders tree-structured data as HTML table with hierarchical display.
     *
     * @remarks
     * Converts tree node structures into formatted HTML tables with
     * predefined column layouts and CSS classes. Provides structured
     * presentation for hierarchical data with consistent table markup
     * and width-proportioned columns.
     *
     * @param params - Object containing tree table rendering parameters
     * @param params.contentLines - Array of HTML content lines for table rows
     * @returns Array of HTML table strings with wrapper markup
     */
    renderTreeTableToHtmlLines({ contentLines, }: {
        contentLines: string[];
    }): string[];
    /**
     * Renders individual tree table row with hierarchical styling and content.
     *
     * @remarks
     * Generates HTML table rows for tree structures with depth-based
     * indentation, icon support, and linked labels. Provides consistent
     * formatting for tree node presentation including descriptions and
     * visual hierarchy indicators.
     *
     * @param params - Object containing tree row rendering parameters
     * @param params.itemIconLetter - Optional icon character for the item
     * @param params.itemIconClass - Optional CSS class for icon styling
     * @param params.itemLabel - The display label for the tree item
     * @param params.itemLink - The URL link for the tree item
     * @param params.depth - The hierarchical depth level (0-based)
     * @param params.description - The descriptive text for the item
     * @returns Array of HTML table row strings
     */
    renderTreeTableRowToHtmlLines({ itemIconLetter, itemIconClass, itemLabel, itemLink, depth, description, }: {
        itemIconLetter?: string;
        itemIconClass?: string;
        itemLabel: string;
        itemLink: string;
        depth: number;
        description: string;
    }): string[];
}
//# sourceMappingURL=renderers.d.ts.map