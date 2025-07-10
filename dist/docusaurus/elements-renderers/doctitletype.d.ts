import { ElementLinesRendererBase } from './element-renderer-base.js';
import { type AbstractDocTitleType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export declare class DocTitleTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocTitleType, type: string): string[];
}
