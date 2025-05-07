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
import { AbstractDocXRefSectType } from '../../data-model/compounds/descriptiontype-dm.js'
import { escapeMdx } from '../../docusaurus-generator/utils.js'

// ----------------------------------------------------------------------------

export class DocXRefSectGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocXRefSectType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    lines.push('')
    lines.push('<XrefSect')
    lines.push(`  title="${escapeMdx(element.xreftitle ?? '?')}"`)
    const permalink: string = this.workspace.getXrefPermalink(element.id)
    lines.push(`  permalink="${permalink}">`)
    lines.push(...this.workspace.renderElementToMdxLines(element.xrefdescription))
    // lines.push('')
    lines.push('</XrefSect>')

    return lines
  }
}

// ----------------------------------------------------------------------------
