import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractMemberBaseType } from './memberdeftype-dm.js';
/**
 * Abstract base class for member type data models within documentation.
 *
 * @remarks
 * Represents member elements as defined by the MemberType XML Schema,
 * providing fundamental member identification and classification
 * functionality. This class extends AbstractMemberBaseType to handle
 * the specific requirements of member elements that contain simplified
 * member information with reference identifiers.
 *
 * The implementation processes member elements that primarily serve as
 * lightweight references to more detailed member definitions, maintaining
 * essential identification data including names, reference identifiers,
 * and member kind classifications for cross-referencing purposes.
 *
 * @public
 */
export declare abstract class AbstractMemberType extends AbstractMemberBaseType {
    /**
     * The unique reference identifier for the member element.
     *
     * @remarks
     * Contains the Doxygen-generated unique identifier used for creating
     * cross-references and hyperlinks to the detailed member definition.
     * This identifier serves as the primary mechanism for linking between
     * member references and their corresponding comprehensive definitions
     * within the documentation system.
     *
     * @public
     */
    refid: string;
    /**
     * Constructs a new member type data model from XML element data.
     *
     * @param xml - The XML parser instance for processing element data
     * @param element - The XML element containing member type information
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Processes the XML element representing simplified member information
     * and extracts the essential identification data including name and
     * reference identifier. The constructor handles the MemberType schema
     * requirements whilst accommodating the practical deviation where
     * member names may be empty in certain contexts.
     *
     * The implementation validates mandatory attributes (refid, kind) and
     * ensures proper element structure according to the XML Schema
     * definition for MemberType elements.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type representing member kind classifications within Doxygen
 * documentation.
 *
 * @remarks
 * Defines the complete set of member types that can be classified within
 * the MemberKind enumeration, covering fundamental programming constructs
 * and framework-specific elements. This enumeration provides a focused
 * subset of member classifications used specifically for member element
 * identification and categorisation.
 *
 * The enumeration encompasses traditional programming elements (functions,
 * variables, typedefs, enums), preprocessor constructs (defines), modern
 * language features (properties, events), and specialised framework
 * constructs including Qt-specific elements (signals, slots) and legacy
 * communication mechanisms (dcop).
 *
 * @public
 */
export type MemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
/**
 * Concrete implementation for member elements within documentation.
 *
 * @remarks
 * Provides specific handling for member XML elements that contain
 * simplified member information within various documentation contexts.
 * This implementation extends the abstract base class functionality
 * to process member elements with the specific element name 'member'.
 *
 * The class represents lightweight member references that serve as
 * cross-reference points to more detailed member definitions, maintaining
 * essential identification data whilst enabling efficient navigation
 * within the documentation system. These elements are commonly used
 * in member lists and summary sections where full member details
 * are not required.
 *
 * @public
 */
export declare class MemberDataModel extends AbstractMemberType {
    /**
     * Constructs a new member data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing member data
     *
     * @remarks
     * Initialises the data model with the specific element name 'member'
     * and delegates processing to the abstract base class implementation.
     * This ensures consistent handling of simplified member information
     * whilst maintaining proper element identification for cross-referencing
     * and navigation functionality.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=membertype-dm.d.ts.map