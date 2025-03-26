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
import { Compound } from './compound.js'
import { Folders } from './folders.js'

// ----------------------------------------------------------------------------

export class Files {
  folders: Folders
  membersById: Map<string, File>

  constructor (folders: Folders) {
    this.folders = folders

    this.membersById = new Map()
  }

  add (id: string, compound: File): void {
    this.membersById.set(id, compound)
  }

  get (id: string): File {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Files.get(${id}) not found`)
  }

  createHierarchies (): void {
    console.log('Files.createHierarchies()...')

    for (const itemFolder of this.folders.membersById.values()) {
      // console.log(itemFolder)
      for (const childFileId of itemFolder.childrenFilesIds) {
        // console.log(childFileId)
        const childFileItem = this.get(childFileId)
        assert(childFileItem.parentFolderId.length === 0)
        childFileItem.parentFolderId = itemFolder.id
        // console.log(childFileItem)
      }
    }
    for (const item of this.membersById.values()) {
      if (item.parentFolderId.length === 0) {
        console.log(item.id, item.name)
      }
    }
  }

  computePermalinks (): void {
    console.log('Files.computePermalinks()...')
    for (const item of this.membersById.values()) {
      if (item.parentFolderId.length > 0) {
        const itemFolder = this.folders.get(item.parentFolderId)
        const folderPermalink: string = this.folders.getPermalink(itemFolder)
        const name: string = item.name.replaceAll('.', '-')
        item.permalink = `files/${folderPermalink}/${name}`
      } else {
        const name: string = item.name.replaceAll('.', '-')
        item.permalink = `files/${name}`
      }
      console.log('permalink: ', item.permalink)
    }
  }
}

export class File extends Compound {
  parentFolderId: string = ''
  permalink: string = ''

  // constructor (xmlCompoundDef: XmlCompoundDef) {
  //   super(xmlCompoundDef)
  // }
}

// ----------------------------------------------------------------------------
