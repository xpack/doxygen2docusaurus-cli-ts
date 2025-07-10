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
export class DocTitleTypeLinesRenderer extends ElementLinesRendererBase {
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