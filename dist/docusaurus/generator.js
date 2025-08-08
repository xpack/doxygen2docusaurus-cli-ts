/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
// import * as util from 'node:util'
import assert from 'node:assert';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { maxParallelPromises } from './cli-options.js';
import { folderExists } from './utils.js';
import { Page } from './view-model/pages-vm.js';
// import type { File } from '../view-model/files-and-folders-vm.js'
// ----------------------------------------------------------------------------
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
export class DocusaurusGenerator {
    /** The workspace containing the data model and configuration options. */
    workspace;
    /** CLI options that control the generation process. */
    options;
    // --------------------------------------------------------------------------
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
    constructor(workspace) {
        this.workspace = workspace;
        this.options = workspace.options;
    }
    // --------------------------------------------------------------------------
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
    async run() {
        console.log();
        await this.prepareOutputFolder();
        // No longer used with CommonMarkdown output.
        // await this.generateConfigurationFile()
        console.log();
        if (this.options.verbose) {
            console.log('Writing Docusaurus .md pages (object -> url)...');
        }
        else {
            console.log('Writing Docusaurus .md pages...');
        }
        await this.generateMdFiles();
        if (this.options.verbose) {
            console.log();
        }
        await this.generateTopIndexDotMdFile();
        await this.generateCollectionsIndexDotMdFiles();
        await this.generatePerInitialsIndexDotMdFiles();
        console.log(this.workspace.writtenMdFilesCounter, '.md files written');
        console.log();
        const sidebarCategory = this.generateSidebarCategory();
        await this.writeSidebarFile(sidebarCategory);
        // await this.generateSidebarFile()
        if (this.options.navbarFilePath.trim().length > 0) {
            const navbarItem = this.generateNavbarItem();
            await this.writeNavbarFile(navbarItem);
        }
        // await this.generateMenuFile()
        // await this.generateManualRedirectFiles()
        await this.generateCompatibilityRedirectFiles();
        await this.copyFiles();
        await this.copyImageFiles();
        return 0;
    }
    // --------------------------------------------------------------------------
    /**
     * Prepares the output folder for generated content.
     *
     * @remarks
     * Removes any existing output folder and creates a new empty directory
     * structure for the generated Docusaurus files. This ensures a clean
     * starting state for each generation run and prevents conflicts with
     * previous builds.
     */
    // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
    async prepareOutputFolder() {
        const { outputFolderPath } = this.workspace;
        try {
            await fs.access(outputFolderPath);
            // Remove the folder if it exist.
            console.log(`Removing existing folder ${outputFolderPath}...`);
            await fs.rm(outputFolderPath, { recursive: true, force: true });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (err) {
            // The folder does not exist, nothing to remove.
        }
        // Create the folder as empty.
        await fs.mkdir(outputFolderPath, { recursive: true });
    }
    // --------------------------------------------------------------------------
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
    generateSidebarCategory() {
        const sidebarTopCategory = {
            type: 'category',
            label: this.options.sidebarCategoryLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}index`,
            },
            collapsed: false,
            items: [],
        };
        const pages = this.workspace.viewModel.collections.get('pages');
        pages.createTopPagesSidebarItems(sidebarTopCategory);
        // The order in sidebarCollectionNames also gives the the order
        // of items in the sidebar.
        for (const collectionName of this.workspace.sidebarCollectionNames) {
            // console.log(collectionName)
            const collection = this.workspace.viewModel.collections.get(collectionName);
            if (collection?.isVisibleInSidebar() === true) {
                collection.addSidebarItems(sidebarTopCategory);
            }
        }
        return sidebarTopCategory;
    }
    // --------------------------------------------------------------------------
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
    async writeSidebarFile(sidebarCategory) {
        // console.log(util.inspect(sidebar, { compact: false, depth: 999 }));
        // Write the sidebar to file.
        const sidebarFilePath = this.workspace.options.sidebarCategoryFilePath;
        console.log(`Writing sidebar file ${sidebarFilePath}...`);
        const sidebarJson = JSON.stringify(sidebarCategory, null, 2);
        await fs.writeFile(sidebarFilePath, sidebarJson);
    }
    // --------------------------------------------------------------------------
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
    generateNavbarItem() {
        let navbarEntry = {
            type: 'dropdown',
            label: this.options.navbarLabel,
            to: this.workspace.menuBaseUrl,
            position: 'left',
            items: [],
        };
        let hasItems = false;
        // This is the order of items in the sidebar.
        for (const collectionName of this.workspace.sidebarCollectionNames) {
            // console.log(collectionName)
            const collection = this.workspace.viewModel.collections.get(collectionName);
            if (collection?.isVisibleInSidebar() === true) {
                assert(navbarEntry.items !== undefined);
                const items = collection.createNavbarItems();
                if (items.length > 0) {
                    navbarEntry.items.push(...collection.createNavbarItems());
                    hasItems = true;
                }
            }
        }
        if (!hasItems) {
            navbarEntry = {
                label: this.options.navbarLabel,
                to: this.workspace.menuBaseUrl,
                position: 'left',
            };
        }
        return navbarEntry;
    }
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
    async writeNavbarFile(navbarItem) {
        // console.log(util.inspect(navbarItem, { compact: false, depth: 999 }));
        // Write the sidebar to file.
        const navbarFilePath = this.workspace.options.navbarFilePath;
        console.log(`Writing navbar file ${navbarFilePath}...`);
        const navbarJson = JSON.stringify(navbarItem, null, 2);
        await fs.writeFile(navbarFilePath, navbarJson);
    }
    // --------------------------------------------------------------------------
    /**
     * Generates index Markdown files for all collections.
     *
     * @remarks
     * Creates overview pages for each documentation collection (classes, files,
     * namespaces, etc.) that provide organised access to the content. These
     * index files serve as entry points for navigating large documentation
     * collections efficiently.
     */
    async generateCollectionsIndexDotMdFiles() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [collectionName, collection] of this.workspace.viewModel
            .collections) {
            // console.log(collectionName)
            await collection.generateIndexDotMdFile();
        }
        // TODO: parallelize
    }
    // --------------------------------------------------------------------------
    /**
     * Generates the main index Markdown file for the API documentation.
     *
     * @remarks
     * Creates the landing page that serves as the entry point to the generated
     * documentation, including topics overview and main page content. This
     * combines the Doxygen @mainpage content with a structured topics table
     * for comprehensive navigation.
     */
    async generateTopIndexDotMdFile() {
        const { outputFolderPath } = this.workspace;
        const filePath = `${outputFolderPath}index.md`;
        const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF');
        const title = this.options.mainPageTitle.length > 0
            ? this.options.mainPageTitle
            : `${projectBrief} API Reference`;
        const permalink = ''; // The root of the API sub-site.
        // This is the top index.md file (@mainpage)
        const frontMatter = {
            title,
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'reference'],
        };
        const lines = [];
        const groups = this.workspace.viewModel.collections.get('groups');
        const topicsLines = groups.generateTopicsTable();
        lines.push(...topicsLines);
        const { mainPage } = this.workspace;
        if (mainPage !== undefined) {
            if (topicsLines.length > 0) {
                lines.push('');
                lines.push('## Description');
            }
            const { detailedDescriptionHtmlLines, briefDescriptionHtmlString } = mainPage;
            if (detailedDescriptionHtmlLines !== undefined &&
                detailedDescriptionHtmlLines.length > 0) {
                lines.push('');
                lines.push(...mainPage.renderDetailedDescriptionToHtmlLines({
                    briefDescriptionHtmlString,
                    detailedDescriptionHtmlLines,
                    showHeader: false,
                    showBrief: false,
                }));
            }
        }
        if (this.options.originalPagesNote.length > 0) {
            lines.push('');
            lines.push(':::note');
            lines.push(this.options.originalPagesNote);
            lines.push(':::');
        }
        if (this.options.verbose) {
            console.log(`Writing top index file ${filePath}...`);
        }
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
    // --------------------------------------------------------------------------
    /**
     * Generates alphabetical index files organised by initial letters.
     *
     * @remarks
     * Creates index pages that group documentation items by their first letter,
     * facilitating alphabetical navigation through large sets of documentation.
     * This approach improves usability when dealing with extensive API
     * documentation containing numerous items.
     */
    async generatePerInitialsIndexDotMdFiles() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [collectionName, collection] of this.workspace.viewModel
            .collections) {
            // console.log(collectionName)
            await collection.generatePerInitialsIndexMdFiles();
        }
        // TODO: parallelize
    }
    // --------------------------------------------------------------------------
    /**
     * Generates all individual Markdown files for documentation compounds.
     *
     * @remarks
     * Processes all compounds (classes, files, namespaces, etc.) from the
     * Doxygen XML and converts them into Docusaurus-compatible Markdown pages.
     * Supports parallel processing for improved performance whilst maintaining
     * proper error handling and resource management.
     */
    async generateMdFiles() {
        const promises = [];
        for (const [, compound] of this.workspace.viewModel.compoundsById) {
            if (compound instanceof Page) {
                if (compound.id === 'indexpage') {
                    // This is the @mainpage. We diverge from Doxygen and generate
                    // the API main page differently, with the list of topics and
                    // this page detailed description. Therefore it is not generated
                    // as a regular page and must be skipped at this stage.
                    continue;
                }
            }
            const permalink = compound.relativePermalink;
            const { sidebarId } = compound;
            if (permalink === undefined || sidebarId === undefined) {
                if (this.options.verbose) {
                    console.warn('Skip', compound.id, 'no permalink');
                }
                continue;
            }
            // assert(permalink !== undefined)
            if (this.options.verbose) {
                console.log(`${compound.kind}: ${compound.compoundName.replaceAll(/[ ]*/g, '')}`, '->', `${this.workspace.absoluteBaseUrl}${permalink}...`);
            }
            if (this.options.debug) {
                await this.generatePage(compound);
            }
            else {
                if (promises.length > maxParallelPromises) {
                    await Promise.all(promises);
                    promises.length = 0;
                }
                promises.push(this.generatePage(compound));
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }
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
    async generatePage(compound) {
        const { sidebarId } = compound;
        assert(sidebarId !== undefined);
        const fileName = `${sidebarId}.md`;
        // console.log('fileName:', fileName)
        const filePath = `${this.workspace.outputFolderPath}${fileName}`;
        const permalink = compound.relativePermalink;
        assert(permalink !== undefined);
        const slug = `${this.workspace.slugBaseUrl}${permalink}`;
        const frontMatter = {
            // title: `${dataObject.pageTitle ?? compound.compoundName}`,
            slug,
            // description: '...', // TODO
            custom_edit_url: null,
            toc_max_heading_level: 4,
            keywords: ['doxygen', 'reference', compound.kind],
        };
        const bodyLines = compound.renderToLines(frontMatter);
        assert(compound.relativePermalink !== undefined);
        const pagePermalink = this.workspace.pageBaseUrl + compound.relativePermalink;
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines,
            title: compound.pageTitle,
            pagePermalink,
        });
    }
    // --------------------------------------------------------------------------
    /**
     * Generates HTML redirect files for backwards compatibility.
     *
     * @remarks
     * Creates redirect files that map original Doxygen URLs to the new
     * Docusaurus URLs, maintaining compatibility with existing bookmarks
     * and external links. This ensures a smooth transition when migrating
     * from Doxygen-generated documentation to Docusaurus.
     */
    async generateCompatibilityRedirectFiles() {
        const redirectsOutputFolderPath = this.options.compatibilityRedirectsOutputFolderPath;
        if (redirectsOutputFolderPath === undefined) {
            return;
        }
        console.log(`Removing existing folder static/${redirectsOutputFolderPath}...`);
        await fs.rm(`static/${redirectsOutputFolderPath}`, {
            recursive: true,
            force: true,
        });
        console.log('Writing redirect files...');
        const compoundIds = Array.from(this.workspace.viewModel.compoundsById.keys()).sort();
        for (const compoundId of compoundIds) {
            const compound = this.workspace.viewModel.compoundsById.get(compoundId);
            assert(compound !== undefined);
            const filePathBase = `static/${redirectsOutputFolderPath}/${compoundId}`;
            const filePath = `${filePathBase}.html`;
            if (compound.relativePermalink === undefined) {
                continue;
            }
            const { absoluteBaseUrl } = this.workspace;
            const permalink = `${absoluteBaseUrl}${compound.relativePermalink}/`;
            await this.generateRedirectFile({
                filePath,
                permalink,
            });
            if (compound.kind === 'file') {
                const filePath = `${filePathBase}_source.html`;
                await this.generateRedirectFile({
                    filePath,
                    permalink,
                });
            }
            else if (compound.kind === 'class' || compound.kind === 'struct') {
                const filePath = `${filePathBase}-members.html`;
                await this.generateRedirectFile({
                    filePath,
                    permalink,
                });
            }
        }
        const indexFilesMap = new Map();
        indexFilesMap.set('classes.html', 'classes');
        indexFilesMap.set('files.html', 'files');
        indexFilesMap.set('index.html', '');
        indexFilesMap.set('namespaces.html', 'namespaces');
        indexFilesMap.set('pages.html', 'pages');
        indexFilesMap.set('topics.html', 'groups');
        // Not redirectd:
        // annotated
        // doxygen_crawl
        // functions, _[a-z~], _func, _type, _vars
        // hierarchy
        // namespacemembers, _enum, _func, type, _vars
        for (const [from, to] of indexFilesMap) {
            const filePath = path.join('static', redirectsOutputFolderPath, from);
            const permalink = `${this.workspace.absoluteBaseUrl}${to}/`;
            await this.generateRedirectFile({
                filePath,
                permalink,
            });
        }
        if (this.options.verbose) {
            console.log(this.workspace.writtenHtmlFilesCounter, 'html files written');
        }
    }
    // async generateManualRedirectFiles(): Promise<void> {
    //   if (this.workspace.pluginOptions.redirects === undefined) {
    //     return
    //   }
    //   const redirectsOutputFolderPath = path.join('static')
    //   for (const entry of this.workspace.pluginOptions.redirects) {
    //     const fromArray = Array.isArray(entry.from) ? entry.from : [entry.from]
    //     for (const from of fromArray) {
    //       const filePath = path.join(redirectsOutputFolderPath, from)
    //       const permalink = `${this.workspace.siteConfig.baseUrl}${entry.to}/`
    //       await this.generateRedirectFile({
    //         filePath,
    //         permalink
    //       })
    //     }
    //   }
    // }
    // --------------------------------------------------------------------------
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
    // If `trailingSlash` is true, Docusaurus redirects do not generate
    // .html files, therefore we have to do it manually.
    async generateRedirectFile({ filePath, permalink, }) {
        // console.log(filePath)
        const lines = [];
        lines.push('<!DOCTYPE html>');
        lines.push('<html>');
        lines.push('  <head>');
        lines.push('    <meta charset="UTF-8">');
        lines.push(`    <meta http-equiv="refresh" content="0; url=${permalink}">`);
        lines.push(`    <link rel="canonical" href="${permalink}" />`);
        lines.push('  </head>');
        lines.push('  <script>');
        lines.push(`    window.location.href = '${permalink}'` +
            ' + window.location.search + window.location.hash;');
        lines.push('  </script>');
        lines.push('</html>');
        lines.push('');
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fileHandle = await fs.open(filePath, 'w');
        await fileHandle.write(lines.join('\n'));
        await fileHandle.close();
        this.workspace.writtenHtmlFilesCounter += 1;
    }
    // --------------------------------------------------------------------------
    /**
     * Copies required static files to the output directory.
     *
     * @remarks
     * Transfers essential template files including SVG icons and CSS
     * stylesheets to the appropriate locations in the static directory
     * for use by the generated documentation. These assets provide the
     * visual styling and iconography for the documentation site.
     */
    async copyFiles() {
        const destImgFolderPath = path.join('static', 'img', 'doxygen2docusaurus');
        await fs.mkdir(destImgFolderPath, { recursive: true });
        let fromFilePath = path.join(this.workspace.projectPath, 'templates', 'img', 'document-svgrepo-com.svg');
        let toFilePath = path.join(destImgFolderPath, 'document-svgrepo-com.svg');
        console.log('Copying image file', toFilePath);
        await fs.copyFile(fromFilePath, toFilePath);
        fromFilePath = path.join(this.workspace.projectPath, 'templates', 'img', 'folder-svgrepo-com.svg');
        toFilePath = path.join(destImgFolderPath, 'folder-svgrepo-com.svg');
        console.log('Copying image file', toFilePath);
        await fs.copyFile(fromFilePath, toFilePath);
        fromFilePath = path.join(this.workspace.projectPath, 'templates', 'css', 'custom.css');
        toFilePath = this.options.customCssFilePath;
        if (!(await folderExists(path.dirname(toFilePath)))) {
            await fs.mkdir(path.dirname(toFilePath), { recursive: true });
        }
        console.log('Copying css file', toFilePath);
        await fs.copyFile(fromFilePath, toFilePath);
    }
    // --------------------------------------------------------------------------
    /**
     * Copies image files referenced in the documentation.
     *
     * @remarks
     * Transfers all image files that are referenced within the Doxygen
     * documentation to the appropriate static directory, ensuring they
     * remain accessible in the generated Docusaurus site. Duplicate
     * image names are automatically deduplicated for efficiency.
     */
    async copyImageFiles() {
        if (this.workspace.dataModel.xml.images.length > 0) {
            return;
        }
        if (!this.options.verbose) {
            if (this.workspace.dataModel.xml.images.length > 0) {
                console.log('Copying', this.workspace.dataModel.xml.images.length, 'image files...');
            }
        }
        const destImgFolderPath = path.join('static', ...this.options.imagesFolderPath.split('/'));
        await fs.mkdir(destImgFolderPath, { recursive: true });
        const images = new Set();
        for (const image of this.workspace.dataModel.xml.images) {
            if (image.name !== undefined && image.name.length > 0) {
                images.add(image.name);
            }
        }
        const uniqueNames = Array.from(images).sort();
        let fromFilePath = '';
        let toFilePath = '';
        for (const name of uniqueNames) {
            fromFilePath = path.join(this.options.doxygenXmlInputFolderPath, name);
            toFilePath = path.join(destImgFolderPath, name);
            if (this.options.verbose) {
                console.log('Copying image file', toFilePath);
            }
            await fs.copyFile(fromFilePath, toFilePath);
        }
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=generator.js.map