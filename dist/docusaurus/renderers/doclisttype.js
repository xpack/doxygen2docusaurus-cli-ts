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
import { ItemizedListDataModel, OrderedListDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
// ----------------------------------------------------------------------------
/**
 * Renderer for list type elements in documentation.
 *
 * @remarks
 * Handles the rendering of both ordered and unordered lists as parsed from
 * Doxygen XML, converting them into appropriate HTML markup with proper
 * styling classes and list type attributes.
 *
 * @public
 */
export class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a list element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen list elements into HTML lists (ul/ol) with appropriate
     * CSS classes and type attributes. Handles both itemised (unordered) and
     * ordered lists, including special check-style formatting when needed.
     *
     * @param element - The list element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        // console.log(element)
        let classCheck = '';
        for (const listItem of element.listItems) {
            if (listItem.override !== undefined) {
                classCheck = ' check';
                break;
            }
        }
        const lines = [];
        lines.push('');
        if (element instanceof ItemizedListDataModel) {
            lines.push(`<ul class="doxyList ${classCheck}">`);
        }
        else if (element instanceof OrderedListDataModel) {
            if (element.type.length > 0) {
                lines.push(`<ol class="doxyList" type="${element.type}">`);
            }
            else {
                lines.push('<ol class="doxyList" type="1">');
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
                if (listItem.paras.length > 0) {
                    let text = '';
                    text += `<li${classChecked}>`;
                    const paraLines = [];
                    for (const para of listItem.paras) {
                        paraLines.push(this.workspace.renderElementToString(para, 'html').trim());
                    }
                    // Two \n to separate paragraphs when there is no <p>.
                    text += paraLines.join('\n\n');
                    text += '</li>';
                    lines.push(text);
                }
            }
            if (listItem.value !== undefined) {
                if (this.workspace.options.verbose) {
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
            if (this.workspace.options.verbose) {
                console.warn('Start', element.start, 'ignored in', this.constructor.name);
            }
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doclisttype.js.map