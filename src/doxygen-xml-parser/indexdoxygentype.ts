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
import { IndexCompound, AbstractIndexCompoundType } from './indexcompoundtype.js'
import { AbstractParsedObjectBase } from './types.js'

// ----------------------------------------------------------------------------

// WARNING: it clashes with the definition in compound.xsd.
// <xsd:complexType name="DoxygenType">
//   <xsd:sequence>
//     <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>

export abstract class AbstractIndexDoxygenType extends AbstractParsedObjectBase {
  // Mandatory attributes.
  version: string = ''
  lang: string = ''

  // Optional elements.
  compounds: AbstractIndexCompoundType[] | undefined

  // Optional attributes.
  noNamespaceSchemaLocation: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element))

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'compound')) {
        if (this.compounds === undefined) {
          this.compounds = []
        }
        this.compounds.push(new IndexCompound(xml, innerElement))
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
      if (attributeName === '@_version') {
        this.version = xml.getAttributeStringValue(element, '@_version')
      } else if (attributeName === '@_lang') {
        this.lang = xml.getAttributeStringValue(element, '@_lang')
      } else if (attributeName === '@_noNamespaceSchemaLocation') {
        this.noNamespaceSchemaLocation = xml.getAttributeStringValue(element, '@_noNamespaceSchemaLocation')
      } else {
        console.error(util.inspect(element))
        console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }
    assert(this.version.length > 0)
    assert(this.lang.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="doxygenindex" type="DoxygenType"/>

export class DoxygenIndex extends AbstractIndexDoxygenType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element))
    super(xml, element, 'doxygenindex')
  }
}

// ----------------------------------------------------------------------------
