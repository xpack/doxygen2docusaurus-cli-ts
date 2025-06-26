import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarCategory } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
export declare class Pages extends CollectionBase {
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(sidebarCategory: SidebarCategory): void;
    createTopPagesSidebarItems(sidebarCategory: SidebarCategory): void;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
}
export declare class Page extends CompoundBase {
    constructor(collection: Pages, compoundDef: CompoundDefDataModel);
    isTopPage(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
}
