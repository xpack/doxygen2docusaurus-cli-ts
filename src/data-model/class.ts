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

export class Classes {
  membersById: Map<string, Class>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: Class): void {
    this.membersById.set(id, compound)
  }

  get (id: string): Class {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Classes.get(${id}) not found`)
  }

  createHierarchies (): void {
    console.log('Classes.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenDerivedIds) {
        const childItem = this.get(childId)
        assert(childItem.parentId.length === 0)
        childItem.parentId = item.id
      }
    }

    for (const item of this.membersById.values()) {
      if (item.parentId.length === 0) {
        console.log(item.id, item.name)
      }
    }
  }

  computePermalinks (): void {
    console.log('Classes.computePermalinks()...')
    for (const item of this.membersById.values()) {
      const name: string = item.name.replaceAll('::', '/')
      item.permalink = `classes/${name}`
      console.log('permalink: ', item.permalink)
    }
  }
}

export class Class extends Compound {
  parentId: string = ''
  childrenDerivedIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'derivedcompoundref') === true) {
        this.childrenDerivedIds.push((item as XmlInnerGroup)[':@']['@_refid'])
      }
    }
  }
}

// ----------------------------------------------------------------------------
