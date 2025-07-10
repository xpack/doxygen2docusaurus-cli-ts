import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractRefType } from '../../doxygen/data-model/compounds/reftype-dm.js';
export declare class RefTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractRefType, type: string): string[];
}
