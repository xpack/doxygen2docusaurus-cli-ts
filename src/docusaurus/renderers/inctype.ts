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
import type { AbstractIncType } from '../../doxygen/data-model/compounds/inctype-dm.js'

// ----------------------------------------------------------------------------

/**
 * Renderer for include directive elements in documentation.
 *
 * @remarks
 * Handles the rendering of #include statements found in source code,
 * converting them to appropriate HTML output with proper link generation
 * when the included file is documented.
 *
 * @public
 */
export class IncTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders an include element to formatted output lines.
   *
   * @remarks
   * Converts Doxygen include elements into HTML format with appropriate
   * angle brackets or quotes, and creates links to documented files
   * when available. Handles both local includes (quotes) and system
   * includes (angle brackets).
   *
   * @param element - The include element to render
   * @param type - The rendering context type
   * @returns Array of formatted output lines
   */
  override renderToLines(element: AbstractIncType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    let permalink: string | undefined = ''
    if (element.refId !== undefined) {
      permalink = this.workspace.getPagePermalink(element.refId)
      // May be undefined.
    }

    const content = this.workspace.renderString(element.text.trim(), type)
    let text = ''
    text += '#include '
    text += element.local ? '"' : '&lt;'
    if (permalink !== undefined && permalink.length > 0) {
      text += `<a href="${permalink}">${content}</a>`
    } else {
      text += content
    }
    text += element.local ? '"' : '&gt;'
    // text += '</code>'

    lines.push(text)

    return lines
  }
}

// ----------------------------------------------------------------------------
