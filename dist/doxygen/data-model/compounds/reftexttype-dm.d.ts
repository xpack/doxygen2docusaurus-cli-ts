import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for reference text type data models.
 *
 * @remarks
 * Represents the foundational structure for reference text elements within
 * Doxygen XML documentation, corresponding to the refTextType complex type
 * in the XML schema. This class manages textual references to documented
 * entities with enhanced metadata including reference classification, external
 * linking capabilities, and tooltip information. Reference text elements
 * provide rich linking functionality within documentation content, enabling
 * precise navigation to related entities whilst maintaining readability and
 * contextual information for enhanced user experience.
 *
 * @public
 */
export declare abstract class AbstractRefTextType extends AbstractDataModelBase {
    /**
     * The textual content of the reference.
     *
     * @remarks
     * Mandatory element containing the display text for the reference, passed
     * as the element's text content. This text provides the human-readable
     * representation of the referenced entity and is typically the name or
     * identifier that appears in the documentation content where the reference
     * is embedded.
     */
    text: string;
    /**
     * The unique reference identifier for the referenced entity.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for the referenced
     * entity within the Doxygen documentation system. This identifier enables
     * precise linking and cross-referencing between documentation elements,
     * allowing navigation to the detailed documentation of the referenced item.
     */
    refid: string;
    /**
     * The kind classification of the referenced entity.
     *
     * @remarks
     * Mandatory attribute specifying the type of entity being referenced,
     * according to the DoxRefKind enumeration. This classification determines
     * how the reference is processed and presented, distinguishing between
     * compound entities (such as classes or namespaces) and member entities
     * (such as functions or variables).
     */
    kindref: string;
    /**
     * The external reference location for cross-project linking.
     *
     * @remarks
     * Optional attribute that specifies an external location for the referenced
     * entity, enabling cross-project or cross-documentation linking. When
     * present, this attribute indicates that the referenced entity is defined
     * in external documentation, requiring special handling for link generation
     * and navigation.
     */
    external?: string | undefined;
    /**
     * The tooltip text for enhanced reference information.
     *
     * @remarks
     * Optional attribute that provides additional contextual information to be
     * displayed as a tooltip when interacting with the reference. This tooltip
     * enhances the user experience by providing immediate context about the
     * referenced entity without requiring navigation to the target documentation.
     */
    tooltip?: string | undefined;
    /**
     * Constructs a new abstract reference text type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reference text data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete reference text
     * data model. The parsing process extracts the textual content from the
     * element and processes all defined attributes including the mandatory
     * refid and kindref attributes, as well as optional external and tooltip
     * attributes. Validation ensures that required elements and attributes are
     * present and conform to the expected XML schema structure.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Type definition for Doxygen reference kind classifications.
 *
 * @remarks
 * Represents the enumeration of valid reference kinds within Doxygen XML
 * documentation, corresponding to the DoxRefKind simple type in the XML
 * schema. This type distinguishes between compound entities (such as classes,
 * structs, interfaces, and namespaces) and member entities (such as functions,
 * variables, enumerations, and typedefs). The classification affects how
 * references are processed, linked, and presented in the generated
 * documentation structure.
 *
 * @public
 */
export type DoxRefKind = 'compound' | 'member';
/**
 * Data model for reference text elements.
 *
 * @remarks
 * Represents a specific textual reference within Doxygen XML documentation,
 * corresponding to the ref XML element. This class manages rich textual
 * references that appear within documentation content, providing enhanced
 * linking capabilities with metadata support. Reference text elements enable
 * seamless navigation between related documentation entities whilst
 * maintaining the flow and readability of the containing text. The class
 * supports both internal and external references, with optional tooltip
 * information for improved user experience.
 *
 * @public
 */
export declare class RefTextDataModel extends AbstractRefTextType {
    /**
     * Constructs a new reference text data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reference text data
     *
     * @remarks
     * Creates a complete reference text data model by parsing the provided XML
     * element. This constructor delegates to the parent class to handle all
     * standard parsing operations for the ref element type, establishing the
     * textual reference with full metadata support for enhanced linking and
     * navigation capabilities.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=reftexttype-dm.d.ts.map