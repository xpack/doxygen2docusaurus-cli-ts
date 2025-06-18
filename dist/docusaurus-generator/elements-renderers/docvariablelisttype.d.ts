import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js';
export declare class DocVariableListTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocVariableListType, type: string): string;
}
export declare class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: VariableListPairDataModel, type: string): string[];
}
