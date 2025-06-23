import { AbstractDataModelBase, DataModel } from '../data-model/types.js';
import { PluginOptions } from '../plugin/options.js';
import { CollectionBase } from './view-model/collection-base.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { CompoundBase } from './view-model/compound-base-vm.js';
import { Page } from './view-model/pages-vm.js';
import { FrontMatter } from './types.js';
import { Member } from './view-model/members-vm.js';
import { Renderers } from './elements-renderers/renderers.js';
import { DescriptionTocItem, DescriptionTocList, DescriptionAnchor } from './view-model/description-anchors.js';
interface SiteConfig {
    baseUrl: string;
}
export declare class Workspace {
    projectPath: string;
    dataModel: DataModel;
    pluginOptions: PluginOptions;
    siteConfig: SiteConfig;
    pluginActions: any;
    collectionNamesByKind: Record<string, string>;
    viewModel: Map<string, CollectionBase>;
    doxygenOptions: DoxygenFileOptions;
    absoluteBaseUrl: string;
    pageBaseUrl: string;
    slugBaseUrl: string;
    menuBaseUrl: string;
    outputFolderPath: string;
    sidebarBaseId: string;
    sidebarCollectionNames: string[];
    compoundsById: Map<string, CompoundBase>;
    membersById: Map<String, Member>;
    descriptionTocLists: DescriptionTocList[];
    descriptionTocItemsById: Map<String, DescriptionTocItem>;
    descriptionAnchorsById: Map<string, DescriptionAnchor>;
    currentCompound: CompoundBase | undefined;
    elementRenderers: Renderers;
    writtenMdFilesCounter: number;
    writtenHtmlFilesCounter: number;
    mainPage: Page | undefined;
    constructor({ dataModel, pluginOptions, siteConfig, pluginActions }: {
        dataModel: DataModel;
        pluginOptions: PluginOptions;
        siteConfig?: SiteConfig;
        pluginActions?: any;
    });
    createVieModelObjects(): void;
    findDescriptionIdsRecursively(compound: CompoundBase, element: AbstractDataModelBase): void;
    createCompoundsHierarchies(): void;
    initializeCompoundsLate(): void;
    createMembersMap(): void;
    initializeMemberLate(): void;
    /**
     * @brief Validate the uniqueness of permalinks.
     */
    validatePermalinks(): void;
    cleanups(): void;
    writeMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        frontMatterCodeLines?: string[];
        title?: string;
        pagePermalink?: string;
    }): Promise<void>;
    private renderString;
    renderElementsArrayToLines(elements: Object[] | undefined, type: string): string[];
    renderElementToLines(element: Object | undefined, type: string): string[];
    renderElementsArrayToString(elements: Object[] | undefined, type: string): string;
    renderElementToString(element: Object | undefined, type: string): string;
    renderMembersIndexItemToLines({ template, type, name, childrenLines }: {
        template?: string | undefined;
        type?: string | undefined;
        name: string;
        childrenLines?: string[] | undefined;
    }): string[];
    renderTreeTableRowToLines({ itemIconLetter, itemIconClass, itemLabel, itemLink, depth, description }: {
        itemIconLetter?: string;
        itemIconClass?: string;
        itemLabel: string;
        itemLink: string;
        depth: number;
        description: string;
    }): string[];
    getPermalink({ refid, kindref }: {
        refid: string;
        kindref: string;
    }): string | undefined;
    getPagePermalink(refid: string, noWarn?: boolean): string | undefined;
    getXrefPermalink(id: string): string;
}
export {};
