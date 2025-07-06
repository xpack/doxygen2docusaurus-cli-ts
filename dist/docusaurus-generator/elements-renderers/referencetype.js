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
import assert from 'assert';
import { ElementStringRendererBase } from './element-renderer-base.js';
import { ReferenceDataModel, ReferencedByDataModel } from '../../data-model/compounds/referencetype-dm.js';
import { sanitizeAnonymousNamespace } from '../utils.js';
// ----------------------------------------------------------------------------
// ReferenceDataModel
// ReferencedByDataModel
export class ReferenceTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        if (element instanceof ReferencedByDataModel || element instanceof ReferenceDataModel) {
            const memberPermalink = this.workspace.getPermalink({ refid: element.refid, kindref: 'member' });
            assert(memberPermalink !== undefined);
            const name = this.workspace.renderString(sanitizeAnonymousNamespace(element.text.trim()), type);
            text += `<a href="${memberPermalink}">${name}</a>`;
        }
        else {
            console.error(element.constructor.name, 'not implemented by', this.constructor.name);
            return '';
        }
        return text;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=referencetype.js.map