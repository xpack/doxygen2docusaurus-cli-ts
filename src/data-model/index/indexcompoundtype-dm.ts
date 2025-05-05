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

import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { IndexMemberDataModel } from './indexmembertype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="CompoundType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//     <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="CompoundKind" use="required"/>
// </xsd:complexType>

export abstract class AbstractIndexCompoundType extends AbstractDataModelBase {
  // Mandatory elements.
  name: string = ''
  members: IndexMemberDataModel[] | undefined // [0-n]

  // Mandatory attributes.
  refid: string = ''
  kind: string = '' // CompoundKind

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
      } else if (xml.isInnerElementText(innerElement, 'name')) {
        assert(this.name.length === 0)
        this.name = xml.getInnerElementText(innerElement, 'name')
      } else if (xml.hasInnerElement(innerElement, 'member')) {
        if (this.members === undefined) {
          this.members = []
        }
        this.members.push(new IndexMemberDataModel(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`index ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.refid.length > 0)
    assert(this.kind.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="CompoundKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="class"/>
//     <xsd:enumeration value="struct"/>
//     <xsd:enumeration value="union"/>
//     <xsd:enumeration value="interface"/>
//     <xsd:enumeration value="protocol"/>
//     <xsd:enumeration value="category"/>
//     <xsd:enumeration value="exception"/>
//     <xsd:enumeration value="file"/>
//     <xsd:enumeration value="namespace"/>
//     <xsd:enumeration value="group"/>
//     <xsd:enumeration value="page"/>
//     <xsd:enumeration value="example"/>
//     <xsd:enumeration value="dir"/>
//     <xsd:enumeration value="type"/>
//     <xsd:enumeration value="concept"/>
//     <xsd:enumeration value="module"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type IndexCompoundKind = 'class' | 'struct' | 'union' | 'interface' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'group' | 'page' | 'example' | 'dir' | 'type' | 'concept' | 'module'

// ----------------------------------------------------------------------------

// <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>

export class IndexCompoundDataModel extends AbstractIndexCompoundType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'compound')
  }
}

// ----------------------------------------------------------------------------
