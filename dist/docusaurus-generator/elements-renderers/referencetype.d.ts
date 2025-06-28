import { ElementStringRendererBase } from './element-renderer-base.js';
import { AbstractReferenceType } from '../../data-model/compounds/referencetype-dm.js';
export declare class ReferenceTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractReferenceType, type: string): string;
}
