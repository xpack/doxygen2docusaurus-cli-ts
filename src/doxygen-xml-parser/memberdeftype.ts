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
import { BriefDescription, DetailedDescription, InbodyDescription } from './descriptiontype.js'
import { Type } from './linkedtexttype.js'
import { Location } from './locationtype.js'
import { Param } from './paramtype.js'
import { AbstractParsedObjectBase } from './types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="memberdefType">
//   <xsd:sequence>
//     <xsd:element name="templateparamlist" type="templateparamlistType" minOccurs="0" />
//     <xsd:element name="type" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="definition" type="xsd:string" minOccurs="0" />
//     <xsd:element name="argsstring" type="xsd:string" minOccurs="0" />
//     <xsd:element name="name" type="xsd:string" />
//     <xsd:element name="qualifiedname" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="read" type="xsd:string" minOccurs="0" />
//     <xsd:element name="write" type="xsd:string" minOccurs="0" />
//     <xsd:element name="bitfield" type="xsd:string" minOccurs="0" />
//     <xsd:element name="reimplements" type="reimplementType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="reimplementedby" type="reimplementType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="qualifier" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="param" type="paramType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="enumvalue" type="enumvalueType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="exceptions" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="inbodydescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="location" type="locationType" />
//     <xsd:element name="references" type="referenceType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="referencedby" type="referenceType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxMemberKind" />
//   <xsd:attribute name="id" type="xsd:string" />
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
//   <xsd:attribute name="static" type="DoxBool" />
//   <xsd:attribute name="extern" type="DoxBool" use="optional" />
//   <xsd:attribute name="strong" type="DoxBool" use="optional"/>
//   <xsd:attribute name="const" type="DoxBool" use="optional"/>
//   <xsd:attribute name="explicit" type="DoxBool" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="refqual" type="DoxRefQualifierKind" use="optional"/>
//   <xsd:attribute name="virt" type="DoxVirtualKind" use="optional"/>
//   <xsd:attribute name="volatile" type="DoxBool" use="optional"/>
//   <xsd:attribute name="mutable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="noexcept" type="DoxBool" use="optional"/>
//   <xsd:attribute name="noexceptexpression" type="xsd:string" use="optional"/>
//   <xsd:attribute name="nodiscard" type="DoxBool" use="optional"/>
//   <xsd:attribute name="constexpr" type="DoxBool" use="optional"/>
//   <xsd:attribute name="consteval" type="DoxBool" use="optional"/>
//   <xsd:attribute name="constinit" type="DoxBool" use="optional"/>
//   <!-- Qt property -->
//   <xsd:attribute name="readable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="writable" type="DoxBool" use="optional"/>
//   <!-- C++/CLI variable -->
//   <xsd:attribute name="initonly" type="DoxBool" use="optional"/>
//   <!-- C++/CLI and C# property -->
//   <xsd:attribute name="settable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="privatesettable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="protectedsettable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="gettable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="privategettable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="protectedgettable" type="DoxBool" use="optional"/>
//   <!-- C++/CLI function -->
//   <xsd:attribute name="final" type="DoxBool" use="optional"/>
//   <xsd:attribute name="sealed" type="DoxBool" use="optional"/>
//   <xsd:attribute name="new" type="DoxBool" use="optional"/>
//   <!-- C++/CLI event -->
//   <xsd:attribute name="add" type="DoxBool" use="optional"/>
//   <xsd:attribute name="remove" type="DoxBool" use="optional"/>
//   <xsd:attribute name="raise" type="DoxBool" use="optional"/>
//   <!-- Objective-C 2.0 protocol method -->
//   <xsd:attribute name="optional" type="DoxBool" use="optional"/>
//   <xsd:attribute name="required" type="DoxBool" use="optional"/>
//   <!-- Objective-C 2.0 property accessor -->
//   <xsd:attribute name="accessor" type="DoxAccessor" use="optional"/>
//   <!-- UNO IDL -->
//   <xsd:attribute name="attribute" type="DoxBool" use="optional"/>
//   <xsd:attribute name="property" type="DoxBool" use="optional"/>
//   <xsd:attribute name="readonly" type="DoxBool" use="optional"/>
//   <xsd:attribute name="bound" type="DoxBool" use="optional"/>
//   <xsd:attribute name="removable" type="DoxBool" use="optional"/>
//   <xsd:attribute name="constrained" type="DoxBool" use="optional"/>
//   <xsd:attribute name="transient" type="DoxBool" use="optional"/>
//   <xsd:attribute name="maybevoid" type="DoxBool" use="optional"/>
//   <xsd:attribute name="maybedefault" type="DoxBool" use="optional"/>
//   <xsd:attribute name="maybeambiguous" type="DoxBool" use="optional"/>
// </xsd:complexType>

export abstract class AbstractMemberDefType extends AbstractParsedObjectBase {
  // Mandatory elements.
  name: string = ''
  location: Location | undefined

  // Mandatory attributes.
  kind: string = ''
  id: string = ''
  prot: string = ''
  _static: Boolean | undefined

  // Optional elements.
  briefDescription: BriefDescription | undefined
  detailedDescription: DetailedDescription | undefined
  inbodyDescription: InbodyDescription | undefined
  qualifiedName?: string | undefined
  type?: Type | undefined
  definition?: string | undefined
  argsstring?: string | undefined
  params?: Param[] | undefined
  // TODO: add more...

  // Optional attributes.
  _const: Boolean | undefined
  constexpr: Boolean | undefined
  explicit: Boolean | undefined
  inline: Boolean | undefined
  mutable: Boolean | undefined
  virt: string | undefined
  // TODO: add more...

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
        this.name = xml.getInnerElementText(innerElement, 'name')
      } else if (xml.hasInnerElement(innerElement, 'location')) {
        this.location = new Location(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescription(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescription(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'inbodydescription')) {
        this.inbodyDescription = new InbodyDescription(xml, innerElement)
      } else if (xml.isInnerElementText(innerElement, 'qualifiedname')) {
        this.qualifiedName = xml.getInnerElementText(innerElement, 'qualifiedname')
      } else if (xml.hasInnerElement(innerElement, 'type')) {
        this.type = new Type(xml, innerElement)
      } else if (xml.isInnerElementText(innerElement, 'definition')) {
        this.definition = xml.getInnerElementText(innerElement, 'definition')
      } else if (xml.isInnerElementText(innerElement, 'argsstring')) {
        this.argsstring = xml.getInnerElementText(innerElement, 'argsstring')
      } else if (xml.hasInnerElement(innerElement, 'param')) {
        if (this.params === undefined) {
          this.params = []
        }
        this.params.push(new Param(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.name.length > 0)
    assert(this.location !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_static') {
        this._static = xml.getAttributeBooleanValue(element, '@_static')
      } else if (attributeName === '@_const') {
        this._const = Boolean(xml.getAttributeBooleanValue(element, '@_const'))
      } else if (attributeName === '@_explicit') {
        this.explicit = Boolean(xml.getAttributeBooleanValue(element, '@_explicit'))
      } else if (attributeName === '@_inline') {
        this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'))
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_mutable') {
        this.mutable = Boolean(xml.getAttributeBooleanValue(element, '@_mutable'))
      } else if (attributeName === '@_constexpr') {
        this.constexpr = Boolean(xml.getAttributeBooleanValue(element, '@_constexpr'))
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.kind)
    assert(this.id)
    assert(this.prot)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />

export class MemberDef extends AbstractMemberDefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'memberdef')
  }
}

// ----------------------------------------------------------------------------
