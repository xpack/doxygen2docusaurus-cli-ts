import { XMLParser } from 'fast-xml-parser';
import { XmlElement, DataModel } from './data-model/types.js';
import { IndexCompoundDataModel } from './data-model/index/indexcompoundtype-dm.js';
import { CliOptions } from '../docusaurus/options.js';
/**
 * The DoxygenXmlParser class is responsible for parsing
 * Doxygen-generated XML files and constructing the internal data model.
 *
 * @remarks
 * This class initialises the XML parser with options that preserve the order
 * and structure of the original XML content, ensuring accurate conversion
 * for documentation purposes. It maintains a counter for the number of files
 * parsed and stores the resulting data model.
 *
 * @example
 * ```typescript
 * const parser = new DoxygenXmlParser({ options });
 * const dataModel = await parser.parse();
 * ```
 *
 * @public
 */
export declare class DoxygenXmlParser {
    /**
     * The global configuration options.
     */
    options: CliOptions;
    /**
     * Tracks the number of XML files parsed.
     *
     * @defaultValue 0
     */
    parsedFilesCounter: number;
    /**
     * The XML parser instance configured for Doxygen XML.
     */
    xmlParser: XMLParser;
    /**
     * The internal data model constructed from the XML files.
     *
     * @defaultValue `{ compoundDefs: [] }`
     */
    dataModel: DataModel;
    /**
     * Constructs a new instance of the DoxygenXmlParser class.
     *
     * @param options - The global configuration options
     *
     * @remarks
     * This constructor initialises the XML parser with settings that preserve the
     * order and structure of the original XML content, remove namespace prefixes,
     * and ensure that both tag and attribute values are parsed. The values are
     * not
     * trimmed, maintaining fidelity to the source XML. The provided options are
     * stored for use throughout the parsing process.
     */
    constructor({ options }: {
        options: CliOptions;
    });
    /**
     * Parses all relevant Doxygen-generated XML files and constructs the
     * internal data model.
     *
     * @returns A promise that resolves to the populated data model
     *
     * @remarks
     * This method sequentially parses the main index XML file, all compound
     * XML files referenced in the index, and the Doxyfile XML containing
     * configuration options. The parser is configured to preserve the original
     * content and element order for accuracy. The method also processes member
     * definitions and logs progress and statistics, such as the number of files
     * parsed and images identified, depending on the verbosity setting.
     */
    parse(): Promise<DataModel>;
    /**
     * Parses the main Doxygen index XML file and initialises the index data
     * model.
     *
     * @remarks
     * This method reads and parses the `index.xml` file, ignoring the XML
     * prologue and top-level text nodes. It extracts the `doxygenindex`
     * element and constructs the corresponding data model. Any unrecognised
     * elements are logged for diagnostic purposes.
     */
    parseDoxygenIndex(): Promise<void>;
    /**
     * Processes compound definitions from the parsed Doxygen XML elements.
     *
     * @param indexCompound - The compound index data model
     * @param parsedDoxygenElements - The array of parsed XML elements for the
     * compound
     *
     * @remarks
     * This method iterates through the parsed XML elements, ignoring the XML
     * prologue and top-level text nodes. For recognised `doxygen` elements, it
     * constructs the compound definitions and appends them to the internal data
     * model. Unrecognised elements are logged for further analysis.
     */
    processCompoundDefs(indexCompound: IndexCompoundDataModel, parsedDoxygenElements: XmlElement[]): void;
    /**
     * Processes member definitions and updates member kinds where necessary.
     *
     * @remarks
     * This method traverses all compound definitions and their associated
     * sections. It collects member definitions by their identifiers and, for
     * each member with an empty kind, assigns the kind from the corresponding
     * member definition. This ensures that all members are correctly classified
     * within the internal data model.
     */
    processMemberdefs(): void;
    /**
     * Parses the Doxyfile XML and initialises the configuration data model.
     *
     * @remarks
     * This method reads and parses the `Doxyfile.xml` file, ignoring the XML
     * prologue and top-level text nodes. It extracts the `doxyfile` element and
     * constructs the corresponding configuration data model. Any unrecognised
     * elements are logged for diagnostic purposes.
     */
    parseDoxyfile(): Promise<void>;
    /**
     * Reads and parses the specified XML file, returning the parsed content.
     *
     * @param fileName - The name of the XML file to be parsed
     * @returns A promise that resolves to the parsed XML content
     *
     * @remarks
     * This method constructs the full file path using the configured input
     * folder, reads the XML file as a UTF-8 string, and parses it using the
     * configured XML parser. The method increments the internal counter for
     * parsed files and, if verbose mode is enabled, logs the file being parsed.
     */
    parseFile({ fileName }: {
        fileName: string;
    }): Promise<any>;
    /**
     * Determines whether the specified XML element has any attributes.
     *
     * @param element - The XML element to inspect for attributes
     * @returns True if the element has attributes; otherwise, false
     *
     * @remarks
     * This method checks for the presence of the ':\@' property on the XML
     * element, which is the convention used by the XML parser for storing
     * attributes. If this property exists, the element has attributes; if not,
     * the element has no attributes. This is a prerequisite check before calling
     * {@link DoxygenXmlParser.getAttributesNames} or other attribute-related
     * methods.
     */
    hasAttributes(element: object): boolean;
    /**
     * Retrieves the names of all attributes present on the specified XML element.
     *
     * @param element - The XML element to inspect for attribute names
     * @returns An array of strings containing the names of all attributes
     *
     * @remarks
     * This method accesses the ':\@' property of the XML element, which is the
     * convention used by the XML parser for storing attributes, and returns the
     * keys of this object as an array of attribute names. The method assumes the
     * element has attributes and does not perform validation - use
     * {@link DoxygenXmlParser.hasAttributes} to check for attribute presence
     * first.
     */
    getAttributesNames(element: object): string[];
    /**
     * Determines whether the specified attribute exists on the given XML element.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the attribute to check for
     * @returns True if the attribute exists; otherwise, false
     *
     * @remarks
     * This method checks for the presence of an attribute within the ':\@'
     * property of the XML element, which is the convention used by the XML
     * parser for storing attributes. It returns true if the attribute is found,
     * otherwise false.
     */
    hasAttribute(element: object, name: string): boolean;
    /**
     * Retrieves the value of a named attribute as a string.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns The attribute value as a string
     * @throws If the attribute does not exist
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element and returns its value as a string. If the attribute value is
     * originally a number (as the XML parser may return numeric strings as
     * numbers), it is converted to a string to maintain consistency with the
     * DTD specification. If the attribute is missing, an error is thrown to
     * indicate the absence.
     */
    getAttributeStringValue(element: object, name: string): string;
    /**
     * Retrieves the value of a named attribute as a number.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns The attribute value as a number
     * @throws If the attribute does not exist or is not a number
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element and returns its value as a number. If the attribute is missing
     * or its value is not a number, an error is thrown to indicate the absence
     * or incorrect type.
     */
    getAttributeNumberValue(element: object, name: string): number;
    /**
     * Retrieves the value of a named attribute as a boolean.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns True if the attribute value is 'yes' (case-insensitive);
     * otherwise, false
     * @throws If the attribute does not exist or is not a string
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element, and returns true if its value is the string 'yes'
     * (case-insensitive). If the attribute is missing or its value is not a
     * string, an error is thrown.
     */
    getAttributeBooleanValue(element: object, name: string): boolean;
    /**
     * Determines whether the specified inner element exists on the given XML
     * element.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the inner element to check for
     * @returns True if the inner element exists; otherwise, false
     *
     * @remarks
     * This method checks for the presence of a named property on the XML element.
     * For text nodes ('#text'), it verifies the value is a string, number, or
     * boolean. For other elements, it confirms the property is an array, as
     * per the XML parser's convention.
     */
    hasInnerElement(element: object, name: string): boolean;
    /**
     * Determines whether a named inner element contains text.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the inner element
     * @returns True if the inner element contains text or is empty;
     * otherwise, false
     *
     * @remarks
     * This method checks if the specified inner element exists and contains a
     * single text node, or is an empty array (representing an empty string).
     * It asserts the expected structure and type of the value for robustness.
     */
    isInnerElementText(element: object, name: string): boolean;
    /**
     * Determines whether the XML element contains a text node.
     *
     * @param element - The XML element to inspect
     * @returns True if the element contains a text node; otherwise, false
     *
     * @remarks
     * This method checks for the presence of a '#text' property on the XML
     * element, and verifies that its value is a string, number, or boolean.
     */
    hasInnerText(element: object): boolean;
    /**
     * Retrieves an array of named child elements from the given XML element.
     *
     * @typeParam T - The expected type of the child elements array
     * (defaults to XmlElement[])
     * @param element - The XML element containing the child elements
     * @param name - The name of the child elements to retrieve
     * @returns The array of child elements
     * @throws If the child elements do not exist
     *
     * @remarks
     * This method accesses the specified property on the XML element and
     * returns it as an array of child elements. If the property is undefined,
     * an error is thrown indicating the absence of the expected child element.
     */
    getInnerElements<T = XmlElement[]>(element: object, name: string): T;
    /**
     * Retrieves the text content of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns The text content of the child element
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its text
     * content. If the child element is missing, an error is thrown. If the
     * child element is empty, an empty string is returned. If there is more
     * than one child element, an error is thrown to indicate unexpected
     * structure.
     */
    getInnerElementText(element: object, name: string): string;
    /**
     * Retrieves the numeric value of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns The numeric value of the child element
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its value
     * as a number. If the child element is missing, an error is thrown. If the
     * child element is empty, NaN is returned. If there is more than one child
     * element, an error is thrown to indicate unexpected structure.
     */
    getInnerElementNumber(element: object, name: string): number;
    /**
     * Retrieves the boolean value of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns True if the child element's text is 'true'
     * (case-insensitive); otherwise, false
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its value
     * as a boolean. If the child element is missing, an error is thrown. If
     * the child element is empty, false is returned. If there is more than one
     * child element, an error is thrown to indicate unexpected structure.
     */
    getInnerElementBoolean(element: object, name: string): boolean;
    /**
     * Retrieves the text content of the XML element.
     *
     * @param element - The XML element to retrieve text from
     * @returns The text content of the element
     * @throws If the element does not contain a valid text node
     *
     * @remarks
     * This method accesses the '#text' property of the XML element and
     * returns its value as a string. It asserts that the value is of type
     * string, number, or boolean before converting it to a string. If the
     * property is missing or the value is of an unexpected type, an error is
     * thrown.
     */
    getInnerText(element: object): string;
}
//# sourceMappingURL=doxygen-xml-parser.d.ts.map