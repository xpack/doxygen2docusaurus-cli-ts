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

import assert from 'node:assert'
// import * as util from 'node:util'

import { ElementStringRendererBase } from './element-renderer-base.js'
import {
  type AbstractReferenceType,
  ReferenceDataModel,
  ReferencedByDataModel,
} from '../../doxygen/data-model/compounds/referencetype-dm.js'
import { sanitizeAnonymousNamespace } from '../utils.js'

// ----------------------------------------------------------------------------

/**
 * Renderer for reference elements in documentation cross-references.
 *
 * @remarks
 * Handles the rendering of cross-reference elements that link to other
 * documented members, creating appropriate hyperlinks with proper
 * permalinks for navigation within the documentation.
 *
 * @public
 */
export class ReferenceTypeStringRenderer extends ElementStringRendererBase {
  /**
   * Renders a reference element to a formatted string with hyperlinks.
   *
   * @remarks
   * Converts Doxygen reference elements into HTML anchor tags with
   * appropriate permalinks to the referenced members. Handles both
   * forward references and reverse references whilst sanitising
   * anonymous namespace names for display.
   *
   * @param element - The reference element to render
   * @param type - The rendering context type
   * @returns Formatted HTML string with hyperlink
   */
  renderToString(element: AbstractReferenceType, type: string): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''

    if (
      element instanceof ReferencedByDataModel ||
      element instanceof ReferenceDataModel
    ) {
      const memberPermalink = this.workspace.getPermalink({
        refid: element.refid,
        kindref: 'member',
      })
      assert(memberPermalink !== undefined)
      const name = this.workspace.renderString(
        sanitizeAnonymousNamespace(element.text.trim()),
        type
      )
      text += `<a href="${memberPermalink}">${name}</a>`
    } else {
      console.error(
        element.constructor.name,
        'not implemented by',
        this.constructor.name
      )
      return ''
    }

    return text
  }
}

// ----------------------------------------------------------------------------
