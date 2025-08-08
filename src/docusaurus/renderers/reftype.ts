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
import type { AbstractRefType } from '../../doxygen/data-model/compounds/reftype-dm.js'

// ----------------------------------------------------------------------------

/**
 * Renderer for reference type elements in documentation cross-references.
 *
 * @remarks
 * Handles the rendering of reference elements that link to other documented
 * entities, creating appropriate hyperlinks with permalinks when targets
 * are available. Used for cross-referencing between documentation elements.
 *
 * @public
 */
export class RefTypeLinesRenderer extends ElementLinesRendererBase {
  /**
   * Renders a reference element to formatted output lines.
   *
   * @remarks
   * Converts Doxygen reference elements into HTML anchor tags with
   * appropriate permalinks to the referenced entities. Falls back to
   * plain text when no permalink is available for the target.
   *
   * @param element - The reference element to render
   * @param type - The rendering context type
   * @returns Array of formatted output lines
   */
  override renderToLines(element: AbstractRefType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.prot !== undefined) {
      console.error(
        element.elementName,
        'attribute prot not yet rendered in',
        this.constructor.name
      )
    }
    if (element.inline !== undefined) {
      console.error(
        element.elementName,
        'attribute inline not yet rendered in',
        this.constructor.name
      )
    }

    const lines: string[] = []

    const content = this.workspace.renderString(element.text.trim(), type)
    const permalink = this.workspace.getPagePermalink(element.refid)
    if (permalink !== undefined && permalink.length > 0) {
      lines.push(`<a href="${permalink}">${content}</a>`)
    } else {
      lines.push(content)
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
