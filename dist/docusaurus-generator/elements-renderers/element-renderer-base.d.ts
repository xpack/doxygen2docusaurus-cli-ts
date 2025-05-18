import { Workspace } from '../workspace.js';
export declare abstract class ElementTextRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToMdxText(element: Object): string;
}
export declare abstract class ElementLinesRendererBase {
    workspace: Workspace;
    constructor(workspace: Workspace);
    abstract renderToMdxLines(element: Object): string[];
}
