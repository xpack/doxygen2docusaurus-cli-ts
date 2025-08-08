import { IncludedByDataModel, IncludesDataModel } from './inctype-dm.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from './compoundreftype-dm.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { SectionDefDataModel } from './sectiondeftype-dm.js';
import { ListOfAllMembersDataModel } from './listofallmemberstype-dm.js';
import { AbstractStringType, BriefDescriptionDataModel, DetailedDescriptionDataModel, ProgramListingDataModel } from './descriptiontype-dm.js';
import { InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel } from './reftype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { TableOfContentsDataModel } from './tableofcontentstype-dm.js';
/**
 * Abstract template class for creating new data model objects.
 *
 * @remarks
 * This template provides a standardised structure for implementing new
 * data model types with common properties and processing patterns. It
 * demonstrates the typical XML parsing approach used throughout the
 * Doxygen data model implementation, including element and attribute
 * processing workflows.
 *
 * @public
 */
export declare abstract class AbstractXyzType extends AbstractDataModelBase {
    text: string;
    compoundName: string;
    colsCount: number;
    elm12: boolean;
    elm20?: string | undefined;
    elm21?: boolean | undefined;
    elm22?: number | undefined;
    briefDescription: BriefDescriptionDataModel | undefined;
    includes?: IncludesDataModel[] | undefined;
    id: string;
    rowsCount: number;
    thead: boolean;
    language?: string | undefined;
    final?: boolean | undefined;
    lineno?: number | undefined;
    attr23?: string[] | undefined;
    /**
     * Constructs a new template data model instance.
     *
     * @remarks
     * Demonstrates the standard XML parsing workflow used throughout the
     * data model implementation. This includes processing inner elements,
     * handling mixed content with ordered children, and extracting attributes
     * with appropriate type conversion and validation.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation of the template data model.
 *
 * @remarks
 * Provides a specific implementation of the abstract template class,
 * demonstrating how to create concrete data model objects for particular
 * XML element types. This pattern is used throughout the data model
 * for creating type-specific implementations.
 *
 * @public
 */
export declare class XyzDataModel extends AbstractXyzType {
    /**
     * Constructs a new XyzDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'xyz' XML elements by delegating
     * to the parent constructor with the appropriate element name.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for Doxygen compound definition data models.
 *
 * @remarks
 * Represents the core structure of compound definitions in Doxygen XML output,
 * including classes, structures, files, namespaces, and other compound types.
 * This class handles the complete XML schema for compound definitions with
 * comprehensive element and attribute processing to capture all aspects of
 * the documented code structures.
 *
 * @public
 */
export declare abstract class AbstractCompoundDefType extends AbstractDataModelBase {
    /**
     * The name of the compound element.
     *
     * @remarks
     * Contains the fully qualified name of the compound (class, namespace,
     * file, etc.) as extracted from the 'compoundname' XML element. This
     * represents the primary identifier for the compound in the documentation
     * hierarchy and is mandatory for all compound types except namespaces.
     */
    compoundName: string;
    /**
     * Optional title for the compound.
     *
     * @remarks
     * Provides a human-readable title for the compound that may differ from
     * the compound name. This is typically used for pages and groups where
     * a descriptive title is more appropriate than the technical identifier.
     */
    title?: string | undefined;
    /**
     * Brief description of the compound.
     *
     * @remarks
     * Contains a concise summary description of the compound extracted from
     * the 'briefdescription' XML element. This provides a short overview
     * suitable for listings and summary views of the documented entity.
     */
    briefDescription?: BriefDescriptionDataModel | undefined;
    /**
     * Detailed description of the compound.
     *
     * @remarks
     * Contains comprehensive documentation for the compound extracted from
     * the 'detaileddescription' XML element. This includes full description
     * text with formatting, examples, and other detailed documentation
     * content.
     */
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    /**
     * Base compound references for inheritance relationships.
     *
     * @remarks
     * Contains references to base classes or parent compounds from which
     * this compound inherits. This property captures the inheritance
     * hierarchy information extracted from 'basecompoundref' XML elements
     * for object-oriented documentation structures.
     */
    baseCompoundRefs?: BaseCompoundRefDataModel[] | undefined;
    /**
     * Derived compound references for inheritance relationships.
     *
     * @remarks
     * Contains references to derived classes or child compounds that inherit
     * from this compound. This property captures the inheritance hierarchy
     * information extracted from 'derivedcompoundref' XML elements for
     * complete inheritance documentation.
     */
    derivedCompoundRefs?: DerivedCompoundRefDataModel[] | undefined;
    /**
     * Include file references for this compound.
     *
     * @remarks
     * Contains information about header files or modules that this compound
     * includes or depends upon. This property captures dependency
     * relationships extracted from 'includes' XML elements, providing
     * visibility into the file inclusion structure.
     */
    includes?: IncludesDataModel[] | undefined;
    /**
     * Reverse include file references for this compound.
     *
     * @remarks
     * Contains information about other files or compounds that include this
     * compound. This property captures reverse dependency relationships
     * extracted from 'includedby' XML elements, showing which entities
     * depend on this compound.
     */
    includedBy?: IncludedByDataModel[] | undefined;
    /**
     * Template parameter list for templated compounds.
     *
     * @remarks
     * Contains the template parameter definitions for templated classes,
     * functions, or other templated entities. This property captures
     * template information extracted from 'templateparamlist' XML elements,
     * providing details about generic programming constructs.
     */
    templateParamList?: TemplateParamListDataModel | undefined;
    /**
     * Section definitions within the compound.
     *
     * @remarks
     * Contains organised sections of members and documentation within the
     * compound. This property captures structured content extracted from
     * 'sectiondef' XML elements, providing hierarchical organisation of
     * compound members by type and visibility.
     */
    sectionDefs?: SectionDefDataModel[] | undefined;
    /**
     * Table of contents for the compound documentation.
     *
     * @remarks
     * Contains the navigation structure for complex compound documentation.
     * This property captures hierarchical content organisation extracted
     * from 'tableofcontents' XML elements, providing structured navigation
     * for large documentation entities.
     */
    tableOfContents?: TableOfContentsDataModel | undefined;
    /**
     * Inner folder references contained within this compound.
     *
     * @remarks
     * Contains references to subdirectories or folders that are logically
     * contained within this compound. This property captures hierarchical
     * folder structure extracted from 'innerdir' XML elements, typically
     * used for directory-based documentation organisation.
     */
    innerDirs?: InnerDirDataModel[] | undefined;
    /**
     * Inner file references contained within this compound.
     *
     * @remarks
     * Contains references to files that are logically contained within this
     * compound. This property captures file relationships extracted from
     * 'innerfile' XML elements, providing visibility into compound-to-file
     * associations in the documentation structure.
     */
    innerFiles?: InnerFileDataModel[] | undefined;
    /**
     * Inner class references contained within this compound.
     *
     * @remarks
     * Contains references to classes, structures, or other class-like
     * entities that are defined within this compound. This property captures
     * nested type relationships extracted from 'innerclass' XML elements,
     * supporting hierarchical type documentation.
     */
    innerClasses?: InnerClassDataModel[] | undefined;
    /**
     * Inner namespace references contained within this compound.
     *
     * @remarks
     * Contains references to namespaces that are nested within this compound.
     * This property captures namespace hierarchy relationships extracted from
     * 'innernamespace' XML elements, supporting multi-level namespace
     * documentation organisation.
     */
    innerNamespaces?: InnerNamespaceDataModel[] | undefined;
    /**
     * Inner page references contained within this compound.
     *
     * @remarks
     * Contains references to documentation pages that are logically
     * associated with this compound. This property captures page
     * relationships extracted from 'innerpage' XML elements, supporting
     * structured documentation navigation.
     */
    innerPages?: InnerPageDataModel[] | undefined;
    /**
     * Inner group references contained within this compound.
     *
     * @remarks
     * Contains references to documentation groups that are associated with
     * this compound. This property captures group relationships extracted
     * from 'innergroup' XML elements, supporting thematic organisation of
     * related documentation elements.
     */
    innerGroups?: InnerGroupDataModel[] | undefined;
    /**
     * Program listing or source code for the compound.
     *
     * @remarks
     * Contains the actual source code implementation or listing for the
     * compound when available. This property captures code content extracted
     * from 'programlisting' XML elements, providing syntax-highlighted
     * source code display in the documentation.
     */
    programListing?: ProgramListingDataModel | undefined;
    /**
     * Location information for the compound definition.
     *
     * @remarks
     * Contains file path, line number, and other location details for where
     * the compound is defined in the source code. This property captures
     * location metadata extracted from 'location' XML elements, enabling
     * source code navigation and reference linking.
     */
    location?: LocationDataModel | undefined;
    /**
     * Complete list of all members contained in the compound.
     *
     * @remarks
     * Contains a comprehensive list of all members (methods, properties,
     * etc.) that belong to this compound, including inherited members.
     * This property captures member information extracted from
     * 'listofallmembers' XML elements for complete API documentation.
     */
    listOfAllMembers?: ListOfAllMembersDataModel | undefined;
    /**
     * Unique identifier for the compound.
     *
     * @remarks
     * Contains the unique ID assigned to this compound by Doxygen for
     * cross-referencing and linking purposes. This identifier is mandatory
     * and serves as the primary key for compound identification throughout
     * the documentation system.
     */
    id: string;
    /**
     * The kind or type of compound.
     *
     * @remarks
     * Specifies the compound type using DoxCompoundKind enumeration values
     * such as 'class', 'struct', 'file', 'namespace', 'page', etc. This
     * mandatory attribute determines how the compound should be processed
     * and displayed in the documentation output.
     */
    kind: string;
    /**
     * Programming language of the compound.
     *
     * @remarks
     * Specifies the programming language using DoxLanguage enumeration
     * values when the compound is language-specific. This optional attribute
     * enables language-aware processing and appropriate syntax highlighting
     * in the generated documentation.
     */
    language?: string | undefined;
    /**
     * Protection level of the compound.
     *
     * @remarks
     * Specifies the access protection level (public, private, protected)
     * for the compound using DoxProtectionKind enumeration values. Note
     * that whilst this attribute is not marked as optional in the XML
     * schema, it may not be present in all compound definitions.
     */
    prot?: string | undefined;
    /**
     * Indicates whether the compound is marked as final.
     *
     * @remarks
     * Specifies that the compound cannot be inherited from or extended,
     * typically used in object-oriented programming languages that support
     * final classes or sealed types. This boolean attribute reflects the
     * final modifier in the source code.
     */
    final?: boolean | undefined;
    /**
     * Indicates whether the compound is inline.
     *
     * @remarks
     * Specifies that the compound is defined inline, typically used for
     * functions, methods, or other constructs that are implemented directly
     * in header files. This boolean attribute reflects inline declarations
     * in the source code.
     */
    inline?: boolean | undefined;
    /**
     * Indicates whether the compound is sealed.
     *
     * @remarks
     * Specifies that the compound is sealed and cannot be inherited from,
     * similar to final but using different language-specific terminology.
     * This boolean attribute reflects sealed modifiers found in languages
     * like C# or other object-oriented programming environments.
     */
    sealed?: boolean | undefined;
    /**
     * Indicates whether the compound is abstract.
     *
     * @remarks
     * Specifies that the compound is abstract and cannot be instantiated
     * directly, typically requiring concrete implementations of abstract
     * methods or properties. This boolean attribute reflects abstract
     * modifiers in object-oriented programming languages.
     */
    abstract?: boolean | undefined;
    /**
     * Constructs a new compound definition data model instance.
     *
     * @remarks
     * Parses the complete XML structure for compound definitions, processing
     * all elements and attributes according to the Doxygen XML schema. This
     * includes handling optional and mandatory elements, complex nested
     * structures, and comprehensive attribute validation to ensure data
     * integrity throughout the parsing process.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation of compound definition data model.
 *
 * @remarks
 * Provides the primary data model implementation for Doxygen compound
 * definitions, handling all types of compounds including classes, structures,
 * files, namespaces, and pages. This class serves as the main entry point
 * for processing compound definition XML elements in the Doxygen output.
 *
 * @public
 */
export declare class CompoundDefDataModel extends AbstractCompoundDefType {
    /**
     * Constructs a new CompoundDefDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'compounddef' XML elements by delegating
     * to the parent constructor with the appropriate element name. This
     * represents the root element for all compound definitions in Doxygen XML
     * output.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Abstract base class for HTML-only documentation content.
 *
 * @remarks
 * Represents content that should only be rendered in HTML output formats,
 * providing a mechanism for format-specific content inclusion in Doxygen
 * documentation. This class handles the 'docHtmlOnlyType' XML schema
 * structure with text content and optional block attributes.
 *
 * @public
 */
export declare abstract class AbstractDocHtmlOnlyType extends AbstractDataModelBase {
    text: string;
    block?: string | undefined;
    /**
     * Constructs a new HTML-only content data model instance.
     *
     * @remarks
     * Parses HTML-only content elements from Doxygen XML output, extracting
     * the text content and any optional block attributes. This content is
     * intended for rendering only in HTML-based output formats whilst being
     * excluded from other documentation formats.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for HTML-only content elements.
 *
 * @remarks
 * Represents content that should only be included in HTML output formats,
 * typically used for web-specific markup or styling that is not appropriate
 * for other documentation formats. This implementation handles the 'htmlonly'
 * XML element from Doxygen output.
 *
 * @public
 */
export declare class HtmlOnlyDataModel extends AbstractDocHtmlOnlyType {
    /**
     * Constructs a new HtmlOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'htmlonly' XML elements, which contain
     * content specifically intended for HTML output rendering only.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for manual-only content elements.
 *
 * @remarks
 * Represents content that should only be included in manual page output
 * formats. This class handles string content specifically intended for
 * Unix manual page generation whilst excluding it from other documentation
 * formats.
 *
 * @public
 */
export declare class ManOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new ManOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'manonly' XML elements containing
     * content specifically intended for manual page output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for XML-only content elements.
 *
 * @remarks
 * Represents content that should only be included in XML output formats.
 * This class handles string content specifically intended for XML-based
 * documentation generation whilst excluding it from other output formats.
 *
 * @public
 */
export declare class XmlOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new XmlOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'xmlonly' XML elements containing
     * content specifically intended for XML output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for RTF-only content elements.
 *
 * @remarks
 * Represents content that should only be included in Rich Text Format (RTF)
 * output. This class handles string content specifically intended for RTF
 * document generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export declare class RtfOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new RtfOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'rtfonly' XML elements containing
     * content specifically intended for RTF output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for LaTeX-only content elements.
 *
 * @remarks
 * Represents content that should only be included in LaTeX output formats.
 * This class handles string content specifically intended for LaTeX document
 * generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export declare class LatexOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new LatexOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'latexonly' XML elements containing
     * content specifically intended for LaTeX output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for DocBook-only content elements.
 *
 * @remarks
 * Represents content that should only be included in DocBook output formats.
 * This class handles string content specifically intended for DocBook XML
 * document generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export declare class DocBookOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new DocBookOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'docbookonly' XML elements containing
     * content specifically intended for DocBook output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=compounddef-dm.d.ts.map