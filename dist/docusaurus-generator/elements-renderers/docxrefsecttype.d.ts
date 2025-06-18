import { ElementLinesRendererBase } from './element-renderer-base.js';
import { AbstractDocXRefSectType } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class DocXRefSectLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element: AbstractDocXRefSectType, type: string): string[];
}
