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

// <xsd:complexType name="incType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="optional" />
//       <xsd:attribute name="local" type="DoxBool" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

export class IncType {
  // Mandatory elements.
  text: string = '' // Passed as element text.

  // Mandatory attributes.
  local: boolean = false // It means to use "..." instead of <...>.

  // Optional attributes.
  refId?: string | undefined // file id

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string = 'includes') {
    // console.log(elementName, util.inspect(element))ect(element))ect(element))

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
      if (attributeName === '@_local') {
        this.local = xml.getAttributeBooleanValue(element, '@_local')
      } else if (attributeName === '@_refid') {
        this.refId = xml.getAttributeStringValue(element, '@_refid')
      } else {
        console.error(util.inspect(element))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}
