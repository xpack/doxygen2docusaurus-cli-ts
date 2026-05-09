import { ElementLinesRendererBase } from './element-renderer-base.js';
import { ItemizedListDataModel, OrderedListDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        let classCheck = '';
        for (const listItem of element.listItems) {
            if (listItem.override !== undefined) {
                classCheck = ' check';
                break;
            }
        }
        const lines = [];
        lines.push('');
        if (element instanceof ItemizedListDataModel) {
            lines.push(`<ul class="doxyList ${classCheck}">`);
        }
        else if (element instanceof OrderedListDataModel) {
            if (element.type.length > 0) {
                lines.push(`<ol class="doxyList" type="${element.type}">`);
            }
            else {
                lines.push('<ol class="doxyList" type="1">');
            }
        }
        for (const listItem of element.listItems) {
            let classChecked = '';
            if (listItem.override !== undefined) {
                classChecked = ` class="${listItem.override}"`;
            }
            if (listItem.paras !== undefined) {
                this.workspace.skipElementsPara(listItem.paras);
                if (listItem.paras.length > 0) {
                    let text = '';
                    text += `<li${classChecked}>`;
                    const paraLines = [];
                    for (const para of listItem.paras) {
                        paraLines.push(this.workspace.renderElementToString(para, 'html').trim());
                    }
                    text += paraLines.join('\n\n');
                    text += '</li>';
                    lines.push(text);
                }
            }
            if (listItem.value !== undefined) {
                if (this.workspace.options.verbose) {
                    console.warn('Value', listItem.value, 'ignored in', this.constructor.name);
                }
            }
        }
        if (element instanceof ItemizedListDataModel) {
            lines.push('</ul>');
        }
        else if (element instanceof OrderedListDataModel) {
            lines.push('</ol>');
        }
        if (element.start !== undefined) {
            if (this.workspace.options.verbose) {
                console.warn('Start', element.start, 'ignored in', this.constructor.name);
            }
        }
        return lines;
    }
}
//# sourceMappingURL=doclisttype.js.map