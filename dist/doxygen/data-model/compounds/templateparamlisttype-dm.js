/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
import assert from 'node:assert';
import * as util from 'node:util';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="templateparamlistType">
//   <xsd:sequence>
//     <xsd:element name="param" type="paramType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
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
// eslint-disable-next-line max-len
export class AbstractTemplateParamListType extends AbstractDataModelBase {
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
    params;
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
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        // console.log(util.inspect(item))
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts
            }
            else if (xml.hasInnerElement(innerElement, 'param')) {
                this.params ??= [];
                this.params.push(new ParamDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="templateparamlist" type="templateparamlistType" minOccurs="0" />
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
export class TemplateParamListDataModel extends AbstractTemplateParamListType {
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
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'templateparamlist');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=templateparamlisttype-dm.js.map