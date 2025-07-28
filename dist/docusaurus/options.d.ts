export interface Redirects {
    from: string | string[];
    to: string;
}
/**
 * Options, as written by the user. All are optional.
 *
 * @public
 */
export type CliConfigurationOptions = Record<string, string | boolean>;
/**
 * Options, when multi-configurations are used.
 *
 * @public
 */
export type MultiConfigurations = Record<string, CliConfigurationOptions>;
/**
 * Options, as seen by the application. Most are mandatory.
 *
 * @public
 */
export declare class CliOptions {
    /**
     * Relative to the current website folder, like `doxygen/xml`, no initial/
     * final slashes.
     */
    doxygenXmlInputFolderPath: string;
    /**
     * Relative to the current website folder, like `docs`, no initial/final
     * slashes.
     */
    docsFolderPath: string;
    /** Relative to the docs folder, like `api`, no initial/final slashes. */
    apiFolderPath: string;
    /** Site base URL, like / or /xxx/. */
    baseUrl: string;
    /** Relative to the web home, like `docs`, without initial/final slashes. */
    docsBaseUrl: string;
    /** Relative to the docs home, like `api`, without initial/final slashes. */
    apiBaseUrl: string;
    /** Relative to `static` */
    imagesFolderPath: string;
    /**  Relative to the current `website/static` folder, like `reference`. */
    compatibilityRedirectsOutputFolderPath?: string | undefined;
    /** The title to be displayed on the main page. */
    mainPageTitle: string;
    /**
     * Relative to the current website folder, default
     * `sidebar-category-doxygen.json`.
     */
    sidebarCategoryFilePath: string;
    /** Short text to be displayed in the sidebar. */
    sidebarCategoryLabel: string;
    /**
     * Relative to the current website folder, default
     * `docusaurus-config-doxygen-menu-dropdown.json`.
     */
    menuDropdownFilePath: string;
    /** Short text to be displayed in the menu. */
    menuDropdownLabel: string;
    /**
     * Relative to the current website folder, default
     * `src/css/custom-doxygen.css`
     */
    customCssFilePath: string;
    /** Boolean to control verbosity. */
    verbose: boolean;
    /** Boolean to control debug verbosity. */
    debug: boolean;
    /** Boolean to control if the TODO suggestions are shown. */
    suggestToDoDescriptions: boolean;
    /** Boolean to render the pages to the top. */
    renderPagesAtTop: boolean;
    /** Boolean to render the program listing in the File pages. */
    renderProgramListing: boolean;
    /**
     * Boolean to render the program listing in the member definitions sections.
     */
    renderProgramListingInline: boolean;
    /**
     * Location of original Doxygen pages
     *
     * 'For comparison, the original Doxygen html pages, styled with the
     * <a href="https://jothepro.github.io/doxygen-awesome-css/">doxygen-awesome-css</a>
     * plugin, continue to be available via the
     * <a href="pathname:///doxygen/topics.html"><code>.../doxygen/*.html</b></code>
     * URLs.'
     */
    originalPagesNote: string;
    /** String identifier in case of multiple instances. */
    id: string;
    constructor(argv: string[]);
    parse(): Promise<void>;
    selectMultiConfiguration(multiConfigurations: CliConfigurationOptions | MultiConfigurations): CliConfigurationOptions | undefined;
}
export declare const renderParagraphs = true;
export declare const maxParallelPromises = 42;
//# sourceMappingURL=options.d.ts.map