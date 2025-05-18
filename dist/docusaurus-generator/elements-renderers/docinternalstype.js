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
        lines.push('');
        lines.push('<Link id="#details" />');
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            console.warn('h1 header title cannot be rendered in Docusaurus, ignored');
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
export class DocS2TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            lines.push('');
            lines.push(`## ${title}`);
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `{#${element.id}}`
            // }
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            console.warn('h2 header title not defined');
            // result += '<h2>\n'
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `  <a id="${element.id}" />\n`
            // }
            // result += '</h2>\n'
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
export class DocS3TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            lines.push('');
            lines.push(`### ${title}`);
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `{#${element.id}}`
            // }
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            // result += '<h3>\n'
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `  <a id="${element.id}" />\n`
            // }
            // result += '</h3>\n'
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
export class DocS4TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            lines.push('');
            lines.push(`#### ${title}`);
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `{#${element.id}}`
            // }
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            // result += '<h4>\n'
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `  <a id="${element.id}" />\n`
            // }
            // result += '</h4>\n'
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
export class DocS5TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            lines.push('');
            lines.push(`##### ${title}`);
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `{#${element.id}}`
            // }
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            // result += '<h5>\n'
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `  <a id="${element.id}" />\n`
            // }
            // result += '</h5>\n'
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
export class DocS6TypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        const lines = [];
        const title = this.workspace.renderElementToMdxText(element.title).trim();
        if (title.length > 0) {
            lines.push('');
            lines.push(`###### ${title}`);
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `{#${element.id}}`
            // }
            lines.push('');
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        else {
            lines.push('');
            // result += '<h6>\n'
            // if (element.id !== undefined && element.id.length > 0) {
            //   result += `  <a id="${element.id}" />\n`
            // }
            // result += '</h6>\n'
            lines.push(...this.workspace.renderElementsToMdxLines(element.children));
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
