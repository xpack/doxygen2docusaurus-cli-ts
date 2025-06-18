import { ElementLinesRendererBase } from './element-renderer-base.js';
import { AbstractDocTocListType } from '../../data-model/compounds/tableofcontentstype-dm.js';
export declare class TocListLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocTocListType, type: string): string[];
}
