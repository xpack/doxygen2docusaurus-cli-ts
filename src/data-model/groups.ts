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

// import * as util from 'node:util'

import assert from 'node:assert'
import type { XmlCompoundDef, XmlTitle, XmlInnerGroup } from '../xml-parser/types.js'
import { Compound } from './compound.js'

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
      item.permalink = `topics/${(item as Group).name}`
      console.log('-', item.permalink)
    }
  }
}

export class Group extends Compound {
  title: string = ''
  parentGroupId: string = ''
  childrenGroupsIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'title') === true) {
        this.title = (item as XmlTitle).title[0]['#text']
      } else if (Object.hasOwn(item, 'innergroup') === true) {
        this.childrenGroupsIds.push((item as XmlInnerGroup)[':@']['@_refid'])
      } else if (Object.hasOwn(item, 'innerclass') === true) {
        // Ignored, not used for now.
      } else if (!this.wasItemProcessedByParent(item)) {
        console.error('class element:', Object.keys(item), 'not implemented yet')
      }
    }

    assert(this.title)
  }
}

// ----------------------------------------------------------------------------
