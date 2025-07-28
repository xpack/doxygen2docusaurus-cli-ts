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

// <xsd:complexType name="compoundRefType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="prot" type="DoxProtectionKind" />
//       <xsd:attribute name="virt" type="DoxVirtualKind" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractCompoundRefType extends AbstractDataModelBase {
  // Mandatory elements.
  text = '' // Passed as element text.

  // Mandatory attributes.
  prot = ''
  virt = ''

  // Optional attributes.
  refid?: string | undefined

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
      if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
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

    assert(this.prot.length > 0)
    assert(this.virt.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
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

/**
 * @public
 */
export class BaseCompoundRefDataModel extends AbstractCompoundRefType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'basecompoundref')
  }
}

/**
 * @public
 */
export class DerivedCompoundRefDataModel extends AbstractCompoundRefType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'derivedcompoundref')
  }
}

// ----------------------------------------------------------------------------
