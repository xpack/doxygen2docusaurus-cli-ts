import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { MenuItem, SidebarCategory, FrontMatter } from '../types.js';
export declare class Namespaces extends CollectionBase {
    topLevelNamespaces: Namespace[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
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
//# sourceMappingURL=namespaces-vm.d.ts.map