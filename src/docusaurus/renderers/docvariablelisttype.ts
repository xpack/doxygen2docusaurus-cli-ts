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
import type {
  AbstractDocVariableListType,
  VariableListPairDataModel,
} from '../../doxygen/data-model/compounds/docvarlistentrytype-dm.js'

// ----------------------------------------------------------------------------

/**
 * Renderer for Doxygen variable list container elements.
 *
 * @remarks
 * Creates HTML definition list structure for variable lists containing
 * term-description pairs. Provides the outer container for organised
 * presentation of variable documentation.
 *
 * @public
 */
export class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a variable list container to formatted output lines.
   *
   * @remarks
   * Creates an HTML definition list wrapper around variable list entries.
   * Each child element represents a term-description pair within the
   * structured list format.
   *
   * @param element - The variable list container element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns Array of HTML strings forming the definition list structure
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderToLines(element: AbstractDocVariableListType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('')
    lines.push('<dl class="doxyVariableList">')
    lines.push(
      ...this.workspace.renderElementsArrayToLines(element.children, 'html')
    )
    lines.push('</dl>')

    return lines
  }
}

/**
 * Renderer for individual variable list entry pairs.
 *
 * @remarks
 * Converts term-description pairs into HTML definition list items.
 * Handles both single-line and multi-line descriptions with appropriate
 * formatting for readable documentation output.
 *
 * @public
 */
export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a variable list entry pair to formatted output lines.
   *
   * @remarks
   * Creates HTML definition term and description elements from the
   * variable list entry. Handles multi-line descriptions by splitting
   * content across multiple lines within the definition element.
   *
   * @param element - The variable list pair element to render
   * @param type - The rendering context type (unused in implementation)
   * @returns Array of HTML strings for the term-description pair
   */
  override renderToLines(
    element: VariableListPairDataModel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: string
  ): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    // console.log(element.varlistentry.term)
    // console.log(element.listitem.paras)

    // WARNING: the title includes <b></b>
    const title = this.workspace
      .renderElementToString(element.varlistentry.term, 'html')
      .trim()

    // this.workspace.skipElementsPara(element.listitem.paras)
    const description = this.workspace
      .renderElementsArrayToString(element.listitem.paras, 'html')
      .trim()

    lines.push(`<dt>${title}</dt>`)
    if (!description.includes('\n')) {
      lines.push(`<dd>${description}</dd>`)
    } else {
      lines.push('<dd>')
      lines.push(...description.split('\n'))
      lines.push('</dd>')
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
