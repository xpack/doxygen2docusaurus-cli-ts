export interface PluginConfigurationOptions {
    doxygenXmlInputFolderPath?: string;
    docsFolderPath?: string;
    apiFolderPath?: string;
    docsBaseUrl?: string;
    apiBaseUrl?: string;
    redirectsOutputFolderPath?: string;
    sidebarCategoryFilePath?: string;
    sidebarCategoryLabel?: string;
    menuDropdownFilePath?: string;
    menuDropdownLabel?: string;
    customCssFilePath?: string;
    verbose?: boolean;
    debug?: boolean;
    runOnStart?: boolean;
    suggestToDoDescriptions?: boolean;
    id?: string;
}
export interface PluginOptions {
    /** Relative to the current website folder, like `doxygen/xml`, no initial/final slashes. */
    doxygenXmlInputFolderPath: string;
    /** Relative to the current website folder, like `docs`, no initial/final slashes. */
    docsFolderPath: string;
    /** Relative to the docs folder, like `api`, no initial/final slashes. */
    apiFolderPath: string;
    /** Relative to the web home, like `docs`, without initial/final slashes. */
    docsBaseUrl: string;
    /** Relative to the docs home, like `api`, without initial/final slashes. */
    apiBaseUrl: string;
    /**  Relative to the current website folder, like `reference`. */
    redirectsOutputFolderPath?: string | undefined;
    /** Relative to the current website folder, default `sidebar-category-doxygen.json`. */
    sidebarCategoryFilePath: string;
    /** Short text to be displayed in the sidebar. */
    sidebarCategoryLabel: string;
    /** Relative to the current website folder, default `docusaurus-config-doxygen-menu-dropdown.json`. */
    menuDropdownFilePath: string;
    /** Short text to be displayed in the menu. */
    menuDropdownLabel: string;
    /** Relative to the current website folder, default `src/css/custom-doxygen.css` */
    customCssFilePath: string;
    /** Boolean to control verbosity. */
    verbose: boolean;
    /** Boolean to control debug verbosity. */
    debug: boolean;
    /** Boolean to control if the plugin runs automatically on Docusaurus start. */
    runOnStart: boolean;
    /** Boolean to control if the TODO suggestions are shown. */
    suggestToDoDescriptions: boolean;
    /** String identifier in case of multiple instances. */
    id: string;
}
export declare const defaultOptions: PluginConfigurationOptions;
