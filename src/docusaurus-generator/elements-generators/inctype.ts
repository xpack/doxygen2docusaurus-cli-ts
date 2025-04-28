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

import assert from 'assert'
import * as util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractIncType } from '../../data-model/compounds/inctype-dm.js'

// ----------------------------------------------------------------------------

export class IncTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractIncType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    let permalink: string = ''
    if (element.refId !== undefined) {
      permalink = this.context.getPagePermalink(element.refId)
      assert(permalink !== undefined && permalink.length > 1)
    }

    result += `<IncludesListItem filePath="${element.text}" permalink="${permalink}" isLocal="${element.local.toString()}" />\n`

    return result
  }
}

// ----------------------------------------------------------------------------
