import { AbstractDataModelBase } from '../doxygen/data-model/types.js';
import { type DataModel } from '../doxygen/data-model/data-model.js';
import { Renderers } from './renderers/renderers.js';
import type { CliOptions } from './cli-options.js';
import type { FrontMatter } from './types.js';
import { type File } from './view-model/files-and-folders-vm.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { type Page } from './view-model/pages-vm.js';
import { ViewModel } from './view-model/view-model.js';
export declare class Workspace extends Renderers {
    options: CliOptions;
    dataModel: DataModel;
    viewModel: ViewModel;
    projectPath: string;
    doxygenOptions: DoxygenFileOptions;
    absoluteBaseUrl: string;
    pageBaseUrl: string;
    slugBaseUrl: string;
    menuBaseUrl: string;
    outputFolderPath: string;
    sidebarBaseId: string;
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
    writtenMdFilesCounter: number;
    writtenHtmlFilesCounter: number;
    collectionNamesByKind: Record<string, string>;
    sidebarCollectionNames: string[];
    constructor(dataModel: DataModel);
    writeOutputMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink, }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        frontMatterCodeLines?: string[];
        title?: string;
        pagePermalink?: string;
    }): Promise<void>;
    skipElementsPara(elements: (AbstractDataModelBase | string)[] | undefined): void;
    getPermalink({ refid, kindref, }: {
        refid: string;
        kindref: string;
    }): string | undefined;
    getPagePermalink(refid: string, noWarn?: boolean): string | undefined;
    getXrefPermalink(id: string): string;
}
//# sourceMappingURL=workspace.d.ts.map