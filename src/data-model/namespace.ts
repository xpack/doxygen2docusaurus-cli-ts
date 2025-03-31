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
import type { XmlCompoundDefElement } from '../xml-parser/compound-xsd-types.js'
import { Compound } from './compound.js'
import { xml } from '../xml-parser/parse.js'

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
    // console.log('Namespaces.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.innerNamespacesIds) {
        const childItem = this.get(childId)
        assert(childItem.parentNamespaceId.length === 0)
        childItem.parentNamespaceId = item.id
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentNamespaceId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Namespaces.computePermalinks()...')
    for (const item of this.membersById.values()) {
      const name: string = item.name.replaceAll('::', '/')
      item.permalink = `namespaces/${name}`
      console.log('-', item.permalink)
    }
  }
}

export class Namespace extends Compound {
  parentNamespaceId: string = ''
  innerNamespacesIds: string[] = []
  innerClassesIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (xml.hasInnerElement(element, 'innernamespace')) {
        this.innerNamespacesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'innerclass')) {
        this.innerClassesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'location')) {
        // Ignored, not used for now.
      } else if (!this.wasItemProcessedByParent(element)) {
        console.error('namespace element:', Object.keys(element), 'not implemented yet')
      }
    }
    // console.log(util.inspect(this.innerClassesIds))
  }
}

// ----------------------------------------------------------------------------
