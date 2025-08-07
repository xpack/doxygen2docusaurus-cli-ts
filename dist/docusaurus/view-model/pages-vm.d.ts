import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
export declare class Pages extends CollectionBase {
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    createTopPagesSidebarItems(sidebarCategory: SidebarCategory): void;
    createNavbarItems(): NavbarItem[];
    generateIndexDotMdFile(): Promise<void>;
}
export declare class Page extends CompoundBase {
    constructor(collection: Pages, compoundDef: CompoundDefDataModel);
    isTopPage(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=pages-vm.d.ts.map