export const defaultOptions = {
    doxygenXmlInputFolderPath: 'doxygen/xml',
    docsFolderPath: 'docs',
    apiFolderPath: 'api',
    baseUrl: '/',
    docsBaseUrl: 'docs',
    apiBaseUrl: 'api',
    imagesFolderPath: 'img/doxygen',
    mainPageTitle: '',
    sidebarCategoryFilePath: 'sidebar-category-doxygen.json',
    sidebarCategoryLabel: 'API Reference (Doxygen)',
    menuDropdownFilePath: 'docusaurus-config-menu-doxygen.json',
    menuDropdownLabel: 'Reference',
    customCssFilePath: 'src/css/custom-doxygen2docusaurus.css',
    verbose: false,
    debug: false,
    suggestToDoDescriptions: false,
    renderPagesAtTop: true,
    renderProgramListing: true,
    renderProgramListingInline: true,
    id: 'default',
};
export function getInstanceDefaultOptions(id) {
    const options = { ...defaultOptions };
    if (id !== undefined && id.length > 0) {
        options.apiFolderPath = id;
        options.apiBaseUrl = id;
        options.imagesFolderPath = `img/doxygen-${id}`;
        options.sidebarCategoryFilePath = `sidebar-category-doxygen-${id}.json`;
        options.menuDropdownFilePath = `docusaurus-config-menu-doxygen-${id}.json`;
    }
    return options;
}
export const renderParagraphs = true;
export const maxParallelPromises = 42;
//# sourceMappingURL=options.js.map