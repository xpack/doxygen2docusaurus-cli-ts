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
import { ElementStringRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class SubstringDocMarkupTypeRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        return element.substring;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=substringtype.js.map