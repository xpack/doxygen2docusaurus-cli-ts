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

import { CompoundDefType } from '../../doxygen-xml-parser/compounddef.js'

// ----------------------------------------------------------------------------

export class Folders {
  membersById: Map<string, Folder>

  constructor (compoundDefs: CompoundDefType[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'dir') {
        this.membersById.set(compoundDef.id, new Folder(compoundDef))
      }
    }

    // Recreate folders hierarchies.
    // console.log(this.folders.membersById.size)
    for (const [id, folder] of this.membersById) {
      for (const folderId of folder.childrenFoldersIds) {
        const folder = this.membersById.get(folderId)
        assert(folder !== undefined)
        // console.log('folderId', folderId,'has parent', id)
        folder.parentFolderId = id
      }
    }

    // console.log('Folders.membersById.size', this.membersById.size)
  }

  getPathRecursive (folderId: string): string {
    const folder = this.membersById.get(folderId)
    assert(folder !== undefined)
    let parentPath = ''
    if (folder.parentFolderId.length > 0) {
      parentPath = this.getPathRecursive(folder.parentFolderId) + '/'
    }
    const name: string = folder.compoundDef.compoundName
    return parentPath + name
  }
}

export class Folder {
  compoundDef: CompoundDefType
  parentFolderId: string = ''
  childrenFoldersIds: string[] = []
  childrenFilesIds: string[] = []
  permalink: string = ''

  constructor (compoundDef: CompoundDefType) {
    this.compoundDef = compoundDef

    if (compoundDef.innerDirs !== undefined) {
      for (const ref of compoundDef.innerDirs) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenFoldersIds.push(ref.refid)
      }
    }
    if (compoundDef.innerFiles !== undefined) {
      for (const ref of compoundDef.innerFiles) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenFilesIds.push(ref.refid)
      }
    }
  }
}

// ----------------------------------------------------------------------------
