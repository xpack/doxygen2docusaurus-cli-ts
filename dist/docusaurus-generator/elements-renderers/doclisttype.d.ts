import { ElementLinesRendererBase } from './element-renderer-base.js';
import { AbstractDocListType } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractDocListType): string[];
}
