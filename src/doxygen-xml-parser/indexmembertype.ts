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
import * as util from 'node:util'

import { xml } from './xml.js'

// ----------------------------------------------------------------------------
// <xsd:complexType name="MemberType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="MemberKind" use="required"/>
// </xsd:complexType>

export class IndexMemberType {
  // Mandatory elements.
  name: string = ''

  // Mandatory attributes.
  refid: string = ''
  kind: string = '' // MemberKind

  constructor (element: Object, elementName: string = 'compound') {
    // console.log(elementName, util.inspect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'name')) {
        assert(this.name.length === 0)
        this.name = xml.getInnerElementText(innerElement, 'name')
      } else {
        console.error(util.inspect(innerElement))
        console.error(`index ${elementName} element:`, Object.keys(innerElement), 'not implemented yet')
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element))
        console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    assert(this.refid.length > 0)
    assert(this.kind.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="MemberKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="define"/>
//     <xsd:enumeration value="property"/>
//     <xsd:enumeration value="event"/>
//     <xsd:enumeration value="variable"/>
//     <xsd:enumeration value="typedef"/>
//     <xsd:enumeration value="enum"/>
//     <xsd:enumeration value="enumvalue"/>
//     <xsd:enumeration value="function"/>
//     <xsd:enumeration value="signal"/>
//     <xsd:enumeration value="prototype"/>
//     <xsd:enumeration value="friend"/>
//     <xsd:enumeration value="dcop"/>
//     <xsd:enumeration value="slot"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type IndexMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'enumvalue' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot'

// ----------------------------------------------------------------------------
