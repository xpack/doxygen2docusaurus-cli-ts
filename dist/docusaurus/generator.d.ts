import { Workspace } from './workspace.js';
import { CliOptions } from './cli-options.js';
import type { SidebarCategory, NavbarItem } from './types.js';
import type { CompoundBase } from './view-model/compound-base-vm.js';
/**
 * Generates Docusaurus-compatible Markdown files and configuration from
 * Doxygen XML output.
 *
 * @remarks
 * This class orchestrates the conversion process, creating documentation pages,
 * navigation structures, and associated assets for integration with Docusaurus
 * websites. It handles parallel processing for performance optimisation and
 * manages the complete workflow from XML parsing to final site generation.
 *
 * @public
 */
export declare class DocusaurusGenerator {
    /** The workspace containing the data model and configuration options. */
    workspace: Workspace;
    /** CLI options that control the generation process. */
    options: CliOptions;
    /**
     * Constructs a new Docusaurus generator instance.
     *
     * @remarks
     * Initialises the generator with the provided workspace, which contains
     * the parsed Doxygen data model and configuration options required for
     * the generation process.
     *
     * @param workspace - The workspace containing the data model and
     * configuration.
     */
    constructor(workspace: Workspace);
    /**
     * Executes the complete generation process.
     *
     * @remarks
     * Orchestrates the creation of all Docusaurus assets including Markdown
     * files, navigation structures, redirect files, and static assets. The
     * process follows a specific sequence to ensure proper dependencies and
     * optimal performance through parallel processing where appropriate.
     *
     * @returns A promise that resolves to the exit code (0 for success).
     */
    run(): Promise<number>;
    /**
     * Prepares the output folder for generated content.
     *
     * @remarks
     * Removes any existing output folder and creates a new empty directory
     * structure for the generated Docusaurus files. This ensures a clean
     * starting state for each generation run and prevents conflicts with
     * previous builds.
     */
    prepareOutputFolder(): Promise<void>;
    /**
     * Generates the sidebar category structure for Docusaurus navigation.
     *
     * @remarks
     * Creates a hierarchical category structure that organises all generated
     * documentation pages into a logical navigation tree. The structure includes
     * top-level pages and follows the configured collection ordering to maintain
     * consistent navigation patterns.
     *
     * @returns The complete sidebar category configuration object.
     */
    generateSidebarCategory(): SidebarCategory;
    /**
     * Writes the sidebar configuration to a JSON file.
     *
     * @remarks
     * Serialises the sidebar category structure and writes it to the configured
     * output path for integration with Docusaurus. The resulting JSON file
     * provides the complete navigation structure for the documentation site.
     *
     * @param sidebarCategory - The sidebar configuration to write.
     */
    writeSidebarFile(sidebarCategory: SidebarCategory): Promise<void>;
    /**
     * Generates the navbar dropdown configuration for the top navigation.
     *
     * @remarks
     * Creates a navigation menu structure that provides quick access to
     * different sections of the generated documentation. When no items are
     * available, falls back to a simple link format for consistency.
     *
     * @returns The navbar item configuration for Docusaurus.
     */
    generateNavbarItem(): NavbarItem;
    /**
     * Writes the navbar configuration to a JSON file.
     *
     * @remarks
     * Serialises the navbar item structure and writes it to the configured
     * output path for integration with Docusaurus navigation. The resulting
     * JSON file provides the top-level navigation menu configuration.
     *
     * @param navbarItem - The navbar configuration to write.
     */
    writeNavbarFile(navbarItem: NavbarItem): Promise<void>;
    /**
     * Generates index Markdown files for all collections.
     *
     * @remarks
     * Creates overview pages for each documentation collection (classes, files,
     * namespaces, etc.) that provide organised access to the content. These
     * index files serve as entry points for navigating large documentation
     * collections efficiently.
     */
    generateCollectionsIndexDotMdFiles(): Promise<void>;
    /**
     * Generates the main index Markdown file for the API documentation.
     *
     * @remarks
     * Creates the landing page that serves as the entry point to the generated
     * documentation, including topics overview and main page content. This
     * combines the Doxygen @mainpage content with a structured topics table
     * for comprehensive navigation.
     */
    generateTopIndexDotMdFile(): Promise<void>;
    /**
     * Generates alphabetical index files organised by initial letters.
     *
     * @remarks
     * Creates index pages that group documentation items by their first letter,
     * facilitating alphabetical navigation through large sets of documentation.
     * This approach improves usability when dealing with extensive API
     * documentation containing numerous items.
     */
    generatePerInitialsIndexDotMdFiles(): Promise<void>;
    /**
     * Generates all individual Markdown files for documentation compounds.
     *
     * @remarks
     * Processes all compounds (classes, files, namespaces, etc.) from the
     * Doxygen XML and converts them into Docusaurus-compatible Markdown pages.
     * Supports parallel processing for improved performance whilst maintaining
     * proper error handling and resource management.
     */
    generateMdFiles(): Promise<void>;
    /**
     * Generates a single Markdown page for a documentation compound.
     *
     * @remarks
     * Converts an individual compound (class, file, namespace, etc.) into a
     * properly formatted Docusaurus Markdown file with appropriate front matter
     * and content. The method handles permalink generation, metadata creation,
     * and content rendering for optimal integration with Docusaurus.
     *
     * @param compound - The compound to generate a page for.
     */
    generatePage(compound: CompoundBase): Promise<void>;
    /**
     * Generates HTML redirect files for backwards compatibility.
     *
     * @remarks
     * Creates redirect files that map original Doxygen URLs to the new
     * Docusaurus URLs, maintaining compatibility with existing bookmarks
     * and external links. This ensures a smooth transition when migrating
     * from Doxygen-generated documentation to Docusaurus.
     */
    generateCompatibilityRedirectFiles(): Promise<void>;
    /**
     * Generates an HTML redirect file for URL redirection.
     *
     * @remarks
     * Creates a client-side redirect page that automatically forwards visitors
     * from old Doxygen URLs to the corresponding Docusaurus pages. The redirect
     * preserves query parameters and hash fragments to maintain deep linking
     * functionality across the migration.
     *
     * @param filePath - The path where the redirect file should be created.
     * @param permalink - The target URL to redirect to.
     */
    private generateRedirectFile;
    /**
     * Copies required static files to the output directory.
     *
     * @remarks
     * Transfers essential template files including SVG icons and CSS
     * stylesheets to the appropriate locations in the static directory
     * for use by the generated documentation. These assets provide the
     * visual styling and iconography for the documentation site.
     */
    copyFiles(): Promise<void>;
    /**
     * Copies image files referenced in the documentation.
     *
     * @remarks
     * Transfers all image files that are referenced within the Doxygen
     * documentation to the appropriate static directory, ensuring they
     * remain accessible in the generated Docusaurus site. Duplicate
     * image names are automatically deduplicated for efficiency.
     */
    copyImageFiles(): Promise<void>;
}
//# sourceMappingURL=generator.d.ts.map