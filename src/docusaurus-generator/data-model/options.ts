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
import { AbstractDoxygenFileOptionType } from '../../doxygen-xml-parser/doxyfileoptiontype.js'

// ----------------------------------------------------------------------------

export class DoxygenFileOptions {
  membersById: Map<string, AbstractDoxygenFileOptionType>

  constructor (options: AbstractDoxygenFileOptionType[] | undefined) {
    this.membersById = new Map()

    assert(options !== undefined)
    for (const option of options) {
      this.membersById.set(option.id, option)
    }
  }

  getOptionStringValue (optionId: string): string {
    const option = this.membersById.get(optionId)
    assert(option !== undefined)
    assert(option.values !== undefined)
    assert(option.values.length === 1)
    assert(typeof option.values[0] === 'string')
    return option.values[0]
  }

  getOptionCdataValue (optionId: string): string {
    const option = this.membersById.get(optionId)
    assert(option !== undefined)
    assert(option.values !== undefined)
    assert(option.values.length === 1)
    assert(typeof option.values[0] === 'string')
    return option.values[0].replace(/^"/, '').replace(/"$/, '')
  }
}

// ----------------------------------------------------------------------------
