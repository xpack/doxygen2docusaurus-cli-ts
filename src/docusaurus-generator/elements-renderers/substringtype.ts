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
import { ElementTextRendererBase } from './element-renderer-base.js'
import { SubstringDocMarkupType } from '../../data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

export class SubstringDocMarkupTypeRenderer extends ElementTextRendererBase {
  renderToMdxText (element: SubstringDocMarkupType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    return element.substring
  }
}

// ----------------------------------------------------------------------------
