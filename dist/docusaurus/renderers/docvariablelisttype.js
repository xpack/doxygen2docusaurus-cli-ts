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
export class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        lines.push('');
        lines.push('<dl class="doxyVariableList">');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, 'html'));
        lines.push('</dl>');
        return lines;
    }
}
export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        // console.log(element.varlistentry.term)
        // console.log(element.listitem.paras)
        // WARNING: the title includes <b></b>
        const title = this.workspace
            .renderElementToString(element.varlistentry.term, 'html')
            .trim();
        // this.workspace.skipElementsPara(element.listitem.paras)
        const description = this.workspace
            .renderElementsArrayToString(element.listitem.paras, 'html')
            .trim();
        lines.push(`<dt>${title}</dt>`);
        if (!description.includes('\n')) {
            lines.push(`<dd>${description}</dd>`);
        }
        else {
            lines.push('<dd>');
            lines.push(...description.split('\n'));
            lines.push('</dd>');
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docvariablelisttype.js.map