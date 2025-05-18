import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarItem } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
export declare class Pages extends CollectionBase {
    mainPage: Page | undefined;
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(): SidebarItem[];
    createMenuItems(): MenuItem[];
    generateIndexDotMdxFile(): Promise<void>;
}
export declare class Page extends CompoundBase {
    constructor(collection: Pages, compoundDef: CompoundDefDataModel);
    renderToMdxLines(frontMatter: FrontMatter): string[];
}
