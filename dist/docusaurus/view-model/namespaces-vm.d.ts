import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
import { Concept } from './concepts-vm.js';
export declare class Namespaces extends CollectionBase {
    topLevelNamespaces: Namespace[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    findNamespaceByCompoundName(compoundName: string): Namespace | undefined;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    private createNamespaceItemRecursively;
    createNavbarItems(): NavbarItem[];
    generateIndexDotMdFile(): Promise<void>;
    private generateIndexMdFileRecursively;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
export declare class Namespace extends CompoundBase {
    unqualifiedName: string;
    isAnonymous: boolean;
    concepts: Concept[];
    constructor(collection: Namespaces, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    hasAnyContent(): boolean;
    hasConceptsRecursively(): boolean;
    hasConcepts(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=namespaces-vm.d.ts.map