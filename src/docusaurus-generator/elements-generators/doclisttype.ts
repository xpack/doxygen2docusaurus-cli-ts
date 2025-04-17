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
import { AbstractDocListType } from '../../doxygen-xml-parser/descriptiontype.js'

// ----------------------------------------------------------------------------

export class DocListType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocListType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    result += '\n'
    result += '<ul>\n'
    for (const listItem of element.listItems) {
      if (listItem.paras !== undefined) {
        result += '<li>'
        result += this.context.renderElementsMdx(listItem.paras).trim()
        result += '</li>\n'
      }
    }
    result += '</ul>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
