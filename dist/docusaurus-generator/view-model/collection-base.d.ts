import { Workspace } from '../workspace.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { MenuItem, SidebarItem } from '../../plugin/types.js';
import { CompoundBase } from './compound-base-vm.js';
export declare abstract class CollectionBase {
    workspace: Workspace;
    collectionCompoundsById: Map<string, CompoundBase>;
    constructor(workspace: Workspace);
    abstract addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    abstract createCompoundsHierarchies(): void;
    abstract createSidebarItems(): SidebarItem[];
    abstract createMenuItems(): MenuItem[];
    abstract generateIndexDotMdxFile(): Promise<void>;
}
