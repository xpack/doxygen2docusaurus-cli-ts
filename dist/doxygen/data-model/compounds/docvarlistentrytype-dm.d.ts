import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { ListItemDataModel, TermDataModel } from './descriptiontype-dm.js';
/**
 * Abstract base class for variable list entry elements within documentation.
 *
 * @remarks
 * Implements processing for variable list entry elements that contain terms
 * within definition lists and variable list structures. This class handles
 * the XML Schema definition for docVarListEntryType elements, which consist
 * of a mandatory term element that provides the definition term for variable
 * list items.
 *
 * The implementation processes term elements using the TermDataModel to
 * maintain proper structure for definition lists and glossary entries within
 * the documentation system.
 *
 * @public
 */
export declare abstract class AbstractDocVarListEntryType extends AbstractDataModelBase {
    /**
     * The term element that defines the term for this variable list entry.
     *
     * @remarks
     * Contains the term data model that represents the definition term within
     * variable lists. This mandatory element provides the term portion of
     * term-definition pairs within definition lists and glossary structures.
     */
    term: TermDataModel | undefined;
    /**
     * Constructs an AbstractDocVarListEntryType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the list entry data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes variable list entry elements by extracting
     * the mandatory term element. The parser ensures proper validation of
     * the term element and maintains compliance with the XML Schema definition
     * for variable list entry structures within documentation systems.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for variable list entry elements within documentation content.
 *
 * @remarks
 * Represents variable list entry elements that provide the term portion
 * of definition lists and variable list structures. This implementation
 * processes Doxygen's varlistentry elements, which contain terms that
 * are paired with list items to form complete definition entries within
 * variable list documentation structures.
 *
 * @public
 */
export declare class VarListEntryDataModel extends AbstractDocVarListEntryType {
    /**
     * Constructs a VarListEntryDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the varlistentry data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocVarListEntryType to
     * handle variable list entry processing whilst identifying the element as
     * 'varlistentry' for proper XML schema compliance and term extraction.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for variable list pair elements within documentation content.
 *
 * @remarks
 * Represents the pairing of variable list entries with their corresponding
 * list items to form complete definition pairs within variable lists. This
 * class encapsulates the relationship between terms and their definitions,
 * as the XML Schema defines variable lists as sequences of varlistentry
 * and listitem pairs but does not provide an explicit container element.
 *
 * This implementation creates a logical pairing structure to maintain the
 * association between terms and their corresponding definitions within
 * variable list documentation structures.
 *
 * @public
 */
export declare class VariableListPairDataModel extends AbstractDataModelBase {
    /**
     * The variable list entry containing the term for this definition pair.
     *
     * @remarks
     * Contains the term portion of the definition pair, representing the
     * item being defined within the variable list structure.
     */
    varlistentry: VarListEntryDataModel;
    /**
     * The list item containing the definition for this definition pair.
     *
     * @remarks
     * Contains the definition portion of the definition pair, providing
     * the explanatory content for the associated term within the variable
     * list structure.
     */
    listitem: ListItemDataModel;
    /**
     * Constructs a VariableListPairDataModel from entry and item components.
     *
     * @param varlistentry - The variable list entry containing the term
     * @param listitem - The list item containing the definition content
     *
     * @remarks
     * This constructor creates a logical pairing between a variable list
     * entry and its corresponding list item to form a complete definition
     * pair. This maintains the semantic relationship between terms and
     * definitions within variable list structures.
     */
    constructor(varlistentry: VarListEntryDataModel, listitem: ListItemDataModel);
}
/**
 * Abstract base class for variable list elements within documentation content.
 *
 * @remarks
 * Implements processing for variable list elements that contain sequences
 * of term-definition pairs within documentation structures. This class
 * handles the XML Schema definition for docVariableListType elements,
 * which consist of repeated variable list groups containing varlistentry
 * and listitem pairs.
 *
 * The implementation processes these pairs sequentially, creating
 * VariableListPairDataModel instances to maintain the logical relationship
 * between terms and their corresponding definitions. The parser expects
 * alternating varlistentry and listitem elements in the correct order
 * to form proper definition pairs.
 *
 * @public
 */
export declare abstract class AbstractDocVariableListType extends AbstractDataModelBase {
    /**
     * Constructs an AbstractDocVariableListType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the variable list data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes variable list elements by extracting pairs
     * of varlistentry and listitem elements in the expected sequence order.
     * The parser creates VariableListPairDataModel instances to maintain
     * the semantic relationship between terms and their definitions whilst
     * ensuring proper XML schema compliance for variable list structures.
     *
     * The implementation expects alternating varlistentry and listitem
     * elements and validates this sequence to ensure proper definition
     * pair formation within the variable list documentation structure.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for variable list elements within documentation content.
 *
 * @remarks
 * Represents variable list elements that provide definition list structures
 * within documentation. This implementation processes Doxygen's variablelist
 * elements, which contain sequences of term-definition pairs for creating
 * glossaries, definition lists, and other structured reference content.
 *
 * The variable list maintains proper pairing between terms and their
 * corresponding definitions through VariableListPairDataModel instances.
 *
 * @public
 */
export declare class VariableListDataModel extends AbstractDocVariableListType {
    /**
     * Constructs a VariableListDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the variablelist data
     *
     * @remarks
     * This constructor delegates to the parent AbstractDocVariableListType to
     * handle variable list processing whilst identifying the element as
     * 'variablelist' for proper XML schema compliance and definition pair
     * extraction within documentation structures.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=docvarlistentrytype-dm.d.ts.map