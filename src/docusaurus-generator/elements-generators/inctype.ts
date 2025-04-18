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
import { AbstractIncType } from '../../doxygen-xml-parser/inctype.js'

// ----------------------------------------------------------------------------

export class IncType extends ElementGeneratorBase {
  renderMdx (element: AbstractIncType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    assert(element.refId !== undefined)
    const permalink = this.context.getCompoundPermalink(element.refId)
    assert(permalink !== undefined && permalink.length > 1)

    result += '<p class="doxyInclude"><code>#include '
    result += element.local ? '"' : '&lt;'
    result += `<Link to="${permalink}">`
    result += element.text
    result += '</Link>'
    result += element.local ? '"' : '&gt;'
    result += '</code></p>'

    return result
  }
}

// ----------------------------------------------------------------------------
