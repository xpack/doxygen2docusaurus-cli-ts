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
/**
 * Renderer for Doxygen reference text elements with linking functionality.
 *
 * @remarks
 * Converts reference text elements into HTML anchor tags when a valid
 * permalink is available, otherwise renders as plain text. Provides
 * cross-reference functionality for Doxygen elements.
 *
 * @public
 */
export class RefTextTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a reference text element to a formatted string with linking.
     *
     * @remarks
     * Generates an HTML anchor tag when a valid permalink exists for the
     * referenced element, otherwise renders the text content directly.
     * Logs warnings for unsupported attributes that are not yet implemented.
     *
     * @param element - The reference text element to render
     * @param type - The rendering context type
     * @returns The formatted HTML string with optional link
     */
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