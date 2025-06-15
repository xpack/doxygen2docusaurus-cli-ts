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

import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js'
import { AbstractDocEntryType, AbstractDocRowType, AbstractDocTableType } from '../../data-model/compounds/descriptiontype-dm.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocTableType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('<table class="markdownTable">')
    lines.push(...this.workspace.renderElementsArrayToLines(element.rows))
    lines.push('</table>')

    return lines
  }
}

export class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: AbstractDocRowType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('  <tr class="markdownTableRow">')
    lines.push(...this.workspace.renderElementsArrayToLines(element.entries))
    lines.push('  </tr>')

    return lines
  }
}

export class DocEntryTypeStringRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocEntryType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''

    const entry = escapeHtml(this.workspace.renderElementsArrayToString(element.paras).trim())
    if (element.thead) {
      text += `    <th class="markdownTableColumn">${entry}</th>`
    } else {
      text += `    <td class="markdownTableColumn">${entry}</td>`
    }
    return text
  }
}

// ----------------------------------------------------------------------------
