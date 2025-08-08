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
/**
 * Renderer for Doxygen substring markup elements.
 *
 * @remarks
 * Simple passthrough renderer for substring content within documentation
 * markup. Extracts and returns the raw substring value without additional
 * processing or formatting transformations.
 *
 * @public
 */
export class SubstringDocMarkupTypeRenderer extends ElementStringRendererBase {
    /**
     * Renders a substring markup element to its string value.
     *
     * @remarks
     * Directly returns the substring content without modification. Provides
     * straightforward text extraction for simple markup elements that do
     * not require complex rendering logic.
     *
     * @param element - The substring markup element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The unmodified substring content
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        return element.substring;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=substringtype.js.map