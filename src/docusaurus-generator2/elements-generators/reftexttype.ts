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

import { ElementTextRendererBase } from './element-renderer-base.js'
import { AbstractRefTextType } from '../../data-model/compounds/reftexttype-dm.js'
import { escapeMdx } from '../../docusaurus-generator/utils.js'

// ----------------------------------------------------------------------------

export class RefTextTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractRefTextType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined) {
      console.error(element.elementName, 'attribute external not yet rendered in', this.constructor.name)
    }
    if (element.tooltip !== undefined) {
      console.error(element.elementName, 'attribute tooltip not yet rendered in', this.constructor.name)
    }

    let text: string = ''

    const permalink: string = this.workspace.getPermalink({
      refid: element.refid,
      kindref: element.kindref
    })

    assert(permalink !== undefined && permalink.length > 1)

    text += `<Link to="${permalink}">${escapeMdx(element.text.trim())}</Link>`

    return text
  }
}

// ----------------------------------------------------------------------------
