import { Workspace } from '../workspace.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { CompoundBase } from './compound-base-vm.js';
import { TreeEntryBase } from './tree-entries-vm.js';
export declare abstract class CollectionBase {
    workspace: Workspace;
    collectionCompoundsById: Map<string, CompoundBase>;
    constructor(workspace: Workspace);
    abstract addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    abstract createCompoundsHierarchies(): void;
    abstract addSidebarItems(sidebarCategory: SidebarCategory): void;
    abstract createMenuItems(): MenuItem[];
    abstract generateIndexDotMdFile(): Promise<void>;
    generatePerInitialsIndexMdFiles(): Promise<void>;
    hasCompounds(): boolean;
    orderPerInitials(entriesMap: Map<string, TreeEntryBase>): Map<string, TreeEntryBase[]>;
    outputEntries(entriesPerInitialsMap: Map<string, TreeEntryBase[]>): string[];
    generateIndexFile({ group, fileKind, title, description, map, filter }: {
        group: string;
        fileKind: string;
        title: string;
        description: string;
        map: Map<string, TreeEntryBase>;
        filter: (kind: string) => boolean;
    }): Promise<void>;
}
