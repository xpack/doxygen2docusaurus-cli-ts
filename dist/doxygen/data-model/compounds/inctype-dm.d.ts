import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for include-type elements within documentation.
 *
 * @remarks
 * Implements processing for include-type elements that represent file inclusion
 * relationships within source code documentation. This class handles the XML
 * Schema definition for incType elements, which contain textual content
 * representing file paths or names along with attributes that specify inclusion
 * behaviour and reference relationships.
 *
 * The implementation processes both local and system includes, distinguishing
 * between quoted includes ("filename") and angle-bracket includes (<filename>)
 * through the local attribute. Optional reference identifiers enable
 * cross-referencing to the included file's documentation.
 *
 * @public
 */
export declare abstract class AbstractIncType extends AbstractDataModelBase {
    /**
     * The textual content representing the file path or name being included.
     *
     * @remarks
     * Contains the file path or filename as specified in the include directive.
     * This text content represents the actual filename that appears within
     * the include statement in the source code, providing the reference to
     * the included file within the documentation structure.
     */
    text: string;
    /**
     * Indicates whether the include uses local or system include syntax.
     *
     * @remarks
     * Determines the include syntax style: when true, indicates a local include
     * using quotation marks ("filename"), when false, indicates a system include
     * using angle brackets (<filename>). This distinction affects how the
     * preprocessor searches for the included file.
     */
    local: boolean;
    /**
     * Optional reference identifier for cross-linking to the included file.
     *
     * @remarks
     * Contains the reference identifier that links to the documentation of
     * the included file. This enables navigation from include statements to
     * the actual file documentation within the generated documentation system.
     */
    refId?: string | undefined;
    /**
     * Constructs an AbstractIncType instance from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the include data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * This constructor processes include-type elements by extracting the
     * textual content representing the filename and processing attributes
     * that specify inclusion behaviour. The parser validates the presence
     * of required content and attributes whilst maintaining compliance with
     * the XML Schema definition for include elements.
     *
     * The implementation distinguishes between local and system includes
     * through the local attribute and optionally associates reference
     * identifiers for cross-linking to included file documentation.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Data model for includes elements within documentation content.
 *
 * @remarks
 * Represents includes elements that document files included by the current
 * source file. This implementation processes Doxygen's includes elements,
 * which contain information about files that are included through preprocessor
 * directives such as #include statements within the documented source code.
 *
 * The includes relationship indicates a dependency where the current file
 * incorporates content from the referenced file during compilation.
 *
 * @public
 */
export declare class IncludesDataModel extends AbstractIncType {
    /**
     * Constructs an IncludesDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the includes data
     *
     * @remarks
     * This constructor delegates to the parent AbstractIncType to handle
     * include processing whilst identifying the element as 'includes' for
     * proper XML schema compliance and include relationship documentation.
     * The processed data represents files that are included by the current
     * source file through preprocessor directives.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * Data model for includedby elements within documentation content.
 *
 * @remarks
 * Represents includedby elements that document files which include the
 * current source file. This implementation processes Doxygen's includedby
 * elements, which contain information about files that incorporate the
 * current file through preprocessor directives, establishing reverse
 * inclusion relationships within the documentation system.
 *
 * The includedby relationship indicates a dependency where other files
 * incorporate content from the current file during compilation.
 *
 * @public
 */
export declare class IncludedByDataModel extends AbstractIncType {
    /**
     * Constructs an IncludedByDataModel from XML element data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML content
     * @param element - The XML element object containing the includedby data
     *
     * @remarks
     * This constructor delegates to the parent AbstractIncType to handle
     * include processing whilst identifying the element as 'includedby' for
     * proper XML schema compliance and reverse include relationship handling.
     * The processed data represents files that include the current source file
     * through preprocessor directives, establishing dependency relationships.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=inctype-dm.d.ts.map