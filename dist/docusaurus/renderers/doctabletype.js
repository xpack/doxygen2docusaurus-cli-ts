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
import { ElementLinesRendererBase, ElementStringRendererBase, } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
/**
 * Renderer for Doxygen document table elements.
 *
 * @remarks
 * Converts Doxygen table structures to HTML table format with optional
 * captions. Processes table rows and maintains styling through CSS
 * classes for consistent documentation presentation.
 *
 * @public
 */
export class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document table element to formatted output lines.
     *
     * @remarks
     * Creates HTML table structure with optional caption and processes
     * all table rows. Applies CSS classes for styling and maintains
     * proper table markup for documentation display.
     *
     * @param element - The document table element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the table structure
     */
    renderToLines(element, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        lines.push('');
        lines.push('<table class="doxyTable">');
        if (element.caption !== undefined) {
            lines.push(this.workspace.renderElementToString(element.caption, 'html'));
        }
        lines.push(...this.workspace.renderElementsArrayToLines(element.rows, 'html'));
        lines.push('</table>');
        return lines;
    }
}
/**
 * Renderer for Doxygen document table caption elements.
 *
 * @remarks
 * Generates HTML caption elements for table titles and descriptions.
 * Processes caption content to provide contextual information about
 * table contents and purpose within documentation.
 *
 * @public
 */
export class DocCaptionLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document caption element to formatted output lines.
     *
     * @remarks
     * Creates HTML caption element containing the processed caption content.
     * Renders child elements to build complete caption text with proper
     * markup and formatting preservation.
     *
     * @param element - The document caption element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array containing the HTML caption element
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        let attributes = '';
        if (element.id.length > 0) {
            attributes += ` id="${element.id}"`;
        }
        text += `<caption${attributes}>`;
        text += this.workspace
            .renderElementsArrayToString(element.children, 'html')
            .trim();
        text += '</caption>';
        return [text];
    }
}
/**
 * Renderer for Doxygen document table row elements.
 *
 * @remarks
 * Generates HTML table row structure containing table entries.
 * Processes all entry elements within the row to build complete
 * table row markup for documentation display.
 *
 * @public
 */
export class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
    /**
     * Renders a document table row element to formatted output lines.
     *
     * @remarks
     * Creates HTML table row tags around rendered table entries.
     * Processes entry elements to generate the complete row structure
     * with proper table markup.
     *
     * @param element - The document table row element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns Array of HTML strings forming the table row
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        lines.push('<tr>');
        lines.push(...this.workspace.renderElementsArrayToLines(element.entries, 'html'));
        lines.push('</tr>');
        return lines;
    }
}
/**
 * Renderer for Doxygen document table entry elements.
 *
 * @remarks
 * Converts table cell elements to HTML table data or header cells
 * with appropriate attributes. Handles cell spanning, alignment,
 * and styling attributes for flexible table presentation.
 *
 * @public
 */
export class DocEntryTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a document table entry element to a formatted string.
     *
     * @remarks
     * Creates HTML table cell (td or th) with attributes including
     * colspan, rowspan, alignment, and styling. Processes cell content
     * and applies appropriate markup based on header status.
     *
     * @param element - The document table entry element to render
     * @param type - The rendering context type (unused in implementation)
     * @returns The formatted HTML table cell string
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        let attributes = '';
        if (element.colspan !== undefined) {
            attributes += ` colspan="${element.colspan.toString()}"`;
        }
        if (element.rowspan !== undefined) {
            attributes += ` rowspan="${element.rowspan.toString()}"`;
        }
        if (element.align !== undefined) {
            attributes += ` align="${element.align}"`;
        }
        if (element.valign !== undefined) {
            attributes += ` valign="${element.valign}"`;
        }
        if (element.width !== undefined) {
            attributes += ` width="${element.width}"`;
        }
        if (element.classs !== undefined) {
            attributes += ` class="${element.classs}"`;
        }
        this.workspace.skipElementsPara(element.paras);
        const entry = this.workspace
            .renderElementsArrayToString(element.paras, 'html')
            .trim();
        if (element.thead) {
            text += `<th${attributes}>${entry}</th>`;
        }
        else {
            text += `<td${attributes}>${entry}</td>`;
        }
        return text;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doctabletype.js.map