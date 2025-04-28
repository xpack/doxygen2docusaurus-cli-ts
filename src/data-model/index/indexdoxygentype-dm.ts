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

import { DoxygenXmlParser } from '../../doxygen-xml-parser/index.js'
import { IndexCompoundDataModel } from './indexcompoundtype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// WARNING: it clashes with the definition in compound.xsd.
// <xsd:complexType name="DoxygenType">
//   <xsd:sequence>
//     <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>

export abstract class AbstractIndexDoxygenType extends AbstractDataModelBase {
  // Mandatory attributes.
  version: string = ''
  lang: string = ''

  // Optional elements.
  compounds?: IndexCompoundDataModel[] | undefined

  // Optional attributes.
  noNamespaceSchemaLocation?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'compound')) {
        if (this.compounds === undefined) {
          this.compounds = []
        }
        this.compounds.push(new IndexCompoundDataModel(xml, innerElement))
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
      if (attributeName === '@_version') {
        this.version = xml.getAttributeStringValue(element, '@_version')
      } else if (attributeName === '@_lang') {
        this.lang = xml.getAttributeStringValue(element, '@_lang')
      } else if (attributeName === '@_noNamespaceSchemaLocation') {
        this.noNamespaceSchemaLocation = xml.getAttributeStringValue(element, '@_noNamespaceSchemaLocation')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }
    assert(this.version.length > 0)
    assert(this.lang.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="doxygenindex" type="DoxygenType"/>

export class DoxygenIndexDataModel extends AbstractIndexDoxygenType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'doxygenindex')
  }
}

// ----------------------------------------------------------------------------
