import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for reference type data models.
 *
 * @remarks
 * Represents the foundational structure for reference relationship elements
 * within Doxygen XML documentation, corresponding to the referenceType
 * complex type in the XML schema. This class manages bidirectional reference
 * relationships between documented entities, capturing both the descriptive
 * text and precise location information including line number ranges. The
 * reference system enables comprehensive dependency tracking and cross-
 * referencing capabilities, essential for understanding code relationships
 * and generating accurate documentation navigation structures.
 *
 * @public
 */
export declare abstract class AbstractReferenceType extends AbstractDataModelBase {
    /**
     * The descriptive text content for this reference relationship.
     *
     * @remarks
     * Contains the textual description of the reference relationship, typically
     * including the name or signature of the referenced entity. This text
     * provides human-readable context about the relationship and is used for
     * display purposes within the generated documentation. Note that this
     * property is not explicitly defined in the XML schema DTD but appears
     * in practice within reference elements.
     */
    text: string;
    /**
     * The unique reference identifier for the referenced entity.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for the entity
     * being referenced. This identifier enables precise linking and cross-
     * referencing between documentation elements, allowing navigation to the
     * detailed documentation of the referenced item within the documentation
     * structure.
     */
    refid: string;
    /**
     * The starting line number where the reference occurs.
     *
     * @remarks
     * Specifies the line number in the source code where the reference
     * relationship begins. This location information enables precise source
     * code navigation and helps establish the exact context of the reference
     * within the original source files. Note that this attribute may be missing
     * in some reference elements despite being defined as mandatory in the
     * XML schema.
     */
    startline: number | undefined;
    /**
     * The ending line number where the reference concludes.
     *
     * @remarks
     * Specifies the line number in the source code where the reference
     * relationship ends. Combined with the starting line, this provides a
     * complete range for the reference occurrence, enabling precise source
     * code highlighting and navigation capabilities. Note that this attribute
     * may be missing in some reference elements despite being defined as
     * mandatory in the XML schema.
     */
    endline: number | undefined;
    /**
     * The compound reference identifier for the containing entity.
     *
     * @remarks
     * Optional attribute that provides the identifier of the compound entity
     * (such as a class or namespace) that contains the referenced item. This
     * additional context enables more precise navigation and helps establish
     * the hierarchical relationship between the referencing and referenced
     * entities within the documentation structure.
     */
    compoundref?: string | undefined;
    /**
     * Constructs a new abstract reference type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reference relationship data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete reference
     * relationship data model. The parsing process extracts the textual content
     * from the element and processes all defined attributes including the
     * mandatory refid attribute, line number information, and optional compound
     * reference data. Validation ensures that the reference identifier is
     * present, maintaining the integrity of the reference relationship
     * documentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for reference relationship elements.
 *
 * @remarks
 * Represents a forward reference relationship within Doxygen XML
 * documentation, corresponding to the references XML element. This class
 * manages relationships where the current entity references or depends upon
 * another documented entity. The relationship captures both the descriptive
 * information and precise location data, enabling comprehensive dependency
 * tracking and navigation capabilities. Forward references help document
 * how entities use or depend on other components within the codebase.
 *
 * @public
 */
export declare class ReferenceDataModel extends AbstractReferenceType {
    /**
     * Constructs a new reference relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reference relationship data
     *
     * @remarks
     * Creates a complete forward reference relationship data model by parsing
     * the provided XML element. This constructor delegates to the parent class
     * to handle all standard parsing operations for the references element type,
     * establishing the forward dependency relationship between the current
     * entity and the referenced component.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for referenced-by relationship elements.
 *
 * @remarks
 * Represents a reverse reference relationship within Doxygen XML
 * documentation, corresponding to the referencedby XML element. This class
 * manages relationships where the current entity is referenced or used by
 * another documented entity. The relationship provides bidirectional
 * dependency information, enabling comprehensive understanding of how
 * entities are utilised throughout the codebase. Referenced-by relationships
 * are essential for impact analysis and understanding the scope of changes
 * when modifying documented components.
 *
 * @public
 */
export declare class ReferencedByDataModel extends AbstractReferenceType {
    /**
     * Constructs a new referenced-by relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing referenced-by relationship data
     *
     * @remarks
     * Creates a complete reverse reference relationship data model by parsing
     * the provided XML element. This constructor delegates to the parent class
     * to handle all standard parsing operations for the referencedby element
     * type, establishing the reverse dependency relationship indicating how
     * other entities utilise the current component.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=referencetype-dm.d.ts.map