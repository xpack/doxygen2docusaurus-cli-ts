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

import { CompoundDefType } from '../doxygen-xml-parser/compounddef.js'

// ----------------------------------------------------------------------------

export class Files {
  membersById: Map<string, File>

  constructor (compoundDefs: CompoundDefType[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'file') {
        this.membersById.set(compoundDef.id, new File(compoundDef))
      }
    }
    // console.log('Files.membersById.size', this.membersById.size)
  }
}

export class File {
  compoundDef: CompoundDefType
  parentFolderId: string = ''
  permalink: string = ''

  constructor (compoundDef: CompoundDefType) {
    this.compoundDef = compoundDef
  }
}

// ----------------------------------------------------------------------------
