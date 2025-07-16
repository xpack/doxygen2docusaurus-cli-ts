export interface Redirects {
    from: string | string[];
    to: string;
}
export interface CliConfigurationOptions {
    doxygenXmlInputFolderPath?: string;
    docsFolderPath?: string;
    apiFolderPath?: string;
    baseUrl?: string;
    docsBaseUrl?: string;
    apiBaseUrl?: string;
    imagesFolderPath?: string;
    compatibilityRedirectsOutputFolderPath?: string;
    mainPageTitle?: string;
    sidebarCategoryFilePath?: string;
    sidebarCategoryLabel?: string;
    menuDropdownFilePath?: string;
    menuDropdownLabel?: string;
    customCssFilePath?: string;
    verbose?: boolean;
    debug?: boolean;
    runOnStart?: boolean;
    suggestToDoDescriptions?: boolean;
    renderPagesAtTop?: boolean;
    renderProgramListing?: boolean;
    renderProgramListingInline?: boolean;
    originalPagesNote?: string;
    id?: string;
}
export interface CliOptions {
    doxygenXmlInputFolderPath: string;
    docsFolderPath: string;
    apiFolderPath: string;
    baseUrl: string;
    docsBaseUrl: string;
    apiBaseUrl: string;
    imagesFolderPath: string;
    compatibilityRedirectsOutputFolderPath?: string | undefined;
    mainPageTitle: string;
    sidebarCategoryFilePath: string;
    sidebarCategoryLabel: string;
    menuDropdownFilePath: string;
    menuDropdownLabel: string;
    customCssFilePath: string;
    verbose: boolean;
    debug: boolean;
    suggestToDoDescriptions: boolean;
    renderPagesAtTop: boolean;
    renderProgramListing: boolean;
    renderProgramListingInline?: boolean;
    originalPagesNote?: string;
    id: string;
}
export declare const defaultOptions: CliOptions;
export declare function getInstanceDefaultOptions(id: string | undefined): CliOptions;
export declare const renderParagraphs = true;
export declare const maxParallelPromises = 42;
//# sourceMappingURL=options.d.ts.map