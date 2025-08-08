import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * Abstract base class for template parameter list type data models.
 *
 * @remarks
 * Represents template parameter list elements within Doxygen XML structures,
 * corresponding to the templateparamlistType complex type in the XML schema.
 * This class handles the parsing of parameter collections for templated
 * constructs such as template classes and functions. All concrete template
 * parameter list data model classes should extend this abstract base to
 * ensure consistent parsing and data representation.
 *
 * @public
 */
export declare abstract class AbstractTemplateParamListType extends AbstractDataModelBase {
    /**
     * Collection of parameter data models within this template parameter list.
     *
     * @remarks
     * Optional array containing parameter elements found within the template
     * parameter list structure. Each parameter represents a template parameter
     * definition including its type, name, and other attributes. The array
     * supports zero to many parameters as per the XML schema, accommodating
     * both non-templated constructs and complex template declarations.
     */
    params?: ParamDataModel[] | undefined;
    /**
     * Constructs a new AbstractTemplateParamListType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the template parameter list
     * data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract template parameter list
     * information including parameter collections. The constructor processes
     * parameter elements into ParamDataModel instances when present. This
     * element type has no attributes as per the XML schema definition,
     * containing only parameter child elements.
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete data model class for template parameter list elements.
 *
 * @remarks
 * Represents individual template parameter list elements found within
 * Doxygen compound XML structures. This class extends the abstract base
 * to provide specific handling for 'templateparamlist' elements, which
 * define the template parameters for templated constructs such as template
 * classes, template functions, and template variables. Each template
 * parameter list contains parameter definitions that specify the generic
 * types and values used in template instantiation.
 *
 * @public
 */
export declare class TemplateParamListDataModel extends AbstractTemplateParamListType {
    /**
     * Constructs a new TemplateParamListDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the template parameter list
     * data
     *
     * @remarks
     * Initialises the template parameter list data model by parsing the
     * provided XML element as a 'templateparamlist' element type. The
     * constructor delegates to the parent class for common parameter list
     * processing whilst specifying the element name for proper XML structure
     * handling.
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=templateparamlisttype-dm.d.ts.map