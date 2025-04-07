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

// <xsd:complexType name="compoundRefType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="prot" type="DoxProtectionKind" />
//       <xsd:attribute name="virt" type="DoxVirtualKind" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

export abstract class AbstractCompoundRefType extends AbstractParsedObjectBase {
  // Mandatory elements.
  text: string = '' // Passed as element text.

  // Mandatory attributes.
  prot: string = ''
  virt: string = ''

  // Optional attributes.
  refid?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

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
      if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else {
        console.error(util.inspect(element))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    assert(this.prot.length > 0)
    assert(this.virt.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxProtectionKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="public" />
//     <xsd:enumeration value="protected" />
//     <xsd:enumeration value="private" />
//     <xsd:enumeration value="package" />
//   </xsd:restriction>
// </xsd:simpleType>

export type DoxProtectionKind = 'public' | 'protected' | 'private' | 'package'

// ----------------------------------------------------------------------------

// <xsd:simpleType name="DoxVirtualKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="non-virtual" />
//     <xsd:enumeration value="virtual" />
//     <xsd:enumeration value="pure-virtual" />
//   </xsd:restriction>
// </xsd:simpleType>

export type DoxVirtualKind = 'non-virtual' | 'virtual' | 'pure-virtual'

// ----------------------------------------------------------------------------

// <xsd:element name="basecompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="derivedcompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />

export class BaseCompoundRef extends AbstractCompoundRefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element))
    super(xml, element, 'basecompoundref')
  }
}

export class DerivedCompoundRef extends AbstractCompoundRefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element))
    super(xml, element, 'derivedcompoundref')
  }
}

// ----------------------------------------------------------------------------
