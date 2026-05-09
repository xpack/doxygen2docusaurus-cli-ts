import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
/**
 * Manages documentation pages collection for the generated site.
 *
 * @remarks
 * Handles the organisation and generation of standalone documentation
 * pages that are not part of the main API reference, such as the
 * main project page and custom documentation pages.
 *
 * @public
 */
export declare class Pages extends CollectionBase {
    /**
     * Adds a page compound to the collection.
     *
     * @remarks
     * Creates a new Page instance from the compound definition and registers
     * it in the collection. Special handling is provided for the main index
     * page which becomes the workspace's main page.
     *
     * @param compoundDef - The compound definition for the page
     * @returns The created Page instance
     */
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between page compounds.
     *
     * @remarks
     * Pages do not have hierarchical relationships, so this method
     * performs no operations. Pages are organised as a flat collection.
     */
    createCompoundsHierarchies(): void;
    /**
     * Adds page items to the sidebar navigation structure.
     *
     * @remarks
     * Creates a "Pages" category in the sidebar and populates it with
     * page entries. Top-level pages may be excluded based on configuration
     * settings when they are displayed at the top of the sidebar.
     *
     * @param sidebarCategory - The main sidebar category to populate
     */
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates sidebar items for top-level pages at the root level.
     *
     * @remarks
     * Conditionally adds page items directly to the main sidebar category
     * when the configuration option to display pages at the top is enabled.
     * This provides prominent placement for important pages outside the
     * standard pages category.
     *
     * @param sidebarCategory - The main sidebar category to populate
     */
    createTopPagesSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates navigation bar items for pages.
     *
     * @remarks
     * Pages do not appear in the navigation bar by design, so this method
     * returns an empty array. The workspace's main navigation is handled
     * by other compound types such as namespaces and classes.
     *
     * @returns An empty array as pages are not included in navigation
     */
    createNavbarItems(): NavbarItem[];
    /**
     * Generates index file for pages collection.
     *
     * @remarks
     * Pages do not have a dedicated index file as they are organised
     * as individual standalone documents. This method performs no
     * operations to maintain interface consistency.
     *
     * @returns Promise that resolves immediately
     */
    generateIndexDotMdFile(): Promise<void>;
}
/**
 * Represents an individual documentation page in the generated site.
 *
 * @remarks
 * Handles standalone documentation pages that are not part of the main
 * API reference structure. Pages can include special content such as
 * the main project page, deprecated items, and custom documentation.
 * The class manages permalink generation, sidebar positioning, and
 * content rendering for these standalone documents.
 *
 * @public
 */
export declare class Page extends CompoundBase {
    /**
     * Initialises a new Page instance.
     *
     * @remarks
     * Constructs the page with appropriate labels, permalinks, and identifiers
     * based on the compound definition. The page title is derived from the
     * compound's title, and relative permalinks are generated using sanitised
     * paths to ensure valid URLs.
     *
     * @param collection - The parent pages collection
     * @param compoundDef - The compound definition containing page data
     */
    constructor(collection: Pages, compoundDef: CompoundDefDataModel);
    /**
     * Determines whether the page should be displayed at the top level.
     *
     * @remarks
     * Special pages such as 'deprecated' and 'todo' are excluded from
     * top-level display as they are considered auxiliary content.
     * All other pages are eligible for prominent placement.
     *
     * @returns True if the page should appear at the top level
     */
    isTopPage(): boolean;
    /**
     * Renders the page content to markdown lines.
     *
     * @remarks
     * Generates the complete page content including brief descriptions,
     * inner indices, section indices, detailed descriptions, and sections.
     * A 'more' permalink is provided when detailed descriptions are available
     * to enable navigation to the detailed content section.
     *
     * @param frontMatter - The front matter configuration for the page
     * @returns Array of markdown lines representing the complete page content
     */
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=pages-vm.d.ts.map