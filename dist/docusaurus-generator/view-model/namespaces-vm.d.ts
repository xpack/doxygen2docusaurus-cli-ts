import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarItem } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
export declare class Namespaces extends CollectionBase {
    topLevelNamespaces: Namespace[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(): SidebarItem[];
    private createNamespaceItemRecursively;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
    private generateIndexMdFileRecursively;
}
export declare class Namespace extends CompoundBase {
    unqualifiedName: string;
    isAnonymous: boolean;
    constructor(collection: Namespaces, compoundDef: CompoundDefDataModel);
    renderToLines(frontMatter: FrontMatter): string[];
}
