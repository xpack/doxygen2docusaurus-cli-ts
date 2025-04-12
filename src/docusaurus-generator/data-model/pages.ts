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

import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'

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

export class Page {
  compoundDef: CompoundDef

  constructor (compoundDef: CompoundDef) {
    // console.log('Page.constructor', util.inspect(compoundDef))
    this.compoundDef = compoundDef
  }
}

// ----------------------------------------------------------------------------
