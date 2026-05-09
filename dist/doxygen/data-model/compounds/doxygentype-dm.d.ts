import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { CompoundDefDataModel } from './compounddef-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for the root Doxygen document type.
 *
 * @remarks
 * Represents the top-level Doxygen XML document structure containing
 * compound definitions and document metadata. This is the root element
 * that contains all other documentation elements parsed from Doxygen XML.
 *
 * @public
 */
export declare abstract class AbstractDoxygenType extends AbstractDataModelBase {
    /**
     * The version of Doxygen that generated the XML.
     *
     * @remarks
     * Version string indicating which Doxygen version was used to
     * generate the XML output, useful for compatibility checking.
     */
    version: string;
    /**
     * The language code for the documentation.
     *
     * @remarks
     * XML language attribute indicating the primary language used
     * in the documentation content.
     */
    lang: string;
    /**
     * Array of compound definition data models.
     *
     * @remarks
     * Contains all the compound definitions (classes, files, namespaces, etc.)
     * that are documented within this Doxygen XML file. This is the main
     * content of the documentation.
     */
    compoundDefs?: CompoundDefDataModel[] | undefined;
    /**
     * XML schema location when no namespace is specified.
     *
     * @remarks
     * Optional attribute specifying the schema location for XML
     * validation when no explicit namespace is used.
     */
    noNamespaceSchemaLocation?: string | undefined;
    /**
     * Creates a new Doxygen document data model from XML.
     *
     * @remarks
     * Parses the root XML element representing a Doxygen document and
     * extracts all compound definitions and metadata attributes.
     *
     * @param xml - The XML parser instance
     * @param element - The XML element to parse
     * @param elementName - The name of the XML element
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation of the Doxygen document data model.
 *
 * @remarks
 * Represents the root doxygen element in Doxygen XML files. Inherits
 * all functionality from the abstract base class and provides the
 * specific element name for parsing.
 *
 * @public
 */
export declare class DoxygenDataModel extends AbstractDoxygenType {
    /**
     * Creates a new Doxygen document data model from XML.
     *
     * @remarks
     * Parses the XML element representing the root doxygen element using
     * the inherited parsing logic with the 'doxygen' element name.
     *
     * @param xml - The XML parser instance
     * @param element - The XML element to parse
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=doxygentype-dm.d.ts.map