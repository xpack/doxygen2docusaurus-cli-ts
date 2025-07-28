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

// <xsd:complexType name="locationType">
//   <xsd:attribute name="file" type="xsd:string" />
//   <xsd:attribute name="line" type="xsd:integer" />
//   <xsd:attribute name="column" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="declfile" type="xsd:string" use="optional"/>
//   <xsd:attribute name="declline" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="declcolumn" type="xsd:integer" use="optional"/>
//   <xsd:attribute name="bodyfile" type="xsd:string" />
//   <xsd:attribute name="bodystart" type="xsd:integer" />
//   <xsd:attribute name="bodyend" type="xsd:integer" />
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractLocationType extends AbstractDataModelBase {
  // Mandatory attributes.
  file = ''

  // Optional elements.
  // WARNING: The xsd specifies that `line` is mandatory,
  // but in practice it is not.
  line?: number | undefined

  // Optional attributes.
  column?: number | undefined
  declfile?: string | undefined
  declline?: number | undefined
  declcolumn?: number | undefined
  bodyfile?: string | undefined
  bodystart?: number | undefined
  bodyend?: number | undefined

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // There are no inner elements.
    assert(innerElements.length === 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_file') {
        this.file = xml.getAttributeStringValue(element, '@_file')
      } else if (attributeName === '@_line') {
        this.line = Number(xml.getAttributeNumberValue(element, '@_line'))
      } else if (attributeName === '@_column') {
        this.column = Number(xml.getAttributeNumberValue(element, '@_column'))
      } else if (attributeName === '@_declfile') {
        this.declfile = xml.getAttributeStringValue(element, '@_declfile')
      } else if (attributeName === '@_declline') {
        this.declline = Number(
          xml.getAttributeNumberValue(element, '@_declline')
        )
      } else if (attributeName === '@_declcolumn') {
        this.declcolumn = Number(
          xml.getAttributeNumberValue(element, '@_declcolumn')
        )
      } else if (attributeName === '@_bodyfile') {
        this.bodyfile = xml.getAttributeStringValue(element, '@_bodyfile')
      } else if (attributeName === '@_bodystart') {
        this.bodystart = xml.getAttributeNumberValue(element, '@_bodystart')
      } else if (attributeName === '@_bodyend') {
        this.bodyend = xml.getAttributeNumberValue(element, '@_bodyend')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `${elementName} attribute:`,
          attributeName,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    assert(this.file.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="location" type="locationType" minOccurs="0" />

/**
 * @public
 */
export class LocationDataModel extends AbstractLocationType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'location')
  }
}

// ----------------------------------------------------------------------------
