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

import assert from 'assert'
import * as util from 'node:util'

import { FrontMatter, GeneratorBase } from '../types.js'
import { CompoundDefType } from '../../doxygen-xml-parser/compounddef.js'

export class GroupGenerator extends GeneratorBase {
  toMdx (compoundDef: CompoundDefType, frontMatter: FrontMatter): string {
    console.log(util.inspect(compoundDef), { depth: 10 })

    assert(compoundDef.title !== undefined)
    frontMatter.title = compoundDef.title + ' reference'

    let bodyText: string = ''

    bodyText += '## Topics\n'
    bodyText += '\n'
    bodyText += 'TODO\n'
    bodyText += '\n'
    bodyText += '## Detailed Description\n'
    bodyText += '\n'
    bodyText += 'TODO\n'

    return bodyText
  }
}
