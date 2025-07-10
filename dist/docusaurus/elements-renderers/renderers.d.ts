import type { ElementLinesRendererBase, ElementStringRendererBase } from './element-renderer-base.js';
import type { Workspace } from '../generator/workspace.js';
import type { DataModelElement } from '../../doxygen/data-model/types.js';
export declare class Renderers {
    elementLinesRenderers: Map<string, ElementLinesRendererBase>;
    elementStringRenderers: Map<string, ElementStringRendererBase>;
    registerRenderers(workspace: Workspace): void;
    getElementLinesRenderer(element: object): ElementLinesRendererBase | undefined;
    getElementTextRenderer(element: object): ElementStringRendererBase | undefined;
    renderString(element: string, type: string): string;
    renderElementsArrayToLines(elements: DataModelElement[] | undefined, type: string): string[];
    renderElementToLines(element: DataModelElement | DataModelElement[] | undefined, type: string): string[];
    renderElementsArrayToString(elements: DataModelElement[] | undefined, type: string): string;
    renderElementToString(element: DataModelElement | DataModelElement[] | undefined, type: string): string;
    renderMembersIndexItemToHtmlLines({ template, type, name, childrenLines, }: {
        template?: string | undefined;
        type?: string | undefined;
        name: string;
        childrenLines?: string[] | undefined;
    }): string[];
    renderTreeTableRowToHtmlLines({ itemIconLetter, itemIconClass, itemLabel, itemLink, depth, description, }: {
        itemIconLetter?: string;
        itemIconClass?: string;
        itemLabel: string;
        itemLink: string;
        depth: number;
        description: string;
    }): string[];
}
