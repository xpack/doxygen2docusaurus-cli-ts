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

export class Namespaces {
  membersById: Map<string, Namespace>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: Namespace): void {
    this.membersById.set(id, compound)
  }

  get (id: string): Namespace {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Namespaces.get(${id}) not found`)
  }

  createHierarchies (): void {
    console.log('Namespaces.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenNamespacesIds) {
        const childItem = this.get(childId)
        assert(childItem.parentNamespaceId.length === 0)
        childItem.parentNamespaceId = item.id
      }
    }

    for (const item of this.membersById.values()) {
      if (item.parentNamespaceId.length === 0) {
        console.log(item.id, item.name)
      }
    }
  }

  computePermalinks (): void {
    console.log('Namespaces.computePermalinks()...')
    for (const item of this.membersById.values()) {
      const name: string = item.name.replaceAll('::', '/')
      item.permalink = `namespaces/${name}`
      console.log('permalink: ', item.permalink)
    }
  }
}

export class Namespace extends Compound {
  parentNamespaceId: string = ''
  childrenNamespacesIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'innernamespace') === true) {
        this.childrenNamespacesIds.push((item as XmlInnerGroup)[':@']['@_refid'])
      } else if (!this.wasItemProcessedByParent(item)) {
        console.error('namespace element:', Object.keys(item), 'not implemented yet')
      }
    }
  }
}

// ----------------------------------------------------------------------------
