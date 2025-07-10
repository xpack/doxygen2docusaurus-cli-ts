import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { MenuItem, SidebarCategory, FrontMatter } from '../types.js';
import type { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from '../../doxygen/data-model/compounds/compoundreftype-dm.js';
import type { TemplateParamListDataModel } from '../../doxygen/data-model/compounds/templateparamlisttype-dm.js';
export declare class Classes extends CollectionBase {
    topLevelClasses: Class[];
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    createCompoundsHierarchies(): void;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    private createSidebarItemRecursively;
    createMenuItems(): MenuItem[];
    generateIndexDotMdFile(): Promise<void>;
    private generateIndexMdFileRecursively;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
export declare class Class extends CompoundBase {
    baseClassIds: Set<string>;
    baseClasses: Class[];
    fullyQualifiedName: string;
    unqualifiedName: string;
    templateParameters: string;
    classFullName: string;
    template: string | undefined;
    baseCompoundRefs: BaseCompoundRefDataModel[] | undefined;
    derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined;
    templateParamList: TemplateParamListDataModel | undefined;
    constructor(collection: Classes, compoundDef: CompoundDefDataModel);
    initializeLate(): void;
    hasAnyContent(): boolean;
    renderToLines(frontMatter: FrontMatter): string[];
    renderIndexToLines(): string[];
}
