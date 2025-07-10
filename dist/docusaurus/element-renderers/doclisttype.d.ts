import { ElementLinesRendererBase } from './element-renderer-base.js';
import { type AbstractDocListType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export declare class DocListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocListType, type: string): string[];
}
