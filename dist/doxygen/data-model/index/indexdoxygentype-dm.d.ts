import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { IndexCompoundDataModel } from './indexcompoundtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for Doxygen index type data models.
 *
 * @remarks
 * Represents the top-level structure of Doxygen index XML files, corresponding
 * to the DoxygenType complex type in the XML schema. This class handles the
 * parsing of version and language attributes, along with compound element
 * collections. Note that this definition may clash with similar types in
 * compound.xsd, requiring careful namespace management.
 *
 * @public
 */
export declare abstract class AbstractIndexDoxygenType extends AbstractDataModelBase {
    /**
     * The version of the Doxygen tool that generated the XML.
     *
     * @remarks
     * Mandatory attribute extracted from the XML structure that identifies
     * the version of Doxygen used to generate the documentation. This
     * information is crucial for compatibility and parsing decisions.
     */
    version: string;
    /**
     * The language specification for the documentation content.
     *
     * @remarks
     * Mandatory attribute corresponding to the xml:lang attribute in the
     * XML structure. Specifies the primary language used in the documented
     * content for internationalisation purposes.
     */
    lang: string;
    /**
     * Collection of compound data models referenced in the index.
     *
     * @remarks
     * Optional array containing compound elements found within the index
     * structure. Each compound represents a documented entity such as
     * classes, namespaces, or files that are catalogued in the index.
     */
    compounds?: IndexCompoundDataModel[] | undefined;
    /**
     * The XML schema location reference for validation.
     *
     * @remarks
     * Optional attribute that specifies the location of the XML schema
     * definition used for validating the structure of the index XML file.
     * This provides schema validation capabilities for the parsed content.
     */
    noNamespaceSchemaLocation?: string | undefined;
    /**
     * Constructs a new AbstractIndexDoxygenType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the Doxygen index data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract Doxygen index information
     * including compound collections and mandatory attributes (version and
     * language). The constructor validates that all required attributes are
     * present and processes compound elements into the appropriate data models.
     * Optional schema location attributes are also extracted when present.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete data model class for doxygenindex elements.
 *
 * @remarks
 * Represents the root element of Doxygen index XML files, extending the
 * abstract base class to provide specific handling for 'doxygenindex'
 * elements. This class serves as the primary entry point for parsing
 * index files and provides access to all compound definitions and
 * metadata contained within the index structure.
 *
 * @public
 */
export declare class DoxygenIndexDataModel extends AbstractIndexDoxygenType {
    /**
     * Constructs a new DoxygenIndexDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the doxygenindex data
     *
     * @remarks
     * Initialises the Doxygen index data model by parsing the provided XML
     * element as a 'doxygenindex' element type. The constructor delegates
     * to the parent class for common processing whilst specifying the
     * element name for proper XML structure handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=indexdoxygentype-dm.d.ts.map