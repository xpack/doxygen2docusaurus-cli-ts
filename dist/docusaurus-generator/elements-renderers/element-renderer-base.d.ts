import { Workspace } from '../workspace.js';
export declare abstract class ElementStringRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToString(element: Object, type: string): string;
}
export declare abstract class ElementLinesRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToLines(element: Object, type: string): string[];
}
