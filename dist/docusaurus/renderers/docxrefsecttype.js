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
import assert from 'node:assert';
// import * as util from 'node:util'
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class DocXRefSectLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderString(element.xreftitle ?? '???', 'html');
        const permalink = this.workspace.getPermalink({
            refid: element.id,
            kindref: 'xrefsect',
        });
        assert(permalink !== undefined);
        lines.push('');
        lines.push('<div class="doxyXrefSect">');
        lines.push('<dl class="doxyXrefSectList">');
        lines.push(`<dt class="doxyXrefSectTitle"><a href=${permalink}>${title}</a></dt>`);
        lines.push('<dd class="doxyXrefSectDescription">');
        if (element.xrefdescription !== undefined) {
            lines.push(this.workspace
                .renderElementToString(element.xrefdescription, 'html')
                .trim());
        }
        lines.push('</dd>');
        lines.push('</dl>');
        lines.push('</div>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docxrefsecttype.js.map