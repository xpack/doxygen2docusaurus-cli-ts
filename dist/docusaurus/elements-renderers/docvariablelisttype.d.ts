import { ElementLinesRendererBase } from './element-renderer-base.js';
import type { AbstractDocVariableListType, VariableListPairDataModel } from '../../doxygen/data-model/compounds/docvarlistentrytype-dm.js';
export declare class DocVariableListTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocVariableListType, type: string): string[];
}
export declare class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: VariableListPairDataModel, type: string): string[];
}
