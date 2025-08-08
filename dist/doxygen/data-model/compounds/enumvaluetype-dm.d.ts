import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel } from './descriptiontype-dm.js';
import { InitializerDataModel } from './linkedtexttype-dm.js';
/**
 * Abstract base class for enumeration value data models.
 *
 * @remarks
 * Represents individual values within enumeration types as parsed from
 * Doxygen XML. Contains the value name, optional initialiser expression,
 * and documentation descriptions with protection level information.
 *
 * @public
 */
export declare abstract class AbstractEnumValueType extends AbstractDataModelBase {
    /**
     * The name of the enumeration value.
     *
     * @remarks
     * Simple identifier for the enumeration constant as it appears
     * in the source code.
     */
    name: string;
    /**
     * Optional initialiser expression for the enumeration value.
     *
     * @remarks
     * Contains the explicit value assignment expression when the
     * enumeration value is explicitly initialised in the source code.
     */
    initializer?: InitializerDataModel | undefined;
    /**
     * Brief description of the enumeration value.
     *
     * @remarks
     * Short documentation comment providing a concise explanation
     * of the enumeration value's purpose or meaning.
     */
    briefDescription?: BriefDescriptionDataModel | undefined;
    /**
     * Detailed description of the enumeration value.
     *
     * @remarks
     * Comprehensive documentation comment providing full details
     * about the enumeration value's purpose, usage, and behaviour.
     */
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    /**
     * Unique identifier for the enumeration value.
     *
     * @remarks
     * Doxygen-generated identifier used for cross-referencing
     * and creating links to this enumeration value.
     */
    id: string;
    /**
     * Protection level of the enumeration value.
     *
     * @remarks
     * Indicates the visibility scope such as 'public', 'private',
     * or 'protected' based on Doxygen's protection kind enumeration.
     */
    prot: string;
    /**
     * Creates a new enumeration value data model.
     *
     * @remarks
     * Parses the XML element representing an enumeration value and
     * extracts all relevant information including name, initialiser,
     * descriptions, and attributes.
     *
     * @param xml - The XML parser instance
     * @param element - The XML element to parse
     * @param elementName - The name of the XML element
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation of enumeration value data model.
 *
 * @remarks
 * Represents a single enumeration value as parsed from Doxygen XML
 * output. Inherits all functionality from the abstract base class
 * and provides the specific element name for parsing.
 *
 * @public
 */
export declare class EnumValueDataModel extends AbstractEnumValueType {
    /**
     * Creates a new enumeration value data model from XML.
     *
     * @remarks
     * Parses the XML element representing an enumeration value using
     * the inherited parsing logic with the 'enumvalue' element name.
     *
     * @param xml - The XML parser instance
     * @param element - The XML element to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=enumvaluetype-dm.d.ts.map