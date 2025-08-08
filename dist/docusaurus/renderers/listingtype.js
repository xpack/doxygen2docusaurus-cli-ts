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
/**
 * Renderer for program listing elements in documentation.
 *
 * @remarks
 * Handles the rendering of source code listings as parsed from Doxygen XML,
 * converting them into formatted HTML output with syntax highlighting and
 * line numbering. Supports both full program listings and member-specific
 * code segments.
 *
 * @public
 */
export class ListingTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a program listing element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen program listing elements into HTML with appropriate
     * CSS classes, line numbers, and syntax highlighting. Handles anchor
     * generation for navigation and cross-referencing.
     *
     * @param element - The listing element to render
     * @param type - The rendering context type
     * @returns Array of formatted output lines
     */
    renderToLines(element, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type) {
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
/**
 * Renders individual code lines with syntax highlighting and line numbers.
 *
 * @remarks
 * Converts a single code line element into HTML format with appropriate
 * line numbering, anchors for navigation, and syntax highlighting support.
 * Handles permalink generation for cross-references when available.
 *
 * @param workspace - The workspace instance for rendering utilities
 * @param element - The code line element to render
 * @param type - The rendering context type
 * @param showAnchor - Whether to include anchor elements for navigation
 * @returns Formatted HTML string for the code line
 */
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
/**
 * Renderer for syntax highlighting elements in code listings.
 *
 * @remarks
 * Handles the rendering of syntax-highlighted code segments by converting
 * Doxygen highlight elements into HTML spans with appropriate CSS classes.
 * Optimised for direct HTML generation to improve build performance.
 *
 * @public
 */
export class HighlightTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Mapping of Doxygen highlight classes to CSS class names.
     *
     * @remarks
     * Maps Doxygen's built-in highlight types to corresponding CSS classes
     * for consistent syntax highlighting across different code elements.
     */
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
    /**
     * Renders a syntax highlight element to formatted output lines.
     *
     * @remarks
     * Converts Doxygen highlight elements into HTML span elements with
     * appropriate CSS classes for syntax highlighting. Handles unknown
     * highlight types by falling back to a default class.
     *
     * @param element - The highlight element to render
     * @param type - The rendering context type
     * @returns Array containing the formatted HTML span
     */
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        assert(element instanceof HighlightDataModel);
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