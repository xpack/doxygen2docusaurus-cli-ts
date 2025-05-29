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
// ----------------------------------------------------------------------------
export class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        // Add the anchor referred by the 'More...' link.
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`## ${title}{#details}`);
        }
        else {
            lines.push('');
            lines.push('<Link id="#details" />');
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
export class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`### ${title}`);
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
export class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`#### ${title}`);
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
export class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`##### ${title}`);
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
export class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`###### ${title}`);
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
export class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim().replace(/\.$/, '');
        if (title.length > 0) {
            lines.push('');
            lines.push(`####### ${title}`);
        }
        lines.push('');
        lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        return lines;
    }
}
// ----------------------------------------------------------------------------
