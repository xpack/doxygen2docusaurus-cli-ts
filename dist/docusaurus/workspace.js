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
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
// import * as util from 'node:util'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ParaDataModel } from '../doxygen/data-model/compounds/descriptiontype-dm.js';
import { Renderers } from './renderers/renderers.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { stripPermalinkHexAnchor, getPermalinkAnchor, stripPermalinkTextAnchor, } from './utils.js';
import { ViewModel } from './view-model/view-model.js';
// ----------------------------------------------------------------------------
// <xsd:simpleType name="DoxCompoundKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="class" />
//     <xsd:enumeration value="struct" />
//     <xsd:enumeration value="union" />
//     <xsd:enumeration value="interface" />
//     <xsd:enumeration value="protocol" />
//     <xsd:enumeration value="category" />
//     <xsd:enumeration value="exception" />
//     <xsd:enumeration value="service" />
//     <xsd:enumeration value="singleton" />
//     <xsd:enumeration value="module" />
//     <xsd:enumeration value="type" />
//     <xsd:enumeration value="file" />
//     <xsd:enumeration value="namespace" />
//     <xsd:enumeration value="group" />
//     <xsd:enumeration value="page" />
//     <xsd:enumeration value="example" />
//     <xsd:enumeration value="dir" />
//     <xsd:enumeration value="concept" />
//   </xsd:restriction>
// </xsd:simpleType>
// ----------------------------------------------------------------------------
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
export class Workspace extends Renderers {
    /** Configuration options controlling the conversion process. */
    // From the project docusaurus.config.ts or defaults.
    options;
    /** The parsed Doxygen data model containing all source information. */
    // The data parsed from the Doxygen XML files.
    dataModel;
    /** The view model that structures data for documentation generation. */
    viewModel;
    /** The absolute path to the doxygen2docusaurus project directory. */
    // The doxygen2docusaurus project path.
    projectPath;
    /** Doxygen configuration options from the original build process. */
    // The many options used by Doxygen during build.
    doxygenOptions;
    /** The absolute base URL for the generated documentation site. */
    // Like `/micro-os-plus/docs/api/`.
    absoluteBaseUrl;
    /** The page base URL for individual documentation pages. */
    // Like `/micro-os-plus/docs/api/`.
    pageBaseUrl;
    /** The slug base URL for Docusaurus routing. */
    // Like `/api/`.
    slugBaseUrl;
    /** The menu base URL for navigation elements. */
    // Like `/docs/api/`.
    menuBaseUrl;
    /** The output folder path for generated Markdown files. */
    // Like `docs/api/`.
    outputFolderPath;
    /** The sidebar base identifier for navigation structure. */
    // like `api/`.
    sidebarBaseId;
    /** The main page compound, if one exists in the documentation. */
    mainPage;
    /** Map of file paths to their corresponding File objects. */
    filesByPath = new Map();
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
    indicesMaps = new Map();
    /** Counter for the total number of Markdown files written. */
    writtenMdFilesCounter = 0;
    /** Counter for the total number of HTML redirect files written. */
    writtenHtmlFilesCounter = 0;
    /** Mapping of Doxygen compound kinds to collection names. */
    collectionNamesByKind = {
        class: 'classes',
        struct: 'classes',
        union: 'classes',
        // interface
        // protocol
        // category
        // exception
        // service
        // singleton
        // module
        // type
        file: 'files',
        namespace: 'namespaces',
        group: 'groups',
        page: 'pages',
        // example
        dir: 'files',
        // concept
    };
    /** Defines the order of entries in the sidebar and top menu dropdown. */
    // The order of entries in the sidebar and in the top menu dropdown.
    sidebarCollectionNames = [
        'groups',
        'namespaces',
        'classes',
        'files',
        'pages',
    ];
    // --------------------------------------------------------------------------
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
    constructor(dataModel) {
        super();
        console.log();
        this.dataModel = dataModel;
        this.options = dataModel.options;
        // Like .../doxygen2docusaurus/dist/docusaurus/generator
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // doxygen2docusaurus
        this.projectPath = path.dirname(path.dirname(__dirname));
        // console.log(__dirname, this.projectPath)
        this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile?.options);
        const docsFolderPath = this.options.docsFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        const apiFolderPath = this.options.apiFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`;
        this.sidebarBaseId = `${apiFolderPath}/`;
        const docsBaseUrl = this.options.docsBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        let apiBaseUrl = this.options.apiBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        if (apiBaseUrl.length > 0) {
            apiBaseUrl += '/';
        }
        this.absoluteBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.pageBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.slugBaseUrl = `/${apiBaseUrl}`;
        this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`;
        this.registerRenderers(this);
        this.viewModel = new ViewModel(this);
        this.viewModel.create();
    }
    // --------------------------------------------------------------------------
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
    async writeOutputMdFile({ filePath, bodyLines, frontMatter, frontMatterCodeLines, title, pagePermalink, }) {
        const lines = [];
        lines.push('');
        lines.push('<div class="doxyPage">');
        if (frontMatter.title === undefined && title !== undefined) {
            lines.push('');
            lines.push(`# ${title}`);
        }
        lines.push('');
        lines.push(...bodyLines);
        lines.push('');
        lines.push('<hr/>');
        lines.push('');
        assert(this.dataModel.doxygenindex?.version !== undefined);
        assert(this.dataModel.projectVersion !== undefined);
        lines.push('<p class="doxyGeneratedBy">Generated via ' +
            '<a href="https://xpack.github.io/doxygen2docusaurus">' +
            'doxygen2docusaurus</a> ' +
            this.dataModel.projectVersion +
            ' by ' +
            '<a href="https://www.doxygen.nl">Doxygen</a> ' +
            this.dataModel.doxygenindex.version +
            '.' +
            '</p>');
        lines.push('');
        lines.push('</div>');
        lines.push('');
        // Hack to prevent Docusaurus replace legit content with emojis.
        let text = lines.join('\n');
        if (pagePermalink !== undefined && pagePermalink.length > 0) {
            // Strip local page permalink from anchors.
            text = text.replaceAll(`"${pagePermalink}/#`, '"#');
        }
        // No longer needed for `.md`.
        // text = text.replaceAll(':thread:', "{':thread:'}")
        //   .replaceAll(':flags:', "{':flags:'}")
        // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
        const frontMatterLines = [];
        frontMatterLines.push('---');
        frontMatterLines.push('');
        frontMatterLines.push('# DO NOT EDIT!');
        frontMatterLines.push('# Automatically generated via doxygen2docusaurus by Doxygen.');
        frontMatterLines.push('');
        for (const [key, value] of Object.entries(frontMatter)) {
            if (Array.isArray(value)) {
                frontMatterLines.push(`${key}:`);
                for (const arrayValue of value) {
                    frontMatterLines.push(`  - ${arrayValue}`);
                }
            }
            else if (typeof value === 'boolean') {
                frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`);
            }
            else if (value == null) {
                frontMatterLines.push(`${key}: null`);
            }
            else {
                frontMatterLines.push(`${key}: ${value.toString()}`);
            }
        }
        frontMatterLines.push('');
        // Skip date, to avoid unnecessary git commits.
        // frontMatterText += `date: ${formatDate(new Date())}\n`
        // frontMatterText += '\n'
        frontMatterLines.push('---');
        frontMatterLines.push('');
        if (frontMatterCodeLines !== undefined && frontMatterCodeLines.length > 0) {
            frontMatterLines.push('');
            for (const line of frontMatterCodeLines) {
                frontMatterLines.push(line);
            }
        }
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fileHandle = await fs.open(filePath, 'ax');
        await fileHandle.write(frontMatterLines.join('\n'));
        await fileHandle.write(text);
        await fileHandle.close();
        this.writtenMdFilesCounter += 1;
    }
    // --------------------------------------------------------------------------
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
    skipElementsPara(elements) {
        if (elements === undefined) {
            return;
        }
        for (const child of elements) {
            if (child instanceof ParaDataModel) {
                child.skipPara = true;
            }
        }
    }
    // --------------------------------------------------------------------------
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
    getPermalink({ refid, kindref, }) {
        // console.log(refid, kindref)
        let permalink = undefined;
        if (kindref === 'compound') {
            permalink = this.getPagePermalink(refid);
        }
        else if (kindref === 'member') {
            const anchor = getPermalinkAnchor(refid);
            const compoundId = stripPermalinkHexAnchor(refid);
            // console.log(
            //   'refid:', refid, 'compoundId:', compoundId, 'anchor:', anchor
            // )
            permalink = this.getPagePermalink(compoundId, true);
            if (permalink !== undefined) {
                permalink += `/#${anchor}`;
            }
            else {
                const tocItem = this.viewModel.descriptionTocItemsById.get(refid);
                if (tocItem !== undefined) {
                    const { tocList } = tocItem;
                    permalink = this.getPagePermalink(tocList.compound.id);
                    if (permalink !== undefined) {
                        permalink += `/#${anchor}`;
                    }
                    else {
                        console.error('Unknown permalink of', tocList.compound.id, 'for', refid, 'in', this.constructor.name, 'getPermalink');
                    }
                }
                else {
                    const descriptionSection = this.viewModel.descriptionAnchorsById.get(refid);
                    if (descriptionSection !== undefined) {
                        permalink = this.getPagePermalink(descriptionSection.compound.id);
                        if (permalink !== undefined) {
                            permalink += `/#${anchor}`;
                        }
                        else {
                            console.error('Unknown permalink of', descriptionSection.compound.id, 'for', refid, 'in', this.constructor.name, 'getPermalink');
                        }
                    }
                    else {
                        console.error('Unknown permalink for', refid, 'in', this.constructor.name, 'getPermalink');
                    }
                }
            }
            // console.log(permalink)
            // }
        }
        else if (kindref === 'xrefsect') {
            const anchor = getPermalinkAnchor(refid);
            const compoundId = stripPermalinkTextAnchor(refid);
            // console.log(
            //   'refid:', refid, 'compoundId:', compoundId, 'anchor:', anchor
            // )
            permalink = this.getPagePermalink(compoundId, true);
            if (permalink !== undefined) {
                permalink += `/#${anchor}`;
            }
            else {
                console.error('Unknown permalink for', refid, 'in', this.constructor.name, 'getPermalink');
            }
            // console.log(permalink)
            // }
        }
        else {
            console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink');
        }
        return permalink;
    }
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
    getPagePermalink(refid, noWarn = false) {
        const dataObject = this.viewModel.compoundsById.get(refid);
        if (dataObject === undefined) {
            if (this.options.debug && !noWarn) {
                console.warn('refid', refid, 'is not a known compound, no permalink');
            }
            return undefined;
        }
        const pagePermalink = dataObject.relativePermalink;
        if (pagePermalink === undefined) {
            if (this.options.verbose && !noWarn) {
                console.warn('refid', refid, 'has no permalink');
            }
            return undefined;
        }
        return `${this.pageBaseUrl}${pagePermalink}`;
    }
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
    getXrefPermalink(id) {
        // console.log('1', id, this.currentCompoundDef.id)
        const pagePart = id.replace(/_1.*/, '');
        const anchorPart = id.replace(/.*_1/, '');
        // console.log('2', part1, part2)
        // if (
        //   this.currentCompound !== undefined &&
        //   pagePart === this.currentCompound.id
        // ) {
        //   return `#${anchorPart}`
        // } else {
        return `${this.pageBaseUrl}pages/${pagePart}/#${anchorPart}`;
        // }
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=workspace.js.map