import { ElementLinesRendererBase } from './element-renderer-base.js';
export class IncTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        let permalink = '';
        if (element.refId !== undefined) {
            permalink = this.workspace.getPagePermalink(element.refId);
        }
        const content = this.workspace.renderString(element.text.trim(), type);
        let text = '';
        text += '#include ';
        text += element.local ? '"' : '&lt;';
        if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${content}</a>`;
        }
        else {
            text += content;
        }
        text += element.local ? '"' : '&gt;';
        lines.push(text);
        return lines;
    }
}
//# sourceMappingURL=inctype.js.map