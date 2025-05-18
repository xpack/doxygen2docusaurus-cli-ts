export interface PluginConfigurationOptions {
    doxygenXmlInputFolderPath?: string;
    outputFolderPath?: string;
    outputBaseUrl?: string;
    redirectsOutputFolderPath?: string;
    sidebarCategoryFilePath?: string;
    sidebarCategoryLabel?: string;
    menuDropdownFilePath?: string;
    menuDropdownLabel?: string;
    verbose?: boolean;
    runOnStart?: boolean;
    id?: string;
}
export interface PluginOptions {
    doxygenXmlInputFolderPath: string; /** like `doxygen/xml`, no initial/final slash */
    outputFolderPath: string; /** like `docs/api`, no initial/final slash */
    outputBaseUrl: string;
    redirectsOutputFolderPath?: string | undefined;
    sidebarCategoryFilePath: string;
    sidebarCategoryLabel: string;
    menuDropdownFilePath: string;
    menuDropdownLabel: string;
    verbose: boolean;
    runOnStart: boolean;
    id: string;
}
export declare const defaultOptions: PluginConfigurationOptions;
