import assert from 'node:assert';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export class DocXRefSectLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        const title = this.workspace.renderString(element.xreftitle ?? '???', 'html');
        const permalink = this.workspace.getPermalink({
            refid: element.id,
            kindref: 'xrefsect',
        });
        assert(permalink !== undefined);
        lines.push('');
        lines.push('<div class="doxyXrefSect">');
        lines.push('<dl class="doxyXrefSectList">');
        lines.push(`<dt class="doxyXrefSectTitle"><a href=${permalink}>${title}</a></dt>`);
        lines.push('<dd class="doxyXrefSectDescription">');
        if (element.xrefdescription !== undefined) {
            lines.push(this.workspace
                .renderElementToString(element.xrefdescription, 'html')
                .trim());
        }
        lines.push('</dd>');
        lines.push('</dl>');
        lines.push('</div>');
        return lines;
    }
}
//# sourceMappingURL=docxrefsecttype.js.map