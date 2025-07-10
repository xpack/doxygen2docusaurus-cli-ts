import { ElementStringRendererBase } from './element-renderer-base.js';
import { type AbstractReferenceType } from '../../doxygen/data-model/compounds/referencetype-dm.js';
export declare class ReferenceTypeStringRenderer extends ElementStringRendererBase {
    renderToString(element: AbstractReferenceType, type: string): string;
}
