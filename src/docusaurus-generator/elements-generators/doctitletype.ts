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
import { AbstractDocTitleType, TitleDataModel } from '../../data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

export class DocTitleTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocTitleType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    if (element instanceof TitleDataModel) {
      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '<b>'
      result += this.context.renderElementsMdx(element.children)
      result += '</b>\n'
    }

    return result
  }
}

// ----------------------------------------------------------------------------
