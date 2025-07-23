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
export class RefTextTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        if (element.external !== undefined) {
            console.error(element.elementName, 'attribute external not yet rendered in', this.constructor.name);
        }
        if (element.tooltip !== undefined) {
            console.error(element.elementName, 'attribute tooltip not yet rendered in', this.constructor.name);
        }
        let text = '';
        const permalink = this.workspace.getPermalink({
            refid: element.refid,
            kindref: element.kindref,
        });
        const content = this.workspace.renderString(element.text.trim(), type);
        if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${content}</a>`;
        }
        else {
            text += content;
        }
        return text;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=reftexttype.js.map