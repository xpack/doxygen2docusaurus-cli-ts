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

import { DoxygenXmlParser } from './index.js'
import { AbstractParsedObjectBase } from './types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="memberRefType">
//   <xsd:sequence>
//     <xsd:element name="scope" type="xsd:string" />
//     <xsd:element name="name" type="xsd:string" />
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
//   <xsd:attribute name="virt" type="DoxVirtualKind" />
//   <xsd:attribute name="ambiguityscope" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractMemberRefType extends AbstractParsedObjectBase {
  // Mandatory elements.
  scope: string = '' // This acts as the namespace.
  name: string = ''

  // Mandatory attributes.
  refid: string = ''
  prot: string = ''
  virt: string = ''
  // WARNING: Deviation from xsd, there it is not optional.
  ambiguityscope?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'scope')) {
        this.scope = xml.getInnerElementText(innerElement, 'scope')
      } else if (xml.isInnerElementText(innerElement, 'name')) {
        this.name = xml.getInnerElementText(innerElement, 'name')
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.scope.length > 0)
    assert(this.name.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_ambiguityscope') {
        this.ambiguityscope = xml.getAttributeStringValue(element, '@_ambiguityscope')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.refid.length > 0)
    assert(this.prot.length > 0)
    assert(this.virt.length > 0)
    // assert(this.ambiguityscope)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="member" type="memberRefType" minOccurs="0" maxOccurs="unbounded" />

export class MemberRef extends AbstractMemberRefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'member')
  }
}

// ----------------------------------------------------------------------------
