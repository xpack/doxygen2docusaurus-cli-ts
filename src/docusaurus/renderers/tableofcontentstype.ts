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

/**
 * Renderer for Doxygen table of contents list elements.
 *
 * @remarks
 * Generates HTML unordered list structure for table of contents entries
 * with anchor links. Creates navigation aids for structured document
 * browsing and section jumping functionality.
 *
 * @public
 */
export class TocListLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a table of contents list to formatted output lines.
   *
   * @remarks
   * Creates an HTML unordered list with anchor links for each table of
   * contents item. Generates permalink anchors and processes content
   * for navigation list presentation.
   *
   * @param element - The table of contents list element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns Array of HTML strings forming the navigation list
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
