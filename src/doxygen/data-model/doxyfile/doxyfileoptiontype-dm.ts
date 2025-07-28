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

import { DoxygenXmlParser } from '../../doxygen-xml-parser.js'
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
 * @public
 */
// eslint-disable-next-line max-len
export abstract class AbstractDoxygenFileOptionType extends AbstractDataModelBase {
  // Optional elements.
  values: string[] | undefined // [0-n] valueType

  // Mandatory attributes.
  id = '' // idType
  default = '' // defaultType
  type = '' // typeType

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

export type DoxyfileDefaultType = 'yes' | 'no'

// <xsd:simpleType name="typeType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="int"/>
//     <xsd:enumeration value="bool"/>
//     <xsd:enumeration value="string"/>
//     <xsd:enumeration value="stringlist"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type DoxyfileTypeType = 'int' | 'bool' | 'string' | 'stringlist'

// ----------------------------------------------------------------------------

// <xsd:element name="option" type="OptionType" minOccurs="0" maxOccurs="unbounded"/>

/**
 * @public
 */
export class DoxygenFileOptionDataModel extends AbstractDoxygenFileOptionType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'option')
  }
}

// ----------------------------------------------------------------------------
