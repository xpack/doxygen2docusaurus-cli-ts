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

import * as util from 'node:util'
import assert from 'node:assert'

import { IncludedBy, Includes } from './inctype-parser.js'
import { DoxygenXmlParser } from './index.js'
import { BaseCompoundRef, DerivedCompoundRef } from './compoundreftype-parser.js'
import { TemplateParamList } from './templateparamlisttype-parser.js'
import { SectionDef } from './sectiondeftype-parser.js'
import { ListOfAllMembers } from './listofallmemberstype-parser.js'
import { BriefDescription, DetailedDescription, ProgramListing } from './descriptiontype-parser.js'
import { InnerClass, InnerDir, InnerFile, InnerGroup, InnerNamespace } from './reftype-parser.js'
import { Location } from './locationtype-parser.js'
import { AbstractParsedObjectBase } from './types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="compounddefType">
//   <xsd:sequence>
//     <xsd:element name="compoundname" type="xsd:string"/>
//     <xsd:element name="title" type="xsd:string" minOccurs="0" />
//     <xsd:element name="basecompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="derivedcompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="includes" type="incType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="includedby" type="incType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="incdepgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="invincdepgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="innermodule" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerdir" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerfile" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerclass" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerconcept" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innernamespace" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerpage" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innergroup" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="qualifier" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="templateparamlist" type="templateparamlistType" minOccurs="0" />
//     <xsd:element name="sectiondef" type="sectiondefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="exports" type="exportsType" minOccurs="0" maxOccurs="1"/>
//     <xsd:element name="inheritancegraph" type="graphType" minOccurs="0" />
//     <xsd:element name="collaborationgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="programlisting" type="listingType" minOccurs="0" />
//     <xsd:element name="location" type="locationType" minOccurs="0" />
//     <xsd:element name="listofallmembers" type="listofallmembersType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
//   <xsd:attribute name="kind" type="DoxCompoundKind" />
//   <xsd:attribute name="language" type="DoxLanguage" use="optional"/>
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
//   <xsd:attribute name="final" type="DoxBool" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="sealed" type="DoxBool" use="optional"/>
//   <xsd:attribute name="abstract" type="DoxBool" use="optional"/>
// </xsd:complexType>

// <xsd:simpleType name="DoxCompoundKind">
// <xsd:restriction base="xsd:string">
//   <xsd:enumeration value="class" />
//   <xsd:enumeration value="struct" />
//   <xsd:enumeration value="union" />
//   <xsd:enumeration value="interface" />
//   <xsd:enumeration value="protocol" />
//   <xsd:enumeration value="category" />
//   <xsd:enumeration value="exception" />
//   <xsd:enumeration value="service" />
//   <xsd:enumeration value="singleton" />
//   <xsd:enumeration value="module" />
//   <xsd:enumeration value="type" />
//   <xsd:enumeration value="file" />
//   <xsd:enumeration value="namespace" />
//   <xsd:enumeration value="group" />
//   <xsd:enumeration value="page" />
//   <xsd:enumeration value="example" />
//   <xsd:enumeration value="dir" />
//   <xsd:enumeration value="concept" />
// </xsd:restriction>
// </xsd:simpleType>

export abstract class AbstractCompoundDefType extends AbstractParsedObjectBase {
  // Mandatory elements.
  compoundName: string = ''

  // Optional elements.
  title?: string | undefined
  briefDescription?: BriefDescription | undefined
  detailedDescription?: DetailedDescription | undefined
  baseCompoundRefs?: BaseCompoundRef[] | undefined
  derivedCompoundRefs?: DerivedCompoundRef[] | undefined
  includes?: Includes[] | undefined
  includedBy?: IncludedBy[] | undefined
  templateParamList?: TemplateParamList | undefined
  sectionDefs?: SectionDef[] | undefined
  // innerModules
  innerDirs?: InnerDir[] | undefined
  innerFiles?: InnerFile[] | undefined
  innerClasses?: InnerClass[] | undefined
  // innerConcepts
  innerNamespaces?: InnerNamespace[] | undefined
  // innerPages
  innerGroups?: InnerGroup[] | undefined
  programListing?: ProgramListing | undefined
  location?: Location | undefined
  listOfAllMembers?: ListOfAllMembers | undefined

  // Mandatory attributes.
  id: string = ''
  kind: string = '' // DoxCompoundKind

  // Optional attributes.
  language?: string | undefined // DoxLanguage
  // WARNING: This attribute is not marked as optional, but is not present.
  prot?: string | undefined
  final?: Boolean | undefined
  inline?: Boolean | undefined
  sealed?: Boolean | undefined
  abstract?: Boolean | undefined

  // Not in xsd.
  // parentId: string = ''
  // permalink: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    // console.log(util.inspect(element, { compact: false, depth: 999 })
    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'compoundname')) {
        this.compoundName = xml.getInnerElementText(innerElement, 'compoundname')
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescription(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescription(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'basecompoundref')) {
        if (this.baseCompoundRefs === undefined) {
          this.baseCompoundRefs = []
        }
        this.baseCompoundRefs.push(new BaseCompoundRef(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'derivedcompoundref')) {
        if (this.derivedCompoundRefs === undefined) {
          this.derivedCompoundRefs = []
        }
        this.derivedCompoundRefs.push(new DerivedCompoundRef(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'includes')) {
        // console.log(util.inspect(item))
        if (this.includes === undefined) {
          this.includes = []
        }
        this.includes.push(new Includes(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'includedby')) {
        // console.log(util.inspect(item))
        if (this.includedBy === undefined) {
          this.includedBy = []
        }
        this.includedBy.push(new IncludedBy(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'incdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'invincdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innerdir')) {
        if (this.innerDirs === undefined) {
          this.innerDirs = []
        }
        this.innerDirs.push(new InnerDir(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innerfile')) {
        if (this.innerFiles === undefined) {
          this.innerFiles = []
        }
        this.innerFiles.push(new InnerFile(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innerclass')) {
        if (this.innerClasses === undefined) {
          this.innerClasses = []
        }
        this.innerClasses.push(new InnerClass(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innernamespace')) {
        if (this.innerNamespaces === undefined) {
          this.innerNamespaces = []
        }
        this.innerNamespaces.push(new InnerNamespace(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innergroup')) {
        if (this.innerGroups === undefined) {
          this.innerGroups = []
        }
        this.innerGroups.push(new InnerGroup(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
        this.templateParamList = new TemplateParamList(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'sectiondef')) {
        if (this.sectionDefs === undefined) {
          this.sectionDefs = []
        }
        this.sectionDefs.push(new SectionDef(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'inheritancegraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'collaborationgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'programlisting')) {
        assert(this.programListing === undefined)
        this.programListing = new ProgramListing(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'location')) {
        this.location = new Location(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'listofallmembers')) {
        this.listOfAllMembers = new ListOfAllMembers(xml, innerElement)
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.compoundName.length > 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else if (attributeName === '@_language') {
        this.language = xml.getAttributeStringValue(element, '@_language')
      } else if (attributeName === '@_prot') {
        this.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_final') {
        this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'))
      } else if (attributeName === '@_inline') {
        this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'))
      } else if (attributeName === '@_sealed') {
        this.sealed = Boolean(xml.getAttributeBooleanValue(element, '@_sealed'))
      } else if (attributeName === '@_abstract') {
        this.abstract = Boolean(xml.getAttributeBooleanValue(element, '@_abstract'))
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.id.length > 0)
    assert(this.kind.length > 0)

    // WARNING: The attribute is not marked as optional, but is not present.
    // assert(this.prot.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="compounddef" type="compounddefType" minOccurs="0" />

export class CompoundDef extends AbstractCompoundDefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'compounddef')
  }
}

// ----------------------------------------------------------------------------
