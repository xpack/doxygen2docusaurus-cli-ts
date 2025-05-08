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

import { ElementLinesRendererBase } from './element-renderer-base.js'
import { AbstractRefType } from '../../data-model/compounds/reftype-dm.js'
import { escapeMdx } from '../../docusaurus-generator/utils.js'

// ----------------------------------------------------------------------------

export class RefTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractRefType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.prot !== undefined) {
      console.error(element.elementName, 'attribute prot not yet rendered in', this.constructor.name)
    }
    if (element.inline !== undefined) {
      console.error(element.elementName, 'attribute inline not yet rendered in', this.constructor.name)
    }

    const lines: string[] = []

    const permalink = this.workspace.getPagePermalink(element.refid)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push(`<Link to="${permalink}">${escapeMdx(element.text)}</Link>`) // trim?

    return lines
  }
}

// ----------------------------------------------------------------------------
