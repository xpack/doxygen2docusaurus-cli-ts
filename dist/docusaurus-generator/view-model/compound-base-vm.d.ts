import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js';
import { FrontMatter } from '../types.js';
import { CollectionBase } from './collection-base.js';
import { Section } from './members-vm.js';
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js';
import { LocationDataModel } from '../../data-model/compounds/locationtype-dm.js';
import { IncludesDataModel } from '../../data-model/compounds/inctype-dm.js';
export declare abstract class CompoundBase {
    collection: CollectionBase;
    kind: string;
    compoundName: string;
    id: string;
    titleMdxText: string | undefined;
    locationFilePath: string | undefined;
    parent?: CompoundBase;
    childrenIds: string[];
    children: CompoundBase[];
    /** Relative path to the output folder, starts with plural kind. */
    docusaurusId: string;
    /** Short name, to fit the limited space in the sidebar. */
    sidebarLabel: string;
    /** The part below outputFolderPath, no leading slash. */
    relativePermalink: string | undefined;
    /** The name shown in the index section. */
    indexName: string;
    /** The name shown in the page title. */
    pageTitle: string;
    briefDescriptionMdxText: string | undefined;
    detailedDescriptionMdxText: string | undefined;
    hasSect1InDescription: boolean;
    locationMdxText: string | undefined;
    sections: Section[];
    locationSet: Set<string>;
    includes: IncludesDataModel[] | undefined;
    innerCompounds: Map<string, any> | undefined;
    _private: {
        _compoundDef?: CompoundDefDataModel | undefined;
    };
    constructor(collection: CollectionBase, compoundDef: CompoundDefDataModel);
    createSections(classUnqualifiedName?: string | undefined): void;
    private reorderSectionDefs;
    private adjustSectionKind;
    initializeLate(): void;
    isOperator(name: string): boolean;
    abstract renderToMdxLines(frontMatter: FrontMatter): string[];
    renderBriefDescriptionToMdxText({ briefDescriptionMdxText, todo, morePermalink }: {
        briefDescriptionMdxText: string | undefined;
        todo?: string;
        morePermalink?: string | undefined;
    }): string;
    renderDetailedDescriptionToMdxLines({ briefDescriptionMdxText, detailedDescriptionMdxText, todo, showHeader, showBrief }: {
        briefDescriptionMdxText?: string | undefined;
        detailedDescriptionMdxText: string | undefined;
        todo?: string;
        showHeader: boolean;
        showBrief?: boolean;
    }): string[];
    hasInnerIndices(): boolean;
    renderInnerIndicesToMdxLines({ suffixes }: {
        suffixes?: string[];
    }): string[];
    hasSections(): boolean;
    renderSectionIndicesToMdxLines(): string[];
    renderIncludesIndexToMdxLines(): string[];
    renderSectionsToMdxLines(): string[];
    renderLocationToMdxText(location: LocationDataModel | undefined): string;
    renderGeneratedFromToMdxLines(): string[];
    /**
     * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
     * @param templateParamList
     * @returns
     */
    collectTemplateParameters({ templateParamList, withDefaults }: {
        templateParamList: TemplateParamListDataModel | undefined;
        withDefaults?: boolean;
    }): string[];
    isTemplate(templateParamList: TemplateParamListDataModel | undefined): boolean;
    collectTemplateParameterNames(templateParamList: TemplateParamListDataModel): string[];
    renderTemplateParametersToMdxText({ templateParamList, withDefaults }: {
        templateParamList: TemplateParamListDataModel | undefined;
        withDefaults?: boolean;
    }): string;
    renderTemplateParameterNamesToMdxText(templateParamList: TemplateParamListDataModel | undefined): string;
}
