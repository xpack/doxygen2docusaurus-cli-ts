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

/*
import * as util from 'node:util'

import assert from 'node:assert'
import { CompoundBase } from './CompoundBase.js'
import { IncType } from './IncType.js'
import { Folders } from './folders.js'

import type { XmlCompoundDefElement, XmlProgramListingElement } from '../xml-parser/compound-xsd-types.js'
import { xml } from '../xml-parser/parse.js'
import { RefTextType } from './RefTextType.js'

// ----------------------------------------------------------------------------

export class Files {
  folders: Folders
  membersById: Map<string, File>

  constructor (folders: Folders) {
    this.folders = folders

    this.membersById = new Map()
  }

  add (id: string, compound: File): void {
    this.membersById.set(id, compound)
  }

  get (id: string): File {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Files.get(${id}) not found`)
  }

  createHierarchies (): void {
    // console.log('Files.createHierarchies()...')

    for (const itemFolder of this.folders.membersById.values()) {
      // console.log(itemFolder)
      for (const childFileId of itemFolder.childrenFilesIds) {
        // console.log(childFileId)
        const childFileItem = this.get(childFileId)
        assert(childFileItem.parentFolderId.length === 0)
        childFileItem.parentFolderId = itemFolder.id
        // console.log(childFileItem)
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentFolderId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Files.computePermalinks()...')
    for (const item of this.membersById.values()) {
      if (item.parentFolderId.length > 0) {
        const itemFolder = this.folders.get(item.parentFolderId)
        const folderPermalink: string = this.folders.getPermalink(itemFolder)
        const name: string = item.compoundName.replaceAll('.', '-')
        item.permalink = `files/${folderPermalink}/${name}`
      } else {
        const name: string = item.compoundName.replaceAll('.', '-')
        item.permalink = `files/${name}`
      }
      console.log('-', item.permalink)
    }
  }
}

export class File extends CompoundBase {
  parentFolderId: string = ''
  permalink: string = ''
  includes: IncType[] = []
  programlisting: string = ''
  innerNamespacesIds: string[] = []
  innerClassesIds: string[] = []

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (xml.hasInnerElement(element, 'includes')) {
        // console.log(util.inspect(item))
        this.includes.push(new IncType(element, 'includes'))
      } else if (xml.hasInnerElement(element, 'programlisting')) {
        // console.log(util.inspect(item))
        // this.programlisting = this.parseProgramListing(element as XmlProgramListingElement)
        // // console.log('listing:', this.programlisting)
      } else if (xml.hasInnerElement(element, 'innernamespace')) {
        this.innerNamespacesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'innerclass')) {
        this.innerClassesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'location')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'incdepgraph')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'invincdepgraph')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'includedby')) {
        // Ignored, not used for now. (perhaps re-evaluate later).
      } else if (!this.wasElementProcessedByParent(element)) {
        console.error('files element:', Object.keys(element), 'not implemented yet')
      }
    }
    // console.log(util.inspect(this.innerNamespacesIds))
    // console.log(util.inspect(this.innerClassesIds))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="listingType">
//   <xsd:sequence>
//     <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="filename" type="xsd:string" use="optional"/>
// </xsd:complexType>

export class ListingType {
  // Mandatory elements.
  codelines: CodelineType = []

  // Mandatory attributes.
  filename: string = ''

  constructor (element: Object, elementName: string = 'XXX') {
    console.log(util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="codelineType">
//   <xsd:sequence>
//     <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="lineno" type="xsd:integer" />
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="refkind" type="DoxRefKind" />
//   <xsd:attribute name="external" type="DoxBool" />
// </xsd:complexType>

export class CodelineType {
  constructor (element: Object, elementName: string = 'XXX') {
    console.log(util.inspect(element))
  }
}

// <xsd:complexType name="highlightType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:choice minOccurs="0" maxOccurs="unbounded">
//     <xsd:element name="sp" type="spType" />
//     <xsd:element name="ref" type="refTextType" />
//   </xsd:choice>
//   <xsd:attribute name="class" type="DoxHighlightClass" />
// </xsd:complexType>

export class HighlightType {
  children: Array<string | SpType | RefTextType> = []

  // Mandatory attributes.
  _class: string = ''

  constructor (element: Object, elementName: string = 'highlight') {
    // console.log(util.inspect(element))

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sp')) {
        this.children.push(new SpType(innerElement, 'scope'))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefTextType(innerElement, 'name'))
      } else {
        console.error(util.inspect(innerElement))
        console.error('highlightType element:', Object.keys(innerElement), 'not implemented yet')
      }
    }

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_class') {
        this._class = xml.getAttributeStringValue(element, '@_class')
      } else {
        console.error(util.inspect(element))
        console.error('highlightType attribute:', attributeName, 'not implemented yet')
      }
    }

    assert(this._class.length > 0)

    // console.log(this)
  }
}

// <xsd:complexType name="spType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>

export class SpType {
  value?: number | undefined

  constructor (element: Object, elementName: string = 'sp') {
    // console.log(util.inspect(element))

    const innerElements = xml.getInnerElements(element, elementName)

    // WARNING: Deviation from xsd, do not allow any children, text or elements.
    assert(innerElements.length === 0)

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_value') {
        this.value = xml.getAttributeNumberValue(element, '@_value')
      } else {
        console.error(util.inspect(element))
        console.error('spType attribute:', attributeName, 'not implemented yet')
      }
    }

    // console.log(this)
  }
}
*/
