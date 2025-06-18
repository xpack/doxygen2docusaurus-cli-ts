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
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        lines.push('');
        lines.push('<ul>');
        for (const listItem of element.listItems) {
            if (listItem.paras !== undefined) {
                lines.push(`<li>${this.workspace.renderElementsArrayToString(listItem.paras, type).trim()}</li>`);
            }
        }
        lines.push('</ul>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doclisttype.js.map