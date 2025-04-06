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

import { CompoundDefType } from '../../doxygen-xml-parser/compounddef.js'
import { Folders } from './folders.js'

// ----------------------------------------------------------------------------

export class Files {
  membersById: Map<string, File>
  topLevelFileIds: string[] = []

  constructor (compoundDefs: CompoundDefType[], folders: Folders) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'file') {
        this.membersById.set(compoundDef.id, new File(compoundDef))
      }
    }

    // Recreate files hierarchies.
    // console.log(this.folders.membersById.size)
    for (const [folderId, folder] of folders.membersById) {
      for (const fileId of folder.childrenFileIds) {
        const childFile = this.membersById.get(fileId)
        assert(childFile !== undefined)
        // console.log('fileId', fileId,'has parent', id)
        childFile.parentFolderId = folderId
      }
    }

    for (const [fileId, file] of this.membersById) {
      if (file.parentFolderId.length === 0) {
        this.topLevelFileIds.push(fileId)
      }
    }
  }
}

export class File {
  compoundDef: CompoundDefType
  parentFolderId: string = ''

  constructor (compoundDef: CompoundDefType) {
    // console.log('File.constructor', util.inspect(compoundDef))
    this.compoundDef = compoundDef
  }
}

// ----------------------------------------------------------------------------
