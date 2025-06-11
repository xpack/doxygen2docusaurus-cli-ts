import { CompoundBase } from './compound-base-vm.js';
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import { MenuItem, SidebarItem } from '../../plugin/types.js';
import { FrontMatter } from '../types.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from '../../data-model/compounds/compoundreftype-dm.js';
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js';
import { IndexEntry } from './indices-vm.js';
export declare class Classes extends CollectionBase {
    topLevelClasses: Class[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    createSidebarItems(): SidebarItem[];
    private createSidebarItemRecursively;
    createMenuItems(): MenuItem[];
    generateIndexDotMdxFile(): Promise<void>;
    private generateIndexMdxFileRecursively;
    generatePerInitialsIndexMdxFiles(): Promise<void>;
    orderPerInitials(entriesMap: Map<string, IndexEntry>): Map<string, IndexEntry[]>;
    outputEntries(entriesPerInitialsMap: Map<string, IndexEntry[]>): string[];
}
export declare class Class extends CompoundBase {
    baseClassIds: Set<string>;
    baseClasses: Class[];
    fullyQualifiedName: string;
    unqualifiedName: string;
    templateParameters: string;
    classFullNameMdxText: string;
    templateMdxText: string | undefined;
    baseCompoundRefs: BaseCompoundRefDataModel[] | undefined;
    derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined;
    templateParamList: TemplateParamListDataModel | undefined;
    constructor(collection: Classes, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    renderToMdxLines(frontMatter: FrontMatter): string[];
    renderIndexToMdxLines(): string[];
}
