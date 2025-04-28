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
import * as util from 'node:util'

import { FrontMatter } from '../types.js'
import { PageGeneratorBase } from './base.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class PageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDefDataModel, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    result += this.context.renderInnerIndicesMdx({
      compoundDef,
      suffixes: []
    })

    result += this.context.renderSectionDefIndicesMdx(compoundDef)

    result += this.context.renderDetailedDescriptionMdx({
      compoundDef,
      todo: `@namespace ${compoundDef.compoundName}`,
      showHeader: false
    })

    result += this.context.renderSectionDefsMdx(compoundDef)

    return result
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    const result: string = ''
    return result
  }
}

// ----------------------------------------------------------------------------
