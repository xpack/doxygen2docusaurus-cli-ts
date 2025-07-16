import { ElementStringRendererBase } from './element-renderer-base.js';
export class LinkedTextTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        let text = '';
        text += this.workspace.renderElementsArrayToString(element.children, type);
        return text;
    }
}
//# sourceMappingURL=linkedtexttype.js.map