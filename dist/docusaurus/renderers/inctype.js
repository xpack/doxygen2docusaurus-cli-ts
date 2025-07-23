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
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class IncTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        let permalink = '';
        if (element.refId !== undefined) {
            permalink = this.workspace.getPagePermalink(element.refId);
            // May be undefined.
        }
        const content = this.workspace.renderString(element.text.trim(), type);
        let text = '';
        text += '#include ';
        text += element.local ? '"' : '&lt;';
        if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${content}</a>`;
        }
        else {
            text += content;
        }
        text += element.local ? '"' : '&gt;';
        // text += '</code>'
        lines.push(text);
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=inctype.js.map