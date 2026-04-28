import { ElementLinesRendererBase } from './element-renderer-base.js';
import { TermDataModel, TitleDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export class DocTitleTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        let text = '';
        if (element instanceof TitleDataModel) {
            text += this.workspace.renderElementsArrayToString(element.children, type);
        }
        else if (element instanceof TermDataModel) {
            text += this.workspace.renderElementsArrayToString(element.children, type);
        }
        else {
            console.error(element.constructor.name, 'not rendered in', this.constructor.name);
        }
        return [text];
    }
}
//# sourceMappingURL=doctitletype.js.map