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

import { IncludedByDataModel, IncludesDataModel } from './inctype-dm.js'
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from './compoundreftype-dm.js'
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js'
import { SectionDefDataModel } from './sectiondeftype-dm.js'
import { ListOfAllMembersDataModel } from './listofallmemberstype-dm.js'
import { AbstractStringType, BriefDescriptionDataModel, DetailedDescriptionDataModel, ParaDataModel, ProgramListingDataModel, Sect5DataModel } from './descriptiontype-dm.js'
import { InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel } from './reftype-dm.js'
import { LocationDataModel } from './locationtype-dm.js'
import { AbstractDataModelBase } from '../types.js'
import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { TableOfContentsDataModel } from './tableofcontentstype-dm.js'

// ----------------------------------------------------------------------------

// Template, to be used for creating new objects.
export abstract class AbstractXyzType extends AbstractDataModelBase {
  // If the object has a text.
  text: string = ''

  // Mandatory elements.
  compoundName: string = ''
  colsCount: number = NaN
  elm12: boolean = false
  // elm13: BriefDescriptionDataModel

  // Optional elements.
  elm20?: string | undefined
  elm21?: Boolean | undefined
  elm22?: Number | undefined
  briefDescription: BriefDescriptionDataModel | undefined
  includes?: IncludesDataModel[] | undefined

  // Mandatory attributes.
  id: string = ''
  rowsCount: number = NaN
  thead: boolean = false

  // Optional attributes.
  language?: string | undefined
  final?: Boolean | undefined
  lineno?: Number | undefined
  attr23?: string[] | undefined

  // ------------------------------------------

  children: Array<string | ParaDataModel | Sect5DataModel> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    // If the object has only a text.
    assert(xml.isInnerElementText(element, elementName))
    this.text = xml.getInnerElementText(element, elementName)

    // ------------------------------------------

    // If the object has sub-elements.
    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'compoundname')) {
        this.compoundName = xml.getInnerElementText(innerElement, 'compoundname')
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        this.briefDescription = new BriefDescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'includes')) {
        // console.log(util.inspect(item))
        if (this.includes === undefined) {
          this.includes = []
        }
        this.includes.push(new IncludesDataModel(xml, innerElement))
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------

    // If the object has to keep trak of the order of mixed type children.
    // const innerElements = xml.getInnerElements(element, elementName)
    // assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new ParaDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect5')) {
        this.children.push(new Sect5DataModel(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    // If the object has no attributes.
    assert(!xml.hasAttributes(element))

    // ------------------------------------------

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_id') {
        this.id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_rows') {
        assert(isNaN(this.rowsCount))
        this.rowsCount = xml.getAttributeNumberValue(element, '@_rows')
      } else if (attributeName === '@_thead') {
        this.thead = xml.getAttributeBooleanValue(element, '@_thead')
      } else if (attributeName === '@_language') {
        this.language = xml.getAttributeStringValue(element, '@_language')
      } else if (attributeName === '@_final') {
        this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'))
      } else if (attributeName === '@_lineno') {
        this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'))
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.id.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

export class XyzDataModel extends AbstractXyzType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'xyz')
  }
}

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

export abstract class AbstractCompoundDefType extends AbstractDataModelBase {
  // Mandatory elements.
  compoundName: string = ''

  // Optional elements.
  title?: string | undefined
  briefDescription?: BriefDescriptionDataModel | undefined
  detailedDescription?: DetailedDescriptionDataModel | undefined
  baseCompoundRefs?: BaseCompoundRefDataModel[] | undefined
  derivedCompoundRefs?: DerivedCompoundRefDataModel[] | undefined
  includes?: IncludesDataModel[] | undefined
  includedBy?: IncludedByDataModel[] | undefined
  templateParamList?: TemplateParamListDataModel | undefined
  sectionDefs?: SectionDefDataModel[] | undefined
  tableOfContents?: TableOfContentsDataModel | undefined
  // innerModules
  innerDirs?: InnerDirDataModel[] | undefined
  innerFiles?: InnerFileDataModel[] | undefined
  innerClasses?: InnerClassDataModel[] | undefined
  // innerConcepts
  innerNamespaces?: InnerNamespaceDataModel[] | undefined
  innerPages?: InnerPageDataModel[] | undefined
  innerGroups?: InnerGroupDataModel[] | undefined
  programListing?: ProgramListingDataModel | undefined
  location?: LocationDataModel | undefined
  listOfAllMembers?: ListOfAllMembersDataModel | undefined

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
        this.briefDescription = new BriefDescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        this.detailedDescription = new DetailedDescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'basecompoundref')) {
        if (this.baseCompoundRefs === undefined) {
          this.baseCompoundRefs = []
        }
        this.baseCompoundRefs.push(new BaseCompoundRefDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'derivedcompoundref')) {
        if (this.derivedCompoundRefs === undefined) {
          this.derivedCompoundRefs = []
        }
        this.derivedCompoundRefs.push(new DerivedCompoundRefDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'includes')) {
        // console.log(util.inspect(item))
        if (this.includes === undefined) {
          this.includes = []
        }
        this.includes.push(new IncludesDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'includedby')) {
        // console.log(util.inspect(item))
        if (this.includedBy === undefined) {
          this.includedBy = []
        }
        this.includedBy.push(new IncludedByDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'incdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'invincdepgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'innerdir')) {
        if (this.innerDirs === undefined) {
          this.innerDirs = []
        }
        this.innerDirs.push(new InnerDirDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innerfile')) {
        if (this.innerFiles === undefined) {
          this.innerFiles = []
        }
        this.innerFiles.push(new InnerFileDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innerclass')) {
        if (this.innerClasses === undefined) {
          this.innerClasses = []
        }
        this.innerClasses.push(new InnerClassDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innernamespace')) {
        if (this.innerNamespaces === undefined) {
          this.innerNamespaces = []
        }
        this.innerNamespaces.push(new InnerNamespaceDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innerpage')) {
        if (this.innerPages === undefined) {
          this.innerPages = []
        }
        this.innerPages.push(new InnerPageDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'innergroup')) {
        if (this.innerGroups === undefined) {
          this.innerGroups = []
        }
        this.innerGroups.push(new InnerGroupDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
        this.templateParamList = new TemplateParamListDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'sectiondef')) {
        if (this.sectionDefs === undefined) {
          this.sectionDefs = []
        }
        this.sectionDefs.push(new SectionDefDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
        this.tableOfContents = new TableOfContentsDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'inheritancegraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'collaborationgraph')) {
        // TODO: Ignored, not used for now.
      } else if (xml.hasInnerElement(innerElement, 'programlisting')) {
        assert(this.programListing === undefined)
        this.programListing = new ProgramListingDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'location')) {
        this.location = new LocationDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'listofallmembers')) {
        this.listOfAllMembers = new ListOfAllMembersDataModel(xml, innerElement)
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // Moved down, depends on kind.
    // assert(this.compoundName.length > 0)

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

    if (this.kind !== 'namespace') {
      assert(this.compoundName.length > 0)
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="compounddef" type="compounddefType" minOccurs="0" />

export class CompoundDefDataModel extends AbstractCompoundDefType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'compounddef')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docHtmlOnlyType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="block" type="xsd:string" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

export abstract class AbstractDocHtmlOnlyType extends AbstractDataModelBase {
  text: string = ''

  block?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    assert(xml.isInnerElementText(element, elementName))
    this.text = xml.getInnerElementText(element, elementName)

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_block') {
          this.block = xml.getAttributeStringValue(element, '@_block')
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="htmlonly" type="docHtmlOnlyType" />

export class HtmlOnlyDataModel extends AbstractDocHtmlOnlyType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'htmlonly')
  }
}

// Normally strings are properties, but these are unusual, so we keep them as objects.
// <xsd:element name="manonly" type="xsd:string" />
// <xsd:element name="xmlonly" type="xsd:string" />
// <xsd:element name="rtfonly" type="xsd:string" />
// <xsd:element name="latexonly" type="xsd:string" />
// <xsd:element name="docbookonly" type="xsd:string" />

export class ManOnlyDataModel extends AbstractStringType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'manonly')
  }
}

export class XmlOnlyDataModel extends AbstractStringType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'xmlonly')
  }
}

export class RtfOnlyDataModel extends AbstractStringType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'rtfonly')
  }
}

export class LatexOnlyDataModel extends AbstractStringType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'latexonly')
  }
}

export class DocBookOnlyDataModel extends AbstractStringType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'docbookonly')
  }
}

// ----------------------------------------------------------------------------
