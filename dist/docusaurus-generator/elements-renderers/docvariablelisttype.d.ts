import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js';
import { AbstractDocVariableListType, VariableListPairDataModel } from '../../data-model/compounds/docvarlistentrytype-dm.js';
export declare class DocVariableListTypeTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element: AbstractDocVariableListType): string;
}
export declare class VariableListPairLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: VariableListPairDataModel): string[];
}
