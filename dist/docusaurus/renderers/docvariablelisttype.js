import { ElementLinesRendererBase } from './element-renderer-base.js';
export class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        lines.push('');
        lines.push('<dl class="doxyVariableList">');
        lines.push(...this.workspace.renderElementsArrayToLines(element.children, 'html'));
        lines.push('</dl>');
        return lines;
    }
}
export class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        const title = this.workspace
            .renderElementToString(element.varlistentry.term, 'html')
            .trim();
        const description = this.workspace
            .renderElementsArrayToString(element.listitem.paras, 'html')
            .trim();
        lines.push(`<dt>${title}</dt>`);
        if (!description.includes('\n')) {
            lines.push(`<dd>${description}</dd>`);
        }
        else {
            lines.push('<dd>');
            lines.push(...description.split('\n'));
            lines.push('</dd>');
        }
        return lines;
    }
}
//# sourceMappingURL=docvariablelisttype.js.map