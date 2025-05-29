import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarItem } from '../../plugin/types.js';
import { Workspace } from '../workspace.js';
import { FrontMatter } from '../types.js';
import { ProgramListingDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class FilesAndFolders extends CollectionBase {
    compoundFoldersById: Map<string, Folder>;
    compoundFilesById: Map<string, File>;
    topLevelFolders: Folder[];
    topLevelFiles: File[];
    filesByPath: Map<String, File>;
    constructor(workspace: Workspace);
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    private getRelativePathRecursively;
    createSidebarItems(): SidebarItem[];
    private createFolderSidebarItemRecursively;
    private createFileSidebarItem;
    createMenuItems(): MenuItem[];
    generateIndexDotMdxFile(): Promise<void>;
    private generateIndexMdxFileRecursively;
    private generateFileIndexMdx;
}
export declare class Folder extends CompoundBase {
    childrenFileIds: string[];
    childrenFiles: File[];
    childrenFolderIds: string[];
    childrenFolders: Folder[];
    relativePath: string;
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    renderToMdxLines(frontMatter: FrontMatter): string[];
}
export declare class File extends CompoundBase {
    relativePath: string;
    listingLineNumbers: Set<Number>;
    programListing: ProgramListingDataModel | undefined;
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    renderToMdxLines(frontMatter: FrontMatter): string[];
}
