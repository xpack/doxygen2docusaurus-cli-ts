import { Workspace } from '../workspace.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { CompoundBase } from './compound-base-vm.js';
import { IndexEntryBase } from './indices-vm.js';
export declare abstract class CollectionBase {
    workspace: Workspace;
    collectionCompoundsById: Map<string, CompoundBase>;
    constructor(workspace: Workspace);
    abstract addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    abstract createCompoundsHierarchies(): void;
    abstract createSidebarItems(sidebarCategory: SidebarCategory): void;
    abstract createMenuItems(): MenuItem[];
    abstract generateIndexDotMdFile(): Promise<void>;
    generatePerInitialsIndexMdFiles(): Promise<void>;
    hasCompounds(): boolean;
    orderPerInitials(entriesMap: Map<string, IndexEntryBase>): Map<string, IndexEntryBase[]>;
    outputEntries(entriesPerInitialsMap: Map<string, IndexEntryBase[]>): string[];
    generateIndexFile({ group, fileKind, title, description, map, filter }: {
        group: string;
        fileKind: string;
        title: string;
        description: string;
        map: Map<string, IndexEntryBase>;
        filter: (kind: string) => boolean;
    }): Promise<void>;
}
