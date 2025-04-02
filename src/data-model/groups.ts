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
import type { XmlCompoundDefElement } from '../xml-parser/compound-xsd-types.js'
import { CompoundBase } from './CompoundBase.js'
import { xml } from '../xml-parser/parse.js'
import { XmlText } from '../xml-parser/common-types.js'

// ----------------------------------------------------------------------------

export class Groups {
  membersById: Map<string, Group>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: Group): void {
    this.membersById.set(id, compound)
  }

  get (id: string): Group {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Groups.get(${id}) not found`)
  }

  createHierarchies (): void {
    // console.log('Groups.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenGroupsIds) {
        const childItem = this.get(childId)
        assert(childItem.parentGroupId.length === 0)
        childItem.parentGroupId = item.id
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentGroupId.length === 0) {
    //     console.log(item.id, item.name, item.title)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Groups.computePermalinks()...')
    for (const item of this.membersById.values()) {
      item.permalink = `topics/${(item as Group).compoundName}`
      console.log('-', item.permalink)
    }
  }
}

export class Group extends CompoundBase {
  title: string = ''
  parentGroupId: string = ''
  childrenGroupsIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (xml.hasInnerElement(element, 'title')) {
        // console.log(util.inspect(element))
        const titleInnerElements = xml.getInnerElements<XmlText[]>(element, 'title')
        assert(titleInnerElements.length === 1)
        assert(titleInnerElements[0] !== undefined && xml.hasInnerElement(titleInnerElements[0], '#text'))
        this.title = xml.getInnerText(titleInnerElements[0])
      } else if (xml.hasInnerElement(element, 'innergroup')) {
        this.childrenGroupsIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'innerclass')) {
        // Ignored, not used for now.
      } else if (!this.wasElementProcessedByParent(element)) {
        console.error('group element:', Object.keys(element), 'not implemented yet')
      }
    }

    assert(this.title)
  }
}

// ----------------------------------------------------------------------------
*/
