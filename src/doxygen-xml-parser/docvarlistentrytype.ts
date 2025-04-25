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
import util from 'util'

import { DoxygenXmlParser } from './index.js'
import { AbstractParsedObjectBase } from './types.js'
import { ListItem, Term } from './descriptiontype.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="docVarListEntryType">
//   <xsd:sequence>
//     <xsd:element name="term" type="docTitleType" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocVarListEntryType extends AbstractParsedObjectBase {
  // Mandatory elements.
  term: Term | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    // console.log(util.inspect(element, { compact: false, depth: 999 })
    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'term')) {
        assert(this.term === undefined)
        this.term = new Term(xml, innerElement)
      } else {
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.term !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="varlistentry" type="docVarListEntryType" />

export class VarListEntry extends AbstractDocVarListEntryType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'varlistentry')
  }
}

// ----------------------------------------------------------------------------

// WARNING: the DTD does not define an explicit pair.
// <xsd:group name="docVariableListGroup">
//   <xsd:sequence>
//     <xsd:element name="varlistentry" type="docVarListEntryType" />
//     <xsd:element name="listitem" type="docListItemType" />
//   </xsd:sequence>
// </xsd:group>

export class VariableListPair extends AbstractParsedObjectBase {
  varlistentry: VarListEntry
  listitem: ListItem

  constructor (varlistentry: VarListEntry, listitem: ListItem) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super('variablelistpair')
    this.varlistentry = varlistentry
    this.listitem = listitem
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docVariableListType">
//   <xsd:sequence>
//     <xsd:group ref="docVariableListGroup" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocVariableListType extends AbstractParsedObjectBase {
  children: VariableListPair[] = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    let varlistentry: VarListEntry | undefined
    for (const innerElement of innerElements) {
      // console.log('innerElement:', innerElement)
      // WARNING: this is not ok, since it depends on the order, it expects
      // pairs of varlistentry and listitem, in this order.
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'varlistentry')) {
        varlistentry = new VarListEntry(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'listitem')) {
        const listitem = new ListItem(xml, innerElement)
        assert(varlistentry !== undefined)
        this.children.push(new VariableListPair(varlistentry, listitem))
        varlistentry = undefined
      } else {
        console.error(util.inspect(innerElement, { compact: false, depth: 999 }))
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

//  <xsd:element name="variablelist" type="docVariableListType" />

export class VariableList extends AbstractDocVariableListType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'variablelist')
  }
}

// ----------------------------------------------------------------------------
