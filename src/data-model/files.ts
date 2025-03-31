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

import type { XmlCompoundDefElement, XmlIncludesElement, XmlProgramListingElement } from '../xml-parser/compound-xsd-types.js'
import { xml } from '../xml-parser/parse.js'

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

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore top texts.
      } else if (xml.hasInnerElement(element, 'includes')) {
        // console.log(util.inspect(item))
        this.includes.push(this.parseIncludes(element as XmlIncludesElement))
      } else if (xml.hasInnerElement(element, 'programlisting')) {
        // console.log(util.inspect(item))
        this.programlisting = this.parseProgramListing(element as XmlProgramListingElement)
        // console.log('listing:', this.programlisting)
      } else if (xml.hasInnerElement(element, 'innernamespace')) {
        this.innerNamespacesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'innerclass')) {
        this.innerClassesIds.push(xml.getAttributeStringValue(element, '@_refid'))
      } else if (xml.hasInnerElement(element, 'location')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'incdepgraph')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'invincdepgraph')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'includedby')) {
        // Ignored, not used for now. (perhaps re-evaluate later).
      } else if (!this.wasItemProcessedByParent(element)) {
        console.error('files element:', Object.keys(element), 'not implemented yet')
      }
    }
    // console.log(util.inspect(this.innerNamespacesIds))
    // console.log(util.inspect(this.innerClassesIds))
  }
}

// ----------------------------------------------------------------------------
