import { ElementLinesRendererBase } from './element-renderer-base.js';
import { getPermalinkAnchor } from '../utils.js';
export class DocS1TypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.title, 'markdown')
            .trim()
            .replace(/\.$/, '');
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
//# sourceMappingURL=docinternalstype.js.map