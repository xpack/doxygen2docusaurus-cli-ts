import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
export declare class Groups extends CollectionBase {
    topLevelGroups: Group[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(sidebarCategory: SidebarCategory): void;
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
