import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { SidebarCategory, FrontMatter, NavbarItem } from '../types.js';
import type { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from '../../doxygen/data-model/compounds/compoundreftype-dm.js';
import type { TemplateParamListDataModel } from '../../doxygen/data-model/compounds/templateparamlisttype-dm.js';
/**
 * Manages the collection of class, struct, and union documentation.
 *
 * @remarks
 * Handles the organisation and generation of class-type compound
 * documentation, including hierarchy creation, sidebar generation,
 * and index file creation. Supports inheritance relationships and
 * alphabetical organisation.
 *
 * @public
 */
export declare class Classes extends CollectionBase {
    /**
     * Array of top-level classes without parent classes.
     *
     * @remarks
     * Contains classes that are not derived from other documented classes,
     * used for organising hierarchical displays and inheritance trees.
     */
    topLevelClasses: Class[];
    /**
     * Adds a class compound to the collection.
     *
     * @remarks
     * Creates a new Class instance from the compound definition and registers
     * it in the collection for later processing and hierarchy creation.
     *
     * @param compoundDef - The compound definition for the class
     * @returns The created Class instance
     */
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between class compounds.
     *
     * @remarks
     * Establishes parent-child relationships based on inheritance data,
     * building the class hierarchy tree and identifying top-level classes
     * that have no documented parent classes.
     */
    createCompoundsHierarchies(): void;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates sidebar item for class hierarchy recursively.
     *
     * @remarks
     * Generates hierarchical sidebar structures for class inheritance
     * trees, creating category items for classes with children and
     * document items for leaf classes. Handles sidebar label and ID
     * generation with proper CSS classes.
     *
     * @param classs - The class to create sidebar item for
     * @returns The sidebar item or undefined if class lacks required data
     */
    private createSidebarItemRecursively;
    createNavbarItems(): NavbarItem[];
    generateIndexDotMdFile(): Promise<void>;
    /**
     * Generates hierarchical index content for class documentation recursively.
     *
     * @remarks
     * Creates HTML tree table rows for class hierarchies with proper
     * indentation, icons, and descriptions. Processes inheritance
     * relationships and generates nested table structures for parent-child
     * class relationships.
     *
     * @param classs - The class to generate index content for
     * @param depth - The current depth level in the hierarchy (1-based)
     * @returns Array of HTML strings representing the tree table rows
     */
    private generateIndexMdFileRecursively;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
/**
 * Represents a single class, struct, or union compound for documentation.
 *
 * @remarks
 * Manages individual class compound data including inheritance relationships,
 * template parameters, member organisation, and documentation generation.
 * Supports multiple inheritance, template specialisation, and hierarchical
 * naming conventions for comprehensive class documentation.
 *
 * @public
 */
export declare class Class extends CompoundBase {
    /** Set of base class IDs for inheritance tracking (multiple inheritance). */
    baseClassIds: Set<string>;
    /** Array of resolved base class instances. */
    baseClasses: Class[];
    /** Fully qualified class name including namespace hierarchy. */
    fullyQualifiedName: string;
    /** Simple class name without namespace qualifiers. */
    unqualifiedName: string;
    /** Template parameter specification string. */
    templateParameters: string;
    /** Complete class name with rendered template parameters. */
    classFullName: string;
    /** Rendered template declaration for display purposes. */
    template: string | undefined;
    /** Direct reference to base compound data model objects. */
    baseCompoundRefs: BaseCompoundRefDataModel[] | undefined;
    /** Direct reference to derived compound data model objects. */
    derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined;
    /** Template parameter list from the compound definition. */
    templateParamList: TemplateParamListDataModel | undefined;
    /**
     * Creates a new Class instance from compound definition data.
     *
     * @remarks
     * Initialises class metadata including inheritance relationships,
     * template parameters, naming conventions, and URL structures.
     * Processes fully qualified names, sidebar labels, and creates
     * hierarchical path structures for documentation generation.
     *
     * @param collection - The parent Classes collection managing this class
     * @param compoundDef - The Doxygen compound definition containing class data
     */
    constructor(collection: Classes, compoundDef: CompoundDefDataModel);
    /**
     * Performs late-stage initialisation after all classes are loaded.
     *
     * @remarks
     * Completes class setup by rendering template parameters to HTML,
     * building full class names with template information, and storing
     * references to compound definition objects for inheritance processing.
     * Called after all compounds are registered.
     */
    initializeLate(): void;
    /**
     * Determines whether the class has any content to display.
     *
     * @remarks
     * Checks for the presence of child classes, inner compounds,
     * member sections, include directives, or base class content
     * to determine if the class documentation page should be
     * generated and displayed.
     *
     * @returns True if the class has displayable content, false otherwise
     */
    hasAnyContent(): boolean;
    /**
     * Renders the complete class documentation to markdown lines.
     *
     * @remarks
     * Generates the full documentation page including class declaration,
     * inheritance relationships, member indices, detailed descriptions,
     * and location information. Handles base and derived class listings
     * with proper HTML table formatting.
     *
     * @param frontMatter - The frontmatter configuration for the page
     * @returns Array of markdown strings representing the complete documentation
     */
    renderToLines(frontMatter: FrontMatter): string[];
    /**
     * Renders the class as an index entry for member listings.
     *
     * @remarks
     * Creates HTML table rows suitable for inclusion in member indices,
     * with links to the class documentation page and brief descriptions.
     * Generates formatted entries with appropriate CSS classes and
     * structure for index displays.
     *
     * @returns Array of HTML strings representing the index entry
     */
    renderIndexToLines(): string[];
}
//# sourceMappingURL=classes-vm.d.ts.map