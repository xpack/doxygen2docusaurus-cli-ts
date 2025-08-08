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
import { TermDataModel, TitleDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
// ----------------------------------------------------------------------------
/**
 * Renderer for Doxygen document title elements.
 *
 * @remarks
 * Handles title and term elements within documentation structures.
 * Supports polymorphic rendering for different title types while
 * providing error handling for unrecognised element variations.
 *
 * @public
 */
export class DocTitleTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document title element to formatted output lines.
     *
     * @remarks
     * Processes title and term data models by rendering their child elements.
     * Logs errors for unrecognised title types that require implementation
     * support for complete documentation coverage.
     *
     * @param element - The document title element to render
     * @param type - The rendering context type
     * @returns Array containing the rendered title text
     */
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        if (element instanceof TitleDataModel) {
            text += this.workspace.renderElementsArrayToString(element.children, type);
        }
        else if (element instanceof TermDataModel) {
            text += this.workspace.renderElementsArrayToString(element.children, type);
        }
        else {
            console.error(element.constructor.name, 'not rendered in', this.constructor.name);
            // text += '<b>'
            // text +=
            //   this.workspace.renderElementsArrayToString(element.children, type)
            // text += '</b>'
        }
        return [text];
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doctitletype.js.map