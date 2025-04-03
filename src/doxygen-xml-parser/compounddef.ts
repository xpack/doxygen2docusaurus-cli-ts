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
// import type { XmlCompoundDefElement, XmlIncludesElement, XmlTemplateParamListElement, XmlParamElement, XmlTypeElement, XmlDefvalElement, XmlRefElement, XmlDeclNameElement, XmlDefNameElement, XmlBaseCompoundRefElement, XmlDerivedCompoundRefElement, XmlCompoundRefTypeElements, XmlListOfAllMembersElement, XmlMemberElement, XmlScopeElement, XmlNameElement, XmlSectionDefElement, XmlDescriptionElement, XmlHeaderElement, XmlMemberDefElement, XmlLocationElement, XmlBriefDescriptionElement, XmlDetailedDescriptionElement, XmlInbodyDescriptionElement, XmlQualifiedNametElement } from '../xml-parser/compound-xsd-types.js'
// import { XmlText } from '../xml-parser/common-types.js'
// import { LocationType } from './LocationType.js'
// import { MemberRefType } from './MemberRefType.js'
// import { CompoundBase } from './CompoundBase.js'
import { IncType } from './inctype.js'
import { DoxygenXmlParser } from './index.js'
import { CompoundRefType } from './compoundreftype.js'
import { TemplateParamListType } from './templateparamlisttype.js'
import { SectionDefType } from './sectiondeftype.js'
import { ListOfAllMembersType } from './listofallmemberstype.js'
import { DescriptionType } from './descriptiontype.js'

// ----------------------------------------------------------------------------

/*
export class CompoundDefs {
  membersById: Map<string, CompoundDefType>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: CompoundDefType): void {
    this.membersById.set(id, compound)
  }

  get (id: string): CompoundDefType {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Classes.get(${id}) not found`)
  }

  createHierarchies (): void {
    // console.log('Classes.createHierarchies()...')

    for (const member of this.membersById.values()) {
      if (member.derivedCompoundsRefs !== undefined) {
        for (const derived of member.derivedCompoundsRefs) {
          if (derived.refid !== undefined && derived.refid?.length > 0) {
            const child = this.get(derived.refid)
            assert(child.parentId.length === 0)
            child.parentId = member.id
          }
        }
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Classes.computePermalinks()...')
    for (const item of this.membersById.values()) {
      const name: string = item.compoundName.replaceAll('::', '/')
      item.permalink = `classes/${name}`
      console.log('-', item.permalink)
    }
  }
}
*/

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

export class CompoundDefType {
  // Mandatory elements.
  compoundName: string = ''

  // Optional elements.
  title?: string | undefined
  briefDescription?: DescriptionType | undefined
  detailedDescription?: DescriptionType | undefined
  baseCompoundRefs: CompoundRefType[] | undefined
  derivedCompoundRefs: CompoundRefType[] | undefined
  includes: IncType[] | undefined
  includedBy: IncType[] | undefined
  templateParamList: TemplateParamListType | undefined
  sectionDefs: SectionDefType[] | undefined
  listOfAllMembers: ListOfAllMembersType | undefined

  // Mandatory attributes.
  id: string = ''
  kind: string = ''

  // Optional attributes.
  language?: string | undefined // DoxLanguage
  // WARNING: This attribute is not marked as optional, but is not present.
  prot: string | undefined
  final: boolean = false
  inline: boolean = false
  sealed: boolean = false
  abstract: boolean = false

  // Not in xsd.
  // parentId: string = ''
  // permalink: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string = 'compounddef') {
    // console.log(elementName, util.inspect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    // console.log(util.inspect(element))
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
        this.briefDescription = new DescriptionType(xml, innerElement, 'briefdescription')
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DescriptionType(xml, innerElement, 'detaileddescription')
      } else if (xml.hasInnerElement(innerElement, 'basecompoundref')) {
        if (this.baseCompoundRefs === undefined) {
          this.baseCompoundRefs = []
        }
        this.baseCompoundRefs.push(new CompoundRefType(xml, innerElement, 'basecompoundref'))
      } else if (xml.hasInnerElement(innerElement, 'derivedcompoundref')) {
        if (this.derivedCompoundRefs === undefined) {
          this.derivedCompoundRefs = []
        }
        this.derivedCompoundRefs.push(new CompoundRefType(xml, innerElement, 'derivedcompoundref'))
      } else if (xml.hasInnerElement(innerElement, 'includes')) {
        // console.log(util.inspect(item))
        if (this.includes === undefined) {
          this.includes = []
        }
        this.includes.push(new IncType(xml, innerElement, 'includes'))
      } else if (xml.hasInnerElement(innerElement, 'includedby')) {
        // console.log(util.inspect(item))
        if (this.includedBy === undefined) {
          this.includedBy = []
        }
        this.includedBy.push(new IncType(xml, innerElement, 'includedby'))
      } else if (xml.hasInnerElement(innerElement, 'incdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'invincdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innerdir')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innerfile')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innerclass')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innernamespace')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innergroup')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
        this.templateParamList = new TemplateParamListType(xml, innerElement, 'templateparamlist')
      } else if (xml.hasInnerElement(innerElement, 'sectiondef')) {
        if (this.sectionDefs === undefined) {
          this.sectionDefs = []
        }
        this.sectionDefs.push(new SectionDefType(xml, innerElement, 'sectiondef'))
      } else if (xml.hasInnerElement(innerElement, 'inheritancegraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'collaborationgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'programlisting')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'location')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'listofallmembers')) {
        this.listOfAllMembers = new ListOfAllMembersType(xml, innerElement, 'listofallmembers')
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet')
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
        this.final = xml.getAttributeBooleanValue(element, '@_final')
      } else if (attributeName === '@_inline') {
        this.inline = xml.getAttributeBooleanValue(element, '@_inline')
      } else if (attributeName === '@_sealed') {
        this.sealed = xml.getAttributeBooleanValue(element, '@_sealed')
      } else if (attributeName === '@_abstract') {
        this.abstract = xml.getAttributeBooleanValue(element, '@_abstract')
      } else {
        console.error(util.inspect(element))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet')
      }
    }

    assert(this.id.length > 0)
    assert(this.kind.length > 0)

    // WARNING: The attribute is not marked as optional, but is not present.
    // assert(this.prot.length > 0)

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}
