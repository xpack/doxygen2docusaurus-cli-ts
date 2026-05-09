import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
export class CliOptions {
    doxygenXmlInputFolderPath = 'doxygen/xml';
    docsFolderPath = 'docs';
    apiFolderPath = 'api';
    baseUrl = '/';
    docsBaseUrl = 'docs';
    apiBaseUrl = 'api';
    imagesFolderPath = 'assets/images/doxygen';
    compatibilityRedirectsOutputFolderPath;
    mainPageTitle = '';
    sidebarCategoryFilePath = 'sidebar-category-doxygen.json';
    sidebarCategoryLabel = 'API Reference (Doxygen)';
    navbarDropdownFilePath = 'docusaurus-config-navbar-doxygen.json';
    navbarDropdownLabel = 'API Reference';
    navbarDropdownPosition = 'left';
    customCssFilePath = 'src/css/custom-doxygen2docusaurus.css';
    verbose = false;
    debug = false;
    suggestToDoDescriptions = false;
    listPagesAtTop = true;
    renderProgramListing = true;
    renderProgramListingInline = true;
    originalPagesNote = '';
    id = 'default';
    constructor(commandOptions) {
        this.id = commandOptions.id;
        if (commandOptions.verbose !== undefined) {
            this.verbose = true;
        }
        if (commandOptions.debug !== undefined) {
            this.debug = true;
        }
        if (this.id !== 'default') {
            this.apiFolderPath = this.id;
            this.apiBaseUrl = this.id;
            this.imagesFolderPath = `img/doxygen-${this.id}`;
            this.sidebarCategoryFilePath =
                'sidebar-category-doxygen' + `-${this.id}.json`;
            this.navbarDropdownFilePath =
                'docusaurus-config-navbar-doxygen' + `-${this.id}.json`;
        }
        else {
            this.apiFolderPath = 'api';
            this.apiBaseUrl = 'api';
            this.imagesFolderPath = `img/doxygen`;
            this.sidebarCategoryFilePath = `sidebar-category-doxygen.json`;
            this.navbarDropdownFilePath = `docusaurus-config-navbar-doxygen.json`;
        }
    }
    async parse() {
        let configurationOptions = undefined;
        try {
            const userPackageJsonPath = path.resolve(process.cwd(), 'config', 'doxygen2docusaurus.json');
            const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
            const multiConfigurations = JSON.parse(pkgJsonRaw);
            configurationOptions = this.selectMultiConfiguration(multiConfigurations);
        }
        catch (err) {
        }
        if (configurationOptions === undefined) {
            try {
                const userPackageJsonPath = path.resolve(process.cwd(), 'doxygen2docusaurus.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                const multiConfigurations = JSON.parse(pkgJsonRaw);
                configurationOptions =
                    this.selectMultiConfiguration(multiConfigurations);
            }
            catch (err) {
            }
        }
        if (configurationOptions === undefined) {
            try {
                const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                const pkgJson = JSON.parse(pkgJsonRaw);
                const multiConfigurations = pkgJson.config?.doxygen2docusaurus ?? pkgJson.doxygen2docusaurus;
                if (multiConfigurations !== undefined) {
                    configurationOptions =
                        this.selectMultiConfiguration(multiConfigurations);
                }
            }
            catch (err) {
            }
        }
        if (configurationOptions !== undefined) {
            if (this.debug) {
                console.log(configurationOptions);
            }
            const thisProperties = Object.getOwnPropertyNames(this);
            for (const key of Object.keys(configurationOptions)) {
                const value = configurationOptions[key];
                if (value !== undefined && thisProperties.includes(key)) {
                    const thisProperty = this[key];
                    const thisType = typeof thisProperty;
                    const valueType = typeof value;
                    if (['id'].includes(key)) {
                        continue;
                    }
                    if (thisType === valueType) {
                        ;
                        this[key] = value;
                    }
                }
            }
        }
        if (this.debug) {
            this.verbose = true;
        }
        if (this.verbose) {
            console.log();
            console.log(this);
        }
        assert(this.doxygenXmlInputFolderPath.length > 0, 'doxygenXmlInputFolderPath is required');
        assert(this.docsFolderPath.length > 0, 'docsFolderPath is required');
        assert(this.apiFolderPath.length > 0, 'apiFolderPath is required');
        assert(this.docsBaseUrl.length > 0, 'docsBaseUrl is required');
        assert(this.sidebarCategoryFilePath.length > 0, 'sidebarCategoryFilePath is required');
    }
    selectMultiConfiguration(multiConfigurations) {
        let configurationOptions = undefined;
        if (this.id !== 'default') {
            configurationOptions = multiConfigurations[this.id];
            if (configurationOptions !== undefined) {
                configurationOptions.id = this.id;
            }
        }
        else {
            const multiConfig = multiConfigurations;
            configurationOptions =
                'default' in multiConfig
                    ? multiConfig.default
                    : multiConfigurations;
        }
        return configurationOptions;
    }
}
export const renderParagraphs = true;
export const maxParallelPromises = 42;
//# sourceMappingURL=cli-options.js.map