import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractDocAnchorType, type AbstractDocBlockQuoteType, AbstractDocEmptyType, AbstractDocFormulaType, type AbstractDocHeadingType, AbstractDocImageType, AbstractDocMarkupType, type AbstractDocParamListType, type AbstractDocParaType, AbstractDocRefTextType, type AbstractDocSimpleSectType, AbstractDocURLLink, AbstractEmojiType, type AbstractPreformattedType, type AbstractSpType, type AbstractVerbatimType, type AbstractDescriptionType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { AbstractDocHtmlOnlyType } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { AbstractDataModelBase } from '../../doxygen/data-model/types.js';
/**
 * Primary renderer for description type elements in documentation.
 *
 * @remarks
 * Handles the rendering of Doxygen description elements that contain
 * formatted text, converting them into appropriate output lines for
 * documentation generation. Supports both brief and detailed descriptions.
 *
 * @public
 */
export declare class DescriptionTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDescriptionType, type: string): string[];
}
/**
 * Renderer for Doxygen paragraph elements in documentation.
 *
 * @remarks
 * Handles the complex rendering of paragraph elements that can contain
 * mixed content including text, markup, links, and block-level elements.
 * Manages paragraph boundaries and applies appropriate HTML wrapping.
 *
 * @public
 */
export declare class DocParaTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a paragraph element to formatted output lines.
     *
     * @remarks
     * Processes child elements to determine paragraph boundaries and applies
     * appropriate HTML paragraph tags when enabled. Handles mixed content
     * including inline elements and block-level elements with proper spacing.
     *
     * @param element - The paragraph element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines with paragraph structure
     */
    renderToLines(element: AbstractDocParaType, type: string): string[];
    /**
     * Determines if an element should be rendered within a paragraph context.
     *
     * @remarks
     * Classifies documentation elements as either inline (paragraph content)
     * or block-level elements. This classification controls whether elements
     * are wrapped in paragraph tags or rendered as standalone blocks.
     *
     * @param element - The element to classify
     * @returns True if the element should be rendered within a paragraph
     */
    isParagraph(element: string | AbstractDataModelBase): boolean;
}
/**
 * Renderer for URL link elements in documentation.
 *
 * @remarks
 * Converts Doxygen URL link elements to HTML anchor tags with proper
 * href attributes. Processes child elements to generate the link text
 * content while preserving formatting.
 *
 * @public
 */
export declare class DocURLLinkStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a URL link element to a formatted HTML anchor string.
     *
     * @remarks
     * Creates an HTML anchor element with the specified URL and renders
     * child elements as the link text content. Maintains proper link
     * structure for external and internal references.
     *
     * @param element - The URL link element to render
     * @param type - The rendering context type
     * @returns The formatted HTML anchor string
     */
    renderToString(element: AbstractDocURLLink, type: string): string;
}
/**
 * Renderer for text markup elements in documentation.
 *
 * @remarks
 * Handles common text formatting elements such as bold, emphasis, underline,
 * subscript, and superscript. Maps Doxygen markup types to appropriate
 * HTML elements for consistent text formatting.
 *
 * @public
 */
export declare class DocMarkupTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a markup element to a formatted HTML string.
     *
     * @remarks
     * Converts Doxygen markup elements to their corresponding HTML tags
     * and processes child content. Supports standard formatting elements
     * with error handling for unrecognised markup types.
     *
     * @param element - The markup element to render
     * @param type - The rendering context type
     * @returns The formatted HTML string with markup tags
     */
    renderToString(element: AbstractDocMarkupType, type: string): string;
}
/**
 * Renderer for computer output or code text elements.
 *
 * @remarks
 * Formats text as computer output using CSS styling rather than code blocks.
 * Handles inline code formatting that may contain HTML elements while
 * maintaining compatibility with Docusaurus rendering.
 *
 * @public
 */
export declare class ComputerOutputDataModelStringRenderer extends ElementStringRendererBase {
    /**
     * Renders computer output text to a formatted HTML string.
     *
     * @remarks
     * Wraps content in a styled span element for computer output formatting.
     * Uses CSS classes instead of code blocks to handle mixed content
     * including HTML elements like anchors.
     *
     * @param element - The computer output element to render
     * @param type - The rendering context type
     * @returns The formatted HTML string with computer output styling
     */
    renderToString(element: AbstractDocMarkupType, type: string): string;
}
/**
 * Renderer for reference text elements within descriptions.
 *
 * @remarks
 * Handles cross-references to other documentation elements by generating
 * appropriate links when permalinks are available. Provides fallback
 * text rendering for unresolved references.
 *
 * @public
 */
export declare class DocRefTextTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a reference text element to a formatted string with linking.
     *
     * @remarks
     * Creates HTML anchor tags for valid references with permalinks,
     * otherwise renders as plain text. Logs warnings for unsupported
     * external references that are not yet implemented.
     *
     * @param element - The reference text element to render
     * @param type - The rendering context type
     * @returns The formatted string with optional link
     */
    renderToString(element: AbstractDocRefTextType, type: string): string;
}
/**
 * Renderer for simple section elements in documentation.
 *
 * @remarks
 * Handles various types of documentation sections including returns,
 * authors, notes, warnings, and custom sections. Maps section types
 * to appropriate HTML structures and Docusaurus admonitions.
 *
 * @public
 */
export declare class DocSimpleSectTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a simple section element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen simple sections to HTML definition lists or
     * Docusaurus admonitions based on section type. Supports standard
     * sections like returns and notes, plus custom paragraph sections.
     *
     * @param element - The simple section element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines for the section
     */
    renderToLines(element: AbstractDocSimpleSectType, type: string): string[];
}
/**
 * Renderer for space elements in documentation.
 *
 * @remarks
 * Handles spacing elements that insert a specified number of space
 * characters into the output. Supports both single spaces and
 * multiple space sequences for formatting control.
 *
 * @public
 */
export declare class SpTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a space element to a string of space characters.
     *
     * @remarks
     * Generates the specified number of space characters based on the
     * element's value attribute. Defaults to a single space if no
     * value is specified.
     *
     * @param element - The space element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns String containing the specified number of spaces
     */
    renderToString(element: AbstractSpType, type: string): string;
}
/**
 * Renderer for empty or structural elements in documentation.
 *
 * @remarks
 * Handles various empty elements that provide structural formatting
 * including horizontal rules, line breaks, and non-breakable spaces.
 * Maps element types to appropriate HTML equivalents.
 *
 * @public
 */
export declare class DocEmptyTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders an empty element to its HTML equivalent.
     *
     * @remarks
     * Converts structural elements like horizontal rules and line breaks
     * to their corresponding HTML tags. Provides error handling for
     * unrecognised empty element types.
     *
     * @param element - The empty element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted HTML string for the structural element
     */
    renderToString(element: AbstractDocEmptyType, type: string): string;
}
/**
 * Renderer for parameter list elements in documentation.
 *
 * @remarks
 * Handles complex parameter documentation including template parameters,
 * function parameters, return values, and exceptions. Generates structured
 * HTML tables for organised parameter presentation.
 *
 * @public
 */
export declare class DocParamListTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a parameter list element to formatted output lines.
     *
     * @remarks
     * Creates HTML definition lists and tables for parameter documentation.
     * Processes parameter names, types, directions, and descriptions to
     * generate comprehensive parameter documentation with proper formatting.
     *
     * @param element - The parameter list element to render
     * @param type - The rendering context type
     * @returns Array of HTML strings forming the parameter documentation
     */
    renderToLines(element: AbstractDocParamListType, type: string): string[];
}
/**
 * Renderer for anchor elements in documentation.
 *
 * @remarks
 * Creates HTML anchor elements for cross-referencing within documents.
 * Generates sanitised anchor IDs that can be used for permalink
 * navigation and internal linking.
 *
 * @public
 */
export declare class DocAnchorTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders an anchor element to formatted output lines.
     *
     * @remarks
     * Creates an HTML anchor element with a sanitised ID attribute
     * for use in permalink generation and cross-referencing within
     * the documentation.
     *
     * @param element - The anchor element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array containing the HTML anchor element
     */
    renderToLines(element: AbstractDocAnchorType, type: string): string[];
}
/**
 * Renderer for verbatim text elements in documentation.
 *
 * @remarks
 * Handles verbatim text blocks that should be displayed exactly as
 * written without interpretation. Generates HTML pre and code elements
 * with proper formatting for code snippets and literal text.
 *
 * @public
 */
export declare class VerbatimStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a verbatim element to formatted HTML code block.
     *
     * @remarks
     * Creates HTML pre and code elements for literal text display.
     * Strips leading and trailing newlines while preserving internal
     * formatting and enables copy functionality through Docusaurus.
     *
     * @param element - The verbatim element to render
     * @param type - The rendering context type
     * @returns The formatted HTML code block string
     */
    renderToString(element: AbstractVerbatimType, type: string): string;
}
/**
 * Renderer for preformatted text elements in documentation.
 *
 * @remarks
 * Similar to verbatim rendering but specifically for preformatted content.
 * Maintains exact spacing and formatting while providing HTML code block
 * structure compatible with Docusaurus features.
 *
 * @public
 */
export declare class PreformattedStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a preformatted element to formatted HTML code block.
     *
     * @remarks
     * Creates HTML pre and code elements for preformatted text display.
     * Preserves exact formatting while stripping unnecessary newlines
     * and enabling Docusaurus copy button functionality.
     *
     * @param element - The preformatted element to render
     * @param type - The rendering context type
     * @returns The formatted HTML code block string
     */
    renderToString(element: AbstractPreformattedType, type: string): string;
}
/**
 * Renderer for mathematical formula elements in documentation.
 *
 * @remarks
 * Handles LaTeX mathematical formulae by converting them to HTML code
 * elements. Provides warnings for limited formula rendering capabilities
 * and maintains formula content for basic display.
 *
 * @public
 */
export declare class FormulaStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a formula element to formatted HTML code.
     *
     * @remarks
     * Converts LaTeX formulae to HTML code elements with basic formatting.
     * Logs warnings about limited rendering capabilities and ignores
     * formula IDs while preserving mathematical content.
     *
     * @param element - The formula element to render
     * @param type - The rendering context type
     * @returns The formatted HTML code string containing the formula
     */
    renderToString(element: AbstractDocFormulaType, type: string): string;
}
/**
 * Renderer for image elements in documentation.
 *
 * @remarks
 * Handles image rendering with support for various attributes including
 * dimensions, captions, and source URLs. Generates HTML figure elements
 * with proper image handling for both local and remote sources.
 *
 * @public
 */
export declare class ImageStringRenderer extends ElementStringRendererBase {
    /**
     * Renders an image element to formatted HTML figure.
     *
     * @remarks
     * Creates HTML figure and img elements with support for width, height,
     * alt text, captions, and inline styling. Handles both URL and local
     * image sources while skipping LaTeX-specific images.
     *
     * @param element - The image element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted HTML figure string
     */
    renderToString(element: AbstractDocImageType, type: string): string;
}
/**
 * Renderer for HTML-only content elements in documentation.
 *
 * @remarks
 * Handles content that should only appear in HTML output formats.
 * Processes HTML-specific markup while converting it to appropriate
 * text format for cross-platform compatibility.
 *
 * @public
 */
export declare class HtmlOnlyStringRenderer extends ElementStringRendererBase {
    /**
     * Renders an HTML-only element to formatted text.
     *
     * @remarks
     * Converts HTML-only content to plain text format for broader
     * compatibility. Processes the element's text content through
     * the workspace renderer with text formatting.
     *
     * @param element - The HTML-only element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted text string
     */
    renderToString(element: AbstractDocHtmlOnlyType, type: string): string;
}
/**
 * Renderer for heading elements in documentation.
 *
 * @remarks
 * Converts Doxygen heading elements to Markdown heading syntax.
 * Supports multiple heading levels while providing warnings for
 * potentially problematic heading configurations.
 *
 * @public
 */
export declare class HeadingLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a heading element to formatted Markdown heading lines.
     *
     * @remarks
     * Creates Markdown-style headings with appropriate hash symbols
     * based on the heading level. Warns about level 1 headings that
     * may interfere with Docusaurus page structure.
     *
     * @param element - The heading element to render
     * @param type - The rendering context type
     * @returns Array containing the formatted Markdown heading
     */
    renderToLines(element: AbstractDocHeadingType, type: string): string[];
}
/**
 * Renderer for emoji elements in documentation.
 *
 * @remarks
 * Handles Unicode emoji characters by wrapping them in appropriate
 * HTML span elements with CSS styling. Provides consistent emoji
 * display across different platforms and browsers.
 *
 * @public
 */
export declare class EmojiStringRenderer extends ElementStringRendererBase {
    /**
     * Renders an emoji element to formatted HTML span.
     *
     * @remarks
     * Creates an HTML span element with CSS class for emoji styling
     * and includes the Unicode emoji character. Ensures consistent
     * emoji presentation in documentation output.
     *
     * @param element - The emoji element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted HTML span string with emoji
     */
    renderToString(element: AbstractEmojiType, type: string): string;
}
/**
 * Renderer for blockquote elements in documentation.
 *
 * @remarks
 * Handles blockquote formatting by wrapping content in HTML blockquote
 * elements with appropriate CSS styling. Processes child elements to
 * maintain proper content structure within quotes.
 *
 * @public
 */
export declare class BlockquoteLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a blockquote element to formatted output lines.
     *
     * @remarks
     * Creates HTML blockquote elements with CSS styling and processes
     * child elements to generate properly formatted quoted content
     * with appropriate indentation and styling.
     *
     * @param element - The blockquote element to render
     * @param type - The rendering context type
     * @returns Array of HTML strings forming the blockquote structure
     */
    renderToLines(element: AbstractDocBlockQuoteType, type: string): string[];
}
//# sourceMappingURL=descriptiontype.d.ts.map