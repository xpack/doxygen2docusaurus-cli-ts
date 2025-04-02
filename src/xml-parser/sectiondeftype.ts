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
import { DescriptionType } from './descriptiontype.js'
import { MemberDefType } from './memberdeftype.js'
import { MemberType } from './membertype.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="sectiondefType">
//   <xsd:sequence>
//     <xsd:element name="header" type="xsd:string" minOccurs="0" />
//     <xsd:element name="description" type="descriptionType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxSectionKind" />
// </xsd:complexType>

export class SectionDefType {
  // Mandatory attributes.
  kind: string = ''

  // Optional elements.
  header?: string | undefined
  description?: DescriptionType | undefined

  // Actually only one is defined at a time.
  memberDefs?: MemberDefType[] | undefined
  members?: MemberType[] | undefined

  constructor (element: Object, elementName: string = 'sectiondef') {
    // console.log(elementName, util.inspect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'header')) {
        assert(this.header === undefined)
        this.header = xml.getInnerElementText(innerElement, 'header')
      } else if (xml.hasInnerElement(innerElement, 'description')) {
        assert(this.description === undefined)
        this.description = new DescriptionType(innerElement, 'description')
      } else if (xml.hasInnerElement(innerElement, 'memberdef')) {
        if (this.memberDefs === undefined) {
          this.memberDefs = []
        }
        this.memberDefs.push(new MemberDefType(innerElement, 'memberdef'))
      } else if (xml.hasInnerElement(innerElement, 'member')) {
        if (this.members === undefined) {
          this.members = []
        }
        this.members.push(new MemberType(innerElement, 'member'))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet')
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        assert(this.kind.length === 0)
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    assert(this.kind.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------
