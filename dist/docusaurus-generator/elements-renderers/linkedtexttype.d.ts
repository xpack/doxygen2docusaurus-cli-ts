import { ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractLinkedTextType } from '../../data-model/compounds/linkedtexttype-dm.js';
export declare class LinkedTextTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractLinkedTextType, type: string): string;
}
