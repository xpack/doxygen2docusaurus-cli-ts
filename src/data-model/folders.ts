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
import type { XmlCompoundDef, XmlInnerDir, XmlInnerFile } from '../xml-parser/types.js'
import { Compound } from './compound.js'

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
    console.log('Folders.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenFoldersIds) {
        const childItem = this.get(childId)
        assert(childItem.parentFolderId.length === 0)
        childItem.parentFolderId = item.id
      }
    }

    for (const item of this.membersById.values()) {
      if (item.parentFolderId.length === 0) {
        console.log(item.id, item.name)
      }
    }
  }

  computePermalinks (): void {
    console.log('Folders.computePermalinks()...')
    for (const item of this.membersById.values()) {
      item.permalink = `folders/${this.getPermalink(item)}`
      console.log('permalink: ', item.permalink)
    }
  }

  getPermalink (item: Folder): string {
    let parentPermalink = ''
    if (item.parentFolderId.length > 0) {
      parentPermalink = this.getPermalink(this.get(item.parentFolderId)) + '/'
    }
    const name: string = item.name.replaceAll('.', '-')
    return parentPermalink + name
  }
}

export class Folder extends Compound {
  parentFolderId: string = ''
  childrenFoldersIds: string[] = []
  childrenFilesIds: string[] = []
  permalink: string = ''

  constructor (xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'innerdir') === true) {
        this.childrenFoldersIds.push((item as XmlInnerDir)[':@']['@_refid'])
      } else if (Object.hasOwn(item, 'innerfile') === true) {
        this.childrenFilesIds.push((item as XmlInnerFile)[':@']['@_refid'])
      } else if (!this.wasItemProcessedByParent(item)) {
        console.error('folders element:', Object.keys(item), 'not implemented yet')
      }
    }
  }
}

// ----------------------------------------------------------------------------
