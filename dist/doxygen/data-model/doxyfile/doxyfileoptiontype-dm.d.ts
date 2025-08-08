import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for Doxygen file option type data models.
 *
 * @remarks
 * Represents configuration option elements within Doxyfile XML structures,
 * corresponding to the OptionType complex type in the XML schema. This
 * class handles the parsing of option values and mandatory attributes
 * (id, default, and type). All concrete option data model classes should
 * extend this abstract base to ensure consistent parsing and data
 * representation of Doxygen configuration settings.
 *
 * @public
 */
export declare abstract class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
    /**
     * Collection of value strings associated with this configuration option.
     *
     * @remarks
     * Optional array containing value elements found within the option
     * structure. Each value represents a specific setting or parameter
     * for the configuration option. The array supports zero to many values
     * as per the XML schema, allowing for both single and multi-value
     * configuration settings.
     */
    values: string[] | undefined;
    /**
     * The unique identifier for this configuration option.
     *
     * @remarks
     * Mandatory attribute that specifies the name or identifier of the
     * Doxygen configuration option. This corresponds to the actual
     * configuration parameter name used in Doxygen configuration files
     * and determines the specific setting being configured.
     */
    id: string;
    /**
     * The default value indicator for this configuration option.
     *
     * @remarks
     * Mandatory attribute that indicates whether this option is set to
     * its default value. Corresponds to the defaultType enumeration in
     * the XML schema, typically having values of 'yes' or 'no'.
     */
    default: string;
    /**
     * The data type classification for this configuration option.
     *
     * @remarks
     * Mandatory attribute that specifies the expected data type for the
     * option's values. Corresponds to the typeType enumeration in the
     * XML schema, indicating whether the option expects integer, boolean,
     * string, or string list values.
     */
    type: string;
    /**
     * Constructs a new AbstractDoxygenFileOptionType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the option data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract configuration option
     * information including value collections and mandatory attributes
     * (id, default, and type). The constructor validates that all required
     * attributes are present and processes value elements into a string
     * array when present. The parsing ensures compliance with the OptionType
     * schema definition.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type representing the default value indicators for Doxyfile options.
 *
 * @remarks
 * Corresponds to the defaultType simple type in the Doxygen XML schema,
 * which defines the allowable values for indicating whether a configuration
 * option is set to its default value. The 'yes' value indicates the option
 * uses its default setting, whilst 'no' indicates a custom value has been
 * specified.
 *
 * @public
 */
export type DoxyfileDefaultType = 'yes' | 'no';
/**
 * Union type representing the data types for Doxyfile configuration options.
 *
 * @remarks
 * Corresponds to the typeType simple type in the Doxygen XML schema,
 * which defines the allowable data type classifications for configuration
 * options. Each value indicates the expected format and validation rules
 * for the option's values: 'int' for integers, 'bool' for boolean flags,
 * 'string' for single text values, and 'stringlist' for multiple text
 * values.
 *
 * @public
 */
export type DoxyfileTypeType = 'int' | 'bool' | 'string' | 'stringlist';
/**
 * Concrete data model class for Doxyfile option elements.
 *
 * @remarks
 * Represents individual configuration option elements found within
 * Doxyfile XML structures. This class extends the abstract base to
 * provide specific handling for 'option' elements, which define
 * individual Doxygen configuration settings including their identifiers,
 * types, default status, and associated values. Each option corresponds
 * to a specific configuration parameter that controls Doxygen's
 * documentation generation behaviour.
 *
 * @public
 */
export declare class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
    /**
     * Constructs a new DoxygenFileOptionDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the option data
     *
     * @remarks
     * Initialises the option data model by parsing the provided XML element
     * as an 'option' element type. The constructor delegates to the parent
     * class for common option processing whilst specifying the element name
     * for proper XML structure handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=doxyfileoptiontype-dm.d.ts.map