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

import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js'
import { AbstractDocXRefSectType } from '../../data-model/compounds/descriptiontype-dm.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class DocXRefSectLinesRenderer extends ElementLinesRendererBase {
  renderToLines (element: AbstractDocXRefSectType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const title = escapeHtml(element.xreftitle ?? '?')
    const permalink: string = this.workspace.getXrefPermalink(element.id)

    lines.push('')
    lines.push('<div class="doxyXrefSect">')
    lines.push('<dl class="doxyXrefSectList">')
    lines.push(`<dt class="doxyXrefSectTitle"><a href=${permalink}>${title}</a></dt>`)
    lines.push('<dd class="doxyXrefSectDescription">')

    lines.push(this.workspace.renderElementToString(element.xrefdescription, type).trim())
    lines.push('</dd>')
    lines.push('</dl>')
    lines.push('</div>')

    return lines
  }
}

// ----------------------------------------------------------------------------
