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
import util from 'util';
import { CodeLineDataModel, HighlightDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        let text = '';
        text += '\n';
        text += '<ProgramListing';
        if (element.filename !== undefined && element.filename.length > 0) {
            const extension = element.filename.replace('.', '');
            text += ` extension="${extension}"`;
        }
        text += '>';
        lines.push(text);
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.codelines));
        lines.push('');
        lines.push('</ProgramListing>');
        lines.push('');
        return lines;
    }
}
export class CodeLineTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        assert(element instanceof CodeLineDataModel);
        if (element.external !== undefined) {
            console.error('external ignored in', element.constructor.name);
        }
        let permalink;
        if (element.refid !== undefined && element.refkind !== undefined) {
            permalink = this.workspace.getPermalink({
                refid: element.refid,
                kindref: element.refkind
            });
        }
        let text = '';
        if (element.lineno !== undefined) {
            const anchor = `l${element.lineno.toString().padStart(5, '0')}`;
            text += `<Link id="${anchor}" />`;
        }
        text += '<CodeLine';
        if (element.lineno !== undefined) {
            text += ` lineNumber="${element.lineno.toString()}"`;
        }
        if (permalink !== undefined) {
            text += ` lineLink="${permalink}"`;
        }
        text += '>';
        text += this.workspace.renderElementsToMdxText(element.highlights);
        text += '</CodeLine>';
        return [text];
    }
}
// Optimise this to directly generate plain html, to save the compiler/bundler
// a lot of efforts, since the file references are very large.
export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    constructor() {
        super(...arguments);
        this.knownClasses = {
            normal: 'doxyHighlight',
            comment: 'doxyHighlightComment',
            preprocessor: 'doxyHighlightPreprocessor',
            keyword: 'doxyHighlightKeyword',
            keywordtype: 'doxyHighlightKeywordType',
            keywordflow: 'doxyHighlightKeywordFlow',
            token: 'doxyHighlightToken',
            stringliteral: 'doxyHighlightStringLiteral',
            charliteral: 'doxyHighlightCharLiteral'
        };
    }
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        assert(element instanceof HighlightDataModel);
        let spanClass = this.knownClasses[element.classs];
        if (spanClass === undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.classs, 'not implemented yet in', this.constructor.name);
            spanClass = 'doxyHighlight';
        }
        let text = '';
        if (element.children.length > 0) {
            text += `<span class="${spanClass}">`;
            text += this.workspace.renderElementsToMdxText(element.children);
            text += '</span>';
        }
        return [text];
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=listingtype.js.map