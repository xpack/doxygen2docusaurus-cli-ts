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
import { ElementLinesRendererBase } from './element-renderer-base.js';
import { getPermalinkAnchor } from '../utils.js';
// ----------------------------------------------------------------------------
// Sections are entered with @sect, @subsect, etc and in Docusaurus
// start wih H2. The markdown syntax is used to make the titles appear
// in the table of contents.
export class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`## ${title} {#${anchor}}`);
            }
            else {
                lines.push(`## ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
export class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`### ${title} {#${anchor}}`);
            }
            else {
                lines.push(`### ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
export class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`#### ${title} {#${anchor}}`);
            }
            else {
                lines.push(`#### ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
export class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`##### ${title} {#${anchor}}`);
            }
            else {
                lines.push(`##### ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
export class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`###### ${title} {#${anchor}}`);
            }
            else {
                lines.push(`###### ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
export class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToString(element.title, 'markdown').trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            if (element.id !== undefined) {
                const anchor = getPermalinkAnchor(element.id);
                lines.push(`####### ${title} {#${anchor}}`);
            }
            else {
                lines.push(`####### ${title}}`);
            }
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docinternalstype.js.map