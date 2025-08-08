import { CompoundBase } from './compound-base-vm.js';
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { CollectionBase } from './collection-base.js';
import type { NavbarItem, SidebarCategory, FrontMatter } from '../types.js';
import type { Workspace } from '../workspace.js';
import type { ProgramListingDataModel } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
/**
 * Manages the collection of file and folder documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of file-based documentation,
 * including folder hierarchies, file listings, sidebar generation, and
 * index file creation. Provides a structured view of the source code
 * organisation with proper navigation support.
 *
 * @public
 */
export declare class FilesAndFolders extends CollectionBase {
    /**
     * Map of folder compounds indexed by identifier.
     *
     * @remarks
     * Stores all folder instances for efficient lookup and hierarchy
     * construction, separate from the main compounds collection.
     */
    compoundFoldersById: Map<string, Folder>;
    /**
     * Map of file compounds indexed by identifier.
     *
     * @remarks
     * Stores all file instances for efficient lookup and organisation,
     * separate from the main compounds collection.
     */
    compoundFilesById: Map<string, File>;
    /**
     * Array of top-level folders without parent folders.
     *
     * @remarks
     * Contains folders that are at the root level of the documentation
     * hierarchy, used for organising hierarchical displays.
     */
    topLevelFolders: Folder[];
    /**
     * Array of top-level files without parent folders.
     *
     * @remarks
     * Contains files that are at the root level of the documentation
     * hierarchy, not contained within any documented folder.
     */
    topLevelFiles: File[];
    /**
     * Creates a new files and folders collection.
     *
     * @remarks
     * Initialises the collection with separate maps for folders and files
     * to enable efficient organisation and hierarchy construction.
     *
     * @param workspace - The workspace instance
     */
    constructor(workspace: Workspace);
    /**
     * Adds a file or folder compound to the collection.
     *
     * @remarks
     * Creates either a File or Folder instance based on the compound kind,
     * registers it in the appropriate collections, and returns the created
     * instance for further processing.
     *
     * @param compoundDef - The compound definition for the file or folder
     * @returns The created File or Folder instance
     * @throws Error if compound kind is not 'file' or 'dir'
     */
    addChild(compoundDef: CompoundDefDataModel): CompoundBase;
    /**
     * Creates hierarchical relationships between file and folder compounds.
     *
     * @remarks
     * Establishes parent-child relationships for folders and files,
     * builds the complete file hierarchy, and generates relative paths
     * and permalinks for all compounds. Registers files in the workspace
     * for global lookup and identifies top-level entities.
     */
    createCompoundsHierarchies(): void;
    /**
     * Recursively builds the relative path for a folder from root.
     *
     * @remarks
     * Traverses the folder hierarchy upwards to construct the complete
     * relative path by concatenating parent folder names. Used for
     * generating proper folder permalinks and navigation structures.
     *
     * @param folder - The folder to build the path for
     * @returns The complete relative path from root to the folder
     */
    private getRelativePathRecursively;
    addSidebarItems(sidebarCategory: SidebarCategory): void;
    /**
     * Creates sidebar items for folder hierarchies recursively.
     *
     * @remarks
     * Generates hierarchical sidebar structures for folder trees,
     * creating category items with nested children for subfolders
     * and files. Processes folders first, then files within each
     * folder level.
     *
     * @param folder - The folder to create sidebar items for
     * @returns The sidebar category item or undefined if folder lacks data
     */
    private createFolderSidebarItemRecursively;
    /**
     * Creates a sidebar document item for a file.
     *
     * @remarks
     * Generates a simple document sidebar item for individual files
     * with appropriate CSS classes and navigation links. Used for
     * leaf nodes in the file hierarchy sidebar.
     *
     * @param file - The file to create a sidebar item for
     * @returns The sidebar document item or undefined if file lacks data
     */
    private createFileSidebarItem;
    createNavbarItems(): NavbarItem[];
    generateIndexDotMdFile(): Promise<void>;
    /**
     * Generates hierarchical index content for folders recursively.
     *
     * @remarks
     * Creates HTML tree table rows for folder hierarchies with proper
     * indentation and folder icons. Processes subfolders first, then
     * files within each folder level to maintain organised structure.
     *
     * @param folder - The folder to generate index content for
     * @param depth - The current depth level in the hierarchy (0-based)
     * @returns Array of HTML strings representing the tree table rows
     */
    private generateIndexMdFileRecursively;
    /**
     * Generates index content for individual files.
     *
     * @remarks
     * Creates HTML tree table rows for file entries with appropriate
     * file icons, labels, and descriptions. Generates consistent
     * formatting for file documentation links within hierarchical
     * index structures.
     *
     * @param file - The file to generate index content for
     * @param depth - The current depth level in the hierarchy (0-based)
     * @returns Array of HTML strings representing the file table row
     */
    private generateFileIndexMd;
    isVisibleInSidebar(): boolean;
    generatePerInitialsIndexMdFiles(): Promise<void>;
}
/**
 * Represents a folder compound for directory documentation.
 *
 * @remarks
 * Manages folder-specific functionality including child file and folder
 * tracking, hierarchy construction, and documentation generation. Provides
 * structured organisation for file system hierarchies within the
 * documentation.
 *
 * @public
 */
export declare class Folder extends CompoundBase {
    /** Array of child file identifiers contained in this folder. */
    childrenFileIds: string[];
    /** Array of child folder identifiers contained in this folder. */
    childrenFolderIds: string[];
    /** Relative path from root to this folder. */
    relativePath: string;
    /**
     * Creates a new Folder instance from compound definition data.
     *
     * @remarks
     * Initialises folder metadata including child file and folder
     * references, display labels, and page titles. Sets up the
     * folder structure for hierarchy construction and documentation
     * generation.
     *
     * @param collection - The parent FilesAndFolders collection
     * @param compoundDef - The Doxygen compound definition for the folder
     */
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    /**
     * Determines if the folder has any children worth displaying.
     *
     * @remarks
     * Recursively checks for files or non-empty subfolders to determine
     * if the folder should be included in documentation. Empty folders
     * without content are typically excluded from navigation.
     *
     * @returns True if the folder contains files or non-empty subfolders
     */
    hasChildren(): boolean;
    hasAnyContent(): boolean;
    /**
     * Renders the complete folder documentation to markdown lines.
     *
     * @remarks
     * Generates the full documentation page including brief descriptions,
     * inner directory and file indices, member sections, and detailed
     * descriptions. Creates structured folder documentation with proper
     * navigation and content organisation.
     *
     * @param frontMatter - The frontmatter configuration for the page
     * @returns Array of markdown strings representing the complete documentation
     */
    renderToLines(frontMatter: FrontMatter): string[];
    /**
     * Performs late initialisation for folders with content validation.
     *
     * @remarks
     * Validates folder content and conditionally disables sidebar generation for
     * empty folders. This ensures that folders without meaningful documentation
     * do not appear in the generated sidebar navigation.
     *
     * @public
     */
    initializeLate(): void;
}
/**
 * Represents a file compound for source code documentation.
 *
 * @remarks
 * Manages file-specific functionality including program listings,
 * line number tracking, and source code documentation generation.
 * Provides structured representation of source files within the
 * documentation hierarchy.
 *
 * @public
 */
export declare class File extends CompoundBase {
    /** Relative path from root to this file. */
    relativePath: string;
    /** Set of line numbers available in the program listing. */
    listingLineNumbers: Set<number>;
    /** Program listing data for source code display. */
    programListing: ProgramListingDataModel | undefined;
    /**
     * Creates a new File instance from compound definition data.
     *
     * @remarks
     * Initialises file metadata including display labels, page titles,
     * and member sections. Sets up the file structure for documentation
     * generation and source code listing display.
     *
     * @param collection - The parent FilesAndFolders collection
     * @param compoundDef - The Doxygen compound definition for the file
     */
    constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel);
    /**
     * Performs late initialisation for files with program listing setup.
     *
     * @remarks
     * Processes the program listing for source code rendering and tracks valid
     * line numbers for link validation. Also validates file content and
     * conditionally disables sidebar generation for empty files.
     *
     * @public
     */
    initializeLate(): void;
    /**
     * Determines if the file has any documentable content.
     *
     * @remarks
     * Checks for children elements, inner compounds, and include relationships
     * to determine content availability. This method helps filter empty files
     * from the generated documentation.
     *
     * @returns True if the file contains documentable content, false otherwise.
     *
     * @public
     */
    hasAnyContent(): boolean;
    /**
     * Renders the file documentation to Markdown lines.
     *
     * @remarks
     * Generates comprehensive file documentation including brief description,
     * includes index, inner compound indices, section indices, detailed
     * description, and optionally the program listing. The output follows
     * Docusaurus conventions for file documentation pages.
     *
     * @param frontMatter - The front matter configuration for the page
     * @returns Array of Markdown lines representing the file documentation
     *
     * @public
     */
    renderToLines(frontMatter: FrontMatter): string[];
}
//# sourceMappingURL=files-and-folders-vm.d.ts.map