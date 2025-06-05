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
import { ElementTextRendererBase } from './element-renderer-base.js';
import { escapeMdx } from '../utils.js';
// ----------------------------------------------------------------------------
export class DocXRefSectTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        lines.push('');
        lines.push('<XrefSect');
        lines.push(`  title="${escapeMdx(element.xreftitle ?? '?')}"`);
        const permalink = this.workspace.getXrefPermalink(element.id);
        lines.push(`  permalink="${permalink}">`);
        lines.push(this.workspace.renderElementToMdxText(element.xrefdescription));
        // lines.push('')
        lines.push('</XrefSect>');
        return lines.join('\n');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docxrefsecttype.js.map