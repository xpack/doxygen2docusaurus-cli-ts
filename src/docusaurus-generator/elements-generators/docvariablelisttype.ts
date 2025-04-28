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

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js'

// ----------------------------------------------------------------------------

export class DocVariableListTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocVariableListType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    result += this.context.renderElementsMdx(element.children)

    return result
  }
}

export class VariableListPairGenerator extends ElementGeneratorBase {
  renderMdx (element: VariableListPairDataModel): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    result += '\n'
    result += '<dl class="reflist">\n'
    result += '<dt>\n'
    result += this.context.renderElementMdx(element.varlistentry.term).trim()
    result += '\n'
    result += '</dt>\n'
    result += '<dd>\n'
    result += this.context.renderElementsMdx(element.listitem.paras).trim()
    result += '\n'
    result += '</dd>\n'
    result += '</dl>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
