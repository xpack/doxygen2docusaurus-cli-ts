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

import assert from 'assert'
import util from 'util'

import { DoxygenXmlParser } from './index.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="refTextType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//      <xsd:attribute name="refid" type="xsd:string" />
//      <xsd:attribute name="kindref" type="DoxRefKind" />
//      <xsd:attribute name="external" type="xsd:string" use="optional"/>
//      <xsd:attribute name="tooltip" type="xsd:string" use="optional"/>
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

export class RefTextType {
  // Mandatory elements.
  text: string = '' // Passed as element text.

  // Mandatory attributes.
  refid: string = ''
  kindref: string = '' // DoxRefKind

  // Optional attributes.
  external?: string | undefined
  tooltip?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string = 'ref') {
    // console.log(elementName, util.inspect(element))

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
      } else if (attributeName === '@_kindref') {
        this.kindref = xml.getAttributeStringValue(element, '@_kindref')
      } else if (attributeName === '@_external') {
        this.external = xml.getAttributeStringValue(element, '@_external')
      } else if (attributeName === '@_tooltip') {
        this.tooltip = xml.getAttributeStringValue(element, '@_tooltip')
      } else {
        console.error(util.inspect(element))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    assert(this.refid.length > 0)
    assert(this.kindref.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxRefKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="compound" />
//     <xsd:enumeration value="member" />
//   </xsd:restriction>
// </xsd:simpleType>

export type DoxRefKind = 'compound' | 'member'

// ----------------------------------------------------------------------------
