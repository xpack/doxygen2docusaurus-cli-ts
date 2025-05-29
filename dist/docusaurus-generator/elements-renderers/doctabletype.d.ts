import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js';
import { AbstractDocEntryType, AbstractDocRowType, AbstractDocTableType } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractDocTableType): string[];
}
export declare class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
    renderToMdxLines(element: AbstractDocRowType): string[];
}
export declare class DocEntryTypeTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element: AbstractDocEntryType): string;
}
