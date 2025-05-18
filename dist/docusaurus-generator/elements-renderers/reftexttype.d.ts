import { ElementTextRendererBase } from './element-renderer-base.js';
import { AbstractRefTextType } from '../../data-model/compounds/reftexttype-dm.js';
export declare class RefTextTypeTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element: AbstractRefTextType): string;
}
