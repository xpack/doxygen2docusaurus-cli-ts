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
import util from 'node:util';
import { CodeLineDataModel, HighlightDataModel, MemberProgramListingDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        if (element.codelines === undefined) {
            return [];
        }
        let showAnchor = true;
        if (element instanceof MemberProgramListingDataModel) {
            showAnchor = false;
        }
        const lines = [];
        lines.push('');
        lines.push('<div class="doxyProgramListing">');
        lines.push('');
        for (const codeline of element.codelines) {
            // Explicit type, since it may come from a markdown environment,
            // like in the Doxygen docblocks page.
            lines.push(renderCodeLinesToString(this.workspace, codeline, 'html', showAnchor));
        }
        lines.push('');
        lines.push('</div>');
        lines.push('');
        return lines;
    }
}
function renderCodeLinesToString(workspace, element, type, showAnchor) {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))
    assert(element instanceof CodeLineDataModel);
    if (element.external !== undefined) {
        console.error('external ignored in', element.constructor.name);
    }
    let permalink = undefined;
    if (element.refid !== undefined && element.refkind !== undefined) {
        permalink = workspace.getPermalink({
            refid: element.refid,
            kindref: element.refkind,
        });
    }
    let text = '';
    text += '<div class="doxyCodeLine">';
    if (element.lineno !== undefined) {
        text += '<span class="doxyLineNumber">';
        const anchor = `l${element.lineno.toString().padStart(5, '0')}`;
        if (showAnchor) {
            text += `<a id="${anchor}"></a>`;
        }
        if (permalink !== undefined) {
            text += `<a href="${permalink}">${element.lineno.toString()}</a>`;
        }
        else {
            text += element.lineno.toString();
        }
        text += '</span>';
    }
    else {
        text += '<span class="doxyNoLineNumber">&nbsp;</span>';
    }
    const content = workspace.renderElementsArrayToString(element.highlights, type);
    if (content.length > 0) {
        text += `<span class="doxyLineContent">${content}</span>`;
    }
    text += '</div>';
    return text;
}
// Optimise this to directly generate plain html, to save the compiler/bundler
// a lot of efforts, since the file references are very large.
export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    knownClasses = {
        normal: 'doxyHighlight',
        charliteral: 'doxyHighlightCharLiteral',
        comment: 'doxyHighlightComment',
        preprocessor: 'doxyHighlightPreprocessor',
        keyword: 'doxyHighlightKeyword',
        keywordtype: 'doxyHighlightKeywordType',
        keywordflow: 'doxyHighlightKeywordFlow',
        token: 'doxyHighlightToken',
        stringliteral: 'doxyHighlightStringLiteral',
        vhdlchar: 'doxyHighlightVhdlChar',
        vhdlkeyword: 'doxyHighlightVhdlKeyword',
        vhdllogic: 'doxyHighlightVhdlLogic',
    };
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        assert(element instanceof HighlightDataModel);
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        let spanClass = this.knownClasses[element.classs];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (spanClass === undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.classs, 'not implemented yet in', this.constructor.name);
            spanClass = 'doxyHighlight';
        }
        let text = '';
        assert(element.children !== undefined);
        if (element.children.length > 0) {
            text += `<span class="${spanClass}">`;
            text += this.workspace.renderElementsArrayToString(element.children, type);
            text += '</span>';
        }
        return [text];
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=listingtype.js.map