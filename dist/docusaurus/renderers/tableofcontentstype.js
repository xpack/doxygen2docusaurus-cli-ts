import { ElementLinesRendererBase } from './element-renderer-base.js';
import { getPermalinkAnchor } from '../utils.js';
export class TocListLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        lines.push('');
        lines.push('');
        lines.push('<ul class="doxyTocList">');
        if (element.tocItems !== undefined) {
            for (const tocItem of element.tocItems) {
                const permalink = getPermalinkAnchor(tocItem.id);
                const content = this.workspace
                    .renderElementsArrayToString(tocItem.children, 'html')
                    .trim();
                lines.push('<li>' +
                    `<a class="doxyTocListItem" href="#${permalink}">${content}</a>` +
                    '</li>');
            }
        }
        lines.push('</ul>');
        return lines;
    }
}
//# sourceMappingURL=tableofcontentstype.js.map