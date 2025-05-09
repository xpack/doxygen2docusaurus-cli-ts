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
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js'

// ----------------------------------------------------------------------------

export class DocVariableListTypeTextRenderer extends ElementTextRendererBase {
  renderToMdxText (element: AbstractDocVariableListType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''

    text += this.workspace.renderElementsToMdxText(element.children)

    return text
  }
}

export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
  override renderToMdxLines (element: VariableListPairDataModel): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    // console.log(element.varlistentry.term)
    // console.log(element.listitem.paras)

    // WARNING: the title includes <b></b>
    const title = this.workspace.renderElementToMdxText(element.varlistentry.term).trim()

    lines.push('')
    lines.push(`<Reference title={<>${title}</>}>`)
    lines.push(this.workspace.renderElementsToMdxText(element.listitem.paras).trim())
    lines.push('</Reference>')
    lines.push('')

    return lines
  }
}

// ----------------------------------------------------------------------------
