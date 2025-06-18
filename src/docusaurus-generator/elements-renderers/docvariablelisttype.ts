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
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js'

// ----------------------------------------------------------------------------

export class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
  renderToLines (element: AbstractDocVariableListType, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push(...this.workspace.renderElementsArrayToLines(element.children, type))

    return lines
  }
}

export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
  override renderToLines (element: VariableListPairDataModel, type: string): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    // console.log(element.varlistentry.term)
    // console.log(element.listitem.paras)

    // WARNING: the title includes <b></b>
    const title = this.workspace.renderElementToString(element.varlistentry.term, type).trim()

    lines.push('')
    lines.push('<dl class="doxyReference">')
    lines.push(`<dt class="doxyReferenceTerm">${title}</dt>`)
    lines.push('<dd class="doxyReferenceDescription">')
    lines.push(this.workspace.renderElementsArrayToString(element.listitem.paras, type).trim())
    lines.push('</dd>')
    lines.push('</dl>')
    lines.push('')

    return lines
  }
}

// ----------------------------------------------------------------------------
