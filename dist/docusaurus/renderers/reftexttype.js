import { ElementStringRendererBase } from './element-renderer-base.js';
export class RefTextTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        if (element.external !== undefined) {
            console.error(element.elementName, 'attribute external not yet rendered in', this.constructor.name);
        }
        if (element.tooltip !== undefined) {
            console.error(element.elementName, 'attribute tooltip not yet rendered in', this.constructor.name);
        }
        let text = '';
        const permalink = this.workspace.getPermalink({
            refid: element.refid,
            kindref: element.kindref,
        });
        const content = this.workspace.renderString(element.text.trim(), type);
        if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${content}</a>`;
        }
        else {
            text += content;
        }
        return text;
    }
}
//# sourceMappingURL=reftexttype.js.map