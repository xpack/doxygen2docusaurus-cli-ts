import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
/**
 * Manages the collection of group documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of group-based documentation,
 * including nested group hierarchies, sidebar generation, and index
 * file creation. Groups provide a way to organise related documentation
 * elements beyond the natural file and namespace structure.
 *
 * @public
 */
export declare class Groups extends CollectionBase {
    /**
     * Array of top-level groups without parent groups.
     *
     * @remarks
     * Contains groups that are not nested within other groups,
     * used for organising hierarchical displays and group trees.
     */
    topLevelGroups: Group[];
    /**
     * Adds a group compound to the collection.
     *
     * @remarks
     * Creates a new Group instance from the compound definition and registers
     * it in the collection for later processing and hierarchy creation.
     *
     * @param compoundDef - The compound definition for the group
     * @returns The created Group instance
     */
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between group compounds.
     *
     * @remarks
     * Establishes parent-child relationships based on group nesting data,
     * building the group hierarchy tree and identifying top-level groups
     * that have no parent groups.
     */
    createCompoundsHierarchies(): void;
    /**
     * Adds group sidebar items to the provided sidebar category.
     *
     * @remarks
     * Creates hierarchical sidebar navigation for groups, either as a "Topics"
     * category when multiple top-level groups exist, or as individual items
     * when only one top-level group is present.
     *
     * @param sidebarCategory - The sidebar category to populate with group items
     *
     * @public
     */
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates sidebar items recursively for group hierarchies.
     *
     * @remarks
     * Generates appropriate sidebar structure based on group nesting, creating
     * document items for leaf groups and category items for groups with children.
     * This method builds the hierarchical navigation structure.
     *
     * @param group - The group to create a sidebar item for
     * @returns The created sidebar item, or undefined if the group is not
     *   displayable
     *
     * @private
     */
    private createSidebarItemRecursively;
    /**
     * Creates navbar items for group navigation.
     *
     * @remarks
     * Generates appropriate navbar entries based on the number of top-level
     * groups. Creates a "Topics" navigation item when multiple groups exist,
     * or a direct link to the single group when only one is present.
     *
     * @returns Array of navbar items for group navigation
     *
     * @public
     */
    createNavbarItems(): NavbarItem[];
    /**
     * Generates the main groups index Markdown file.
     *
     * @remarks
     * Creates a comprehensive index file for topics when multiple top-level
     * groups exist. The index includes a hierarchical tree table showing
     * all groups with their descriptions and navigation links.
     *
     * @public
     */
    generateIndexDotMdFile(): Promise<void>;
    /**
     * Generates a topics table for embedding in other documentation.
     *
     * @remarks
     * Creates an HTML tree table representation of all top-level groups with
     * their brief descriptions. This method is used to embed topic summaries
     * in main documentation pages or overview sections.
     *
     * @returns Array of HTML lines representing the topics table
     *
     * @public
     */
    generateTopicsTable(): string[];
    /**
     * Recursively generates index content for group hierarchies.
     *
     * @remarks
     * Creates hierarchical HTML tree table rows for groups and their children,
     * including appropriate indentation and navigation links. This method
     * builds the complete nested structure for group documentation indices.
     *
     * @param group - The group to generate index content for
     * @param depth - The current nesting depth for indentation
     * @returns Array of HTML lines representing the group hierarchy
     *
     * @private
     */
    private generateIndexMdFileRecursively;
}
/**
 * Represents a group compound for topic-based documentation organisation.
 *
 * @remarks
 * Groups provide a logical organisation method for related documentation
 * elements beyond the natural file and namespace structure. They support
 * hierarchical nesting and are commonly used for thematic documentation
 * organisation in complex projects.
 *
 * @public
 */
export declare class Group extends CompoundBase {
    /**
     * Initialises a new Group instance from compound definition data.
     *
     * @remarks
     * Processes the group metadata including nested group relationships,
     * title extraction, and permalink generation. Sets up the group for
     * integration into the documentation hierarchy and navigation structure.
     *
     * @param collection - The parent Groups collection
     * @param compoundDef - The compound definition containing group metadata
     *
     * @public
     */
    constructor(collection: Groups, compoundDef: CompoundDefDataModel);
    /**
     * Renders the group documentation to Markdown lines.
     *
     * @remarks
     * Generates comprehensive group documentation including brief description,
     * inner compound indices, section indices, detailed description, and
     * sections. The output follows Docusaurus conventions for topic pages
     * with appropriate navigation and content organisation.
     *
     * @param frontMatter - The front matter configuration for the page
     * @returns Array of Markdown lines representing the group documentation
     *
     * @public
     */
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=groups-vm.d.ts.map