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
// import assert from 'node:assert'
// import * as util from 'node:util'
import { ElementStringRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class SubstringDocMarkupTypeRenderer extends ElementStringRendererBase {
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        return element.substring;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=substringtype.js.map