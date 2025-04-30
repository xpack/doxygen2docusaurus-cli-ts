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

import { Folders } from './folders-vm.js'
import { CompoundBase } from './compound-base-vm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class Files {
  membersById: Map<string, File>
  membersByPath: Map<String, File>
  topLevelFileIds: string[] = []
  folders: Folders

  constructor (compoundDefs: CompoundDefDataModel[], folders: Folders) {
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
        childFile.parentId = folderId
      }
    }

    for (const [fileId, file] of this.membersById) {
      if (file.parentId === undefined || file.parentId.length === 0) {
        this.topLevelFileIds.push(fileId)
      }
    }

    for (const file of this.membersById.values()) {
      const path = file.compoundDef.location?.file
      assert(path !== undefined)
      this.membersByPath.set(path, file)
      // console.log(path, file)
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [, file] of this.membersById) {
      let parentPath = ''
      if (file.parentId !== undefined && file.parentId.length > 0) {
        parentPath = this.folders.getRelativePathRecursively(file.parentId) + '/'
      }

      const sanitizedPath: string = sanitizeHierarchicalPath(`${parentPath}${file.compoundDef.compoundName as string}`)
      file.relativePermalink = `files/${sanitizedPath}`

      file.docusaurusId = `files/${flattenPath(sanitizedPath)}`

      // console.log('1', file.compoundDef.compoundName)
      // console.log('2', file.relativePermalink)
      // console.log('3', file.docusaurusId)
      // console.log('4', file.sidebarLabel)
      // console.log('5', file.indexName)
      // console.log()
    }
  }

  getRelativePathRecursively (fileId: string): string {
    const file = this.membersById.get(fileId)
    assert(file !== undefined)
    let parentPath = ''
    if (file.parentId !== undefined && file.parentId.length > 0) {
      parentPath = this.folders.getRelativePathRecursively(file.parentId) + '/'
    }
    const name: string = file.compoundDef.compoundName
    return `${parentPath}${name}`
  }
}

export class File extends CompoundBase {
  constructor (compoundDef: CompoundDefDataModel) {
    super(compoundDef)

    // The compoundName is the actual file name.
    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`

    // console.log('File.constructor', util.inspect(compoundDef))
  }
}

// ----------------------------------------------------------------------------
