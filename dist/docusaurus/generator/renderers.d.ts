import { DataModelElement } from "../../doxygen/data-model/types.js";
export declare class RenderersBase {
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
