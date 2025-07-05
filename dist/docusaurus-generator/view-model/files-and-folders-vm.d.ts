import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { Workspace } from '../workspace.js';
import { FrontMatter } from '../types.js';
import { ProgramListingDataModel } from '../../data-model/compounds/descriptiontype-dm.js';
export declare class FilesAndFolders extends CollectionBase {
    compoundFoldersById: Map<string, Folder>;
    compoundFilesById: Map<string, File>;
    topLevelFolders: Folder[];
    topLevelFiles: File[];
    constructor(workspace: Workspace);
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    private getRelativePathRecursively;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    private createFolderSidebarItemRecursively;
    private createFileSidebarItem;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
    private generateIndexMdFileRecursively;
    private generateFileIndexMd;
    hasCompounds(): boolean;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
export declare class Folder extends CompoundBase {
    childrenFileIds: string[];
    childrenFolderIds: string[];
    relativePath: string;
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    hasChildren(): boolean;
    hasAnyContent(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
    initializeLate(): void;
}
export declare class File extends CompoundBase {
    relativePath: string;
    listingLineNumbers: Set<Number>;
    programListing: ProgramListingDataModel | undefined;
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    hasAnyContent(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
}
