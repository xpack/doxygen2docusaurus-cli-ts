import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
/**
 * Abstract base class for XML elements that contain simple string content.
 *
 * @remarks
 * Whilst it might appear unusual to encapsulate string values within object
 * properties, this approach maintains consistency with format-specific
 * elements (such as XXXonly types) and provides a unified interface for
 * XML content processing throughout the Doxygen data model hierarchy.
 *
 * @public
 */
export declare abstract class AbstractStringType extends AbstractDataModelBase {
    /**
     * The textual content extracted from the XML element.
     *
     * @remarks
     * This property stores the inner text content of XML elements that follow
     * the simple string pattern, providing a standardised mechanism for
     * accessing textual data within the Doxygen XML structure.
     */
    text: string;
    /**
     * Constructs an AbstractStringType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the string data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor validates that the provided element contains inner text
     * content and extracts it into the text property. The implementation
     * ensures that no attributes are present on simple string elements,
     * maintaining the expected XML schema constraints.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for Doxygen description elements containing mixed
 * content.
 *
 * @remarks
 * Implements the XML Schema definition for descriptionType elements, which
 * support mixed content (character data between child elements). This class
 * handles the complex structure of documentation descriptions including
 * titles, paragraphs, internal sections, and hierarchical section elements.
 *
 * The implementation processes the sequence of optional title elements
 * followed by various documentation components such as paragraphs, internal
 * documentation, and nested section structures up to level 1.
 *
 * @public
 */
export declare abstract class AbstractDescriptionType extends AbstractDataModelBase {
    /**
     * Optional title element for the description.
     *
     * @remarks
     * Contains the title text for the description section when present.
     * According to the XML schema, only one title element is permitted
     * per description, hence the assertion that ensures uniqueness during
     * parsing.
     */
    title?: string | undefined;
    /**
     * Constructs an AbstractDescriptionType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the description data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes mixed content descriptions by iterating through
     * all inner elements and handling text nodes, title elements, paragraphs,
     * internal sections, and level-1 sections. The parser maintains the
     * original order of elements in the children array whilst extracting
     * the title into a separate property for convenient access.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class providing properties for listing-type XML elements.
 *
 * @remarks
 * Defines the common structure for elements that contain code listings
 * with optional filename attributes. This base class establishes the
 * foundation for both full listing implementations and filtered subsets
 * of code lines.
 *
 * @public
 */
export declare abstract class AbstractListingTypeBase extends AbstractDataModelBase {
    /**
     * Array of code line elements within the listing.
     *
     * @remarks
     * Contains the individual code lines that comprise the listing content.
     * Each code line may include syntax highlighting information, line
     * numbers, and cross-reference data depending on the source
     * documentation configuration.
     */
    codelines?: CodeLineDataModel[] | undefined;
    /**
     * Optional filename attribute for the listing source.
     *
     * @remarks
     * Specifies the original filename of the source code when the listing
     * represents content from a specific file. This attribute assists in
     * providing context and navigation capabilities within the generated
     * documentation.
     */
    filename?: string | undefined;
}
/**
 * Abstract base class for processing listing-type XML elements with parsing
 * logic.
 *
 * @remarks
 * Extends the base listing properties with comprehensive XML parsing
 * capabilities. This class handles the extraction of code lines and
 * filename attributes from Doxygen XML structures, providing the
 * foundation for program listings and similar code-containing elements.
 *
 * The parser processes codeline elements whilst ignoring textual content
 * that may appear between structured elements, maintaining compatibility
 * with the mixed-content nature of XML listings.
 *
 * @public
 */
export declare abstract class AbstractListingType extends AbstractListingTypeBase {
    /**
     * Constructs an AbstractListingType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the listing data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes listing elements by extracting codeline
     * children and filename attributes. Text content between elements is
     * deliberately ignored to accommodate the mixed-content model of XML
     * listings, focusing on the structured code line elements that contain
     * the meaningful programming content.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for programlisting XML elements containing source code.
 *
 * @remarks
 * Represents program listings that contain source code with optional
 * syntax highlighting and line numbering. This implementation processes
 * Doxygen's programlisting elements, which are commonly used to display
 * code examples, function implementations, and other programming content
 * within documentation.
 *
 * @public
 */
export declare class ProgramListingDataModel extends AbstractListingType {
    /**
     * Constructs a ProgramListingDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the programlisting data
     *
     * @remarks
     * This constructor delegates to the parent AbstractListingType to handle
     * the standard listing processing whilst specifically identifying the
     * element as a 'programlisting' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Filtered data model for member-specific program listing content.
 *
 * @remarks
 * Creates a subset of a program listing containing only the code lines
 * that fall within a specified line number range. This class is particularly
 * useful for displaying member function implementations or specific code
 * sections within larger source files, enabling focused documentation
 * that highlights relevant portions of the codebase.
 *
 * The filtering process preserves all code line attributes including
 * syntax highlighting, cross-references, and line numbering whilst
 * restricting the content to the specified range.
 *
 * @public
 */
export declare class MemberProgramListingDataModel extends AbstractListingTypeBase {
    /**
     * Constructs a filtered program listing for member-specific content.
     *
     * @param programListing - The source program listing to filter
     * @param startLine - The first line number to include (inclusive)
     * @param endLine - The last line number to include (inclusive)
     *
     * @remarks
     * This constructor creates a new listing containing only the code lines
     * that fall within the specified line number range. The filtering process
     * examines each code line's line number attribute and includes only those
     * lines where the number falls between startLine and endLine (inclusive).
     *
     * If no lines fall within the specified range, the codelines property
     * remains undefined, indicating an empty filtered result.
     */
    constructor(programListing: ProgramListingDataModel, startLine: number, endLine: number);
}
/**
 * Abstract base class for code line elements with syntax highlighting support.
 *
 * @remarks
 * Implements the XML Schema definition for codelineType elements, which
 * represent individual lines of source code within program listings. Each
 * code line may contain syntax highlighting information, line numbers,
 * cross-references to documentation elements, and external link indicators.
 *
 * All attributes are optional according to the schema, allowing for flexible
 * representation of code content ranging from simple text lines to fully
 * annotated source code with comprehensive metadata.
 *
 * @public
 */
export declare abstract class AbstractCodeLineType extends AbstractDataModelBase {
    /**
     * Array of syntax highlighting elements within the code line.
     *
     * @remarks
     * Contains highlight elements that provide syntax colouring information
     * for different parts of the code line. Each highlight element specifies
     * a highlight class (such as keyword, comment, or string literal) and
     * the corresponding text content to be styled.
     */
    highlights?: HighlightDataModel[] | undefined;
    /**
     * Optional line number for the code line.
     *
     * @remarks
     * Specifies the line number of this code line within the source file.
     * This attribute enables line-based navigation and referencing within
     * the documentation system.
     */
    lineno?: number | undefined;
    /**
     * Optional reference identifier for cross-linking.
     *
     * @remarks
     * Contains a reference ID that can be used to create hyperlinks to
     * related documentation elements such as function definitions, variable
     * declarations, or other documented entities.
     */
    refid?: string | undefined;
    /**
     * Optional reference kind classification.
     *
     * @remarks
     * Specifies the type of reference represented by the refid attribute,
     * such as compound, member, or other Doxygen reference kinds. This
     * classification assists in determining the appropriate link target
     * and display behaviour.
     */
    refkind?: string | undefined;
    /**
     * Optional flag indicating external reference status.
     *
     * @remarks
     * When true, indicates that the reference points to an external
     * documentation source rather than an element within the current
     * documentation set. This flag influences link generation and
     * navigation behaviour.
     */
    external?: boolean | undefined;
    /**
     * Constructs an AbstractCodeLineType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the code line data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes code line elements by extracting highlight
     * children and optional attributes including line numbers, reference IDs,
     * reference kinds, and external flags. The parser handles empty code
     * lines gracefully whilst ignoring textual content that may appear
     * between structured highlight elements.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for individual code line elements within program listings.
 *
 * @remarks
 * Represents a single line of source code with optional syntax highlighting,
 * line numbering, and cross-reference information. This implementation
 * processes Doxygen's codeline elements, which form the fundamental
 * building blocks of program listings and code examples within the
 * documentation.
 *
 * @public
 */
export declare class CodeLineDataModel extends AbstractCodeLineType {
    /**
     * Constructs a CodeLineDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the codeline data
     *
     * @remarks
     * This constructor delegates to the parent AbstractCodeLineType to handle
     * the standard code line processing whilst specifically identifying the
     * element as a 'codeline' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Type definition for Doxygen highlight classification values.
 *
 * @remarks
 * Defines the enumerated values used to classify syntax highlighting
 * within source code listings. These classifications correspond to
 * different programming language constructs and enable appropriate
 * styling and colour coding in the generated documentation.
 *
 * The enumeration includes standard programming constructs such as
 * comments, keywords, and literals, as well as specialised VHDL
 * highlighting categories for hardware description language support.
 *
 * @public
 */
export type DoxHighlightClass = 'comment' | 'normal' | 'preprocessor' | 'keyword' | 'keywordtype' | 'keywordflow' | 'stringliteral' | 'xmlcdata' | 'charliteral' | 'vhdlkeyword' | 'vhdllogic' | 'vhdlchar' | 'vhdldigit';
/**
 * Abstract base class for syntax highlighting elements within code listings.
 *
 * @remarks
 * Implements the XML Schema definition for highlightType elements, which
 * provide syntax highlighting information for portions of source code.
 * Each highlight element contains a mandatory class attribute that specifies
 * the type of syntax element (keyword, comment, etc.) and may contain
 * mixed content including text, spacing elements, and cross-references.
 *
 * The implementation supports the full range of Doxygen highlight classes
 * including standard programming language constructs and specialised
 * VHDL categories for hardware description language documentation.
 *
 * @public
 */
export declare abstract class AbstractHighlightType extends AbstractDataModelBase {
    /**
     * Mandatory highlight classification attribute.
     *
     * @remarks
     * Specifies the syntax highlighting class for this element, determining
     * how the contained text should be styled in the generated documentation.
     * The value must be one of the predefined DoxHighlightClass enumeration
     * values such as 'keyword', 'comment', or 'stringliteral'.
     */
    classs: string;
    /**
     * Constructs an AbstractHighlightType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the highlight data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes highlight elements by extracting the mandatory
     * class attribute and any mixed content including text nodes, spacing
     * elements, and cross-reference elements. The parser maintains the original
     * order of content elements in the children array to preserve the intended
     * layout and formatting of the highlighted code segment.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for syntax highlight elements within code listings.
 *
 * @remarks
 * Represents individual syntax highlighting segments that specify how
 * portions of source code should be styled in the generated documentation.
 * This implementation processes Doxygen's highlight elements, which contain
 * the highlight class information and associated text content for proper
 * syntax colouring.
 *
 * @public
 */
export declare class HighlightDataModel extends AbstractHighlightType {
    /**
     * Constructs a HighlightDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the highlight data
     *
     * @remarks
     * This constructor delegates to the parent AbstractHighlightType to handle
     * the standard highlight processing whilst specifically identifying the
     * element as a 'highlight' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for spacing elements within highlighted code.
 *
 * @remarks
 * Implements the XML Schema definition for spType elements, which represent
 * spacing or whitespace within syntax-highlighted code listings. These
 * elements support mixed content and may include an optional numeric value
 * attribute to specify the amount or type of spacing.
 *
 * Spacing elements are commonly used within highlight elements to preserve
 * proper formatting and indentation of source code whilst maintaining
 * the structured nature of the XML representation.
 *
 * @public
 */
export declare abstract class AbstractSpType extends AbstractDataModelBase {
    /**
     * The textual content of the spacing element.
     *
     * @remarks
     * Contains any text content associated with the spacing element. For
     * simple whitespace elements, this typically contains space characters,
     * tabs, or other whitespace sequences that preserve the original
     * formatting of the source code.
     */
    text: string;
    /**
     * Optional numeric value attribute for spacing specifications.
     *
     * @remarks
     * Specifies a numeric value that may indicate the amount of spacing,
     * tab stops, or other formatting-related measurements. The interpretation
     * of this value depends on the context and the specific spacing
     * requirements of the documentation generator.
     */
    value?: number | undefined;
    /**
     * Constructs an AbstractSpType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the spacing data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes spacing elements by validating that they
     * contain no inner elements (only text content) and extracting any
     * optional value attribute. The implementation ensures proper handling
     * of whitespace preservation within syntax-highlighted code sections.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for spacing elements within syntax-highlighted code.
 *
 * @remarks
 * Represents individual spacing elements that preserve whitespace and
 * formatting within highlighted code segments. This implementation
 * processes Doxygen's sp elements, which maintain proper indentation
 * and spacing in source code listings whilst supporting the structured
 * XML representation of the documentation.
 *
 * @public
 */
export declare class SpDataModel extends AbstractSpType {
    /**
     * Constructs a SpDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the spacing data
     *
     * @remarks
     * This constructor delegates to the parent AbstractSpType to handle
     * the standard spacing processing whilst specifically identifying the
     * element as an 'sp' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for hierarchical documentation section elements.
 *
 * @remarks
 * Provides the common structure for documentation sections at various
 * levels of the hierarchy. All section types share the ability to have
 * an optional title and an optional ID attribute for cross-referencing
 * and navigation purposes.
 *
 * This base class establishes the foundation for the nested section
 * structure that allows for well-organised documentation with proper
 * hierarchical relationships between content elements.
 *
 * @public
 */
export declare abstract class AbstractDocSectType extends AbstractDataModelBase {
    /**
     * Optional title element for the section.
     *
     * @remarks
     * Contains the title data model for the section when present. Section
     * titles provide descriptive headers that help organise and navigate
     * the documentation content within the hierarchical structure.
     */
    title?: TitleDataModel | undefined;
    /**
     * Optional identifier attribute for cross-referencing.
     *
     * @remarks
     * Specifies a unique identifier for the section that can be used for
     * cross-references, hyperlinks, and navigation within the documentation.
     * This ID enables direct linking to specific sections from other parts
     * of the documentation or external sources.
     */
    id: string | undefined;
}
/**
 * Abstract base class for first-level documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docSect1Type elements, which
 * represent the first level of hierarchical sections within documentation
 * descriptions. These sections support mixed content and may contain
 * titles, paragraphs, internal documentation sections, and nested
 * second-level sections.
 *
 * First-level sections form the primary organisational structure for
 * complex documentation content, enabling authors to create well-structured
 * and navigable documentation with clear hierarchical relationships.
 *
 * @public
 */
export declare abstract class AbstractDocSect1Type extends AbstractDocSectType {
    /**
     * Constructs an AbstractDocSect1Type instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the section data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes first-level section elements by extracting
     * title elements, paragraphs, internal sections, and nested second-level
     * sections. The parser maintains the original order of content elements
     * whilst extracting titles and ID attributes for convenient access and
     * cross-referencing capabilities.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for second-level documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docSect2Type elements, which
 * represent the second level of hierarchical sections within documentation
 * descriptions. These sections support mixed content and may contain
 * titles, paragraphs, internal documentation sections, and nested
 * third-level sections.
 *
 * Second-level sections provide additional organisational depth for
 * complex documentation structures, enabling detailed content organisation
 * within first-level sections whilst maintaining clear hierarchical
 * relationships.
 *
 * @public
 */
export declare abstract class AbstractDocSect2Type extends AbstractDocSectType {
    /**
     * Constructs an AbstractDocSect2Type instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the section data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes second-level section elements by extracting
     * title elements, paragraphs, internal sections, and nested third-level
     * sections. The implementation maintains content ordering whilst providing
     * structured access to section metadata and hierarchical content
     * organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocSect3Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocSect4Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocSect5Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocSect6Type extends AbstractDocSectType {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for internal documentation section elements.
 *
 * @remarks
 * Implements the XML Schema definition for docInternalType elements, which
 * represent internal documentation sections containing mixed content. These
 * sections typically contain implementation details, internal notes, or
 * other content that may be conditionally included in the documentation
 * output based on configuration settings.
 *
 * Internal sections support paragraphs and first-level sections, providing
 * flexible content organisation for detailed technical information that
 * may be intended for specific audiences or documentation contexts.
 *
 * @public
 */
export declare abstract class AbstractDocInternalType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocInternalType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal section
     *   data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes internal documentation sections by extracting
     * paragraphs and first-level sections whilst maintaining the mixed content
     * structure. The implementation handles text nodes and structured elements
     * in their original order to preserve the intended layout and flow of
     * internal documentation content.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS1Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS2Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS3Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS4Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS5Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare abstract class AbstractDocInternalS6Type extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type for document title command group elements.
 *
 * @remarks
 * Defines the various types of inline markup elements that can appear
 * within document titles according to the Doxygen XML schema. This union
 * encompasses formatting elements (bold, underline, emphasis), interactive
 * elements (links, anchors, references), structural elements (line breaks),
 * and special character markup elements.
 *
 * The type provides type safety for title parsing operations whilst
 * supporting the full range of inline content that can appear within
 * documentation titles, ensuring proper handling of complex formatted
 * headings and cross-references.
 *
 * @public
 */
export type DocTitleCmdGroup = BoldDataModel | UnderlineDataModel | EmphasisDataModel | ComputerOutputDataModel | RefDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | SubstringDocMarkupType;
/**
 * Parser function for processing document title command group elements.
 *
 * @param xml - The Doxygen XML parser instance for processing XML content
 * @param element - The XML element object containing the title command data
 * @param elementName - The name of the XML element being processed
 * @returns Array of parsed DocTitleCmdGroup elements
 *
 * @remarks
 * This function processes XML elements that contain title command groups,
 * parsing various markup elements such as bold text, emphasis, links,
 * anchors, and special character entities. The parser recognises the
 * different element types and creates appropriate data model instances
 * for each command group element.
 *
 * The function handles the complex variety of inline markup elements
 * that can appear within documentation titles, ensuring proper
 * representation of formatting and cross-reference information.
 *
 * @public
 */
export declare function parseDocTitleCmdGroup(xml: DoxygenXmlParser, element: object, elementName: string): DocTitleCmdGroup[];
/**
 * Base class for document title elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docTitleType elements, which
 * represent document titles containing mixed content including text and
 * various title command group elements. These titles support rich formatting
 * and interactive elements whilst maintaining proper structure for
 * documentation headings and section titles.
 *
 * The implementation processes both textual content and structured markup
 * elements, preserving their original order to maintain the intended
 * formatting and presentation of title content within the documentation
 * hierarchy.
 *
 * @public
 */
export declare class AbstractDocTitleType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocTitleType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the title data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes title elements by extracting both textual
     * content and title command group elements. The parser maintains the
     * original order of content elements whilst delegating structured element
     * processing to the parseDocTitleCmdGroup function for comprehensive
     * title markup support.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type for document command group elements.
 *
 * @remarks
 * Defines the comprehensive set of command elements that can appear within
 * document content according to the Doxygen XML schema. This union encompasses
 * formatting elements (bold, underline, emphasis), structural elements
 * (lists, tables, sections), interactive elements (links, references),
 * specialized documentation elements (parameter lists, cross-references),
 * and special character markup.
 *
 * The type supports the full richness of Doxygen documentation markup,
 * enabling complex document structures with proper type safety for
 * content parsing and generation operations. This includes support for
 * code listings, mathematical formulae, images, and cross-references.
 *
 * @public
 */
export type DocCmdGroup = BoldDataModel | SimpleSectDataModel | UnderlineDataModel | EmphasisDataModel | ParameterListDataModel | ComputerOutputDataModel | RefDataModel | ItemizedListDataModel | LineBreakDataModel | UlinkDataModel | AnchorDataModel | XrefSectDataModel | VariableListDataModel | SubstringDocMarkupType | DocTableDataModel;
/**
 * Abstract base class for document paragraph elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docParaType elements, which
 * represent paragraphs within documentation containing mixed content including
 * text and various document command group elements. These paragraphs form
 * the fundamental content blocks within documentation structures, supporting
 * rich formatting, cross-references, and embedded elements.
 *
 * The implementation processes both textual content and structured markup
 * elements using the document command group parser, maintaining the original
 * order of content elements to preserve the intended layout and presentation
 * of paragraph content.
 *
 * @public
 */
export declare abstract class AbstractDocParaType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocParaType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the paragraph data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes paragraph elements by extracting both textual
     * content and structured command group elements. The parser delegates
     * structured element processing to the parseDocCmdGroup function to handle
     * the full range of document markup elements whilst maintaining the
     * original content order for proper paragraph presentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Base class for document markup elements containing mixed content.
 *
 * @remarks
 * Implements the XML Schema definition for docMarkupType elements, which
 * represent markup containers that support mixed content including text
 * and various document command group elements. These markup elements form
 * the foundation for formatted content within documentation such as bold
 * text, emphasis, and other inline formatting constructs.
 *
 * The implementation processes both textual content and structured markup
 * elements, maintaining their original order to preserve the intended
 * formatting and presentation of the documentation content.
 *
 * @public
 */
export declare class AbstractDocMarkupType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocMarkupType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the markup data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes markup elements by extracting both textual
     * content and structured command group elements. The parser maintains
     * the original order of content elements whilst delegating structured
     * element processing to the parseDocCmdGroup function for comprehensive
     * markup support.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Specialised markup type for substring-based special character elements.
 *
 * @remarks
 * Extends the base markup functionality to include a substring property
 * that stores the actual character or character sequence represented by
 * the markup element. This class is particularly useful for handling
 * special character entities and symbols that need both structural
 * representation and their corresponding textual output.
 *
 * The substring property enables proper rendering of special characters
 * whilst maintaining the XML structure and metadata associated with
 * the markup element.
 *
 * @public
 */
export declare class SubstringDocMarkupType extends AbstractDocMarkupType {
    /**
     * The character or character sequence represented by this markup element.
     *
     * @remarks
     * Contains the actual textual representation of the special character
     * or symbol that this markup element represents. This property enables
     * proper text generation whilst preserving the structured markup
     * information for documentation processing.
     */
    substring: string;
    /**
     * Constructs a SubstringDocMarkupType with associated character data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the markup data
     * @param elementName - The name of the XML element being processed
     * @param substring - The character sequence this markup represents
     *
     * @remarks
     * This constructor extends the base markup processing to associate
     * specific character data with the markup element. This enables
     * special character entities to maintain both their XML structure
     * and their intended textual output for proper document generation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string, substring: string);
}
export declare class CopyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IexclDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CentDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PoundDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CurrenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class YenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class BrvbarDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SectDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UmlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NzwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ZwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OrdfDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ShyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RegisteredDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MacrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DegDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PlusmnDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Sup2DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Sup3DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AcuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MicroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ParaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MiddotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Sup1DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OrdmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Frac14DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Frac12DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class Frac34DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IquestDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AringDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CcedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ETHDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OslashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class YacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class THORNDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SzligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AtildeSmallDocMarkupType extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AringSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AeligSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CcedilSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EthSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DivideDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OslashSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class YacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ThornSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class YumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class FnofDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AlphaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class BetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class GammaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DeltaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ZetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EtaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ThetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IotaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class KappaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LambdaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class XiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OmicronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RhoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SigmaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TauDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PhiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ChiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PsiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OmegaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AlphaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class BetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class GammaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DeltaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ZetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EtaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ThetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IotaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class KappaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LambdaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class XiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OmicronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RhoSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SigmaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SigmafSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TauSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PhiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ChiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PsiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OmegaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ThetasymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UpsihDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class BullDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class HellipDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PrimeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PrimeUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OlineDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class FraslDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class WeierpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ImaginaryDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RealDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TrademarkDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AlefsymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class HarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CrarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class UArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class HArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ForallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PartDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ExistDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EmptyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NablaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IsinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NotinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ProdDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SumDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class MinusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LowastDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RadicDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PropDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InfinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AngDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AndDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CapDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class IntDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class There4DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SimDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CongDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AsympDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EquivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class GeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class NsubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SubeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SupeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OplusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OtimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PerpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SdotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LozDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SpadesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ClubsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class HeartsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DiamsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class OeligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ScaronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ScaronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class YumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class CircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EnspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EmspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ThinspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class ZwnjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LrmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RlmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class SbquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class BdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DaggerDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DaggerUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class PermilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class EuroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for URL link elements within documentation content.
 *
 * @remarks
 * Represents hyperlink elements that reference external URLs or web resources
 * within documentation descriptions. This implementation processes Doxygen's
 * URL link elements, which support mixed content including text and formatting
 * commands within the link text, providing comprehensive support for rich
 * hyperlink content.
 *
 * URL links contain a mandatory URL attribute and support child elements
 * for formatted link text, enabling complex link presentations with styling
 * and embedded markup whilst maintaining proper link functionality.
 *
 * @public
 */
export declare class AbstractDocURLLink extends AbstractDataModelBase {
    /**
     * Target URL for the hyperlink.
     *
     * @remarks
     * Contains the destination URL that the hyperlink should navigate to.
     * This can be an absolute URL to external resources or a relative URL
     * for internal navigation within the documentation structure.
     */
    url: string;
    /**
     * Constructs an AbstractDocURLLink instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the URL link data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes URL link elements by extracting the mandatory
     * URL attribute and processing any mixed content including text and
     * formatting commands within the link. The implementation ensures that
     * a valid URL is present and organises child elements for proper link
     * text rendering.
     *
     * The URL attribute is validated to ensure proper link functionality
     * within the generated documentation output.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for URL link elements within documentation content.
 *
 * @remarks
 * Represents hyperlink elements that reference external URLs or web resources
 * within documentation descriptions. This implementation processes Doxygen's
 * ulink elements, providing support for external linking with formatted
 * link text and proper URL handling.
 *
 * URL links enable documentation to reference external resources, websites,
 * specifications, and related materials whilst maintaining proper hyperlink
 * functionality within the generated documentation output.
 *
 * @public
 */
export declare class UlinkDataModel extends AbstractDocURLLink {
    /**
     * Constructs a UlinkDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the URL link data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocURLLink whilst
     * identifying the element as 'ulink' for proper URL link processing
     * and hyperlink functionality within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for anchor elements within documentation content.
 *
 * @remarks
 * Represents anchor elements that provide navigation targets within
 * documentation descriptions. This implementation processes Doxygen's
 * anchor elements, which create bookmarks or jump targets that can be
 * referenced by cross-references and hyperlinks within the documentation.
 *
 * Anchor elements contain a mandatory ID attribute that serves as the
 * target identifier for navigation purposes. Whilst the schema allows
 * mixed content, anchor elements are typically empty in practice and
 * serve purely as navigation markers.
 *
 * @public
 */
export declare class AbstractDocAnchorType extends AbstractDataModelBase {
    /**
     * Unique identifier for the anchor target.
     *
     * @remarks
     * Contains the unique identifier that serves as the navigation target
     * for cross-references and hyperlinks. This ID is used to generate
     * HTML anchor elements and enable deep linking within documentation.
     */
    id: string;
    /**
     * Constructs an AbstractDocAnchorType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the anchor data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes anchor elements by extracting the mandatory
     * ID attribute whilst handling any unexpected content. Anchor elements
     * are typically empty but the implementation provides error reporting
     * for unexpected text content to ensure proper anchor functionality.
     *
     * The ID attribute is validated to ensure proper anchor target creation
     * within the generated documentation output.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for anchor elements within documentation content.
 *
 * @remarks
 * Represents anchor elements that provide navigation targets within
 * documentation descriptions. This implementation processes Doxygen's
 * anchor elements, creating bookmarks or jump targets for cross-references
 * and deep linking functionality within the documentation structure.
 *
 * Anchor elements enable precise navigation within documentation pages,
 * allowing users to link directly to specific content sections and
 * providing enhanced usability for complex documentation structures.
 *
 * @public
 */
export declare class AnchorDataModel extends AbstractDocAnchorType {
    /**
     * Constructs an AnchorDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the anchor data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocAnchorType whilst
     * identifying the element as 'anchor' for proper navigation target
     * creation and cross-reference functionality within documentation
     * generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for mathematical formula elements within documentation.
 *
 * @remarks
 * Represents mathematical formula elements that contain LaTeX expressions
 * or mathematical notation within documentation descriptions. This
 * implementation processes Doxygen's formula elements, which typically
 * contain LaTeX code for mathematical expressions and equations.
 *
 * Formula elements include both an ID attribute for cross-referencing
 * and text content containing the mathematical expression. The text
 * content is usually LaTeX code that can be processed by mathematical
 * rendering systems in the documentation output.
 *
 * @public
 */
export declare abstract class AbstractDocFormulaType extends AbstractDataModelBase {
    /**
     * Mathematical expression or formula content.
     *
     * @remarks
     * Contains the mathematical expression, typically in LaTeX format,
     * that represents the formula. This text is processed by mathematical
     * rendering systems to display properly formatted equations and
     * expressions within the documentation output.
     */
    text: string;
    /**
     * Unique identifier for the formula element.
     *
     * @remarks
     * Contains the unique identifier for the formula that can be used for
     * cross-referencing and linking within the documentation. This enables
     * references to specific mathematical expressions from other parts of
     * the documentation.
     */
    id: string;
    /**
     * Constructs an AbstractDocFormulaType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the formula data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes formula elements by extracting the text
     * content containing the mathematical expression and the mandatory ID
     * attribute for cross-referencing. The implementation validates that
     * both the formula text and ID are present to ensure proper mathematical
     * content representation.
     *
     * The formula text is typically LaTeX code that requires appropriate
     * rendering support in the documentation output system.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for mathematical formula elements within documentation content.
 *
 * @remarks
 * Represents mathematical formula elements that contain LaTeX expressions
 * or mathematical notation within documentation descriptions. This
 * implementation processes Doxygen's formula elements, providing support
 * for mathematical content including equations, expressions, and notation
 * that enhance technical documentation.
 *
 * Formula elements enable the inclusion of properly formatted mathematical
 * content within documentation, supporting complex technical documentation
 * requirements for mathematical and scientific applications.
 *
 * @public
 */
export declare class FormulaDataModel extends AbstractDocFormulaType {
    /**
     * Constructs a FormulaDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the formula data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocFormulaType whilst
     * identifying the element as 'formula' for proper mathematical content
     * processing and rendering within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for index entry elements within documentation.
 *
 * @remarks
 * Represents index entry elements that define entries for documentation
 * indices and keyword lists. This implementation processes Doxygen's
 * index entry elements, which consist of primary and secondary index
 * terms that enable comprehensive documentation indexing and search
 * functionality.
 *
 * Index entries support hierarchical indexing with primary and secondary
 * terms, allowing for detailed organisation of documentation content
 * according to topics, concepts, and keywords for enhanced discoverability.
 *
 * @public
 */
export declare abstract class AbstractDocIndexEntryType extends AbstractDataModelBase {
    /**
     * Primary index term or keyword.
     *
     * @remarks
     * Contains the main index term that serves as the primary classification
     * for the index entry. This term appears as the top-level entry in
     * generated indices and search systems, providing the primary access
     * point for content discovery.
     */
    primaryie: string;
    /**
     * Secondary index term or sub-keyword.
     *
     * @remarks
     * Contains the secondary index term that provides additional classification
     * beneath the primary term. This enables hierarchical index organisation
     * where related concepts can be grouped under broader categories for
     * more precise content classification.
     */
    secondaryie: string;
    /**
     * Constructs an AbstractDocIndexEntryType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the index entry data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes index entry elements by extracting the
     * primary and secondary index terms from the XML content. The
     * implementation handles both terms as optional to accommodate various
     * indexing scenarios whilst providing comprehensive index functionality.
     *
     * The index terms are used to generate searchable indices and keyword
     * lists that enhance documentation navigation and content discovery.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for index entry elements within documentation content.
 *
 * @remarks
 * Represents index entry elements that define entries for documentation
 * indices and keyword lists. This implementation processes Doxygen's
 * indexentry elements, providing support for hierarchical indexing with
 * primary and secondary terms that enhance content organisation and
 * discoverability.
 *
 * Index entries enable comprehensive documentation indexing that supports
 * search functionality and content navigation, helping users locate
 * specific topics and concepts within large documentation sets.
 *
 * @public
 */
export declare class IndexEntryDataModel extends AbstractDocIndexEntryType {
    /**
     * Constructs an IndexEntryDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the index entry data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocIndexEntryType whilst
     * identifying the element as 'indexentry' for proper index term processing
     * and search functionality within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for documentation list elements within content.
 *
 * @remarks
 * Provides foundational structure for ordered and unordered list elements
 * that organise content hierarchically within documentation. This abstract
 * class manages list items and common attributes such as type and starting
 * values, enabling consistent processing of various list formats including
 * bullet points, numbered lists, and custom enumeration styles.
 *
 * Lists enhance content organisation by enabling clear presentation of
 * structured information, supporting both simple and complex hierarchical
 * arrangements that improve documentation readability and user comprehension.
 *
 * @public
 */
export declare abstract class AbstractDocListType extends AbstractDataModelBase {
    /**
     * Array of list items contained within this list element.
     *
     * @remarks
     * Contains all individual list items that constitute the list content,
     * maintaining order and hierarchy for proper list rendering within
     * documentation output.
     */
    listItems: ListItemDataModel[];
    /**
     * The list type identifier for formatting purposes.
     *
     * @remarks
     * Specifies the list type such as 'bullet', 'number', or custom
     * enumeration styles that determine the visual presentation of list items
     * within the rendered documentation.
     */
    type: string;
    /**
     * Optional starting value for ordered lists.
     *
     * @remarks
     * Defines the initial value for numbered lists when custom starting
     * points are required, allowing documentation to continue numbering from
     * specific values or restart sequences as needed.
     */
    start: number | undefined;
    /**
     * Constructs an AbstractDocListType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the list data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes XML list elements by extracting list items
     * and attributes that define list behaviour and appearance, enabling
     * proper list structure within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for individual list item elements.
 *
 * @remarks
 * Represents individual items within ordered and unordered lists, providing
 * structure for list content including paragraphs and optional attributes
 * that control list item presentation. This abstract class enables flexible
 * list item processing whilst maintaining consistency across different list
 * types and documentation contexts.
 *
 * List items support complex content including multiple paragraphs and
 * custom numbering, allowing for rich documentation structures that enhance
 * content organisation and readability within generated documentation.
 *
 * @public
 */
export declare abstract class AbstractDocListItemType extends AbstractDataModelBase {
    /**
     * Optional array of paragraph elements within this list item.
     *
     * @remarks
     * Contains paragraph content that constitutes the list item body,
     * supporting rich content including text, formatting, and nested
     * elements that enhance list item presentation.
     */
    paras?: ParaDataModel[] | undefined;
    /**
     * Optional override attribute for list item customisation.
     *
     * @remarks
     * Provides mechanism for overriding default list item presentation or
     * behaviour, enabling custom formatting or special handling of specific
     * list items within documentation generation.
     */
    override: string | undefined;
    /**
     * Optional numeric value for ordered list items.
     *
     * @remarks
     * Specifies custom numbering for ordered list items when default
     * sequential numbering is insufficient, allowing for custom values and
     * non-sequential list numbering in documentation output.
     */
    value: number | undefined;
    /**
     * Constructs an AbstractDocListItemType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the list item data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes XML list item elements by extracting paragraph
     * content and optional attributes that define list item behaviour and
     * presentation within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ListItemDataModel extends AbstractDocListItemType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for simple section elements with typed content.
 *
 * @remarks
 * Implements the XML Schema definition for docSimpleSectType elements, which
 * represent structured sections with specific semantic types such as 'note',
 * 'warning', 'see', 'return', 'since', and others. These sections provide
 * standardised content blocks for common documentation patterns and help
 * organise information according to its purpose and meaning.
 *
 * Simple sections contain an optional title and a sequence of paragraphs,
 * along with a mandatory kind attribute that specifies the semantic type
 * of the section content.
 *
 * @public
 */
export declare abstract class AbstractDocSimpleSectType extends AbstractDataModelBase {
    /**
     * Optional title for the simple section.
     *
     * @remarks
     * Contains the title text for the simple section when present. Simple
     * sections may have descriptive titles that provide additional context
     * beyond the semantic type indicated by the kind attribute.
     */
    title?: string | undefined;
    /**
     * Mandatory kind attribute specifying the section type.
     *
     * @remarks
     * Specifies the semantic type of the simple section such as 'note',
     * 'warning', 'see', 'return', 'since', 'version', 'author', or other
     * predefined section types. This attribute determines how the section
     * content should be interpreted and potentially styled in the output.
     */
    kind: string;
    /**
     * Constructs an AbstractDocSimpleSectType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the simple section data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes simple section elements by extracting the
     * title, paragraph content, and mandatory kind attribute. The implementation
     * validates the presence of the kind attribute and organises content
     * elements whilst maintaining their original order for proper presentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for reference text elements with links.
 *
 * @remarks
 * Represents textual references that link to other documentation elements,
 * providing cross-reference functionality within documentation content.
 * This abstract class handles mixed content including text and formatting
 * elements alongside reference attributes that specify the target and type
 * of the reference link.
 *
 * Reference text elements enable navigation between related documentation
 * sections, supporting both internal references within the documentation
 * set and external references to other documentation sources or websites.
 *
 * @public
 */
export declare abstract class AbstractDocRefTextType extends AbstractDataModelBase {
    /**
     * Mandatory reference identifier for the linked element.
     *
     * @remarks
     * Specifies the unique identifier of the referenced documentation element,
     * enabling precise linking to specific functions, classes, or other
     * documented entities within the documentation set.
     */
    refid: string;
    /**
     * Mandatory reference kind specifying the type of referenced element.
     *
     * @remarks
     * Indicates the type of element being referenced such as 'compound',
     * 'member', or other entity types, helping the documentation system
     * resolve and format the reference appropriately.
     */
    kindref: string;
    /**
     * Optional external reference attribute for external links.
     *
     * @remarks
     * Specifies external documentation sources when the reference points to
     * elements outside the current documentation set, enabling links to
     * external APIs, libraries, or documentation websites.
     */
    external?: string | undefined;
    /**
     * Constructs an AbstractDocRefTextType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the reference data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes reference text elements by extracting mixed
     * content and reference attributes, enabling proper cross-reference
     * functionality within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class RefDataModel extends AbstractDocRefTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for table elements within documentation content.
 *
 * @remarks
 * Represents tabular data structures that organise content into rows and
 * columns, providing structured presentation of information within
 * documentation. This abstract class manages table structure including
 * optional captions, table rows, and sizing attributes that control table
 * appearance and layout within generated documentation.
 *
 * Tables support complex content organisation enabling clear presentation
 * of structured data, comparison information, and technical specifications
 * that enhance documentation readability and user comprehension.
 *
 * @public
 */
export declare abstract class AbstractDocTableType extends AbstractDataModelBase {
    /**
     * Optional caption element for the table.
     *
     * @remarks
     * Contains descriptive text that provides context or explanation for the
     * table content, typically displayed above or below the table in the
     * rendered documentation output.
     */
    caption?: DocCaptionDataModel;
    /**
     * Optional array of table rows containing table data.
     *
     * @remarks
     * Contains all row elements that constitute the table content, maintaining
     * order and structure for proper table rendering within documentation
     * generation workflows.
     */
    rows?: DocRowDataModel[];
    /**
     * Mandatory number of rows in the table.
     *
     * @remarks
     * Specifies the total number of rows that the table should contain,
     * enabling proper table structure validation and layout calculation
     * during documentation generation.
     */
    rowsCount: number;
    /**
     * Mandatory number of columns in the table.
     *
     * @remarks
     * Specifies the total number of columns that the table should contain,
     * enabling proper table structure validation and layout calculation
     * during documentation generation.
     */
    colsCount: number;
    /**
     * Optional width specification for the table.
     *
     * @remarks
     * Defines the table width using CSS-style values such as percentages,
     * pixels, or other units, allowing control over table presentation and
     * layout within the documentation output.
     */
    width: string | undefined;
    /**
     * Constructs an AbstractDocTableType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the table data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes table elements by extracting caption, rows,
     * and sizing attributes that define table structure and appearance within
     * documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class DocTableDataModel extends AbstractDocTableType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for table row elements within table structures.
 *
 * @remarks
 * Represents individual rows within table elements, containing a sequence
 * of entry elements that constitute the row's cell content. This abstract
 * class provides structure for table row processing whilst maintaining
 * flexibility for different row types and table configurations within
 * documentation content.
 *
 * Table rows organise content horizontally across table columns, enabling
 * structured data presentation that supports complex information layouts
 * and enhances documentation readability through clear data organisation.
 *
 * @public
 */
export declare abstract class AbstractDocRowType extends AbstractDataModelBase {
    /**
     * Optional array of entry elements constituting the row content.
     *
     * @remarks
     * Contains the individual cell entries that make up this table row,
     * maintaining order and structure for proper table rendering within
     * documentation generation workflows.
     */
    entries?: DocEntryDataModel[] | undefined;
    /**
     * Constructs an AbstractDocRowType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the row data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes table row elements by extracting entry
     * elements that define the row's cell content within documentation
     * generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class DocRowDataModel extends AbstractDocRowType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for table entry (cell) elements within table rows.
 *
 * @remarks
 * Represents individual cells within table rows, containing paragraph
 * content and various attributes that control cell presentation and layout.
 * This abstract class provides comprehensive support for table cell
 * functionality including header designation, spanning, alignment, and
 * styling attributes that enable rich table formatting within documentation.
 *
 * Table entries support complex content organisation through paragraph
 * elements and flexible presentation through layout attributes, enabling
 * professional table design that enhances documentation clarity and
 * visual appeal.
 *
 * @public
 */
export declare abstract class AbstractDocEntryType extends AbstractDataModelBase {
    /**
     * Optional array of paragraph elements within this table entry.
     *
     * @remarks
     * Contains the paragraph content that constitutes the cell content,
     * supporting rich text formatting and nested elements within table
     * cells for comprehensive documentation presentation.
     */
    paras?: ParaDataModel[] | undefined;
    /**
     * Boolean flag indicating whether this entry is a table header.
     *
     * @remarks
     * Determines whether this cell should be treated as a header cell,
     * affecting its visual presentation and semantic meaning within the
     * table structure for improved accessibility and styling.
     */
    thead: boolean;
    /**
     * Optional column span value for cell spanning.
     *
     * @remarks
     * Specifies the number of columns this cell should span horizontally,
     * enabling complex table layouts with merged cells that improve data
     * organisation and presentation clarity.
     */
    colspan?: number | undefined;
    /**
     * Optional row span value for cell spanning.
     *
     * @remarks
     * Specifies the number of rows this cell should span vertically,
     * enabling complex table layouts with merged cells that improve data
     * organisation and presentation clarity.
     */
    rowspan?: number | undefined;
    /**
     * Optional horizontal alignment specification for cell content.
     *
     * @remarks
     * Controls the horizontal alignment of content within the cell such as
     * 'left', 'center', 'right', or 'justify', enabling precise content
     * positioning for improved table presentation.
     */
    align?: string | undefined;
    /**
     * Optional vertical alignment specification for cell content.
     *
     * @remarks
     * Controls the vertical alignment of content within the cell such as
     * 'top', 'middle', or 'bottom', enabling precise content positioning
     * for improved table presentation.
     */
    valign?: string | undefined;
    /**
     * Optional width specification for the table entry.
     *
     * @remarks
     * Defines the cell width using CSS-style values such as percentages,
     * pixels, or other units, allowing precise control over table column
     * sizing and layout appearance.
     */
    width?: string | undefined;
    /**
     * Optional CSS class specification for styling purposes.
     *
     * @remarks
     * Provides CSS class names for custom styling of table cells, enabling
     * enhanced visual presentation and consistent styling across
     * documentation output.
     */
    classs?: string | undefined;
    /**
     * Constructs an AbstractDocEntryType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the entry data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes table entry elements by extracting paragraph
     * content and layout attributes that define cell structure and appearance
     * within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class DocEntryDataModel extends AbstractDocEntryType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for caption elements within documentation content.
 *
 * @remarks
 * Represents caption elements that provide descriptive text for tables,
 * figures, images, and other content elements within documentation.
 * This abstract class handles mixed content including text and formatting
 * commands alongside an identifier attribute for cross-referencing and
 * linking purposes.
 *
 * Captions enhance content accessibility and understanding by providing
 * descriptive context for visual and structured elements, supporting
 * comprehensive documentation that improves user comprehension and
 * content navigation.
 *
 * @public
 */
export declare abstract class AbstractDocCaptionType extends AbstractDataModelBase {
    /**
     * Mandatory identifier for the caption element.
     *
     * @remarks
     * Specifies the unique identifier for this caption element, enabling
     * cross-referencing and linking within documentation generation
     * workflows and supporting proper caption association with content.
     */
    id: string;
    /**
     * Constructs an AbstractDocCaptionType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the caption data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes caption elements by extracting mixed content
     * including text and formatting commands alongside the mandatory identifier
     * attribute within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class DocCaptionDataModel extends AbstractDocCaptionType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocHeadingType extends AbstractDataModelBase {
    level: number;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class HeadingDataModel extends AbstractDocHeadingType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for image elements within documentation content.
 *
 * @remarks
 * Represents image elements that can be embedded within documentation
 * descriptions and content blocks. This implementation processes Doxygen's
 * image elements, which support multiple output formats (HTML, LaTeX,
 * DocBook, RTF, XML) and provide comprehensive image metadata including
 * dimensions, captions, alternative text, and inline positioning.
 *
 * Image elements support mixed content with text and formatting commands,
 * allowing for rich image descriptions and captions. The class tracks HTML
 * images specifically for asset copying during documentation generation.
 *
 * @public
 */
export declare abstract class AbstractDocImageType extends AbstractDataModelBase {
    /**
     * Output format type for the image.
     *
     * @remarks
     * Specifies the target output format for the image, such as 'html',
     * 'latex', 'docbook', 'rtf', or 'xml'. This determines how the image
     * should be processed and rendered in different documentation outputs.
     */
    type?: string | undefined;
    /**
     * Name or path of the image file.
     *
     * @remarks
     * Contains the filename or path to the image resource. For HTML images,
     * this typically references files that need to be copied to the output
     * folder during documentation generation.
     */
    name?: string | undefined;
    /**
     * Width specification for the image.
     *
     * @remarks
     * Specifies the desired width for the image rendering. The format and
     * units depend on the target output format and may include CSS-style
     * dimensions or format-specific measurements.
     */
    width?: string | undefined;
    /**
     * Height specification for the image.
     *
     * @remarks
     * Specifies the desired height for the image rendering. The format and
     * units depend on the target output format and may include CSS-style
     * dimensions or format-specific measurements.
     */
    height?: string | undefined;
    /**
     * Alternative text for accessibility and fallback purposes.
     *
     * @remarks
     * Provides descriptive text for the image that can be used by screen
     * readers and displayed when the image cannot be loaded. This supports
     * accessibility requirements and fallback presentation.
     */
    alt?: string | undefined;
    /**
     * Inline positioning flag for the image.
     *
     * @remarks
     * Determines whether the image should be rendered inline with text
     * content or as a block-level element. Inline images flow with text
     * whilst block images create separate content sections.
     */
    inline?: boolean | undefined;
    /**
     * Caption text for the image.
     *
     * @remarks
     * Provides descriptive caption text that accompanies the image display.
     * Captions typically appear below or adjacent to the image and provide
     * additional context or explanation for the visual content.
     */
    caption?: string | undefined;
    /**
     * Constructs an AbstractDocImageType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the image data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes image elements by extracting all optional
     * attributes including type, name, dimensions, alternative text, inline
     * positioning, and caption information. For HTML images with local file
     * references, the image is registered with the parser for asset tracking
     * during documentation generation.
     *
     * The implementation also processes any mixed content within the image
     * element, including text and formatting commands that may be part of
     * the image description or caption.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for image elements within documentation content.
 *
 * @remarks
 * Represents image elements that embed visual content within documentation
 * descriptions and content blocks. This implementation processes Doxygen's
 * image elements, providing support for multiple output formats and
 * comprehensive image metadata management.
 *
 * Images can include formatting content, captions, and metadata attributes
 * that control their presentation across different documentation outputs.
 * The class ensures proper asset tracking for HTML images during the
 * documentation generation process.
 *
 * @public
 */
export declare class ImageDataModel extends AbstractDocImageType {
    /**
     * Constructs an ImageDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the image data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocImageType whilst
     * identifying the element as 'image' for proper image processing and
     * asset management within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for parameter list elements within documentation.
 *
 * @remarks
 * Represents parameter lists that document function and method parameters,
 * return values, exceptions, and other parameter-related information.
 * This abstract class manages collections of parameter items and their
 * associated metadata, providing structured documentation for function
 * signatures and parameter descriptions.
 *
 * Parameter lists support various parameter documentation types including
 * input parameters, output parameters, return values, and exceptions,
 * enabling comprehensive function documentation that enhances API
 * understanding and usage.
 *
 * @public
 */
export declare abstract class AbstractDocParamListType extends AbstractDataModelBase {
    /**
     * Optional array of parameter items within this parameter list.
     *
     * @remarks
     * Contains individual parameter item elements that document specific
     * parameters, return values, or exceptions associated with functions
     * and methods within the documentation.
     */
    parameterItems?: ParameterItemDataModel[] | undefined;
    /**
     * Mandatory kind attribute specifying the parameter list type.
     *
     * @remarks
     * Specifies the type of parameter list such as 'param', 'retval',
     * 'exception', 'templateparam', or other parameter documentation
     * types that determine how the parameter list should be interpreted
     * and formatted in documentation output.
     */
    kind: string;
    /**
     * Constructs an AbstractDocParamListType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the parameter list data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes parameter list elements by extracting
     * parameter items and the mandatory kind attribute that defines the
     * parameter list type within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ParameterListDataModel extends AbstractDocParamListType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocParamListItem extends AbstractDataModelBase {
    parameterDescription: ParameterDescriptionDataModel | undefined;
    parameterNameList?: ParameterNamelistDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ParameterItemDataModel extends AbstractDocParamListItem {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocParamNameList extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocParamType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocParamName extends AbstractDataModelBase {
    direction: string | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class ParameterNameDataModel extends AbstractDocParamName {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for cross-reference section elements.
 *
 * @remarks
 * Represents cross-reference sections that provide links and references to
 * related documentation elements, enabling navigation between connected
 * content areas. This abstract class manages cross-reference sections
 * including optional titles and mandatory descriptions that provide context
 * and detail for the referenced content.
 *
 * Cross-reference sections enhance documentation usability by establishing
 * clear relationships between related topics, supporting comprehensive
 * navigation and content discovery within large documentation sets.
 *
 * @public
 */
export declare abstract class AbstractDocXRefSectType extends AbstractDataModelBase {
    /**
     * Optional title for the cross-reference section.
     *
     * @remarks
     * Contains the title text for the cross-reference section when present,
     * providing descriptive context for the referenced content and improving
     * section identification within documentation output.
     */
    xreftitle: string | undefined;
    /**
     * Mandatory description for the cross-reference section.
     *
     * @remarks
     * Contains detailed descriptive content for the cross-reference section,
     * providing comprehensive information about the referenced content and
     * its relationship to the current documentation context.
     */
    xrefdescription: XrefDescriptionDataModel | undefined;
    /**
     * Mandatory identifier for the cross-reference section.
     *
     * @remarks
     * Specifies the unique identifier for this cross-reference section,
     * enabling precise linking and referencing within documentation
     * generation workflows and cross-reference resolution.
     */
    id: string;
    /**
     * Constructs an AbstractDocXRefSectType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the cross-reference data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes cross-reference section elements by extracting
     * title, description, and identifier information that defines cross-reference
     * relationships within documentation generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class XrefSectDataModel extends AbstractDocXRefSectType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocBlockQuoteType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class BlockquoteDataModel extends AbstractDocBlockQuoteType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Abstract base class for emoji elements within documentation content.
 *
 * @remarks
 * Represents emoji elements that can be embedded within documentation
 * content to enhance visual communication and expression. This abstract
 * class manages emoji data including both human-readable names and
 * Unicode representations that enable consistent emoji rendering across
 * different documentation output formats and platforms.
 *
 * Emoji elements support modern documentation practices by enabling
 * expressive visual communication that can improve user engagement and
 * content accessibility in appropriate documentation contexts.
 *
 * @public
 */
export declare abstract class AbstractEmojiType extends AbstractDataModelBase {
    /**
     * The human-readable name identifier for the emoji.
     *
     * @remarks
     * Specifies the emoji name using standard emoji naming conventions,
     * enabling consistent emoji identification and providing fallback
     * representation when Unicode rendering is not available.
     */
    name: string;
    /**
     * The Unicode code point representation for the emoji.
     *
     * @remarks
     * Contains the Unicode code point or sequence that defines the emoji
     * character, enabling proper emoji rendering in Unicode-capable
     * documentation output formats and systems.
     */
    unicode: string;
    /**
     * Constructs an AbstractEmojiType from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the emoji data
     * @param elementName - The XML element name for identification purposes
     *
     * @remarks
     * This constructor processes emoji elements by extracting name and Unicode
     * attributes that define emoji representation within documentation
     * generation workflows.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class EmojiDataModel extends AbstractEmojiType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for brief description elements within documentation.
 *
 * @remarks
 * Represents brief description elements that provide concise summary
 * content for entities. This implementation processes Doxygen's
 * briefdescription elements, which contain short descriptive content
 * used for entity summaries, overviews, and quick reference information
 * within documentation structures.
 *
 * Brief descriptions are typically displayed in listings, summaries,
 * and overview sections to provide immediate context about documented
 * entities without requiring full detailed descriptions.
 *
 * @public
 */
export declare class BriefDescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs a BriefDescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the brief description
     *   data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'briefdescription' for concise summary
     * content processing and documentation organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * @public
 */
/**
 * Data model for detailed description elements within documentation.
 *
 * @remarks
 * Represents detailed description elements that provide comprehensive
 * documentation content for entities. This implementation processes
 * Doxygen's detaileddescription elements, which contain extensive
 * descriptive content including paragraphs, sections, lists, and
 * other rich documentation structures.
 *
 * @public
 */
export declare class DetailedDescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs a DetailedDescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the detailed
     *   description data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'detaileddescription' for comprehensive
     * content processing and documentation organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for in-body description elements within documentation.
 *
 * @remarks
 * Represents in-body description elements that provide documentation
 * content embedded within source code bodies. This implementation
 * processes Doxygen's inbodydescription elements for documentation
 * that appears inline within code implementations.
 *
 * @public
 */
export declare class InbodyDescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs an InbodyDescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the in-body
     *   description data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'inbodydescription' for inline documentation
     * content processing within code implementations.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for general description elements within documentation.
 *
 * @remarks
 * Represents general description elements that provide standard documentation
 * content for entities. This implementation processes Doxygen's description
 * elements, which contain descriptive content including paragraphs and
 * other documentation structures for general-purpose descriptions.
 *
 * @public
 */
export declare class DescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs a DescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the description data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'description' for general-purpose description
     * content processing and documentation organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for cross-reference description elements within documentation.
 *
 * @remarks
 * Represents cross-reference description elements that provide descriptive
 * content for cross-references and related sections. This implementation
 * processes Doxygen's xrefdescription elements for documentation content
 * associated with cross-reference sections and related material.
 *
 * @public
 */
export declare class XrefDescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs an XrefDescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the cross-reference
     *   description data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'xrefdescription' for cross-reference section
     * content processing and related documentation organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for parameter description elements within documentation.
 *
 * @remarks
 * Represents parameter description elements that provide descriptive content
 * for function and method parameters. This implementation processes Doxygen's
 * parameterdescription elements for parameter documentation within parameter
 * lists and function descriptions.
 *
 * @public
 */
export declare class ParameterDescriptionDataModel extends AbstractDescriptionType {
    /**
     * Constructs a ParameterDescriptionDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the parameter
     *   description data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDescriptionType whilst
     * identifying the element as 'parameterdescription' for parameter-specific
     * documentation content processing within function documentation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections that contain content marked
 * as internal or implementation-specific within documentation. This
 * implementation processes Doxygen's internal elements for organising
 * content that is typically hidden from public documentation views
 * but retained for developer reference.
 *
 * @public
 */
export declare class InternalDataModel extends AbstractDocInternalType {
    /**
     * Constructs an InternalDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal section
     *   data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalType to
     * handle internal section processing whilst identifying the element as
     * 'internal' for proper content organisation and visibility control.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for first-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the first hierarchical level
 * within section structures. This implementation processes Doxygen's internal
 * elements that appear within first-level sections, providing organised
 * internal content that is typically excluded from public documentation.
 *
 * @public
 */
export declare class InternalS1DataModel extends AbstractDocInternalS1Type {
    /**
     * Constructs an InternalS1DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S1
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS1Type whilst
     * identifying the element as 'internal' for first-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for second-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the second hierarchical level
 * within section structures. This implementation processes internal content
 * that appears within second-level sections for detailed internal documentation
 * organisation.
 *
 * @public
 */
export declare class InternalS2DataModel extends AbstractDocInternalS2Type {
    /**
     * Constructs an InternalS2DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S2
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS2Type whilst
     * identifying the element as 'internal' for second-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for third-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the third hierarchical level
 * for detailed internal content organisation within deeply nested section
 * structures.
 *
 * @public
 */
export declare class InternalS3DataModel extends AbstractDocInternalS3Type {
    /**
     * Constructs an InternalS3DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S3
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS3Type whilst
     * identifying the element as 'internal' for third-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for fourth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the fourth hierarchical level
 * for very detailed internal content organisation within deeply nested
 * documentation structures.
 *
 * @public
 */
export declare class InternalS4DataModel extends AbstractDocInternalS4Type {
    /**
     * Constructs an InternalS4DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S4
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS4Type whilst
     * identifying the element as 'internal' for fourth-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for fifth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the fifth hierarchical level
 * for extremely detailed internal content organisation within complex
 * documentation hierarchies.
 *
 * @public
 */
export declare class InternalS5DataModel extends AbstractDocInternalS5Type {
    /**
     * Constructs an InternalS5DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S5
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS5Type whilst
     * identifying the element as 'internal' for fifth-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for sixth-level internal documentation section elements.
 *
 * @remarks
 * Represents internal documentation sections at the deepest hierarchical level
 * supported by the schema for comprehensive internal content organisation
 * within complex documentation structures.
 *
 * @public
 */
export declare class InternalS6DataModel extends AbstractDocInternalS6Type {
    /**
     * Constructs an InternalS6DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the internal S6
     *   section data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocInternalS6Type whilst
     * identifying the element as 'internal' for sixth-level internal content.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for first-level section elements within documentation.
 *
 * @remarks
 * Represents level-1 sections that form the primary organisational structure
 * within documentation descriptions. This implementation processes Doxygen's
 * sect1 elements, which contain titles, paragraphs, internal sections, and
 * nested level-2 sections, providing the foundation for hierarchical
 * documentation organisation.
 *
 * @public
 */
export declare class Sect1DataModel extends AbstractDocSect1Type {
    /**
     * Constructs a Sect1DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect1 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect1Type to handle
     * the standard first-level section processing whilst specifically
     * identifying the element as a 'sect1' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for second-level section elements within documentation.
 *
 * @remarks
 * Represents level-2 sections that provide additional organisational depth
 * within first-level sections. This implementation processes Doxygen's
 * sect2 elements, which contain titles, paragraphs, internal sections, and
 * nested level-3 sections, enabling detailed content structuring within
 * the documentation hierarchy.
 *
 * @public
 */
export declare class Sect2DataModel extends AbstractDocSect2Type {
    /**
     * Constructs a Sect2DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect2 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect2Type to handle
     * the standard second-level section processing whilst specifically
     * identifying the element as a 'sect2' type for proper XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for third-level section elements within documentation.
 *
 * @remarks
 * Represents level-3 sections that provide detailed subsection organisation
 * within second-level sections. This implementation processes Doxygen's
 * sect3 elements for granular content structuring.
 *
 * @public
 */
export declare class Sect3DataModel extends AbstractDocSect3Type {
    /**
     * Constructs a Sect3DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect3 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect3Type to handle
     * third-level section processing whilst identifying the element as 'sect3'.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for fourth-level section elements within documentation.
 *
 * @remarks
 * Represents level-4 sections for deep hierarchical content organisation.
 * This implementation processes Doxygen's sect4 elements within the
 * documentation structure hierarchy.
 *
 * @public
 */
export declare class Sect4DataModel extends AbstractDocSect4Type {
    /**
     * Constructs a Sect4DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect4 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect4Type whilst
     * identifying the element as 'sect4' for schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for fifth-level section elements within documentation.
 *
 * @remarks
 * Represents level-5 sections for very detailed content organisation.
 * This implementation processes Doxygen's sect5 elements within deeply
 * nested documentation structures.
 *
 * @public
 */
export declare class Sect5DataModel extends AbstractDocSect5Type {
    /**
     * Constructs a Sect5DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect5 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect5Type whilst
     * identifying the element as 'sect5' for schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for sixth-level section elements within documentation.
 *
 * @remarks
 * Represents the deepest level of section organisation supported by the
 * Doxygen schema. This implementation processes Doxygen's sect6 elements
 * for maximum hierarchical depth in documentation structures.
 *
 * @public
 */
export declare class Sect6DataModel extends AbstractDocSect6Type {
    /**
     * Constructs a Sect6DataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the sect6 data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSect6Type whilst
     * identifying the element as 'sect6' for schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for title elements within documentation structures.
 *
 * @remarks
 * Represents title elements that provide descriptive headings for sections,
 * tables, figures, and other documentation components. This implementation
 * processes Doxygen's title elements, which support rich formatting and
 * mixed content to create informative and properly styled headings.
 *
 * @public
 */
export declare class TitleDataModel extends AbstractDocTitleType {
    /**
     * Constructs a TitleDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the title data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocTitleType to handle
     * title processing whilst identifying the element as 'title' for proper
     * XML schema compliance.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for term elements within definition lists.
 *
 * @remarks
 * Represents term elements that provide the definition term within variable
 * lists and definition structures. This implementation processes Doxygen's
 * term elements, which support formatted content for creating clear and
 * descriptive definition terms.
 *
 * @public
 */
export declare class TermDataModel extends AbstractDocTitleType {
    /**
     * Constructs a TermDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the term data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocTitleType to handle
     * term processing whilst identifying the element as 'term' for proper
     * XML schema compliance and definition list semantics.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for paragraph elements within documentation content.
 *
 * @remarks
 * Represents paragraph elements that form the fundamental content blocks
 * within documentation structures. This implementation processes Doxygen's
 * para elements, which contain rich mixed content including text, formatting,
 * cross-references, lists, tables, and other documentation elements.
 *
 * Paragraphs serve as the primary containers for narrative content within
 * descriptions, sections, and other documentation components.
 *
 * @public
 */
export declare class ParaDataModel extends AbstractDocParaType {
    /**
     * Constructs a ParaDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the paragraph data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocParaType to handle
     * comprehensive paragraph content processing whilst identifying the element
     * as 'para' for proper XML schema compliance and content organisation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for bold text formatting within documentation content.
 *
 * @remarks
 * Represents bold markup elements that provide emphasis formatting for
 * text content within documentation. This implementation processes Doxygen's
 * bold elements, which can contain mixed content including text and other
 * inline formatting elements to create properly emphasised content.
 *
 * @public
 */
export declare class BoldDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a BoldDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the bold markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType to handle
     * markup processing whilst identifying the element as 'bold' for proper
     * XML schema compliance and text formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for strikethrough text formatting within documentation content.
 *
 * @remarks
 * Represents strikethrough markup elements that provide strike-through
 * formatting for text content. This implementation processes Doxygen's
 * 's' elements for creating struck-through text within documentation.
 *
 * @public
 */
export declare class SDataModel extends AbstractDocMarkupType {
    /**
     * Constructs an SDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the strikethrough
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 's' for proper strikethrough formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for strike-through text formatting within documentation content.
 *
 * @remarks
 * Represents strike markup elements that provide explicit strike-through
 * formatting for text content. This implementation processes Doxygen's
 * strike elements for deprecated or crossed-out text within documentation.
 *
 * @public
 */
export declare class StrikeDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a StrikeDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the strike markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'strike' for explicit strike-through formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for underlined text formatting within documentation content.
 *
 * @remarks
 * Represents underline markup elements that provide underline formatting
 * for text content within documentation. This implementation processes
 * Doxygen's underline elements for creating underlined text emphasis.
 *
 * @public
 */
export declare class UnderlineDataModel extends AbstractDocMarkupType {
    /**
     * Constructs an UnderlineDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the underline markup
     *   data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'underline' for proper underline formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for emphasised text formatting within documentation content.
 *
 * @remarks
 * Represents emphasis markup elements that provide italicised formatting
 * for text content within documentation. This implementation processes
 * Doxygen's emphasis elements for creating emphasised text, typically
 * rendered in italics to provide subtle content highlighting.
 *
 * @public
 */
export declare class EmphasisDataModel extends AbstractDocMarkupType {
    /**
     * Constructs an EmphasisDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the emphasis markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'emphasis' for proper italicised formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for computer output text formatting within documentation content.
 *
 * @remarks
 * Represents computer output markup elements that provide monospace formatting
 * for code, filenames, and computer-generated text within documentation.
 * This implementation processes Doxygen's computeroutput elements for
 * displaying code fragments and technical terms in monospace font.
 *
 * @public
 */
export declare class ComputerOutputDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a ComputerOutputDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the computer output
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'computeroutput' for monospace formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for subscript text formatting within documentation content.
 *
 * @remarks
 * Represents subscript markup elements that provide subscript formatting
 * for mathematical expressions and chemical formulae within documentation.
 * This implementation processes Doxygen's subscript elements for proper
 * scientific notation display.
 *
 * @public
 */
export declare class SubscriptDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a SubscriptDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the subscript markup
     *   data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'subscript' for proper subscript formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for superscript text formatting within documentation content.
 *
 * @remarks
 * Represents superscript markup elements that provide superscript formatting
 * for mathematical expressions, footnotes, and ordinal numbers within
 * documentation. This implementation processes Doxygen's superscript elements
 * for proper scientific and mathematical notation display.
 *
 * @public
 */
export declare class SuperscriptDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a SuperscriptDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the superscript
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'superscript' for proper superscript formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for centred text formatting within documentation content.
 *
 * @remarks
 * Represents centre alignment markup elements that provide centred formatting
 * for text content within documentation. This implementation processes
 * Doxygen's center elements for creating centred text blocks and headings.
 *
 * @public
 */
export declare class CenterDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a CenterDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the centre markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'center' for proper centred alignment.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for small text formatting within documentation content.
 *
 * @remarks
 * Represents small text markup elements that provide reduced font size
 * formatting for fine print, footnotes, and secondary information within
 * documentation. This implementation processes Doxygen's small elements
 * for creating properly sized text content.
 *
 * @public
 */
export declare class SmallDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a SmallDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the small text
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'small' for reduced font size formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for citation text formatting within documentation content.
 *
 * @remarks
 * Represents citation markup elements that provide proper formatting for
 * bibliographic references and citations within documentation. This
 * implementation processes Doxygen's cite elements for creating properly
 * formatted citation references.
 *
 * @public
 */
export declare class CiteDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a CiteDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the citation markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'cite' for proper citation formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for deleted text formatting within documentation content.
 *
 * @remarks
 * Represents deleted text markup elements that indicate content removal
 * or deprecation within documentation. This implementation processes
 * Doxygen's del elements for marking text as deleted or removed.
 *
 * @public
 */
export declare class DelDataModel extends AbstractDocMarkupType {
    /**
     * Constructs a DelDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the deleted text
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'del' for deleted text formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inserted text formatting within documentation content.
 *
 * @remarks
 * Represents inserted text markup elements that indicate content addition
 * or new material within documentation. This implementation processes
 * Doxygen's ins elements for marking text as newly inserted or added.
 *
 * @public
 */
export declare class InsDataModel extends AbstractDocMarkupType {
    /**
     * Constructs an InsDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the inserted text
     *   markup data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocMarkupType whilst
     * identifying the element as 'ins' for inserted text formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for simple section elements within documentation.
 *
 * @remarks
 * Represents simple sections that provide structured content organisation
 * with specific section types such as 'note', 'warning', 'see', 'return',
 * and others. This implementation processes Doxygen's simplesect elements,
 * which contain typed content blocks for common documentation patterns
 * like notes, warnings, and cross-references.
 *
 * @public
 */
export declare class SimpleSectDataModel extends AbstractDocSimpleSectType {
    /**
     * Constructs a SimpleSectDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the simplesect data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocSimpleSectType to
     * handle simple section processing whilst identifying the element as
     * 'simplesect' for proper XML schema compliance and section type handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for itemised list elements within documentation content.
 *
 * @remarks
 * Represents itemised (bulleted) list elements that provide unordered list
 * structures within documentation. This implementation processes Doxygen's
 * itemizedlist elements, which contain list items for creating bulleted
 * lists with various marker styles and nested list support.
 *
 * @public
 */
export declare class ItemizedListDataModel extends AbstractDocListType {
    /**
     * Constructs an ItemizedListDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the itemised list data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocListType to handle
     * list processing whilst identifying the element as 'itemizedlist' for
     * proper bulleted list formatting and structure.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for ordered list elements within documentation content.
 *
 * @remarks
 * Represents ordered (numbered) list elements that provide sequential list
 * structures within documentation. This implementation processes Doxygen's
 * orderedlist elements, which contain list items for creating numbered
 * lists with various numbering styles and nested list support.
 *
 * @public
 */
export declare class OrderedListDataModel extends AbstractDocListType {
    /**
     * Constructs an OrderedListDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the ordered list data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocListType to handle
     * list processing whilst identifying the element as 'orderedlist' for
     * proper numbered list formatting and structure.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for line break elements within documentation content.
 *
 * @remarks
 * Represents line break elements that provide explicit line breaks within
 * documentation text. This implementation processes Doxygen's linebreak
 * elements for controlling line spacing and text flow within content blocks.
 *
 * @public
 */
export declare class LineBreakDataModel extends AbstractDocEmptyType {
    /**
     * Constructs a LineBreakDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the line break data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocEmptyType whilst
     * identifying the element as 'linebreak' for proper line break handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for horizontal ruler elements within documentation content.
 *
 * @remarks
 * Represents horizontal ruler elements that provide visual separation
 * between content sections. This implementation processes Doxygen's
 * hruler elements for creating horizontal dividing lines within documentation.
 *
 * @public
 */
export declare class HrulerDataModel extends AbstractDocEmptyType {
    /**
     * Constructs an HrulerDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the horizontal ruler
     *   data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocEmptyType whilst
     * identifying the element as 'hruler' for proper horizontal line formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for non-breakable space elements within documentation content.
 *
 * @remarks
 * Represents non-breakable space elements that provide control over text
 * wrapping and spacing within documentation. This implementation processes
 * Doxygen's nonbreakablespace elements for maintaining text cohesion
 * across line breaks.
 *
 * @public
 */
export declare class NonBreakableSpaceDataModel extends AbstractDocEmptyType {
    /**
     * Constructs a NonBreakableSpaceDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the non-breakable
     *   space data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocEmptyType whilst
     * identifying the element as 'nonbreakablespace' for proper space handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for empty paragraph elements within documentation content.
 *
 * @remarks
 * Represents empty paragraph elements used as placeholders or structural
 * markers within documentation. This implementation processes Doxygen's
 * empty para elements, which serve as document structure indicators
 * without containing content.
 *
 * @public
 */
export declare class ParaEmptyDataModel extends AbstractDocEmptyType {
    /**
     * Constructs a ParaEmptyDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the empty paragraph data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocEmptyType whilst
     * identifying the element as 'para' for empty paragraph structure handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for verbatim text elements within documentation content.
 *
 * @remarks
 * Implements processing for verbatim content elements that preserve exact
 * formatting and whitespace within documentation. This class handles
 * elements that contain literal text content, such as code blocks and
 * preformatted text, whilst maintaining their original formatting and
 * character sequences.
 *
 * The implementation processes both textual content and structured markup
 * elements that may appear within verbatim contexts, ensuring proper
 * preservation of the intended display format.
 *
 * @public
 */
export declare abstract class AbstractVerbatimType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractVerbatimType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the verbatim data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes verbatim elements by extracting both textual
     * content and any embedded markup elements. The parser maintains proper
     * content order whilst preserving the original formatting and whitespace
     * characteristics of the verbatim content.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for verbatim text elements within documentation content.
 *
 * @remarks
 * Represents verbatim text elements that preserve exact formatting and
 * whitespace for code blocks, examples, and literal text within documentation.
 * This implementation processes Doxygen's verbatim elements, which maintain
 * precise character sequences and formatting whilst potentially containing
 * cross-references and other markup elements.
 *
 * @public
 */
export declare class VerbatimDataModel extends AbstractVerbatimType {
    /**
     * Constructs a VerbatimDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the verbatim data
     *
     * @remarks
     * This constructor delegates to the parent AbstractVerbatimType to handle
     * verbatim content processing whilst identifying the element as 'verbatim'
     * for proper literal text preservation and formatting.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for preformatted content elements within documentation.
 *
 * @remarks
 * Implements processing for preformatted content elements that maintain
 * specific formatting while supporting embedded markup elements. This class
 * handles elements that preserve whitespace and formatting whilst allowing
 * for structured content including cross-references and formatting markup.
 *
 * The implementation processes both textual content and document command
 * group elements that may appear within preformatted contexts, ensuring
 * proper content organisation and formatting preservation.
 *
 * @public
 */
export declare abstract class AbstractPreformattedType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractPreformattedType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the preformatted data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes preformatted elements by extracting both
     * textual content and structured command group elements. The parser
     * maintains proper content order whilst preserving formatting characteristics
     * and enabling embedded markup within preformatted contexts.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for preformatted content elements within documentation.
 *
 * @remarks
 * Represents preformatted content elements that preserve formatting while
 * supporting embedded markup elements. This implementation processes
 * Doxygen's preformatted elements, which maintain whitespace and formatting
 * whilst allowing for structured content including cross-references and
 * other documentation markup.
 *
 * @public
 */
export declare class PreformattedDataModel extends AbstractPreformattedType {
    /**
     * Constructs a PreformattedDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the preformatted data
     *
     * @remarks
     * This constructor delegates to the parent AbstractPreformattedType to
     * handle preformatted content processing whilst identifying the element
     * as 'preformatted' for proper formatting preservation and markup support.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=descriptiontype-dm.d.ts.map