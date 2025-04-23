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

import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { Folders } from './folders.js'

// ----------------------------------------------------------------------------

export class Files {
  membersById: Map<string, File>
  membersByPath: Map<String, File>
  topLevelFileIds: string[] = []
  folders: Folders

  constructor (compoundDefs: CompoundDef[], folders: Folders) {
    this.membersById = new Map()
    this.membersByPath = new Map()

    this.folders = folders

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'file') {
        this.membersById.set(compoundDef.id, new File(compoundDef))
      }
    }

    // Recreate files hierarchies.
    // console.log(this.folders.membersById.size)
    for (const [folderId, folder] of folders.membersById) {
      for (const childFileId of folder.childrenFileIds) {
        const childFile = this.membersById.get(childFileId)
        assert(childFile !== undefined)
        // console.log('fileId', childFileId, 'has parent', folderId)
        childFile.parentFolderId = folderId
      }
    }

    for (const [fileId, file] of this.membersById) {
      if (file.parentFolderId === undefined || file.parentFolderId.length === 0) {
        this.topLevelFileIds.push(fileId)
      }
    }

    for (const file of this.membersById.values()) {
      const path = file.compoundDef.location?.file
      assert(path !== undefined)
      this.membersByPath.set(path, file)
      // console.log(path, file)
    }
  }

  getRelativePathRecursively (fileId: string): string {
    const file = this.membersById.get(fileId)
    assert(file !== undefined)
    let parentPath = ''
    if (file.parentFolderId !== undefined && file.parentFolderId.length > 0) {
      parentPath = this.folders.getRelativePathRecursively(file.parentFolderId) + '/'
    }
    const name: string = file.compoundDef.compoundName
    return `${parentPath}${name}`
  }
}

export class File {
  compoundDef: CompoundDef
  parentFolderId?: string | undefined

  constructor (compoundDef: CompoundDef) {
    // console.log('File.constructor', util.inspect(compoundDef))
    this.compoundDef = compoundDef
  }
}

// ----------------------------------------------------------------------------
