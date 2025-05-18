import { ElementTextRendererBase } from './element-renderer-base.js';
import { AbstractDocXRefSectType } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class DocXRefSectTextRenderer extends ElementTextRendererBase {
    renderToMdxText(element: AbstractDocXRefSectType): string;
}
