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
import { Compound, Includes } from './compound.js'
import { Folders } from './folders.js'

import type { XmlCompoundDef, XmlIncludes, XmlInnerClass, XmlInnerNamespace, XmlProgramListing } from '../xml-parser/types.js'

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
    // console.log('Files.createHierarchies()...')

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

    // for (const item of this.membersById.values()) {
    //   if (item.parentFolderId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Files.computePermalinks()...')
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
      console.log('-', item.permalink)
    }
  }
}

export class File extends Compound {
  parentFolderId: string = ''
  permalink: string = ''
  includes: Includes[] = []
  programlisting: string = ''
  innerNamespacesIds: string[] = []
  innerClassesIds: string[] = []

  constructor (xmlCompoundDef: XmlCompoundDef) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'includes') === true) {
        // console.log(util.inspect(item))
        this.includes.push(this.parseIncludes(item as XmlIncludes))
      } else if (Object.hasOwn(item, 'programlisting') === true) {
        // console.log(util.inspect(item))
        this.programlisting = this.parseProgramListing(item as XmlProgramListing)
        // console.log('listing:', this.programlisting)
      } else if (Object.hasOwn(item, 'innernamespace') === true) {
        this.innerNamespacesIds.push((item as XmlInnerNamespace)[':@']['@_refid'])
      } else if (Object.hasOwn(item, 'innerclass') === true) {
        this.innerClassesIds.push((item as XmlInnerClass)[':@']['@_refid'])
      } else if (Object.hasOwn(item, 'location') === true) {
        // Ignored, not used for now.
      } else if (Object.hasOwn(item, 'incdepgraph') === true) {
        // Ignored, not used for now.
      } else if (Object.hasOwn(item, 'invincdepgraph') === true) {
        // Ignored, not used for now.
      } else if (Object.hasOwn(item, 'includedby') === true) {
        // Ignored, not used for now. (perhaps re-evaluate later).
      } else if (!this.wasItemProcessedByParent(item)) {
        console.error('files element:', Object.keys(item), 'not implemented yet')
      }
    }
    // console.log(util.inspect(this.innerNamespacesIds))
    // console.log(util.inspect(this.innerClassesIds))
  }
}

// ----------------------------------------------------------------------------
