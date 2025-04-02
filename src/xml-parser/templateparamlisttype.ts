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

import { xml } from './xml.js'
import { ParamType } from './paramtype.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="templateparamlistType">
//   <xsd:sequence>
//     <xsd:element name="param" type="paramType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class TemplateParamListType {
  // Optional elements.
  params?: ParamType[] | undefined

  constructor (element: Object, elementName: string = 'includes') {
    // console.log(elementName, util.inspect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    // console.log(util.inspect(item))
    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts
      } else if (xml.hasInnerElement(innerElement, 'param')) {
        if (this.params === undefined) {
          this.params = []
        }
        this.params.push(new ParamType(innerElement, 'param'))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet')
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------
