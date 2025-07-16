import assert from 'node:assert';
import { ElementStringRendererBase } from './element-renderer-base.js';
import { ReferenceDataModel, ReferencedByDataModel, } from '../../doxygen/data-model/compounds/referencetype-dm.js';
import { sanitizeAnonymousNamespace } from '../utils.js';
export class ReferenceTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element, type) {
        let text = '';
        if (element instanceof ReferencedByDataModel ||
            element instanceof ReferenceDataModel) {
            const memberPermalink = this.workspace.getPermalink({
                refid: element.refid,
                kindref: 'member',
            });
            assert(memberPermalink !== undefined);
            const name = this.workspace.renderString(sanitizeAnonymousNamespace(element.text.trim()), type);
            text += `<a href="${memberPermalink}">${name}</a>`;
        }
        else {
            console.error(element.constructor.name, 'not implemented by', this.constructor.name);
            return '';
        }
        return text;
    }
}
//# sourceMappingURL=referencetype.js.map