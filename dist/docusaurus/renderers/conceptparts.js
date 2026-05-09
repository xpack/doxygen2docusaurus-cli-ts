import assert from 'node:assert';
import { ElementLinesRendererBase } from './element-renderer-base.js';
export class ConceptPartsLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        assert(element.children !== undefined);
        if (element.children.length > 0) {
            lines.push(...this.workspace.renderElementsArrayToLines(element.children, type));
        }
        return lines;
    }
}
export class ConceptCodePartLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        const lines = [];
        assert(element.programListing !== undefined);
        lines.push(...this.workspace.renderElementToLines(element.programListing, type));
        return lines;
    }
}
//# sourceMappingURL=conceptparts.js.map