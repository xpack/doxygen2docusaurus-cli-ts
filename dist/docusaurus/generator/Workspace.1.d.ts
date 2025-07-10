import { type DataModel, AbstractDataModelBase, type DataModelElement } from '../../doxygen/data-model/types.js';
import { Renderers } from '../elements-renderers/renderers.js';
import type { CliOptions } from '../options.js';
import type { FrontMatter } from '../types.js';
import type { CollectionBase } from '../view-model/collection-base.js';
import type { CompoundBase } from '../view-model/compound-base-vm.js';
import { DescriptionTocList, DescriptionTocItem, DescriptionAnchor } from '../view-model/description-anchors.js';
import { type File } from '../view-model/files-and-folders-vm.js';
import { Member } from '../view-model/members-vm.js';
import { DoxygenFileOptions } from '../view-model/options.js';
import { type Page } from '../view-model/pages-vm.js';
export declare class Workspace {
    projectPath: string;
    dataModel: DataModel;
    options: CliOptions;
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
    membersById: Map<string, Member>;
    descriptionTocLists: DescriptionTocList[];
    descriptionTocItemsById: Map<string, DescriptionTocItem>;
    descriptionAnchorsById: Map<string, DescriptionAnchor>;
    currentCompound: CompoundBase | undefined;
    elementRenderers: Renderers;
    writtenMdFilesCounter: number;
    writtenHtmlFilesCounter: number;
    mainPage: Page | undefined;
    filesByPath: Map<string, File>;
    /**
     * @brief Map to keep track of indices that have content.
     *
     * @details
     * The map keys are:
     * - classes
     * - namespaces
     * - files
     *
     * and the Set may include:
     * - all
     * - classes
     * - namespaces
     * - functions
     * - variables
     * - typedefs
     * - enums
     * - enumvalues
     */
    indicesMaps: Map<string, Set<string>>;
    constructor({ dataModel, options, }: {
        dataModel: DataModel;
        options: CliOptions;
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
    writeMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink, }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        frontMatterCodeLines?: string[];
        title?: string;
        pagePermalink?: string;
    }): Promise<void>;
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
    skipElementsPara(elements: Array<AbstractDataModelBase | string> | undefined): void;
    getPermalink({ refid, kindref, }: {
        refid: string;
        kindref: string;
    }): string | undefined;
    getPagePermalink(refid: string, noWarn?: boolean): string | undefined;
    getXrefPermalink(id: string): string;
}
