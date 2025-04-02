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
// import * as util from 'node:util'

import assert from 'node:assert'
import type { XmlCompoundDefElement } from '../xml-parser/compound-xsd-types.js'
import { CompoundBase } from './CompoundBase.js'
import { xml } from '../xml-parser/parse.js'

// ----------------------------------------------------------------------------

export class Folders {
  membersById: Map<string, Folder>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: Folder): void {
    this.membersById.set(id, compound)
  }

  get (id: string): Folder {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Folders.get(${id}) not found`)
  }

  createHierarchies (): void {
    // console.log('Folders.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenFoldersIds) {
        const childItem = this.get(childId)
        assert(childItem.parentFolderId.length === 0)
        childItem.parentFolderId = item.id
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentFolderId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Folders.computePermalinks()...')
    for (const item of this.membersById.values()) {
      item.permalink = `folders/${this.getPermalink(item)}`
      console.log('-', item.permalink)
    }
  }

  getPermalink (item: Folder): string {
    let parentPermalink = ''
    if (item.parentFolderId.length > 0) {
      parentPermalink = this.getPermalink(this.get(item.parentFolderId)) + '/'
    }
    const name: string = item.compoundName.replaceAll('.', '-')
    return parentPermalink + name
  }
}

export class Folder extends CompoundBase {
  parentFolderId: string = ''
  childrenFoldersIds: string[] = []
  childrenFilesIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (xml.hasInnerElement(element, 'innerdir')) {
        this.childrenFoldersIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'innerfile')) {
        this.childrenFilesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'location')) {
        // Ignored, not used for now.
      } else if (!this.wasElementProcessedByParent(element)) {
        console.error('folders element:', Object.keys(element), 'not implemented yet')
      }
    }
  }
}

// ----------------------------------------------------------------------------

*/
