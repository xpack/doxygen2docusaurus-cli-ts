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
// import assert from 'node:assert'

import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { DataModelBase } from './base-dm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'

// ----------------------------------------------------------------------------

export class Pages {
  membersById: Map<string, Page>
  mainPage: Page | undefined

  constructor (compoundDefs: CompoundDef[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'page') {
        const page = new Page(compoundDef)
        this.membersById.set(compoundDef.id, page)

        if (page.compoundDef.id === 'indexpage') {
          this.mainPage = page
        }
      }
    }
  }
}

export class Page extends DataModelBase {
  constructor (compoundDef: CompoundDef) {
    super(compoundDef)

    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel}`

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundDef.compoundName)
    this.relativePermalink = `pages/${sanitizedPath}`

    this.docusaurusId = `pages/${flattenPath(sanitizedPath)}`

    // console.log('1', this.compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
