import type { Workspace } from '../workspace.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import type { NavbarItem, SidebarCategory } from '../types.js';
import type { CompoundBase } from './compound-base-vm.js';
import type { TreeEntryBase } from './tree-entries-vm.js';
export declare abstract class CollectionBase {
    workspace: Workspace;
    collectionCompoundsById: Map<string, CompoundBase>;
    constructor(workspace: Workspace);
    abstract addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    abstract createCompoundsHierarchies(): void;
    abstract addSidebarItems(sidebarCategory: SidebarCategory): void;
    abstract createNavbarItems(): NavbarItem[];
    abstract generateIndexDotMdFile(): Promise<void>;
    generatePerInitialsIndexMdFiles(): Promise<void>;
    isVisibleInSidebar(): boolean;
    orderPerInitials(entriesMap: Map<string, TreeEntryBase>): Map<string, TreeEntryBase[]>;
    outputEntries(entriesPerInitialsMap: Map<string, TreeEntryBase[]>): string[];
    generateIndexFile({ group, fileKind, title, description, map, filter, }: {
        group: string;
        fileKind: string;
        title: string;
        description: string;
        map: Map<string, TreeEntryBase>;
        filter: (kind: string) => boolean;
    }): Promise<void>;
}
//# sourceMappingURL=collection-base.d.ts.map