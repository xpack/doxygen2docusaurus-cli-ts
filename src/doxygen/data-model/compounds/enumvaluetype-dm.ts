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

import { DoxygenXmlParser } from '../../doxygen-xml-parser.js'
import { AbstractDataModelBase } from '../types.js'
import {
  BriefDescriptionDataModel,
  DetailedDescriptionDataModel,
} from './descriptiontype-dm.js'
import { InitializerDataModel } from './linkedtexttype-dm.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="enumvalueType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string" />
//     <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractEnumValueType extends AbstractDataModelBase {
  // Mandatory elements.
  name = ''

  // Optional elements.
  initializer?: InitializerDataModel | undefined
  briefDescription?: BriefDescriptionDataModel | undefined
  detailedDescription?: DetailedDescriptionDataModel | undefined

  // Mandatory attributes.
  id = ''
  prot = '' // DoxProtectionKind

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
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
        this.name = xml.getInnerElementText(innerElement, 'name')
      } else if (xml.hasInnerElement(innerElement, 'initializer')) {
        this.initializer = new InitializerDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescriptionDataModel(
          xml,
          innerElement
        )
      } else {
        console.error(util.inspect(innerElement))
        console.error(
          `${elementName} element:`,
          Object.keys(innerElement),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    assert(this.name.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
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

    assert(this.id.length > 0)
    assert(this.prot.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

//     <xsd:element name="enumvalue" type="enumvalueType" minOccurs="0" maxOccurs="unbounded" />

/**
 * @public
 */
export class EnumValueDataModel extends AbstractEnumValueType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'enumvalue')
  }
}

// ----------------------------------------------------------------------------
