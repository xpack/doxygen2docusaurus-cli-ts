import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { DescriptionDataModel } from './descriptiontype-dm.js';
import { MemberDefDataModel } from './memberdeftype-dm.js';
import { MemberDataModel } from './membertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for section definition type data models.
 *
 * @remarks
 * Represents the foundational structure for section definition elements
 * within Doxygen XML documentation, corresponding to the sectiondefType
 * complex type in the XML schema. This class provides the core properties
 * and utility methods for managing section definitions, including kind
 * classification, optional headers and descriptions, and member collections.
 * All concrete section definition classes should extend this base to ensure
 * consistent structure and behaviour.
 *
 * @public
 */
export declare abstract class AbstractSectionDefTypeBase extends AbstractDataModelBase {
    /**
     * The kind classification of this section definition.
     *
     * @remarks
     * Mandatory attribute that specifies the type of section, corresponding
     * to the DoxSectionKind enumeration in the XML schema. This classification
     * determines how the section is processed and presented in the documentation.
     */
    kind: string;
    /**
     * The optional header text for this section.
     *
     * @remarks
     * Optional element that provides a title or heading for the section.
     * When present, this header is used for display and navigation purposes
     * within the generated documentation.
     */
    header?: string | undefined;
    /**
     * The optional description content for this section.
     *
     * @remarks
     * Optional element containing detailed description information for the
     * section. This description provides context and documentation about
     * the section's purpose and contents.
     */
    description?: DescriptionDataModel | undefined;
    /**
     * Collection of member definition data models.
     *
     * @remarks
     * Optional array containing detailed member definitions for this section.
     * This collection is mutually exclusive with the members array, as per
     * the XML schema choice constraint. Each member definition provides
     * comprehensive information about documented entities.
     */
    memberDefs?: MemberDefDataModel[] | undefined;
    /**
     * Collection of member reference data models.
     *
     * @remarks
     * Optional array containing member references for this section. This
     * collection is mutually exclusive with the memberDefs array, as per
     * the XML schema choice constraint. Each member reference provides
     * summary information and links to detailed definitions.
     */
    members?: MemberDataModel[] | undefined;
    /**
     * Constructs a new abstract section definition type base instance.
     *
     * @param elementName - The XML element name for this section definition
     * @param kind - The section kind classification
     *
     * @remarks
     * Initialises the base properties for a section definition, establishing
     * the element name and kind classification that will be used throughout
     * the processing lifecycle.
     */
    constructor(elementName: string, kind: string);
    /**
     * Determines whether this section contains any member information.
     *
     * @returns True if the section has member definitions or member references
     *
     * @remarks
     * Utility method that checks for the presence of either member definitions
     * or member references within this section. This is useful for determining
     * whether the section requires member processing or can be treated as
     * documentation-only content.
     */
    hasMembers(): boolean;
    /**
     * Computes an adjusted kind string based on section and member suffixes.
     *
     * @param sectionSuffix - The suffix to apply for section-based adjustments
     * @param memberSuffix - The suffix to apply for member-based adjustments
     * @returns The adjusted kind string
     *
     * @remarks
     * Transforms the section kind for specific member types, such as converting
     * 'public-func' into more specific kinds like 'public-constructor',
     * 'public-destructor', or 'public-operator'. For user-defined sections,
     * returns the member suffix directly. For hyphenated kinds, replaces the
     * final component with the section suffix. Otherwise, returns the member
     * suffix as the default behaviour.
     */
    computeAdjustedKind(sectionSuffix: string, memberSuffix?: string): string;
}
/**
 * Abstract class for XML-parsed section definition types.
 *
 * @remarks
 * Extends the base section definition type to provide XML parsing capabilities
 * for constructing section definition data models from Doxygen XML elements.
 * This class handles the complete parsing process including attributes, inner
 * elements, headers, descriptions, and member collections. All concrete
 * section definition implementations that require XML parsing should extend
 * this class to benefit from the standardised parsing infrastructure.
 *
 * @public
 */
export declare abstract class AbstractSectionDefType extends AbstractSectionDefTypeBase {
    /**
     * Constructs a new abstract section definition type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing section definition data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete section definition
     * data model. The parsing process handles all defined inner elements
     * including headers, descriptions, member definitions, and member references,
     * as well as the mandatory kind attribute. Validation ensures that required
     * elements and attributes are present and conform to the expected XML schema
     * structure.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete data model for section definition elements.
 *
 * @remarks
 * Represents a specific section definition within Doxygen XML documentation,
 * corresponding to the sectiondef XML element. This class provides the
 * complete implementation for parsing and managing section definition data,
 * including all supported attributes, elements, and member collections. Each
 * instance represents a single section within a compound or group structure.
 *
 * @public
 */
export declare class SectionDefDataModel extends AbstractSectionDefType {
    /**
     * Constructs a new section definition data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing section definition data
     *
     * @remarks
     * Creates a complete section definition data model by parsing the provided
     * XML element. This constructor delegates to the parent class to handle all
     * standard parsing operations for the sectiondef element type.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for section definitions organised by kind classification.
 *
 * @remarks
 * Represents a section definition that is categorised by a specific kind
 * without requiring XML parsing. This class is useful for creating organised
 * collections of section definitions based on their classification types,
 * allowing for structured presentation and filtering of documentation sections.
 * The kind-based organisation enables efficient grouping and processing of
 * related sections within the documentation structure.
 *
 * @public
 */
export declare class SectionDefByKindDataModel extends AbstractSectionDefTypeBase {
    /**
     * Constructs a new section definition organised by kind.
     *
     * @param kind - The section kind classification
     *
     * @remarks
     * Creates a section definition data model with the specified kind
     * classification. This constructor is used when creating organised
     * collections of sections based on their type, without requiring
     * XML parsing operations.
     */
    constructor(kind: string);
}
//# sourceMappingURL=sectiondeftype-dm.d.ts.map