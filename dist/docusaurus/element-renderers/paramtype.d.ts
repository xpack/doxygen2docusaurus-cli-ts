import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractParamType } from '../../doxygen/data-model/compounds/paramtype-dm.js';
export declare class ParamTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractParamType, type: string): string[];
}
