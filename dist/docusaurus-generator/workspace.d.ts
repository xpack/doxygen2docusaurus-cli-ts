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
    collectionNamesByKind: Record<string, string>;
    viewModel: Map<string, CollectionBase>;
    doxygenOptions: DoxygenFileOptions;
    permalinkBaseUrl: string;
    sidebarCollectionNames: string[];
    compoundsById: Map<string, CompoundBase>;
    membersById: Map<String, Member>;
    currentCompound: CompoundBase | undefined;
    elementRenderers: Renderers;
    constructor({ dataModel, pluginOptions, siteConfig }: {
        dataModel: DataModel;
        pluginOptions: PluginOptions;
        siteConfig: any;
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
    writeFile({ filePath, bodyLines, frontMatter, title }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        title?: string;
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
