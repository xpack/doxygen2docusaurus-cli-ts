import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import type { AbstractDocCaptionType, AbstractDocEntryType, AbstractDocRowType, AbstractDocTableType } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export declare class DocTableTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocTableType, type: string): string[];
}
export declare class DocCaptionLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocCaptionType, type: string): string[];
}
export declare class DocRowTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocRowType, type: string): string[];
}
export declare class DocEntryTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractDocEntryType, type: string): string;
}
//# sourceMappingURL=doctabletype.d.ts.map