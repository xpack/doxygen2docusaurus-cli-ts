import { ElementLinesRendererBase, ElementTextRendererBase } from './element-renderer-base.js';
import { Workspace } from '../workspace.js';
export declare class Renderers {
    elementLinesRenderers: Map<string, ElementLinesRendererBase>;
    elementTextRenderers: Map<string, ElementTextRendererBase>;
    constructor(workspace: Workspace);
    getElementLinesRenderer(element: Object): ElementLinesRendererBase | undefined;
    getElementTextRenderer(element: Object): ElementTextRendererBase | undefined;
}
