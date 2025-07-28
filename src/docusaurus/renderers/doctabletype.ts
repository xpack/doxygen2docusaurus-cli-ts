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

import {
  ElementLinesRendererBase,
  ElementStringRendererBase,
} from './element-renderer-base.js'
import type {
  AbstractDocCaptionType,
  AbstractDocEntryType,
  AbstractDocRowType,
  AbstractDocTableType,
} from '../../doxygen/data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

export class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
  override renderToLines(
    element: AbstractDocTableType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: string
  ): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('')
    lines.push('<table class="doxyTable">')
    if (element.caption !== undefined) {
      lines.push(this.workspace.renderElementToString(element.caption, 'html'))
    }
    lines.push(
      ...this.workspace.renderElementsArrayToLines(element.rows, 'html')
    )
    lines.push('</table>')

    return lines
  }
}

export class DocCaptionLinesRenderer extends ElementLinesRendererBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderToLines(element: AbstractDocCaptionType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    let attributes = ''
    if (element.id.length > 0) {
      attributes += ` id="${element.id}"`
    }
    text += `<caption${attributes}>`
    text += this.workspace
      .renderElementsArrayToString(element.children, 'html')
      .trim()
    text += '</caption>'

    return [text]
  }
}

export class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(element: AbstractDocRowType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('<tr>')
    lines.push(
      ...this.workspace.renderElementsArrayToLines(element.entries, 'html')
    )
    lines.push('</tr>')

    return lines
  }
}

export class DocEntryTypeStringRenderer extends ElementStringRendererBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderToString(element: AbstractDocEntryType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    let attributes = ''
    if (element.colspan !== undefined) {
      attributes += ` colspan="${element.colspan.toString()}"`
    }
    if (element.rowspan !== undefined) {
      attributes += ` rowspan="${element.rowspan.toString()}"`
    }
    if (element.align !== undefined) {
      attributes += ` align="${element.align}"`
    }
    if (element.valign !== undefined) {
      attributes += ` valign="${element.valign}"`
    }
    if (element.width !== undefined) {
      attributes += ` width="${element.width}"`
    }
    if (element.classs !== undefined) {
      attributes += ` class="${element.classs}"`
    }

    this.workspace.skipElementsPara(element.paras)
    const entry = this.workspace
      .renderElementsArrayToString(element.paras, 'html')
      .trim()
    if (element.thead) {
      text += `<th${attributes}>${entry}</th>`
    } else {
      text += `<td${attributes}>${entry}</td>`
    }
    return text
  }
}

// ----------------------------------------------------------------------------
