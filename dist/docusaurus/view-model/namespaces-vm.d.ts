import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
/**
 * Manages the collection of namespace documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of namespace-based documentation,
 * including nested namespace hierarchies, sidebar generation, and comprehensive
 * index file creation. Namespaces provide logical code organisation beyond
 * file boundaries, supporting complex software architectures.
 *
 * @public
 */
export declare class Namespaces extends CollectionBase {
    /**
     * Array of top-level namespaces without parent namespaces.
     *
     * @remarks
     * Contains namespaces that are not nested within other namespaces,
     * used for organising hierarchical displays and namespace trees.
     */
    topLevelNamespaces: Namespace[];
    /**
     * Adds a namespace compound to the collection.
     *
     * @remarks
     * Creates a new Namespace instance from the compound definition and registers
     * it in the collection for later processing. Anonymous namespaces with empty
     * names are skipped unless they contain child namespaces.
     *
     * @param compoundDef - The compound definition for the namespace
     * @returns The created Namespace instance
     *
     * @public
     */
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between namespace compounds.
     *
     * @remarks
     * Establishes parent-child relationships based on namespace nesting data,
     * building the namespace hierarchy tree and identifying top-level namespaces
     * that have no parent. This enables proper nested namespace navigation
     * and documentation organisation.
     *
     * @public
     */
    createCompoundsHierarchies(): void;
    /**
     * Adds namespace sidebar items to the provided sidebar category.
     *
     * @remarks
     * Creates comprehensive namespace navigation including hierarchical namespace
     * trees and specialised indices for classes, functions, variables, typedefs,
     * enums, and enum values. The structure provides multiple access paths to
     * namespace content for improved user navigation.
     *
     * @param sidebarCategory - The sidebar category to populate with namespace
     *   items
     *
     * @public
     */
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates sidebar items recursively for namespace hierarchies.
     *
     * @remarks
     * Generates appropriate sidebar structure based on namespace nesting,
     * creating document items for leaf namespaces and category items for
     * namespaces with children. This method builds the hierarchical navigation
     * structure with proper ellipsis styling for nested content.
     *
     * @param namespace - The namespace to create a sidebar item for
     * @returns The created sidebar item, or undefined if the namespace is not
     *   displayable
     *
     * @private
     */
    private createNamespaceItemRecursively;
    /**
     * Creates navbar items for namespace navigation.
     *
     * @remarks
     * Generates a navigation bar item that provides access to the main
     * namespaces index page, enabling users to explore namespace hierarchies
     * and specialised namespace indices from the top-level navigation.
     *
     * @returns Array containing the namespaces navbar item
     *
     * @public
     */
    createNavbarItems(): NavbarItem[];
    /**
     * Generates the main namespaces index Markdown file.
     *
     * @remarks
     * Creates a comprehensive index file for namespaces when top-level namespaces
     * exist. The index includes a hierarchical tree table showing all namespaces
     * with their descriptions and navigation links, providing a complete overview
     * of the project's namespace organisation.
     *
     * @public
     */
    generateIndexDotMdFile(): Promise<void>;
    /**
     * Recursively generates index content for namespace hierarchies.
     *
     * @remarks
     * Creates hierarchical HTML tree table rows for namespaces and their
     * children, including appropriate indentation, icons, and navigation links.
     * This method builds the complete nested structure for namespace
     * documentation indices with proper depth handling.
     *
     * @param namespace - The namespace to generate index content for
     * @param depth - The current nesting depth for indentation
     * @returns Array of HTML lines representing the namespace hierarchy
     *
     * @private
     */
    private generateIndexMdFileRecursively;
    /**
     * Generates specialised namespace index files by content type.
     *
     * @remarks
     * Creates comprehensive index files for different types of namespace content
     * including all definitions, classes, functions, variables, typedefs, enums,
     * and enum values. Each index provides filtered views of namespace content
     * for targeted exploration and documentation access.
     *
     * @public
     */
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
/**
 * Represents a namespace compound for code organisation documentation.
 *
 * @remarks
 * Namespaces provide logical code organisation beyond file boundaries,
 * supporting complex software architectures with hierarchical structure.
 * Handles both named and anonymous namespaces with appropriate documentation
 * generation, including special handling for compiler-generated anonymous
 * namespaces.
 *
 * @public
 */
export declare class Namespace extends CompoundBase {
    /**
     * The unqualified namespace name without scope.
     *
     * @remarks
     * Contains the simple name of the namespace without parent scope
     * qualifiers, used for display and navigation purposes.
     */
    unqualifiedName: string;
    /**
     * Indicates if this is an anonymous namespace.
     *
     * @remarks
     * True for anonymous namespaces that don't have explicit names,
     * affecting how the namespace is displayed and documented.
     */
    isAnonymous: boolean;
    /**
     * Initialises a new Namespace instance from compound definition data.
     *
     * @remarks
     * Processes namespace metadata including nested namespace relationships,
     * name extraction, and permalink generation. Handles special cases for
     * anonymous namespaces and compiler-generated namespace structures.
     * Sets up the namespace for integration into the documentation hierarchy.
     *
     * @param collection - The parent Namespaces collection
     * @param compoundDef - The compound definition containing namespace metadata
     *
     * @public
     */
    constructor(collection: Namespaces, compoundDef: CompoundDefDataModel);
    /**
     * Performs late initialisation for namespaces with content validation.
     *
     * @remarks
     * Validates namespace content and conditionally disables sidebar generation
     * for empty namespaces. This ensures that namespaces without meaningful
     * documentation do not appear in the generated sidebar navigation.
     *
     * @public
     */
    initializeLate(): void;
    /**
     * Determines if the namespace has any documentable content.
     *
     * @remarks
     * Checks for child namespaces with content, inner compounds beyond just
     * nested namespaces, and base class content to determine if the namespace
     * should be included in documentation. This method helps filter empty
     * namespaces from the generated output.
     *
     * @returns True if the namespace contains documentable content, false
     *   otherwise
     *
     * @public
     */
    hasAnyContent(): boolean;
    /**
     * Renders the namespace documentation to Markdown lines.
     *
     * @remarks
     * Generates comprehensive namespace documentation including brief
     * description, namespace definition syntax, inner compound indices, section
     * indices, detailed description, and sections. The output follows Docusaurus
     * conventions for namespace pages with proper navigation and content
     * organisation.
     *
     * @param frontMatter - The front matter configuration for the page
     * @returns Array of Markdown lines representing the namespace documentation
     *
     * @public
     */
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=namespaces-vm.d.ts.map