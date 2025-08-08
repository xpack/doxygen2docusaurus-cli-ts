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
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="OptionType">
//   <xsd:sequence>
//     <xsd:element name="value" type="valueType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="idType" use="required"/>
//   <xsd:attribute name="default" type="defaultType" use="required"/>
//   <xsd:attribute name="type" type="typeType" use="required"/>
// </xsd:complexType>

/**
 * Abstract base class for Doxygen file option type data models.
 *
 * @remarks
 * Represents configuration option elements within Doxyfile XML structures,
 * corresponding to the OptionType complex type in the XML schema. This
 * class handles the parsing of option values and mandatory attributes
 * (id, default, and type). All concrete option data model classes should
 * extend this abstract base to ensure consistent parsing and data
 * representation of Doxygen configuration settings.
 *
 * @public
 */
// eslint-disable-next-line max-len
export abstract class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
  /**
   * Collection of value strings associated with this configuration option.
   *
   * @remarks
   * Optional array containing value elements found within the option
   * structure. Each value represents a specific setting or parameter
   * for the configuration option. The array supports zero to many values
   * as per the XML schema, allowing for both single and multi-value
   * configuration settings.
   */
  values: string[] | undefined // [0-n] valueType

  /**
   * The unique identifier for this configuration option.
   *
   * @remarks
   * Mandatory attribute that specifies the name or identifier of the
   * Doxygen configuration option. This corresponds to the actual
   * configuration parameter name used in Doxygen configuration files
   * and determines the specific setting being configured.
   */
  id = '' // idType

  /**
   * The default value indicator for this configuration option.
   *
   * @remarks
   * Mandatory attribute that indicates whether this option is set to
   * its default value. Corresponds to the defaultType enumeration in
   * the XML schema, typically having values of 'yes' or 'no'.
   */
  default = '' // defaultType

  /**
   * The data type classification for this configuration option.
   *
   * @remarks
   * Mandatory attribute that specifies the expected data type for the
   * option's values. Corresponds to the typeType enumeration in the
   * XML schema, indicating whether the option expects integer, boolean,
   * string, or string list values.
   */
  type = '' // typeType

  /**
   * Constructs a new AbstractDoxygenFileOptionType instance from XML data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML elements
   * @param element - The XML element containing the option data
   * @param elementName - The name of the XML element being processed
   *
   * @remarks
   * Parses the provided XML element to extract configuration option
   * information including value collections and mandatory attributes
   * (id, default, and type). The constructor validates that all required
   * attributes are present and processes value elements into a string
   * array when present. The parsing ensures compliance with the OptionType
   * schema definition.
   */
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'value')) {
        this.values ??= []
        this.values.push(xml.getInnerElementText(innerElement, 'value'))
      } else {
        console.error(util.inspect(innerElement))
        console.error(
          `doxyfile ${elementName} element:`,
          Object.keys(innerElement),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_default') {
        this.default = xml.getAttributeStringValue(element, '@_default')
      } else if (attributeName === '@_type') {
        this.type = xml.getAttributeStringValue(element, '@_type')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `doxyfile ${elementName} attribute:`,
          attributeName,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    assert(this.id.length > 0)
    assert(this.default.length > 0)
    assert(this.type.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="valueType">
//   <xsd:restriction base="xsd:string">
//   </xsd:restriction>
// </xsd:simpleType>

// <xsd:simpleType name="idType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="DOXYFILE_ENCODING"/>
//     <xsd:enumeration value="PROJECT_NAME"/>
//     <xsd:enumeration value="PROJECT_NUMBER"/>
//     <xsd:enumeration value="PROJECT_BRIEF"/>
//     <xsd:enumeration value="PROJECT_LOGO"/>
//     <xsd:enumeration value="PROJECT_ICON"/>
//     ... many more
//     <xsd:enumeration value="MSCFILE_DIRS"/>
//   </xsd:restriction>
// </xsd:simpleType>

// <xsd:simpleType name="defaultType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="yes"/>
//     <xsd:enumeration value="no"/>
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Union type representing the default value indicators for Doxyfile options.
 *
 * @remarks
 * Corresponds to the defaultType simple type in the Doxygen XML schema,
 * which defines the allowable values for indicating whether a configuration
 * option is set to its default value. The 'yes' value indicates the option
 * uses its default setting, whilst 'no' indicates a custom value has been
 * specified.
 *
 * @public
 */
export type DoxyfileDefaultType = 'yes' | 'no'

// <xsd:simpleType name="typeType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="int"/>
//     <xsd:enumeration value="bool"/>
//     <xsd:enumeration value="string"/>
//     <xsd:enumeration value="stringlist"/>
//   </xsd:restriction>
// </xsd:simpleType>

/**
 * Union type representing the data types for Doxyfile configuration options.
 *
 * @remarks
 * Corresponds to the typeType simple type in the Doxygen XML schema,
 * which defines the allowable data type classifications for configuration
 * options. Each value indicates the expected format and validation rules
 * for the option's values: 'int' for integers, 'bool' for boolean flags,
 * 'string' for single text values, and 'stringlist' for multiple text
 * values.
 *
 * @public
 */
export type DoxyfileTypeType = 'int' | 'bool' | 'string' | 'stringlist'

// ----------------------------------------------------------------------------

// <xsd:element name="option" type="OptionType" minOccurs="0" maxOccurs="unbounded"/>

/**
 * Concrete data model class for Doxyfile option elements.
 *
 * @remarks
 * Represents individual configuration option elements found within
 * Doxyfile XML structures. This class extends the abstract base to
 * provide specific handling for 'option' elements, which define
 * individual Doxygen configuration settings including their identifiers,
 * types, default status, and associated values. Each option corresponds
 * to a specific configuration parameter that controls Doxygen's
 * documentation generation behaviour.
 *
 * @public
 */
export class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
  /**
   * Constructs a new DoxygenFileOptionDataModel instance from XML data.
   *
   * @param xml - The Doxygen XML parser instance for processing XML elements
   * @param element - The XML element containing the option data
   *
   * @remarks
   * Initialises the option data model by parsing the provided XML element
   * as an 'option' element type. The constructor delegates to the parent
   * class for common option processing whilst specifying the element name
   * for proper XML structure handling.
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'option')
  }
}

// ----------------------------------------------------------------------------
