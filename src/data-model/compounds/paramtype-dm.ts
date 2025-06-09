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
import { BriefDescriptionDataModel } from './descriptiontype-dm.js'
import { DefValDataModel, TypeDataModel, TypeConstraintDataModel } from './linkedtexttype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="paramType">
//   <xsd:sequence>
//     <xsd:element name="attributes" type="xsd:string" minOccurs="0" />
//     <xsd:element name="type" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="declname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="array" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defval" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="typeconstraint" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractParamType extends AbstractDataModelBase {
  // Optional elements.
  attributes?: string | undefined
  type?: TypeDataModel | undefined
  declname?: string | undefined
  defname?: string | undefined
  array?: string | undefined
  defval?: DefValDataModel | undefined
  typeconstraint?: TypeConstraintDataModel | undefined
  briefdescription?: BriefDescriptionDataModel | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    // May be empty.
    // assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      // console.log(util.inspect(paramElement))
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'attributes')) {
        const attributesElements = xml.getInnerElements(innerElement, 'attributes')
        // console.log(util.inspect(defvalElements))
        assert(attributesElements.length === 1)
        assert(attributesElements[0] !== undefined)
        this.attributes = xml.getInnerText(attributesElements[0])
      } else if (xml.hasInnerElement(innerElement, 'type')) {
        this.type = new TypeDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'declname')) {
        const declnameElements = xml.getInnerElements(innerElement, 'declname')
        // console.log(util.inspect(defvalElements))
        assert(declnameElements.length === 1)
        assert(declnameElements[0] !== undefined)
        this.declname = xml.getInnerText(declnameElements[0])
      } else if (xml.hasInnerElement(innerElement, 'defname')) {
        const defnameElements = xml.getInnerElements(innerElement, 'defname')
        // console.log(util.inspect(defvalElements))
        assert(defnameElements.length === 1)
        assert(defnameElements[0] !== undefined)
        this.declname = xml.getInnerText(defnameElements[0])
      } else if (xml.hasInnerElement(innerElement, 'array')) {
        const arrayElements = xml.getInnerElements(innerElement, 'array')
        // console.log(util.inspect(defvalElements))
        assert(arrayElements.length === 1)
        assert(arrayElements[0] !== undefined)
        this.array = xml.getInnerText(arrayElements[0])
      } else if (xml.hasInnerElement(innerElement, 'defval')) {
        this.defval = new DefValDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'typeconstraint')) {
        this.typeconstraint = new TypeConstraintDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        // TODO
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="param" type="paramType" minOccurs="0" maxOccurs="unbounded" />

export class ParamDataModel extends AbstractParamType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'param')
  }
}

// ----------------------------------------------------------------------------
