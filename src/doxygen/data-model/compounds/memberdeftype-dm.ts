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
import {
  BriefDescriptionDataModel,
  DetailedDescriptionDataModel,
  InbodyDescriptionDataModel,
} from './descriptiontype-dm.js'
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js'
import { LocationDataModel } from './locationtype-dm.js'
import { ParamDataModel } from './paramtype-dm.js'
import { AbstractDataModelBase } from '../types.js'
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js'
import { EnumValueDataModel } from './enumvaluetype-dm.js'
import {
  ReimplementDataModel,
  ReimplementedByDataModel,
} from './reimplementtype-dm.js'
import {
  ReferenceDataModel,
  ReferencedByDataModel,
} from './referencetype-dm.js'

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

// <xsd:simpleType name="DoxMemberKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="define" />
//     <xsd:enumeration value="property" />
//     <xsd:enumeration value="event" />
//     <xsd:enumeration value="variable" />
//     <xsd:enumeration value="typedef" />
//     <xsd:enumeration value="enum" />
//     <xsd:enumeration value="function" />
//     <xsd:enumeration value="signal" />
//     <xsd:enumeration value="prototype" />
//     <xsd:enumeration value="friend" />
//     <xsd:enumeration value="dcop" />
//     <xsd:enumeration value="slot" />
//     <xsd:enumeration value="interface" />
//     <xsd:enumeration value="service" />
//   </xsd:restriction>
// </xsd:simpleType>

export type DoxMemberKind =
  | 'define'
  | 'property'
  | 'event'
  | 'variable'
  | 'typedef'
  | 'enum'
  | 'function'
  | 'signal'
  | 'prototype'
  | 'friend'
  | 'dcop'
  | 'slot'
  | 'interface'
  | 'service'

/**
 * @public
 */
export abstract class AbstractMemberBaseType extends AbstractDataModelBase {
  // Mandatory elements.
  name: string = ''
  kind: string = ''
}

/**
 * @public
 */
export abstract class AbstractMemberDefType extends AbstractMemberBaseType {
  // Mandatory elements.
  // name: string = '' (in parent)
  location: LocationDataModel | undefined

  // Mandatory attributes.
  // kind: DoxMemberKind | '' = '' (in parent)
  id: string = ''
  prot: string = ''
  staticc: Boolean | undefined

  // Optional elements.
  templateparamlist?: TemplateParamListDataModel | undefined
  type?: TypeDataModel | undefined
  definition?: string | undefined
  argsstring?: string | undefined
  qualifiedName?: string | undefined
  // read?: string | undefined
  // write?: string | undefined
  bitfield?: string | undefined
  reimplements?: ReimplementDataModel[] | undefined
  reimplementedBys?: ReimplementDataModel[] | undefined
  // qualifier?: string[] | undefined
  params?: ParamDataModel[] | undefined
  enumvalues?: EnumValueDataModel[] | undefined
  // requiresclause?: LinkedTextType | undefined
  initializer?: InitializerDataModel | undefined
  // exceptions?: LinkedTextType | undefined
  briefDescription?: BriefDescriptionDataModel | undefined
  detailedDescription?: DetailedDescriptionDataModel | undefined
  inbodyDescription?: InbodyDescriptionDataModel | undefined
  references?: ReferenceDataModel[] | undefined
  referencedBy?: ReferencedByDataModel[] | undefined

  // Optional attributes.
  extern?: Boolean | undefined
  strong?: Boolean | undefined
  constt?: Boolean | undefined
  explicit?: Boolean | undefined
  inline?: Boolean | undefined
  refqual?: Boolean | undefined
  virt?: string | undefined
  volatile?: Boolean | undefined
  mutable?: Boolean | undefined
  noexcept?: Boolean | undefined
  noexceptexpression?: Boolean | undefined
  nodiscard?: Boolean | undefined
  constexpr?: Boolean | undefined
  consteval?: Boolean | undefined
  constinit?: Boolean | undefined
  final?: Boolean | undefined
  // TODO: add more...

  constructor(xml: DoxygenXmlParser, element: Object, elementName: string) {
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
        this.location = new LocationDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
        this.templateparamlist = new TemplateParamListDataModel(
          xml,
          innerElement
        )
      } else if (xml.hasInnerElement(innerElement, 'type')) {
        this.type = new TypeDataModel(xml, innerElement)
      } else if (xml.isInnerElementText(innerElement, 'definition')) {
        this.definition = xml.getInnerElementText(innerElement, 'definition')
      } else if (xml.isInnerElementText(innerElement, 'argsstring')) {
        this.argsstring = xml.getInnerElementText(innerElement, 'argsstring')
      } else if (xml.isInnerElementText(innerElement, 'bitfield')) {
        this.bitfield = xml.getInnerElementText(innerElement, 'bitfield')
      } else if (xml.isInnerElementText(innerElement, 'qualifiedname')) {
        this.qualifiedName = xml.getInnerElementText(
          innerElement,
          'qualifiedname'
        )
      } else if (xml.hasInnerElement(innerElement, 'reimplements')) {
        if (this.reimplements === undefined) {
          this.reimplements = []
        }
        this.reimplements.push(new ReimplementDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'reimplementedby')) {
        if (this.reimplementedBys === undefined) {
          this.reimplementedBys = []
        }
        this.reimplementedBys.push(
          new ReimplementedByDataModel(xml, innerElement)
        )
      } else if (xml.hasInnerElement(innerElement, 'param')) {
        if (this.params === undefined) {
          this.params = []
        }
        this.params.push(new ParamDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'enumvalue')) {
        if (this.enumvalues === undefined) {
          this.enumvalues = []
        }
        this.enumvalues.push(new EnumValueDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'initializer')) {
        this.initializer = new InitializerDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescriptionDataModel(
          xml,
          innerElement
        )
      } else if (xml.hasInnerElement(innerElement, 'inbodydescription')) {
        this.inbodyDescription = new InbodyDescriptionDataModel(
          xml,
          innerElement
        )
      } else if (xml.hasInnerElement(innerElement, 'references')) {
        if (this.references === undefined) {
          this.references = []
        }
        this.references.push(new ReferenceDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'referencedby')) {
        if (this.referencedBy === undefined) {
          this.referencedBy = []
        }
        this.referencedBy.push(new ReferencedByDataModel(xml, innerElement))
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

    // WARNING it may be empty.
    // assert(this.name.length > 0)
    assert(this.location !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(
          element,
          '@_kind'
        ) as DoxMemberKind
      } else if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_static') {
        this.staticc = xml.getAttributeBooleanValue(element, '@_static')
      } else if (attributeName === '@_extern') {
        this.extern = Boolean(xml.getAttributeBooleanValue(element, '@_extern'))
      } else if (attributeName === '@_strong') {
        this.strong = Boolean(xml.getAttributeBooleanValue(element, '@_strong'))
      } else if (attributeName === '@_const') {
        this.constt = Boolean(xml.getAttributeBooleanValue(element, '@_const'))
      } else if (attributeName === '@_explicit') {
        this.explicit = Boolean(
          xml.getAttributeBooleanValue(element, '@_explicit')
        )
      } else if (attributeName === '@_inline') {
        this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'))
      } else if (attributeName === '@_refqual') {
        this.refqual = Boolean(
          xml.getAttributeBooleanValue(element, '@_refqual')
        )
      } else if (attributeName === '@_virt') {
        this.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_volatile') {
        this.volatile = xml.getAttributeBooleanValue(element, '@_volatile')
      } else if (attributeName === '@_mutable') {
        this.mutable = Boolean(
          xml.getAttributeBooleanValue(element, '@_mutable')
        )
      } else if (attributeName === '@_noexcept') {
        this.noexcept = Boolean(
          xml.getAttributeBooleanValue(element, '@_noexcept')
        )
      } else if (attributeName === '@_noexceptexpression') {
        this.noexceptexpression = Boolean(
          xml.getAttributeBooleanValue(element, '@_noexceptexpression')
        )
      } else if (attributeName === '@_nodiscard') {
        this.nodiscard = Boolean(
          xml.getAttributeBooleanValue(element, '@_nodiscard')
        )
      } else if (attributeName === '@_constexpr') {
        this.constexpr = Boolean(
          xml.getAttributeBooleanValue(element, '@_constexpr')
        )
      } else if (attributeName === '@_consteval') {
        this.consteval = Boolean(
          xml.getAttributeBooleanValue(element, '@_consteval')
        )
      } else if (attributeName === '@_constinit') {
        this.constinit = Boolean(
          xml.getAttributeBooleanValue(element, '@_constinit')
        )
      } else if (attributeName === '@_final') {
        this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'))
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

    assert(this.kind)
    assert(this.id)
    assert(this.prot)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />

/**
 * @public
 */
export class MemberDefDataModel extends AbstractMemberDefType {
  constructor(xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'memberdef')
  }
}

// ----------------------------------------------------------------------------
