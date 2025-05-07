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

import { ElementLinesGeneratorBase } from './element-generator-base.js'
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js'

// ----------------------------------------------------------------------------

export class DocVariableListTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocVariableListType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push(...this.workspace.renderElementsToMdxLines(element.children))

    return lines
  }
}

export class VariableListPairGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: VariableListPairDataModel): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('')
    lines.push('<dl class="reflist">')
    lines.push('<dt>')
    lines.push(...this.workspace.renderElementToMdxLines(element.varlistentry.term)) // trim?
    lines.push('')
    lines.push('</dt>')
    lines.push('<dd>')
    lines.push(...this.workspace.renderElementsToMdxLines(element.listitem.paras)) // trim?
    lines.push('')
    lines.push('</dd>')
    lines.push('</dl>')

    return lines
  }
}

// ----------------------------------------------------------------------------
