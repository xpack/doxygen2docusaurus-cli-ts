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
import type { XmlCompoundDef, XmlInnerGroup } from '../xml-parser/types.js'
import { Compound } from './compound.js'

// ----------------------------------------------------------------------------

export class Groups {
  membersById: Map<string, Group>

  constructor() {
    this.membersById = new Map()
  }

  add(id: string, compound: Group): void {
    this.membersById.set(id, compound)
  }

  get(id: string): Group {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Groups.get(${id}) not found`)
  }

  createHierarchies(): void {
    console.log('groups createHierarchies()...')

    for (const group of this.membersById.values()) {
      for (const innerGroupId of group.innerGroupIds) {
        const innerGroup = this.get(innerGroupId)
        assert(innerGroup.parentId.length === 0)
        innerGroup.parentId = group.id
      }
    }

    for (const group of this.membersById.values()) {
      if (group.parentId.length === 0) {
        console.log(group.id, group.name, group.title)
      }
    }
  }

  computePermalinks(): void {
    console.log('groups computePermalinks()...')
    for (const group of this.membersById.values()) {
      group.permalink = `groups/${(group as Group).name}`
    }
  }

  postProcess(): void {
    console.log('groups postProcess()...')
  }
}

export class Group extends Compound {
  parentId: string = ''
  innerGroupIds: string[] = []
  permalink: string = ''

  constructor(xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (item.hasOwnProperty('innergroup')) {
        this.innerGroupIds.push((item as XmlInnerGroup)[':@']['@_refid'])
      }
    }
  }
}

// ----------------------------------------------------------------------------
