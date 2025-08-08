import type { Workspace } from '../workspace.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import type { NavbarItem, SidebarCategory } from '../types.js';
import type { CompoundBase } from './compound-base-vm.js';
import type { TreeEntryBase } from './tree-entries-vm.js';
/**
 * Base class for managing collections of documentation compounds.
 *
 * @remarks
 * Provides common functionality for organising and managing different
 * types of documentation collections such as classes, namespaces, files,
 * and groups. Handles hierarchy creation, sidebar generation, and index
 * file creation.
 *
 * @public
 */
export declare abstract class CollectionBase {
    /** The workspace instance providing global configuration and utilities. */
    workspace: Workspace;
    /** Map storing compound instances indexed by their unique identifiers. */
    collectionCompoundsById: Map<string, CompoundBase>;
    /**
     * Creates a new collection base instance.
     *
     * @remarks
     * Initialises the workspace reference and creates an empty map for
     * storing compound instances indexed by their identifiers.
     *
     * @param workspace - The workspace instance containing global configuration
     */
    constructor(workspace: Workspace);
    /**
     * Adds a compound definition to the collection.
     *
     * @remarks
     * Abstract method that must be implemented by derived classes to handle
     * the specific compound type addition logic.
     *
     * @param compoundDef - The compound definition data model to add
     * @returns The created compound base instance
     */
    abstract addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between compounds.
     *
     * @remarks
     * Abstract method that organises compounds into their appropriate
     * hierarchical structure based on the collection type.
     */
    abstract createCompoundsHierarchies(): void;
    /**
     * Adds items to the sidebar category for navigation.
     *
     * @remarks
     * Abstract method that populates the sidebar with appropriate navigation
     * items for this collection type.
     *
     * @param sidebarCategory - The sidebar category to populate
     */
    abstract addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates navigation bar items for the top-level menu.
     *
     * @remarks
     * Abstract method that generates navbar dropdown items appropriate
     * for this collection type.
     *
     * @returns Array of navbar items for the collection
     */
    abstract createNavbarItems(): NavbarItem[];
    /**
     * Generates the main index Markdown file for the collection.
     *
     * @remarks
     * Abstract method that creates the primary index page listing all
     * items in the collection with appropriate organisation.
     */
    abstract generateIndexDotMdFile(): Promise<void>;
    /**
     * Generates index files organised by initial letters.
     *
     * @remarks
     * Optional method that can be overridden to create alphabetical
     * index pages when the collection is large enough to warrant
     * subdivision by initial letters.
     */
    generatePerInitialsIndexMdFiles(): Promise<void>;
    /**
     * Determines whether the collection should appear in the sidebar.
     *
     * @remarks
     * Collections are visible in the sidebar when they contain at least
     * one compound. Empty collections are hidden to avoid clutter.
     *
     * @returns True if the collection has compounds and should be visible
     */
    isVisibleInSidebar(): boolean;
    /**
     * Organises tree entries by their initial letters for alphabetical indexing.
     *
     * @remarks
     * Groups collection entries by their first letter to enable creation
     * of alphabetical index pages. Handles special characters like tildes
     * and ensures consistent lowercase grouping.
     *
     * @param entriesMap - Map of tree entries to organise
     * @returns Map grouping entries by their initial letters
     */
    orderPerInitials(entriesMap: Map<string, TreeEntryBase>): Map<string, TreeEntryBase[]>;
    /**
     * Generates output entries for alphabetical index pages.
     *
     * @remarks
     * Creates formatted lists of entries organised by initial letters,
     * producing HTML markup suitable for inclusion in Markdown index
     * pages. Includes entry names, types, and navigation links.
     *
     * @param entriesPerInitialsMap - Map of entries grouped by initials
     * @returns Array of formatted output lines for the index
     */
    outputEntries(entriesPerInitialsMap: Map<string, TreeEntryBase[]>): string[];
    /**
     * Generates a filtered index file for a specific kind of entries.
     *
     * @remarks
     * Creates alphabetically organised index pages for specific entry types
     * within the collection. Applies filtering to include only relevant
     * entries, organises them by initial letters, and generates Markdown
     * files with proper frontmatter and navigation links.
     *
     * @param params - Object containing index file generation parameters
     * @param params.group - The collection group name for file organisation
     * @param params.fileKind - The specific kind of entries to include
     * @param params.title - The page title for the generated index
     * @param params.description - The descriptive text for the index page
     * @param params.map - Map of all available entries to filter from
     * @param params.filter - Function to determine which entries to include
     */
    generateIndexFile({ group, fileKind, title, description, map, filter, }: {
        group: string;
        fileKind: string;
        title: string;
        description: string;
        map: Map<string, TreeEntryBase>;
        filter: (kind: string) => boolean;
    }): Promise<void>;
}
//# sourceMappingURL=collection-base.d.ts.map