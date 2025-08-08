import { AbstractDataModelBase } from '../doxygen/data-model/types.js';
import { type DataModel } from '../doxygen/data-model/data-model.js';
import { Renderers } from './renderers/renderers.js';
import type { CliOptions } from './cli-options.js';
import type { FrontMatter } from './types.js';
import { type File } from './view-model/files-and-folders-vm.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { type Page } from './view-model/pages-vm.js';
import { ViewModel } from './view-model/view-model.js';
/**
 * Central workspace that coordinates the conversion process.
 *
 * @remarks
 * The Workspace class serves as the primary orchestrator for transforming
 * Doxygen XML data into Docusaurus-compatible documentation. It manages
 * the data model, view model, rendering system, and output generation whilst
 * providing centralised configuration and URL management for consistent
 * documentation structure across all generated content.
 *
 * @public
 */
export declare class Workspace extends Renderers {
    /** Configuration options controlling the conversion process. */
    options: CliOptions;
    /** The parsed Doxygen data model containing all source information. */
    dataModel: DataModel;
    /** The view model that structures data for documentation generation. */
    viewModel: ViewModel;
    /** The absolute path to the doxygen2docusaurus project directory. */
    projectPath: string;
    /** Doxygen configuration options from the original build process. */
    doxygenOptions: DoxygenFileOptions;
    /** The absolute base URL for the generated documentation site. */
    absoluteBaseUrl: string;
    /** The page base URL for individual documentation pages. */
    pageBaseUrl: string;
    /** The slug base URL for Docusaurus routing. */
    slugBaseUrl: string;
    /** The menu base URL for navigation elements. */
    menuBaseUrl: string;
    /** The output folder path for generated Markdown files. */
    outputFolderPath: string;
    /** The sidebar base identifier for navigation structure. */
    sidebarBaseId: string;
    /** The main page compound, if one exists in the documentation. */
    mainPage: Page | undefined;
    /** Map of file paths to their corresponding File objects. */
    filesByPath: Map<string, File>;
    /**
     * @brief Map to keep track of indices that have content.
     *
     * @details
     * The map keys are:
     * - classes
     * - namespaces
     * - files
     *
     * and the Set may include:
     * - all
     * - classes
     * - namespaces
     * - functions
     * - variables
     * - typedefs
     * - enums
     * - enumvalues
     */
    indicesMaps: Map<string, Set<string>>;
    /** Counter for the total number of Markdown files written. */
    writtenMdFilesCounter: number;
    /** Counter for the total number of HTML redirect files written. */
    writtenHtmlFilesCounter: number;
    /** Mapping of Doxygen compound kinds to collection names. */
    collectionNamesByKind: Record<string, string>;
    /** Defines the order of entries in the sidebar and top menu dropdown. */
    sidebarCollectionNames: string[];
    /**
     * Constructs a new Workspace instance.
     *
     * @remarks
     * Initialises the workspace with the provided data model and sets up
     * the necessary paths, URLs, and configuration for documentation generation.
     * This includes configuring base URLs, output paths, sidebar identifiers,
     * and establishing the view model for structured documentation creation.
     *
     * @param dataModel - The parsed Doxygen data model.
     */
    constructor(dataModel: DataModel);
    /**
     * Writes a Markdown output file with proper front matter and formatting.
     *
     * @remarks
     * Creates a complete Docusaurus-compatible Markdown file including YAML
     * front matter, content body, and generated footer information. The method
     * handles permalink processing, emoji prevention, and proper file structure
     * to ensure optimal integration with Docusaurus documentation sites.
     *
     * @param filePath - The output file path for the Markdown file.
     * @param bodyLines - Array of content lines for the file body.
     * @param frontMatter - YAML front matter configuration object.
     * @param frontMatterCodeLines - Optional additional front matter code.
     * @param title - Optional page title if not specified in front matter.
     * @param pagePermalink - Optional page permalink for anchor processing.
     */
    writeOutputMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink, }: {
        filePath: string;
        bodyLines: string[];
        frontMatter: FrontMatter;
        frontMatterCodeLines?: string[];
        title?: string;
        pagePermalink?: string;
    }): Promise<void>;
    /**
     * Marks paragraph elements to be skipped during rendering.
     *
     * @remarks
     * Processes an array of elements and sets the skipPara flag on any
     * ParaDataModel instances to prevent them from being rendered. This
     * functionality is essential for controlling paragraph output in contexts
     * where specific formatting requirements must be maintained.
     *
     * @param elements - Array of elements to process for paragraph skipping.
     */
    skipElementsPara(elements: (AbstractDataModelBase | string)[] | undefined): void;
    /**
     * Resolves a reference identifier to its corresponding permalink URL.
     *
     * @remarks
     * Determines the appropriate permalink for a given reference based on
     * the reference type (compound, member, or xrefsect) and constructs
     * the full URL including anchors where applicable. This method handles
     * complex reference resolution including table of contents items and
     * description sections for comprehensive cross-referencing capabilities.
     *
     * @param refid - The reference identifier to resolve.
     * @param kindref - The kind of reference ('compound', 'member', 'xrefsect').
     * @returns The resolved permalink URL, or undefined if not found.
     */
    getPermalink({ refid, kindref, }: {
        refid: string;
        kindref: string;
    }): string | undefined;
    /**
     * Retrieves the permalink URL for a specific page by reference identifier.
     *
     * @remarks
     * Looks up a compound by its reference identifier and constructs the
     * complete page permalink URL for linking purposes. The method includes
     * comprehensive error handling and optional warning suppression for
     * cases where references may not be resolvable during processing.
     *
     * @param refid - The reference identifier of the compound.
     * @param noWarn - Whether to suppress warning messages for missing compounds.
     * @returns The complete page permalink URL, or undefined if not found.
     */
    getPagePermalink(refid: string, noWarn?: boolean): string | undefined;
    /**
     * Constructs a cross-reference permalink for documentation pages.
     *
     * @remarks
     * Generates a permalink URL for cross-references by extracting the page
     * and anchor components from the identifier and constructing the
     * appropriate URL structure. This method specifically handles the pages
     * collection format for cross-reference navigation within the documentation.
     *
     * @param id - The cross-reference identifier to process.
     * @returns The constructed cross-reference permalink URL.
     */
    getXrefPermalink(id: string): string;
}
//# sourceMappingURL=workspace.d.ts.map