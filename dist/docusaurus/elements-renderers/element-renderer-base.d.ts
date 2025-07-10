import type { Workspace } from '../generator/workspace.js';
export declare abstract class ElementStringRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToString(element: object, type: string): string;
}
export declare abstract class ElementLinesRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToLines(element: object, type: string): string[];
}
