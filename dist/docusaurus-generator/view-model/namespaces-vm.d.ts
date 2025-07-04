import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
export declare class Namespaces extends CollectionBase {
    topLevelNamespaces: Namespace[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(sidebarCategory: SidebarCategory): void;
    private createNamespaceItemRecursively;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
    private generateIndexMdFileRecursively;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
export declare class Namespace extends CompoundBase {
    unqualifiedName: string;
    isAnonymous: boolean;
    constructor(collection: Namespaces, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    hasAnyContent(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
}
