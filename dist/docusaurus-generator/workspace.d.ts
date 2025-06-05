import { DataModel } from '../data-model/types.js';
import { PluginOptions } from '../plugin/options.js';
import { CollectionBase } from './view-model/collection-base.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { CompoundBase } from './view-model/compound-base-vm.js';
import { FrontMatter } from './types.js';
import { Member } from './view-model/members-vm.js';
import { Renderers } from './elements-renderers/renderers.js';
export declare class Workspace {
    dataModel: DataModel;
    pluginOptions: PluginOptions;
    siteConfig: any;
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
    currentCompound: CompoundBase | undefined;
    elementRenderers: Renderers;
    constructor({ dataModel, pluginOptions, siteConfig, pluginActions }: {
        dataModel: DataModel;
        pluginOptions: PluginOptions;
        siteConfig: any;
        pluginActions?: any;
    });
    createVieModelObjects(): void;
    createCompoundsHierarchies(): void;
    initializeCompoundsLate(): void;
    createMembersMap(): void;
    initializeMemberLate(): void;
    /**
     * @brief Validate the uniqueness of permalinks.
     */
    validatePermalinks(): void;
    cleanups(): void;
    writeMdxFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        frontMatterCodeLines?: string[];
        title?: string;
        pagePermalink?: string;
    }): Promise<void>;
    renderElementsToMdxLines(elements: Object[] | undefined): string[];
    renderElementToMdxLines(element: Object | undefined): string[];
    renderElementsToMdxText(elements: Object[] | undefined): string;
    renderElementToMdxText(element: Object | undefined): string;
    getPermalink({ refid, kindref }: {
        refid: string;
        kindref: string;
    }): string;
    getPagePermalink(refid: string): string;
    getXrefPermalink(id: string): string;
}
