import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { DoxygenFileOptionDataModel } from './doxyfileoptiontype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for Doxygen file type data models.
 *
 * @remarks
 * Represents the structure of Doxyfile XML configurations, corresponding
 * to the DoxygenFileType complex type in the XML schema. This class handles
 * the parsing of Doxygen configuration options and mandatory attributes
 * (version and language). All concrete Doxyfile data model classes should
 * extend this abstract base to ensure consistent parsing and data
 * representation of configuration settings.
 *
 * @public
 */
export declare abstract class AbstractDoxygenFileType extends AbstractDataModelBase {
    /**
     * The version of the Doxygen tool that generated the configuration.
     *
     * @remarks
     * Mandatory attribute extracted from the XML structure that identifies
     * the version of Doxygen used to generate the configuration file. This
     * information is essential for compatibility and configuration parsing
     * decisions.
     */
    version: string;
    /**
     * The language specification for the documentation configuration.
     *
     * @remarks
     * Mandatory attribute corresponding to the xml:lang attribute in the
     * XML structure. Specifies the primary language used in the configuration
     * and documentation generation process for internationalisation purposes.
     */
    lang: string;
    /**
     * Collection of configuration option data models.
     *
     * @remarks
     * Optional array containing option elements found within the Doxyfile
     * structure. Each option represents a specific configuration setting
     * that controls the behaviour of Doxygen during documentation generation.
     * The array supports zero to many options as per the XML schema.
     */
    options?: DoxygenFileOptionDataModel[] | undefined;
    /**
     * The XML schema location reference for validation.
     *
     * @remarks
     * Optional attribute that specifies the location of the XML schema
     * definition used for validating the structure of the Doxyfile XML.
     * This provides schema validation capabilities for the parsed
     * configuration content.
     */
    noNamespaceSchemaLocation?: string | undefined;
    /**
     * Constructs a new AbstractDoxygenFileType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the Doxyfile data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract Doxyfile configuration
     * information including option collections and mandatory attributes
     * (version and language). The constructor validates that all required
     * attributes are present and processes option elements into the
     * appropriate data models. Optional schema location attributes are
     * also extracted when present.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete data model class for doxyfile elements.
 *
 * @remarks
 * Represents the root element of Doxyfile XML configuration files,
 * extending the abstract base class to provide specific handling for
 * 'doxyfile' elements. This class serves as the primary entry point
 * for parsing Doxygen configuration files and provides access to all
 * configuration options and metadata contained within the file structure.
 *
 * @public
 */
export declare class DoxygenFileDataModel extends AbstractDoxygenFileType {
    /**
     * Constructs a new DoxygenFileDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the doxyfile data
     *
     * @remarks
     * Initialises the Doxyfile data model by parsing the provided XML element
     * as a 'doxyfile' element type. The constructor delegates to the parent
     * class for common configuration processing whilst specifying the element
     * name for proper XML structure handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=doxyfiletype-dm.d.ts.map