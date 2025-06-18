import { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import { Workspace } from '../workspace.js';
export declare class Renderers {
    elementLinesRenderers: Map<string, ElementLinesRendererBase>;
    elementStringRenderers: Map<string, ElementStringRendererBase>;
    constructor(workspace: Workspace);
    getElementLinesRenderer(element: Object): ElementLinesRendererBase | undefined;
    getElementTextRenderer(element: Object): ElementStringRendererBase | undefined;
}
