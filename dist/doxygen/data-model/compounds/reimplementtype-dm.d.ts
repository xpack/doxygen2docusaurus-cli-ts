import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for reimplement type data models.
 *
 * @remarks
 * Represents the foundational structure for reimplement relationship elements
 * within Doxygen XML documentation, corresponding to the reimplementType
 * complex type in the XML schema. This class manages relationships between
 * methods, functions, or other documented entities that implement or override
 * behaviour from base classes or interfaces. The reimplement relationship
 * captures both the descriptive text and the reference identifier for the
 * related entity, enabling comprehensive documentation of inheritance and
 * polymorphic behaviours within the codebase.
 *
 * @public
 */
export declare abstract class AbstractReimplementType extends AbstractDataModelBase {
    /**
     * The descriptive text content for this reimplement relationship.
     *
     * @remarks
     * Mandatory element containing the textual description of the reimplement
     * relationship. This text typically includes the signature or name of the
     * reimplemented entity, providing human-readable context about the
     * relationship between the current entity and the referenced implementation.
     */
    text: string;
    /**
     * The reference identifier for the reimplemented entity.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for the entity
     * being reimplemented. This reference enables linking and cross-referencing
     * between related documentation elements, allowing navigation between
     * implementations and their base declarations within the generated
     * documentation structure.
     */
    refId: string;
    /**
     * Constructs a new abstract reimplement type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplement relationship data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete reimplement
     * relationship data model. The parsing process extracts the textual content
     * from the element and processes the mandatory refid attribute. Validation
     * ensures that both the descriptive text and reference identifier are
     * present and non-empty, maintaining the integrity of the reimplement
     * relationship documentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for reimplement relationship elements.
 *
 * @remarks
 * Represents a specific reimplement relationship within Doxygen XML
 * documentation, corresponding to the reimplements XML element. This class
 * manages relationships where the current entity reimplements or overrides
 * behaviour from a base class or interface. The relationship captures both
 * the descriptive information and the reference to the original implementation,
 * enabling comprehensive documentation of polymorphic behaviours and
 * inheritance patterns within object-oriented codebases.
 *
 * @public
 */
export declare class ReimplementDataModel extends AbstractReimplementType {
    /**
     * Constructs a new reimplement relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplement relationship data
     *
     * @remarks
     * Creates a complete reimplement relationship data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the reimplements element type,
     * establishing the relationship between the current entity and the
     * reimplemented base implementation.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for reimplemented-by relationship elements.
 *
 * @remarks
 * Represents the inverse reimplement relationship within Doxygen XML
 * documentation, corresponding to the reimplementedby XML element. This class
 * manages relationships where the current entity is reimplemented or overridden
 * by derived classes or implementing types. The relationship provides a
 * reverse-lookup capability, allowing documentation of which entities override
 * or reimplement the current method or function. This bidirectional
 * relationship documentation enables comprehensive understanding of inheritance
 * hierarchies and polymorphic implementations.
 *
 * @public
 */
export declare class ReimplementedByDataModel extends AbstractReimplementType {
    /**
     * Constructs a new reimplemented-by relationship data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reimplemented-by relationship
     *   data
     *
     * @remarks
     * Creates a complete reimplemented-by relationship data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the reimplementedby element
     * type, establishing the reverse relationship between the current entity
     * and the implementing derived classes or types.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=reimplementtype-dm.d.ts.map