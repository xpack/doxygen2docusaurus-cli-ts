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

import assert from 'node:assert'
import * as util from 'node:util'

import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { BriefDescriptionDataModel } from './descriptiontype-dm.js'
import {
  DefValDataModel,
  TypeDataModel,
  TypeConstraintDataModel,
} from './linkedtexttype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="paramType">
//   <xsd:sequence>
//     <xsd:element name="attributes" type="xsd:string" minOccurs="0" />
//     <xsd:element name="type" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="declname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="array" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defval" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="typeconstraint" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * Abstract base class for parameter data models within documentation.
 *
 * @remarks
 * Represents comprehensive parameter information as defined by the paramType
 * XML Schema, handling function and method parameter definitions including
 * type information, naming variations, default values, and constraints.
 * This class processes the complete range of parameter metadata required
 * for accurate function signature documentation.
 *
 * The implementation manages optional parameter elements including
 * attributes, type specifications with linked text support, declaration
 * and definition names, array specifications, default values, type
 * constraints, and brief descriptions. All elements are optional,
 * reflecting the flexible nature of parameter documentation within
 * different programming contexts.
 *
 * @public
 */
export abstract class AbstractParamType extends AbstractDataModelBase {
  /**
   * Parameter attributes specification string.
   *
   * @remarks
   * Contains language-specific parameter attributes such as qualifiers,
   * modifiers, or annotations that apply to the parameter declaration.
   * This information provides additional context about parameter
   * behaviour and constraints within the function signature.
   *
   * @public
   */
  attributes?: string | undefined

  /**
   * Type information for the parameter with linked text support.
   *
   * @remarks
   * Provides comprehensive type data including cross-references and
   * embedded links to type definitions. This enables rich type
   * presentation with navigation capabilities to related type
   * documentation within the system.
   *
   * @public
   */
  type?: TypeDataModel | undefined

  /**
   * The declared parameter name as it appears in the declaration.
   *
   * @remarks
   * Contains the parameter name as specified in the function or method
   * declaration, representing the formal parameter identifier used
   * within the function signature for identification purposes.
   *
   * @public
   */
  declname?: string | undefined

  /**
   * The defined parameter name as it appears in the definition.
   *
   * @remarks
   * Contains the parameter name as used in the function or method
   * definition, which may differ from the declaration name in contexts
   * where declarations and definitions are separate (such as header
   * and implementation files).
   *
   * @public
   */
  defname?: string | undefined

  /**
   * Array specification information for array parameters.
   *
   * @remarks
   * Contains array dimension information and specifications when the
   * parameter represents an array type. This includes array bounds,
   * size specifications, and dimensional characteristics essential
   * for accurate parameter documentation.
   *
   * @public
   */
  array?: string | undefined

  /**
   * Default value specification with linked text support.
   *
   * @remarks
   * Provides the parameter's default value information including
   * cross-references to related elements when the default value
   * contains references to other documented entities. This enables
   * comprehensive default value presentation with navigation
   * capabilities.
   *
   * @public
   */
  defval?: DefValDataModel | undefined

  /**
   * Type constraint information for template parameters.
   *
   * @remarks
   * Contains constraint specifications for template or generic
   * parameters, including concept requirements, type bounds, and
   * constraint expressions. This information is essential for
   * documenting modern C++ concepts and generic programming
   * constraints.
   *
   * @public
   */
  typeconstraint?: TypeConstraintDataModel | undefined

  /**
   * Brief description documentation for the parameter.
   *
   * @remarks
   * Provides concise parameter documentation including purpose,
   * usage notes, and essential parameter information. This
   * description enhances parameter understanding within function
   * documentation and API reference materials.
   *
   * @public
   */
  briefdescription?: BriefDescriptionDataModel | undefined

  /**
   * Constructs a new parameter data model from XML element data.
   *
   * @param xml - The XML parser instance for processing element data
   * @param element - The XML element containing parameter information
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * Processes the XML element representing parameter information and
   * extracts all available parameter metadata including attributes,
   * type specifications, naming variations, default values, constraints,
   * and descriptions. The constructor handles the paramType schema
   * requirements where all elements are optional, reflecting the
   * flexible nature of parameter documentation.
   *
   * The implementation processes various parameter representations
   * including simple parameters, array parameters, template parameters
   * with constraints, and parameters with default values. It ensures
   * proper extraction of linked text elements that contain embedded
   * cross-references to related documentation entities.
   *
   * @public
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // May be empty.
    // assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      // console.log(util.inspect(paramElement))
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'attributes')) {
        const attributesElements = xml.getInnerElements(
          innerElement,
          'attributes'
        )
        // console.log(util.inspect(defvalElements))
        assert(attributesElements.length === 1)
        this.attributes = xml.getInnerText(attributesElements[0])
      } else if (xml.hasInnerElement(innerElement, 'type')) {
        this.type = new TypeDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'declname')) {
        const declnameElements = xml.getInnerElements(innerElement, 'declname')
        // console.log(util.inspect(defvalElements))
        assert(declnameElements.length === 1)
        this.declname = xml.getInnerText(declnameElements[0])
      } else if (xml.hasInnerElement(innerElement, 'defname')) {
        const defnameElements = xml.getInnerElements(innerElement, 'defname')
        // console.log(util.inspect(defvalElements))
        assert(defnameElements.length === 1)
        this.declname = xml.getInnerText(defnameElements[0])
      } else if (xml.hasInnerElement(innerElement, 'array')) {
        const arrayElements = xml.getInnerElements(innerElement, 'array')
        // console.log(util.inspect(defvalElements))
        assert(arrayElements.length === 1)
        this.array = xml.getInnerText(arrayElements[0])
      } else if (xml.hasInnerElement(innerElement, 'defval')) {
        this.defval = new DefValDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'typeconstraint')) {
        this.typeconstraint = new TypeConstraintDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        // TODO
      } else {
        console.error(util.inspect(innerElement))
        console.error(
          `${elementName} element:`,
          Object.keys(innerElement),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="param" type="paramType" minOccurs="0" maxOccurs="unbounded" />

/**
 * Concrete implementation for parameter elements within function documentation.
 *
 * @remarks
 * Provides specific handling for param XML elements that contain
 * comprehensive parameter information within function and method
 * documentation. This implementation extends the abstract base class
 * functionality to process parameter elements with the specific
 * element name 'param'.
 *
 * The class ensures proper instantiation of parameter data models
 * whilst maintaining all the detailed parameter metadata required
 * for accurate function signature documentation including type
 * information, naming variations, default values, constraints,
 * and descriptive information.
 *
 * @public
 */
export class ParamDataModel extends AbstractParamType {
  /**
   * Constructs a new parameter data model instance.
   *
   * @param xml - The XML parser instance for processing elements
   * @param element - The source XML element containing parameter data
   *
   * @remarks
   * Initialises the data model with the specific element name 'param'
   * and delegates processing to the abstract base class implementation.
   * This ensures consistent handling of parameter information whilst
   * maintaining proper element identification for function signature
   * documentation and API reference generation.
   *
   * @public
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'param')
  }
}

// ----------------------------------------------------------------------------
