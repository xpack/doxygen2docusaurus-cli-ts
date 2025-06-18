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
import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class DocVariableListTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        text += this.workspace.renderElementsArrayToString(element.children, type);
        return text;
    }
}
export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        // console.log(element.varlistentry.term)
        // console.log(element.listitem.paras)
        // WARNING: the title includes <b></b>
        const title = this.workspace.renderElementToString(element.varlistentry.term, type).trim();
        lines.push('');
        lines.push('<dl class="doxyReference">');
        lines.push(`<dt class="doxyReferenceTerm">${title}</dt>`);
        lines.push('<dd class="doxyReferenceDescription">');
        lines.push(this.workspace.renderElementsArrayToString(element.listitem.paras, type).trim());
        lines.push('</dd>');
        lines.push('</dl>');
        lines.push('');
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docvariablelisttype.js.map