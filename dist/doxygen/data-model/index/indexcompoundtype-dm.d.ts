import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { IndexMemberDataModel } from './indexmembertype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for index compound type data models.
 *
 * @remarks
 * Represents compound elements found within Doxygen index XML structures,
 * corresponding to the CompoundType complex type in the XML schema. This
 * class handles the parsing of compound names, member collections, and
 * mandatory attributes (refid and kind). All concrete compound data model
 * classes should extend this abstract base to ensure consistent parsing
 * and data representation.
 *
 * @public
 */
export declare abstract class AbstractIndexCompoundType extends AbstractDataModelBase {
    /**
     * The name of the compound element.
     *
     * @remarks
     * Extracted from the mandatory 'name' element within the compound XML
     * structure. Represents the identifier or name of the documented compound
     * such as a class name, namespace, or filename.
     */
    name: string;
    /**
     * Collection of member data models associated with this compound.
     *
     * @remarks
     * Optional array containing member elements found within the compound
     * structure. Each member represents a documented entity that belongs
     * to this compound, such as functions, variables, or other nested
     * constructs. The array supports zero to many members as per the XML schema.
     */
    members: IndexMemberDataModel[] | undefined;
    /**
     * The unique reference identifier for this compound.
     *
     * @remarks
     * Mandatory attribute that provides a unique identifier for referencing
     * this compound within the Doxygen documentation structure. Used to link
     * index entries to their detailed definitions in separate XML files.
     */
    refid: string;
    /**
     * The kind classification of this compound.
     *
     * @remarks
     * Mandatory attribute specifying the type of compound (e.g., class, struct,
     * namespace, file). Corresponds to the CompoundKind enumeration in the
     * XML schema, determining how the compound should be processed and presented.
     */
    kind: string;
    /**
     * Constructs a new AbstractIndexCompoundType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the compound data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract compound information including
     * the name element, member collections, and mandatory attributes (refid and
     * kind). The constructor validates that all required data is present and
     * properly formatted according to the XML schema specifications. Member
     * elements are processed into IndexMemberDataModel instances when present.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Union type representing the various kinds of compounds in Doxygen
 * documentation.
 *
 * @remarks
 * Corresponds to the CompoundKind simple type in the Doxygen XML schema,
 * which defines the allowable classifications for documented compounds.
 * Each value represents a specific type of programming construct or
 * documentation unit that can be indexed, ranging from code structures
 * like classes and namespaces to documentation pages and examples.
 *
 * @public
 */
export type IndexCompoundKind = 'class' | 'struct' | 'union' | 'interface' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'group' | 'page' | 'example' | 'dir' | 'type' | 'concept' | 'module';
/**
 * Concrete data model class for index compound elements.
 *
 * @remarks
 * Represents individual compound elements found within Doxygen index XML
 * structures. This class extends the abstract base to provide specific
 * handling for 'compound' elements, which reference documented entities
 * such as classes, namespaces, files, and other structural components
 * within the indexed documentation. Each compound serves as an entry
 * point for accessing detailed documentation in separate XML files.
 *
 * @public
 */
export declare class IndexCompoundDataModel extends AbstractIndexCompoundType {
    /**
     * Constructs a new IndexCompoundDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the compound data
     *
     * @remarks
     * Initialises the compound data model by parsing the provided XML element
     * as a 'compound' element type. The constructor delegates to the parent
     * class for common compound processing whilst specifying the element name
     * for proper XML structure handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=indexcompoundtype-dm.d.ts.map