import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for member reference data models within documentation.
 *
 * @remarks
 * Represents comprehensive references to class or namespace members as
 * parsed from Doxygen XML elements. This class processes memberRefType
 * schema definitions which contain scope information, member names, and
 * essential attributes required for cross-referencing and link generation
 * within the documentation system.
 *
 * The implementation handles the complete set of member reference metadata
 * including qualified scope identification, protection levels, virtual
 * inheritance characteristics, and ambiguity resolution information.
 * This enables accurate cross-reference generation and navigation between
 * different parts of the documentation.
 *
 * @public
 */
export declare abstract class AbstractMemberRefType extends AbstractDataModelBase {
    /**
     * The containing scope for the referenced member element.
     *
     * @remarks
     * Specifies the namespace, class, or other containing context that
     * houses the referenced member. This scope information provides the
     * qualified context necessary for proper member identification and
     * disambiguation within the documentation hierarchy.
     *
     * @public
     */
    scope: string;
    /**
     * The identifier name of the referenced member element.
     *
     * @remarks
     * Contains the simple identifier name for the member being referenced,
     * which serves as the primary display name and is used for link
     * generation within the documentation system. This name is used in
     * conjunction with the scope to provide complete member identification.
     *
     * @public
     */
    name: string;
    /**
     * The unique reference identifier for cross-referencing the member.
     *
     * @remarks
     * Contains the Doxygen-generated unique identifier used for creating
     * precise cross-references and hyperlinks to the member documentation.
     * This identifier ensures unambiguous linking between documentation
     * elements and enables accurate navigation within the generated
     * documentation system.
     *
     * @public
     */
    refid: string;
    /**
     * The protection level classification of the referenced member.
     *
     * @remarks
     * Specifies the access protection level such as 'public', 'private',
     * or 'protected' based on Doxygen's DoxProtectionKind enumeration.
     * This information determines the member's visibility and accessibility
     * within its containing scope and affects documentation presentation.
     *
     * @public
     */
    prot: string;
    /**
     * The virtual inheritance classification of the referenced member.
     *
     * @remarks
     * Indicates the virtual nature such as 'virtual', 'pure-virtual',
     * or 'non-virtual' based on Doxygen's DoxVirtualKind enumeration.
     * This classification is essential for understanding inheritance
     * relationships and member override behaviour within class hierarchies.
     *
     * @public
     */
    virt: string;
    /**
     * The ambiguity resolution scope for member reference disambiguation.
     *
     * @remarks
     * Provides optional scope information used to resolve ambiguous member
     * references when multiple members with identical names exist within
     * the documentation context. This field assists in ensuring accurate
     * member identification when name conflicts occur.
     *
     * Note that this deviates from the XML Schema definition where it is
     * marked as required, but in practice may be undefined for certain
     * member references.
     *
     * @public
     */
    ambiguityscope?: string | undefined;
    /**
     * Constructs a new member reference data model from XML element data.
     *
     * @param xml - The XML parser instance for processing element data
     * @param element - The XML element containing member reference information
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Processes the XML element representing member reference information
     * and extracts scope identification, member names, and reference
     * attributes required for cross-referencing functionality. The
     * constructor validates mandatory elements and attributes whilst
     * gracefully handling optional ambiguity scope information.
     *
     * The implementation ensures that essential reference data (scope, name,
     * refid, protection, virtual kind) is properly extracted and validated
     * according to the memberRefType schema requirements.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation for member reference elements within documentation.
 *
 * @remarks
 * Provides specific handling for member XML elements that contain
 * comprehensive member reference information within class and compound
 * documentation. This implementation extends the abstract base class
 * functionality to process member references with the specific element
 * name 'member'.
 *
 * The class ensures proper instantiation of member reference data models
 * whilst maintaining all the cross-referencing metadata required for
 * accurate documentation linking and navigation between related members
 * within the documentation system.
 *
 * @public
 */
export declare class MemberRefDataModel extends AbstractMemberRefType {
    /**
     * Constructs a new member reference data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing member reference data
     *
     * @remarks
     * Initialises the data model with the specific element name 'member'
     * and delegates processing to the abstract base class implementation.
     * This ensures consistent handling of member reference information
     * whilst maintaining proper element identification for cross-referencing
     * functionality.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=memberreftype-dm.d.ts.map