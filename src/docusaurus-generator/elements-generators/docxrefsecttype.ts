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
import { AbstractDocXRefSectType } from '../../doxygen-xml-parsers/descriptiontype-parser.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class DocXRefSectType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocXRefSectType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    result += '\n'
    result += '<XrefSect'
    result += ` title="${escapeHtml(element.xreftitle ?? '?')}"`
    const permalink = this.context.getXrefPermalink(element.id)
    result += ` permalink="${permalink}"`
    result += '>\n'
    result += this.context.renderElementMdx(element.xrefdescription)
    result += '\n'
    result += '</XrefSect>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
