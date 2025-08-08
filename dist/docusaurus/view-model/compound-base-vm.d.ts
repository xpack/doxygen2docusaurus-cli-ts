import type { FrontMatter } from '../types.js';
import type { CollectionBase } from './collection-base.js';
import { Section } from './members-vm.js';
import type { TemplateParamListDataModel } from '../../doxygen/data-model/compounds/templateparamlisttype-dm.js';
import type { LocationDataModel } from '../../doxygen/data-model/compounds/locationtype-dm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import type { IncludesDataModel } from '../../doxygen/data-model/compounds/inctype-dm.js';
import type { ReferenceDataModel, ReferencedByDataModel } from '../../doxygen/data-model/compounds/referencetype-dm.js';
/**
 * Abstract base class for all compound documentation objects.
 *
 * The CompoundBase class provides common functionality and structure for
 * all types of documentation compounds (classes, files, namespaces, etc.),
 * including rendering, navigation, and metadata management.
 *
 * @public
 */
export declare abstract class CompoundBase {
    /** The Doxygen compound kind (class, file, namespace, etc.). */
    kind: string;
    /** The display name of the compound. */
    compoundName: string;
    /** Unique identifier for the compound. */
    id: string;
    /** The collection this compound belongs to. */
    collection: CollectionBase;
    /** HTML-rendered title string for display purposes. */
    titleHtmlString: string | undefined;
    /** File path where the compound is located in the source. */
    locationFilePath: string | undefined;
    /** Parent compound in the hierarchy (not used for classes). */
    parent?: CompoundBase;
    /**
     * Array of child compound identifiers for two-step initialisation.
     *
     * Set in 2 steps, first the Ids and then, when all objects are in,
     * the references.
     * Folder objects use separate arrays for files and folders children.
     */
    childrenIds: string[];
    /** Array of resolved child compound instances. */
    children: CompoundBase[];
    /**
     * Short name for sidebar display within limited space.
     * If undefined, the compound is excluded from the sidebar.
     */
    sidebarLabel: string | undefined;
    /**
     * Relative path to the output folder starting with plural kind.
     * If undefined, the compound is excluded from the sidebar.
     */
    sidebarId: string | undefined;
    /**
     * Relative permalink below outputFolderPath without leading slash.
     * If undefined, no Markdown file is generated for the compound.
     */
    relativePermalink: string | undefined;
    /** The name shown in the index section. */
    indexName: string;
    /** The name used in tree entries for top-level index pages. */
    treeEntryName: string;
    /** The name shown in the page title. */
    pageTitle: string;
    /** HTML-rendered brief description for display purposes. */
    briefDescriptionHtmlString: string | undefined;
    /** HTML-rendered detailed description lines for full documentation. */
    detailedDescriptionHtmlLines: string[] | undefined;
    /** Flag indicating if detailed description contains sect1 elements. */
    hasSect1InDescription: boolean;
    /** Location information lines for rendering file/line references. */
    locationLines: string[] | undefined;
    /** Array of member sections organised by type and visibility. */
    sections: Section[];
    /** Set of unique file locations for this compound. */
    locationSet: Set<string>;
    /** Array of include directives for this compound. */
    includes: IncludesDataModel[] | undefined;
    /** Map of inner compounds organised by type. */
    innerCompounds: Map<string, CompoundDefDataModel> | undefined;
    /** Private data storage for internal compound definition reference. */
    _private: {
        /** Reference to the source data model object. */
        _compoundDef?: CompoundDefDataModel | undefined;
    };
    /**
     * Creates a new compound base instance from definition data.
     *
     * @remarks
     * Initialises the basic compound properties including kind, name,
     * identifier, and optional title and location information. Sets up
     * the collection reference and processes HTML rendering for titles.
     *
     * @param collection - The parent collection managing this compound
     * @param compoundDef - The Doxygen compound definition containing source data
     */
    constructor(collection: CollectionBase, compoundDef: CompoundDefDataModel);
    /**
     * Creates and organises member sections for the compound.
     *
     * @remarks
     * Processes section definitions from the compound data model,
     * reorders them by type and visibility, and creates Section
     * instances for rendering. Sorts sections according to their
     * logical display order.
     *
     * @param classUnqualifiedName - Optional class name for special method
     *   detection
     */
    createSections(classUnqualifiedName?: string): void;
    /**
     * Reorders section definitions by member type and adjusts section kinds.
     *
     * @remarks
     * Processes member definitions and groups them by adjusted section
     * kinds, handling user-defined sections separately. Creates new
     * section definitions organised by member types for consistent
     * display ordering.
     *
     * @param classUnqualifiedName - Optional class name for special method
     *   detection
     * @returns Array of reordered section definitions or undefined if none exist
     */
    private reorderSectionDefs;
    /**
     * Adjusts section kind based on member type and context.
     *
     * @remarks
     * Maps member kinds to appropriate section categories, handling
     * special cases like operators, constructors, destructors, and
     * various member types. Preserves visibility prefixes and applies
     * context-specific adjustments.
     *
     * @param sectionDef - The section definition containing the member
     * @param memberBase - The member whose section kind needs adjustment
     * @param classUnqualifiedName - Optional class name for special method
     *   detection
     * @returns The adjusted section kind string
     */
    private adjustSectionKind;
    /**
     * Performs late-stage initialisation after all compounds are loaded.
     *
     * @remarks
     * Processes description content, location information, member sections,
     * and inner compounds. Renders HTML strings and builds location sets
     * for comprehensive compound documentation. Called after initial
     * object creation phase.
     */
    initializeLate(): void;
    /**
     * Determines if a member name represents an operator function.
     *
     * @remarks
     * Checks if the name starts with 'operator' followed by operator
     * characters, identifying C++ operator overload functions for
     * proper categorisation in documentation sections.
     *
     * @param name - The member name to check
     * @returns True if the name represents an operator function
     */
    isOperator(name: string): boolean;
    /**
     * Renders the compound to an array of markdown lines.
     *
     * @remarks
     * Abstract method that must be implemented by derived classes to
     * generate the complete documentation content for the compound,
     * including descriptions, member listings, and navigation elements.
     *
     * @param frontMatter - The frontmatter configuration for the page
     * @returns Array of markdown strings representing the complete documentation
     */
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
    /**
     * Determines whether the compound has any displayable content.
     *
     * @remarks
     * Checks for the presence of brief descriptions, detailed descriptions,
     * or member sections to determine if the compound documentation page
     * should be generated. Can be overridden by derived classes to add
     * additional content checks.
     *
     * @returns True if the compound has content worth displaying
     */
    hasAnyContent(): boolean;
}
//# sourceMappingURL=compound-base-vm.d.ts.map