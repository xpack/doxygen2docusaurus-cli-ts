import { ElementLinesRendererBase } from './element-renderer-base.js';
import { AbstractIncType } from '../../data-model/compounds/inctype-dm.js';
export declare class IncTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractIncType): string[];
}
