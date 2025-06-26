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
import { ItemizedListDataModel, OrderedListDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
// ----------------------------------------------------------------------------
export class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        // console.log(element)
        let classCheck = '';
        for (const listItem of element.listItems) {
            if (listItem.override !== undefined) {
                classCheck = ' class="check"';
                break;
            }
        }
        const lines = [];
        lines.push('');
        if (element instanceof ItemizedListDataModel) {
            lines.push(`<ul${classCheck}>`);
        }
        else if (element instanceof OrderedListDataModel) {
            if (element.type.length > 0) {
                lines.push(`<ol type="${element.type}">`);
            }
            else {
                lines.push('<ol type="1">');
            }
        }
        for (const listItem of element.listItems) {
            let classChecked = '';
            if (listItem.override !== undefined) {
                classChecked = ` class="${listItem.override}"`;
            }
            if (listItem.paras !== undefined) {
                // console.log(listItem.paras)
                this.workspace.skipElementsPara(listItem.paras);
                let text = '';
                text += `<li${classChecked}>`;
                for (const para of listItem.paras) {
                    text += this.workspace.renderElementToString(para, type).trim();
                    text += '\n';
                    text += '\n';
                }
                text += '</li>';
                lines.push(text);
            }
            if (listItem.value !== undefined) {
                if (this.workspace.pluginOptions.verbose) {
                    console.warn('Value', listItem.value, 'ignored in', this.constructor.name);
                }
            }
        }
        if (element instanceof ItemizedListDataModel) {
            lines.push('</ul>');
        }
        else if (element instanceof OrderedListDataModel) {
            lines.push('</ol>');
        }
        if (element.start !== undefined) {
            if (this.workspace.pluginOptions.verbose) {
                console.warn('Start', element.start, 'ignored in', this.constructor.name);
            }
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doclisttype.js.map