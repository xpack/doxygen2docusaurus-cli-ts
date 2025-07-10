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

// import assert from 'node:assert'
// import * as util from 'node:util'

import { ElementLinesRendererBase } from './element-renderer-base.js'
import type { AbstractDocTocListType } from '../../doxygen/data-model/compounds/tableofcontentstype-dm.js'
import { getPermalinkAnchor } from '../utils.js'

// ----------------------------------------------------------------------------

export class TocListLinesRenderer extends ElementLinesRendererBase {
  renderToLines(element: AbstractDocTocListType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('')
    lines.push('')
    lines.push('<ul class="doxyTocList">')
    if (element.tocItems !== undefined) {
      for (const tocItem of element.tocItems) {
        const permalink = getPermalinkAnchor(tocItem.id)
        const content = this.workspace
          .renderElementsArrayToString(tocItem.children, 'html')
          .trim()
        lines.push(
          '<li>' +
            `<a class="doxyTocListItem" href="#${permalink}">${content}</a>` +
            '</li>'
        )
      }
    }
    lines.push('</ul>')

    return lines
  }
}

// ----------------------------------------------------------------------------
