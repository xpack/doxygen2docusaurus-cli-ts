import { ElementLinesRendererBase } from './element-renderer-base.js';
export class RefTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        if (element.prot !== undefined) {
            console.error(element.elementName, 'attribute prot not yet rendered in', this.constructor.name);
        }
        if (element.inline !== undefined) {
            console.error(element.elementName, 'attribute inline not yet rendered in', this.constructor.name);
        }
        const lines = [];
        const content = this.workspace.renderString(element.text.trim(), type);
        const permalink = this.workspace.getPagePermalink(element.refid);
        if (permalink !== undefined && permalink.length > 0) {
            lines.push(`<a href="${permalink}">${content}</a>`);
        }
        else {
            lines.push(content);
        }
        return lines;
    }
}
//# sourceMappingURL=reftype.js.map