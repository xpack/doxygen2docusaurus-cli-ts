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
import { AbstractDataModelBase } from '../types.js'
import { DocTitleCmdGroup, parseDocTitleCmdGroup } from './descriptiontype-dm.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="tableofcontentsType">
//   <xsd:sequence>
//     <xsd:choice>
//       <xsd:element name="tocsect" type="tableofcontentsKindType" minOccurs="1" maxOccurs="unbounded" />
//       <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractTableOfContentsType extends AbstractDataModelBase {
  // xsd:choice, only one of them.
  tocSect: TocSectDataModel[] | undefined
  tableOfContents: TableOfContentsDataModel[] | undefined

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
      } else if (xml.hasInnerElement(innerElement, 'tocsect')) {
        // console.log(util.inspect(item))
        if (this.tocSect === undefined) {
          this.tocSect = []
        }
        this.tocSect.push(new TocSectDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
        // console.log(util.inspect(item))
        if (this.tableOfContents === undefined) {
          this.tableOfContents = []
        }
        this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement))
      } else {
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

// <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="1" />

export class TableOfContentsDataModel extends AbstractTableOfContentsType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'tableofcontents')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="tableofcontentsKindType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string" minOccurs="1" maxOccurs="1"/>
//     <xsd:element name="reference" type="xsd:string" minOccurs="1" maxOccurs="1"/>
//     <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractTableOfContentsKindType extends AbstractDataModelBase {
  // Mandatory elements.
  name: string = ''
  reference: string = ''
  // docs:
  tableOfContents: TableOfContentsDataModel[] | undefined

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
      } else if (xml.isInnerElementText(innerElement, 'reference')) {
        this.reference = xml.getInnerElementText(innerElement, 'reference')
      } else if (xml.hasInnerElement(innerElement, 'docs')) {
        // WARNING not in dtd, type unknown.
      } else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
        // console.log(util.inspect(item))
        if (this.tableOfContents === undefined) {
          this.tableOfContents = []
        }
        this.tableOfContents.push(new TableOfContentsDataModel(xml, innerElement))
      } else {
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

// <xsd:element name="tocsect" type="tableofcontentsKindType" minOccurs="1" maxOccurs="unbounded" />

export class TocSectDataModel extends AbstractTableOfContentsKindType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'tocsect')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docTocItemType" mixed="true">
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractTocDocItemType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | DocTitleCmdGroup> = []

  // Mandatory attributes.
  id: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName))
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_id') {
        assert(this.id.length === 0)
        this.id = xml.getAttributeStringValue(element, '@_id')
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

// <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />

export class TocItemDataModel extends AbstractTocDocItemType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'tocitem')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docTocListType">
//   <xsd:sequence>
//     <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocTocListType extends AbstractDataModelBase {
  tocItems?: TocItemDataModel[] | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'tocitem')) {
        // console.log(util.inspect(item))
        if (this.tocItems === undefined) {
          this.tocItems = []
        }
        this.tocItems.push(new TocItemDataModel(xml, innerElement))
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    // If the object has no attributes.
    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="toclist" type="docTocListType" />

export class TocListDataModel extends AbstractDocTocListType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'toclist')
  }
}

// ----------------------------------------------------------------------------
