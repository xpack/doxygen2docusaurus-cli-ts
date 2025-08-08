import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { MemberRefDataModel } from './memberreftype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for list-of-all-members elements within documentation.
 *
 * @remarks
 * Implements processing for list-of-all-members elements that contain
 * comprehensive member reference collections within class and compound
 * documentation. This class handles the XML Schema definition for
 * listofallmembersType elements, which provide complete inventories of
 * all members (including inherited members) associated with classes,
 * structures, and other compound types.
 *
 * The implementation processes sequences of member reference elements,
 * creating MemberRefDataModel instances to maintain detailed information
 * about each member's identity, scope, and accessibility within the
 * compound's complete member hierarchy.
 *
 * @public
 */
export declare abstract class AbstractListOfAllMembersType extends AbstractDataModelBase {
    /**
     * Collection of member reference elements within the list-of-all-members.
     *
     * @remarks
     * Contains processed member reference data models representing all members
     * associated with the compound, including both directly declared and
     * inherited members. Each reference provides comprehensive identification
     * and scope information for the corresponding member element.
     *
     * @public
     */
    memberRefs?: MemberRefDataModel[] | undefined;
    /**
     * Constructs a new list-of-all-members data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing list-of-all-members data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Processes the XML element to extract and organise member reference
     * information, creating appropriate data model instances for each
     * member entry found within the comprehensive member listing.
     * The constructor validates the element structure and ensures
     * all member references are properly instantiated.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation for listofallmembers elements within compound
 * documentation.
 *
 * @remarks
 * Provides specific handling for listofallmembers XML elements that contain
 * comprehensive member inventories within class and compound documentation.
 * This implementation extends the abstract base class functionality to
 * process the complete collection of member references, including both
 * directly declared and inherited members.
 *
 * The class ensures proper instantiation of member reference data models
 * whilst maintaining the hierarchical structure and accessibility information
 * required for comprehensive documentation generation.
 *
 * @public
 */
export declare class ListOfAllMembersDataModel extends AbstractListOfAllMembersType {
    /**
     * Constructs a new listofallmembers data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing listofallmembers data
     *
     * @remarks
     * Initialises the data model with the specific element name
     * 'listofallmembers' and delegates processing to the abstract base class
     * implementation. This ensures consistent handling of member reference
     * collections whilst maintaining proper element identification.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=listofallmemberstype-dm.d.ts.map