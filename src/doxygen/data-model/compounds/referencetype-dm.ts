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
import util from 'node:util'

import { DoxygenXmlParser } from '../../doxygen-xml-parser.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="referenceType" mixed="true">
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="compoundref" type="xsd:string" use="optional" />
//   <xsd:attribute name="startline" type="xsd:integer" />
//   <xsd:attribute name="endline" type="xsd:integer" />
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractReferenceType extends AbstractDataModelBase {
  // WARNING: not in DTD?
  text = ''

  // Mandatory attributes.
  refid = ''
  // WARNING: may be missing
  startline: number | undefined
  // WARNING: may be missing
  endline: number | undefined

  // Optional attributes.
  compoundref?: string | undefined

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    assert(xml.isInnerElementText(element, elementName))
    this.text = xml.getInnerElementText(element, elementName)

    assert(this.text.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_startline') {
        this.startline = Number(
          xml.getAttributeNumberValue(element, '@_startline')
        )
      } else if (attributeName === '@_endline') {
        this.endline = Number(xml.getAttributeNumberValue(element, '@_endline'))
      } else if (attributeName === '@_compoundref') {
        this.compoundref = xml.getAttributeStringValue(element, '@_compoundref')
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

    assert(this.refid.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="references" type="referenceType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="referencedby" type="referenceType" minOccurs="0" maxOccurs="unbounded" />

/**
 * @public
 */
export class ReferenceDataModel extends AbstractReferenceType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'references')
  }
}

/**
 * @public
 */
export class ReferencedByDataModel extends AbstractReferenceType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'referencedby')
  }
}

// ----------------------------------------------------------------------------
