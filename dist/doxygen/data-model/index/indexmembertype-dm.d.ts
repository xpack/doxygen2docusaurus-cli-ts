import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for index member type data models.
 *
 * @remarks
 * Represents member elements found within Doxygen index XML structures,
 * corresponding to the MemberType complex type in the XML schema. This
 * class handles the parsing of member names, reference identifiers, and
 * member kinds from the XML structure. All concrete member data model
 * classes should extend this abstract base to ensure consistent parsing
 * and data representation.
 *
 * @public
 */
export declare abstract class AbstractIndexMemberType extends AbstractDataModelBase {
    /**
     * The name of the member element.
     *
     * @remarks
     * Extracted from the mandatory 'name' element within the member XML
     * structure. Represents the identifier or name of the documented member.
     */
    name: string;
    /**
     * The reference identifier for the member.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for referencing
     * this member within the Doxygen documentation structure. Used to link
     * index entries to their detailed definitions.
     */
    refid: string;
    /**
     * The kind classification of the member.
     *
     * @remarks
     * Mandatory attribute specifying the type of member (e.g., function,
     * variable, typedef). Corresponds to the MemberKind enumeration in the
     * XML schema.
     */
    kind: string;
    /**
     * Constructs a new AbstractIndexMemberType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the member data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract member information including
     * the name element and mandatory attributes (refid and kind). The constructor
     * validates that all required data is present and properly formatted
     * according to the XML schema specifications.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type representing the various kinds of members in Doxygen
 * documentation.
 *
 * @remarks
 * Corresponds to the MemberKind simple type in the Doxygen XML schema,
 * which defines the allowable classifications for documented members.
 * Each value represents a specific type of programming construct that
 * can be documented, ranging from preprocessor definitions to class
 * methods and properties.
 *
 * @public
 */
export type IndexMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'enumvalue' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot';
/**
 * Concrete data model class for index member elements.
 *
 * @remarks
 * Represents individual member elements found within Doxygen index XML
 * structures. This class extends the abstract base to provide specific
 * handling for 'member' elements, which reference documented members
 * such as functions, variables, and other programming constructs within
 * the indexed documentation.
 *
 * @public
 */
export declare class IndexMemberDataModel extends AbstractIndexMemberType {
    /**
     * Constructs a new IndexMemberDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the member data
     *
     * @remarks
     * Initialises the member data model by parsing the provided XML element
     * as a 'member' element type. The constructor delegates to the parent
     * class for common member processing whilst specifying the element name.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=indexmembertype-dm.d.ts.map