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
import { AbstractRefTextType } from '../../data-model/compounds/reftexttype-dm.js'
import { escapeMdx } from '../../docusaurus-generator/utils.js'

// ----------------------------------------------------------------------------

export class RefTextTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractRefTextType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined) {
      console.error(element.elementName, 'attribute external not yet rendered in', this.constructor.name)
    }
    if (element.tooltip !== undefined) {
      console.error(element.elementName, 'attribute tooltip not yet rendered in', this.constructor.name)
    }

    const lines: string[] = []

    const permalink: string = this.workspace.getPermalink({
      refid: element.refid,
      kindref: element.kindref
    })

    assert(permalink !== undefined && permalink.length > 1)

    lines.push(`<Link to="${permalink}">${escapeMdx(element.text)}</Link>`) // trim?

    return lines
  }
}

// ----------------------------------------------------------------------------
