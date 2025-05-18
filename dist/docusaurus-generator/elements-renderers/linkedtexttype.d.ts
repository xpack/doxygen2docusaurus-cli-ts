import { ElementTextRendererBase } from './element-renderer-base.js';
import { AbstractLinkedTextType } from '../../data-model/compounds/linkedtexttype-dm.js';
export declare class LinkedTextTypeTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element: AbstractLinkedTextType): string;
}
