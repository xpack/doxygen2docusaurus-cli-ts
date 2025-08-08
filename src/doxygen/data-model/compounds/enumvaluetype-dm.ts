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
 * Abstract base class for enumeration value data models.
 *
 * @remarks
 * Represents individual values within enumeration types as parsed from
 * Doxygen XML. Contains the value name, optional initialiser expression,
 * and documentation descriptions with protection level information.
 *
 * @public
 */
export abstract class AbstractEnumValueType extends AbstractDataModelBase {
  // Mandatory elements.
  /**
   * The name of the enumeration value.
   *
   * @remarks
   * Simple identifier for the enumeration constant as it appears
   * in the source code.
   */
  name = ''

  // Optional elements.
  /**
   * Optional initialiser expression for the enumeration value.
   *
   * @remarks
   * Contains the explicit value assignment expression when the
   * enumeration value is explicitly initialised in the source code.
   */
  initializer?: InitializerDataModel | undefined

  /**
   * Brief description of the enumeration value.
   *
   * @remarks
   * Short documentation comment providing a concise explanation
   * of the enumeration value's purpose or meaning.
   */
  briefDescription?: BriefDescriptionDataModel | undefined

  /**
   * Detailed description of the enumeration value.
   *
   * @remarks
   * Comprehensive documentation comment providing full details
   * about the enumeration value's purpose, usage, and behaviour.
   */
  detailedDescription?: DetailedDescriptionDataModel | undefined

  // Mandatory attributes.
  /**
   * Unique identifier for the enumeration value.
   *
   * @remarks
   * Doxygen-generated identifier used for cross-referencing
   * and creating links to this enumeration value.
   */
  id = ''

  /**
   * Protection level of the enumeration value.
   *
   * @remarks
   * Indicates the visibility scope such as 'public', 'private',
   * or 'protected' based on Doxygen's protection kind enumeration.
   */
  prot = '' // DoxProtectionKind

  /**
   * Creates a new enumeration value data model.
   *
   * @remarks
   * Parses the XML element representing an enumeration value and
   * extracts all relevant information including name, initialiser,
   * descriptions, and attributes.
   *
   * @param xml - The XML parser instance
   * @param element - The XML element to parse
   * @param elementName - The name of the XML element
   */
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
 * Concrete implementation of enumeration value data model.
 *
 * @remarks
 * Represents a single enumeration value as parsed from Doxygen XML
 * output. Inherits all functionality from the abstract base class
 * and provides the specific element name for parsing.
 *
 * @public
 */
export class EnumValueDataModel extends AbstractEnumValueType {
  /**
   * Creates a new enumeration value data model from XML.
   *
   * @remarks
   * Parses the XML element representing an enumeration value using
   * the inherited parsing logic with the 'enumvalue' element name.
   *
   * @param xml - The XML parser instance
   * @param element - The XML element to parse
   */
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'enumvalue')
  }
}

// ----------------------------------------------------------------------------
