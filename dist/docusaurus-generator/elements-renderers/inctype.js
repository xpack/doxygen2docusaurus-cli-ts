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
import assert from 'assert';
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class IncTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        let permalink = '';
        if (element.refId !== undefined) {
            permalink = this.workspace.getPagePermalink(element.refId);
            assert(permalink !== undefined && permalink.length > 1);
        }
        lines.push('<IncludesListItem');
        lines.push(`  filePath="${element.text}"`);
        lines.push(`  permalink="${permalink}"`);
        lines.push(`  isLocal="${element.local.toString()}" />`);
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=inctype.js.map