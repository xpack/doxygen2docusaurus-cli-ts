import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { MenuItem, SidebarCategory, FrontMatter } from '../types.js';
export declare class Groups extends CollectionBase {
    topLevelGroups: Group[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    private createSidebarItemRecursively;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
    generateTopicsTable(): string[];
    private generateIndexMdFileRecursively;
}
export declare class Group extends CompoundBase {
    constructor(collection: Groups, compoundDef: CompoundDefDataModel);
    renderToLines(frontMatter: FrontMatter): string[];
}
