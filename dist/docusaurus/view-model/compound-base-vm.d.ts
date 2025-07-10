import type { FrontMatter } from '../types.js';
import type { CollectionBase } from './collection-base.js';
import { Section } from './members-vm.js';
import type { TemplateParamListDataModel } from '../../doxygen/data-model/compounds/templateparamlisttype-dm.js';
import type { LocationDataModel } from '../../doxygen/data-model/compounds/locationtype-dm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import type { IncludesDataModel } from '../../doxygen/data-model/compounds/inctype-dm.js';
import type { ReferenceDataModel, ReferencedByDataModel } from '../../doxygen/data-model/compounds/referencetype-dm.js';
export declare abstract class CompoundBase {
    kind: string;
    compoundName: string;
    id: string;
    collection: CollectionBase;
    titleHtmlString: string | undefined;
    locationFilePath: string | undefined;
    parent?: CompoundBase;
    childrenIds: string[];
    children: CompoundBase[];
    /**
     * @brief Relative path to the output folder.
     *
     * Starts with plural kind.
     *
     * If undefined, the compound must not
     * be referred in the sidebar.
     */
    docusaurusId: string | undefined;
    /**
     * @brief Short name, to fit the limited space in the sidebar.
     *
     * If undefined, the compound must not
     * be referred in the sidebar.
     */
    sidebarLabel: string | undefined;
    /**
     * @brief The part below outputFolderPath.
     *
     * No leading slash.
     *
     * If undefined, the MD file for the compound must not be generated.
     */
    relativePermalink: string | undefined;
    /** The name shown in the index section. */
    indexName: string;
    /**
     * @brief
     * The named used in the tree entry rendered in the top index pages.
     */
    treeEntryName: string;
    /** The name shown in the page title. */
    pageTitle: string;
    briefDescriptionHtmlString: string | undefined;
    detailedDescriptionHtmlLines: string[] | undefined;
    hasSect1InDescription: boolean;
    locationLines: string[] | undefined;
    sections: Section[];
    locationSet: Set<string>;
    includes: IncludesDataModel[] | undefined;
    innerCompounds: Map<string, CompoundDefDataModel> | undefined;
    _private: {
        _compoundDef?: CompoundDefDataModel | undefined;
    };
    constructor(collection: CollectionBase, compoundDef: CompoundDefDataModel);
    createSections(classUnqualifiedName?: string): void;
    private reorderSectionDefs;
    private adjustSectionKind;
    initializeLate(): void;
    isOperator(name: string): boolean;
    abstract renderToLines(frontMatter: FrontMatter): string[];
    renderBriefDescriptionToHtmlString({ briefDescriptionHtmlString, todo, morePermalink, }: {
        briefDescriptionHtmlString: string | undefined;
        todo?: string;
        morePermalink?: string | undefined;
    }): string;
    renderDetailedDescriptionToHtmlLines({ briefDescriptionHtmlString, detailedDescriptionHtmlLines, todo, showHeader, showBrief, }: {
        briefDescriptionHtmlString?: string | undefined;
        detailedDescriptionHtmlLines: string[] | undefined;
        todo?: string;
        showHeader: boolean;
        showBrief?: boolean;
    }): string[];
    hasInnerIndices(): boolean;
    renderInnerIndicesToLines({ suffixes, }: {
        suffixes?: string[];
    }): string[];
    hasSections(): boolean;
    renderSectionIndicesToLines(): string[];
    renderIncludesIndexToLines(): string[];
    renderSectionsToLines(): string[];
    renderLocationToLines(location: LocationDataModel | undefined): string[];
    renderGeneratedFromToLines(): string[];
    renderReferencesToHtmlString(references: ReferenceDataModel[] | undefined): string;
    renderReferencedByToHtmlString(referencedBy: ReferencedByDataModel[] | undefined): string;
    /**
     * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
     * @param templateParamList
     * @returns
     */
    collectTemplateParameters({ templateParamList, withDefaults, }: {
        templateParamList: TemplateParamListDataModel | undefined;
        withDefaults?: boolean;
    }): string[];
    isTemplate(templateParamList: TemplateParamListDataModel | undefined): boolean;
    collectTemplateParameterNames(templateParamList: TemplateParamListDataModel): string[];
    renderTemplateParametersToString({ templateParamList, withDefaults, }: {
        templateParamList: TemplateParamListDataModel | undefined;
        withDefaults?: boolean;
    }): string;
    renderTemplateParameterNamesToString(templateParamList: TemplateParamListDataModel | undefined): string;
    hasAnyContent(): boolean;
}
//# sourceMappingURL=compound-base-vm.d.ts.map