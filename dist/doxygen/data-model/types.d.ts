/**
 * Represents the XML prologue declaration at the start of XML files.
 *
 * @remarks
 * Contains the XML declaration with version, encoding, and standalone
 * attributes as parsed by the XML parser from Doxygen-generated files.
 *
 * @public
 */
export interface XmlPrologue {
    '?xml': [XmlText];
    ':@': {
        '@_version': string;
        '@_encoding': string;
        '@_standalone': string;
    };
}
/**
 * Represents XML element attributes in the parsed structure.
 *
 * @remarks
 * Contains the attributes map used by the XML parser to store element
 * attributes with support for various primitive value types.
 *
 * @public
 */
export interface XmlAttributes {
    ':@': Record<string, string | number | boolean>;
}
/**
 * Represents a generic XML element in the parsed structure.
 *
 * @remarks
 * Defines the structure used by the XML parser for representing parsed
 * XML elements, including text content, attributes, and child elements.
 * Each element maps keys to arrays of child elements.
 *
 * @public
 */
export interface XmlElement {
    (key: string): XmlElement[];
    '#text': string | number | boolean;
    ':@'?: Record<string, string | number | boolean>;
}
/**
 * Represents XML text content within elements.
 *
 * @remarks
 * Simple wrapper for text content found within XML elements,
 * used by the XML parser to distinguish text nodes.
 *
 * @public
 */
export interface XmlText {
    '#text': string;
}
/**
 * Represents XML CDATA content within elements.
 *
 * @remarks
 * Simple wrapper for CDATA content found within XML elements,
 * used by the XML parser to distinguish CDATA nodes.
 *
 * @public
 */
export interface XmlCDATA {
    '#cdata': string;
}
/**
 * Represents an XML element with a name property containing text content.
 *
 * @remarks
 * Used for elements that have a `name` property with associated text content,
 * as commonly found in Doxygen-generated XML files.
 *
 * @public
 */
export interface XmlNameElement {
    name: {
        '#text': string;
    };
}
/**
 * Abstract base class for all data model elements in the Doxygen XML layer.
 *
 * @remarks
 * Provides the common interface and properties for all data model elements
 * parsed from Doxygen XML files. All concrete data model classes should
 * extend this base class to ensure consistent structure and behaviour.
 *
 * @public
 */
export declare abstract class AbstractDataModelBase {
    /**
     * The name of the XML element represented by this data model instance.
     *
     * @remarks
     * Used to identify the XML element type for this data model object.
     */
    elementName: string;
    /**
     * Indicates whether paragraph processing should be skipped for this element.
     *
     * @remarks
     * Optional property used to control paragraph handling during documentation
     * generation. If true, paragraph tags are not generated for this element.
     */
    skipPara?: boolean;
    /**
     * The child elements or text nodes contained within this data model element.
     *
     * @remarks
     * Contains an array of child elements or text nodes, supporting recursive
     * data model structures for complex XML hierarchies.
     */
    children?: (string | AbstractDataModelBase)[];
    /**
     * Constructs a new data model base instance for a given XML element name.
     *
     * @param elementName - The name of the XML element represented by this
     *   instance
     *
     * @remarks
     * Initialises the base data model with the specified element name. All
     * derived data model classes should call this constructor.
     */
    constructor(elementName: string);
}
/**
 * Union type for data model element content.
 *
 * @remarks
 * Represents content that can be either a string value or an instance of
 * an abstract data model class. Used to handle mixed content in XML elements.
 *
 * @public
 */
export type DataModelElement = string | AbstractDataModelBase;
//# sourceMappingURL=types.d.ts.map