import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for reference type data models.
 *
 * @remarks
 * Represents the foundational structure for reference elements within Doxygen
 * XML documentation, corresponding to the refType complex type in the XML
 * schema. This class manages references to various documented entities such
 * as classes, namespaces, files, folders, modules, pages, and groups. Each
 * reference includes the entity name, a unique identifier for linking, and
 * optional protection and inline attributes. All concrete reference
 * implementations should extend this base to ensure consistent structure
 * and parsing behaviour across different reference types.
 *
 * @public
 */
export declare abstract class AbstractRefType extends AbstractDataModelBase {
    /**
     * The name of the referenced entity.
     *
     * @remarks
     * Mandatory element containing the textual name of the referenced entity,
     * passed as the element's text content. This name provides human-readable
     * identification of the referenced item and is used for display and
     * navigation purposes within the generated documentation.
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
     * The protection level of the referenced entity.
     *
     * @remarks
     * Optional attribute specifying the protection level according to the
     * DoxProtectionKind enumeration. Values include 'public', 'protected',
     * 'private', and 'package', indicating the accessibility scope of the
     * referenced entity within its containing context.
     */
    prot?: string | undefined;
    /**
     * Indicates whether the referenced entity is inline.
     *
     * @remarks
     * Optional boolean attribute that specifies whether the referenced entity
     * is defined inline within its containing context. This information affects
     * how the entity is presented and processed in the generated documentation,
     * particularly for inline classes, functions, or other code constructs.
     */
    inline?: boolean | undefined;
    /**
     * Constructs a new abstract reference type from XML data.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing reference data
     * @param elementName - The expected XML element name
     *
     * @remarks
     * Parses the provided XML element to construct a complete reference data
     * model. The parsing process extracts the textual content from the element
     * and processes all defined attributes including the mandatory refid and
     * optional protection and inline attributes. Validation ensures that both
     * the reference name and identifier are present and non-empty, maintaining
     * the integrity of the reference documentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for inner module reference elements.
 *
 * @remarks
 * Represents a reference to an inner module within Doxygen XML documentation,
 * corresponding to the innermodule XML element. This class manages references
 * to modules that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed module
 * documentation. Inner modules typically represent modular components or
 * subsystems within larger software projects.
 *
 * @public
 */
export declare class InnerModuleDataModel extends AbstractRefType {
    /**
     * Constructs a new inner module reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner module reference data
     *
     * @remarks
     * Creates a complete inner module reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innermodule element type,
     * establishing the reference to the contained module entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner folder reference elements.
 *
 * @remarks
 * Represents a reference to an inner folder within Doxygen XML documentation,
 * corresponding to the innerdir XML element. This class manages references
 * to folders that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed folder
 * documentation. Inner folders typically represent subdirectories within
 * the project structure that contain related source files and documentation.
 *
 * @public
 */
export declare class InnerDirDataModel extends AbstractRefType {
    /**
     * Constructs a new inner folder reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner folder reference data
     *
     * @remarks
     * Creates a complete inner folder reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innerdir element type,
     * establishing the reference to the contained folder entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner file reference elements.
 *
 * @remarks
 * Represents a reference to an inner file within Doxygen XML documentation,
 * corresponding to the innerfile XML element. This class manages references
 * to files that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed file
 * documentation. Inner files typically represent source code files, headers,
 * or other documented files within the project structure.
 *
 * @public
 */
export declare class InnerFileDataModel extends AbstractRefType {
    /**
     * Constructs a new inner file reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner file reference data
     *
     * @remarks
     * Creates a complete inner file reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innerfile element type,
     * establishing the reference to the contained file entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner class reference elements.
 *
 * @remarks
 * Represents a reference to an inner class within Doxygen XML documentation,
 * corresponding to the innerclass XML element. This class manages references
 * to classes that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed class
 * documentation. Inner classes typically represent nested classes, inner
 * types, or classes defined within other classes or namespaces.
 *
 * @public
 */
export declare class InnerClassDataModel extends AbstractRefType {
    /**
     * Constructs a new inner class reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner class reference data
     *
     * @remarks
     * Creates a complete inner class reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innerclass element type,
     * establishing the reference to the contained class entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner concept reference elements.
 *
 * @remarks
 * Represents a reference to an inner concept within Doxygen XML documentation,
 * corresponding to the innerconcept XML element. This class manages references
 * to concepts that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed concept
 * documentation. Inner concepts typically represent C++20 concepts or similar
 * constraint-based language features defined within classes or namespaces.
 *
 * @public
 */
export declare class InnerConceptDataModel extends AbstractRefType {
    /**
     * Constructs a new inner concept reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner concept reference data
     *
     * @remarks
     * Creates a complete inner concept reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innerconcept element type,
     * establishing the reference to the contained concept entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner namespace reference elements.
 *
 * @remarks
 * Represents a reference to an inner namespace within Doxygen XML
 * documentation, corresponding to the innernamespace XML element. This class
 * manages references to namespaces that are contained within the current
 * documentation context, providing linking and navigation capabilities to
 * detailed namespace documentation. Inner namespaces typically represent
 * nested namespaces or namespace aliases defined within other namespaces.
 *
 * @public
 */
export declare class InnerNamespaceDataModel extends AbstractRefType {
    /**
     * Constructs a new inner namespace reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner namespace reference data
     *
     * @remarks
     * Creates a complete inner namespace reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innernamespace element
     * type, establishing the reference to the contained namespace entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner page reference elements.
 *
 * @remarks
 * Represents a reference to an inner page within Doxygen XML documentation,
 * corresponding to the innerpage XML element. This class manages references
 * to pages that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed page
 * documentation. Inner pages typically represent documentation pages,
 * tutorials, or other narrative content that is logically contained within
 * the current documentation scope.
 *
 * @public
 */
export declare class InnerPageDataModel extends AbstractRefType {
    /**
     * Constructs a new inner page reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner page reference data
     *
     * @remarks
     * Creates a complete inner page reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innerpage element type,
     * establishing the reference to the contained page entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for inner group reference elements.
 *
 * @remarks
 * Represents a reference to an inner group within Doxygen XML documentation,
 * corresponding to the innergroup XML element. This class manages references
 * to groups that are contained within the current documentation context,
 * providing linking and navigation capabilities to detailed group
 * documentation. Inner groups typically represent logical collections or
 * modules of related functionality that are organised within the current
 * documentation scope.
 *
 * @public
 */
export declare class InnerGroupDataModel extends AbstractRefType {
    /**
     * Constructs a new inner group reference data model from XML.
     *
     * @param xml - The Doxygen XML parser instance
     * @param element - The XML element containing inner group reference data
     *
     * @remarks
     * Creates a complete inner group reference data model by parsing the
     * provided XML element. This constructor delegates to the parent class to
     * handle all standard parsing operations for the innergroup element type,
     * establishing the reference to the contained group entity.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=reftype-dm.d.ts.map