import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for compound reference data models.
 *
 * @remarks
 * Represents references to other compound entities in Doxygen XML output,
 * including inheritance relationships and cross-references. This class
 * handles the 'compoundRefType' XML schema structure with text content
 * and attributes for protection level, virtual specification, and optional
 * reference identifiers.
 *
 * @public
 */
export declare abstract class AbstractCompoundRefType extends AbstractDataModelBase {
    /**
     * The name or identifier text of the referenced compound.
     *
     * @remarks
     * Contains the textual content extracted from the compound reference XML
     * element, typically representing the name of the referenced class,
     * structure, or other compound entity. This text content serves as the
     * primary identifier for the referenced compound in inheritance
     * relationships and cross-references.
     */
    text: string;
    /**
     * Protection level of the compound reference.
     *
     * @remarks
     * Specifies the access protection level using DoxProtectionKind
     * enumeration values ('public', 'protected', 'private', 'package').
     * This mandatory attribute determines the visibility and accessibility
     * of the referenced compound in inheritance relationships.
     */
    prot: string;
    /**
     * Virtual specification of the compound reference.
     *
     * @remarks
     * Specifies the virtual nature using DoxVirtualKind enumeration values
     * ('non-virtual', 'virtual', 'pure-virtual'). This mandatory attribute
     * indicates whether the compound reference involves virtual inheritance
     * or virtual methods in object-oriented programming contexts.
     */
    virt: string;
    /**
     * Optional reference identifier for cross-linking.
     *
     * @remarks
     * Contains the unique identifier that can be used to create hyperlinks
     * or cross-references to the referenced compound's documentation. When
     * present, this identifier enables navigation between related compound
     * definitions in the generated documentation.
     */
    refid?: string | undefined;
    /**
     * Constructs a new compound reference data model instance.
     *
     * @remarks
     * Parses compound reference elements from Doxygen XML output, extracting
     * the text content representing the compound name and processing attributes
     * for protection level, virtual specification, and optional reference
     * identifier. This provides the foundation for inheritance and
     * cross-reference relationships in the documentation structure.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Type definition for Doxygen protection levels.
 *
 * @remarks
 * Represents the access protection levels available in object-oriented
 * programming languages as recognised by Doxygen. These values correspond
 * to the visibility modifiers used in class inheritance and member access
 * control throughout the documentation system.
 *
 * @public
 */
export type DoxProtectionKind = 'public' | 'protected' | 'private' | 'package';
/**
 * Type definition for Doxygen virtual function specifications.
 *
 * @remarks
 * Represents the virtual function categories recognised by Doxygen for
 * object-oriented programming languages. These values indicate the virtual
 * nature of methods and functions in inheritance hierarchies, enabling
 * proper documentation of polymorphic behaviour and interface contracts.
 *
 * @public
 */
export type DoxVirtualKind = 'non-virtual' | 'virtual' | 'pure-virtual';
/**
 * Data model for base compound references in inheritance relationships.
 *
 * @remarks
 * Represents references to base classes or parent compounds in inheritance
 * hierarchies as documented by Doxygen. This class handles the
 * 'basecompoundref' XML elements that establish parent-child relationships
 * in object-oriented documentation structures.
 *
 * @public
 */
export declare class BaseCompoundRefDataModel extends AbstractCompoundRefType {
    /**
     * Constructs a new BaseCompoundRefDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'basecompoundref' XML elements,
     * representing inheritance relationships where the current compound
     * derives from the referenced base compound.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for derived compound references in inheritance relationships.
 *
 * @remarks
 * Represents references to derived classes or child compounds in inheritance
 * hierarchies as documented by Doxygen. This class handles the
 * 'derivedcompoundref' XML elements that establish child-parent relationships
 * in object-oriented documentation structures.
 *
 * @public
 */
export declare class DerivedCompoundRefDataModel extends AbstractCompoundRefType {
    /**
     * Constructs a new DerivedCompoundRefDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'derivedcompoundref' XML elements,
     * representing inheritance relationships where other compounds derive
     * from the current compound as their base.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=compoundreftype-dm.d.ts.map