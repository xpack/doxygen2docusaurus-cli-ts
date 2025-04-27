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

import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { DataModelBase } from './base-dm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'

// ----------------------------------------------------------------------------

export class Folders {
  membersById: Map<string, Folder>
  topLevelFolderIds: string[] = []

  constructor (compoundDefs: CompoundDef[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'dir') {
        this.membersById.set(compoundDef.id, new Folder(compoundDef))
      }
    }

    // Recreate folders hierarchies.
    // console.log(this.folders.membersById.size)
    for (const [folderId, folder] of this.membersById) {
      for (const childFolderId of folder.childrenIds) {
        const childFolder = this.membersById.get(childFolderId)
        assert(childFolder !== undefined)
        // console.log('folderId', childFolderId, 'has parent', folderId)
        childFolder.parentId = folderId
      }
    }

    for (const [folderId, folder] of this.membersById) {
      if (folder.parentId === undefined || folder.parentId.length === 0) {
        this.topLevelFolderIds.push(folderId)
      }
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [, folder] of this.membersById) {
      let parentPath = ''
      if (folder.parentId !== undefined && folder.parentId.length > 0) {
        parentPath = `${this.getRelativePathRecursively(folder.parentId)}/`
      }

      const sanitizedPath: string = sanitizeHierarchicalPath(`${parentPath}${folder.compoundDef.compoundName as string}`)
      folder.relativePermalink = `folders/${sanitizedPath}`

      folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`

      // console.log('1', folder.compoundDef.compoundName)
      // console.log('2', folder.relativePermalink)
      // console.log('3', folder.docusaurusId)
      // console.log('4', folder.sidebarLabel)
      // console.log('5', folder.indexName)
      // console.log()
    }
  }

  getRelativePathRecursively (folderId: string): string {
    const folder = this.membersById.get(folderId)
    assert(folder !== undefined)
    let parentPath = ''
    if (folder.parentId !== undefined && folder.parentId.length > 0) {
      parentPath = this.getRelativePathRecursively(folder.parentId) + '/'
    }
    const name: string = folder.compoundDef.compoundName
    return `${parentPath}${name}`
  }
}

export class Folder extends DataModelBase {
  childrenFileIds: string[] = []

  constructor (compoundDef: CompoundDef) {
    super(compoundDef)

    // console.log('Folder.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerDirs)) {
      for (const ref of compoundDef.innerDirs) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    if (Array.isArray(compoundDef.innerFiles)) {
      for (const ref of compoundDef.innerFiles) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenFileIds.push(ref.refid)
      }
    }

    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel} Folder Reference`
  }
}

// ----------------------------------------------------------------------------
