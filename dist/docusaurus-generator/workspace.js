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
import * as util from 'node:util';
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { Groups } from './view-model/groups-vm.js';
import { Classes } from './view-model/classes-vm.js';
import { DoxygenFileOptions } from './view-model/options.js';
import { escapeMdx, getPermalinkAnchor, stripPermalinkAnchor } from './utils.js';
import { Namespaces } from './view-model/namespaces-vm.js';
import { FilesAndFolders } from './view-model/files-and-folders-vm.js';
import { Pages } from './view-model/pages-vm.js';
import { pluginName } from '../plugin/docusaurus.js';
import { Member } from './view-model/members-vm.js';
import { Renderers } from './elements-renderers/renderers.js';
// ----------------------------------------------------------------------------
export class Workspace {
    // --------------------------------------------------------------------------
    constructor({ dataModel, pluginOptions, siteConfig, pluginActions = undefined }) {
        this.collectionNamesByKind = {
            group: 'groups',
            namespace: 'namespaces',
            class: 'classes',
            struct: 'classes',
            file: 'files',
            dir: 'files',
            page: 'pages'
        };
        // The order of entries in the sidebar and in the top menu dropdown.
        this.sidebarCollectionNames = ['groups', 'namespaces', 'classes', 'files', 'pages'];
        // View model objects.
        this.compoundsById = new Map();
        // TODO: change to member view model objects
        this.membersById = new Map();
        console.log();
        this.dataModel = dataModel;
        this.pluginOptions = pluginOptions;
        this.siteConfig = siteConfig;
        this.pluginActions = pluginActions;
        this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile?.options);
        // The relevant part of the permalink, like 'api', with the trailing slash.
        // TODO: what if not below `docs`?
        const outputBaseUrl = this.pluginOptions.outputBaseUrl.replace(/^[/]/, '').replace(/[/]$/, '');
        this.permalinkBaseUrl = `${outputBaseUrl}/`;
        // console.log('permalinkBaseUrl:', this.permalinkBaseUrl)
        // Create the view-model objects.
        this.viewModel = new Map();
        this.viewModel.set('groups', new Groups(this));
        this.viewModel.set('namespaces', new Namespaces(this));
        this.viewModel.set('classes', new Classes(this));
        this.viewModel.set('files', new FilesAndFolders(this));
        this.viewModel.set('pages', new Pages(this));
        this.elementRenderers = new Renderers(this);
        this.createVieModelObjects();
        this.createCompoundsHierarchies();
        this.createMembersMap();
        this.initializeCompoundsLate();
        this.initializeMemberLate();
        this.validatePermalinks();
        this.cleanups();
    }
    // --------------------------------------------------------------------------
    createVieModelObjects() {
        console.log('Creating view model objects...');
        for (const compoundDefDataModel of this.dataModel.compoundDefs) {
            let added = false;
            const collectionName = this.collectionNamesByKind[compoundDefDataModel.kind];
            if (collectionName !== undefined) {
                const collection = this.viewModel.get(collectionName);
                if (collection !== undefined) {
                    // Create the compound object and add it to the parent collection.
                    const compound = collection.addChild(compoundDefDataModel);
                    // Also add it to the global compounds map.
                    this.compoundsById.set(compoundDefDataModel.id, compound);
                    added = true;
                }
            }
            if (!added) {
                // console.error(util.inspect(compoundDefDataModel, { compact: false, depth: 999 }))
                console.error('compoundDefDataModel', compoundDefDataModel.kind, 'not implemented yet in', this.constructor.name);
            }
        }
        console.log(this.compoundsById.size, 'compound definitions');
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        console.log('Creating compounds hierarchies...');
        for (const [collectionName, collection] of this.viewModel) {
            // console.log('createHierarchies:', collectionName)
            collection.createCompoundsHierarchies();
        }
    }
    // --------------------------------------------------------------------------
    // Required since references can be resolved only after all objects are in.
    initializeCompoundsLate() {
        console.log('Performing compounds late initializations...');
        for (const [collectionName, collection] of this.viewModel) {
            // console.log('createHierarchies:', collectionName)
            for (const [compoundId, compound] of collection.collectionCompoundsById) {
                this.currentCompound = compound;
                // console.log(compound.compoundName)
                compound.initializeLate();
            }
        }
        this.currentCompound = undefined;
    }
    // --------------------------------------------------------------------------
    createMembersMap() {
        console.log('Creating member definitions map...');
        for (const [, compound] of this.compoundsById) {
            // console.log(compound.kind, compound.compoundName, compound.id)
            if (compound.sections !== undefined) {
                for (const section of compound.sections) {
                    if (section.members !== undefined) {
                        // console.log('  ', sectionDef.kind)
                        for (const member of section.members) {
                            if (member instanceof Member) {
                                const memberCompoundId = stripPermalinkAnchor(member.id);
                                if (memberCompoundId !== compound.id) {
                                    // Skip member definitions from different compounds.
                                    // Hopefully they are defined properly there.
                                    // console.log('member from another compound', compoundId, 'skipped')
                                }
                                else {
                                    // console.log('    ', memberDef.kind, memberDef.id)
                                    if (this.membersById.has(member.id)) {
                                        console.warn('member already in map', member.id, 'in', this.membersById.get(member.id)?.name);
                                    }
                                    else {
                                        this.membersById.set(member.id, member);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log(this.membersById.size, 'member definitions');
    }
    // --------------------------------------------------------------------------
    // Required since references can be resolved only after all objects are in.
    initializeMemberLate() {
        console.log('Performing members late initializations...');
        for (const [, compound] of this.compoundsById) {
            // console.log(compound.kind, compound.compoundName, compound.id)
            this.currentCompound = compound;
            if (compound.sections !== undefined) {
                for (const section of compound.sections) {
                    section.initializeLate();
                    if (section.members !== undefined) {
                        // console.log('  ', sectionDef.kind)
                        for (const member of section.members) {
                            if (member instanceof Member) {
                                member.initializeLate();
                            }
                        }
                    }
                }
            }
        }
        this.currentCompound = undefined;
    }
    // --------------------------------------------------------------------------
    /**
     * @brief Validate the uniqueness of permalinks.
     */
    validatePermalinks() {
        console.log('Validating permalinks...');
        assert(this.pluginOptions.outputFolderPath);
        // const outputFolderPath = this.options.outputFolderPath
        const pagePermalinksById = new Map();
        const pagePermalinksSet = new Set();
        for (const compoundDefDataModel of this.dataModel.compoundDefs) {
            // console.log(compoundDefDataModel.kind, compoundDefDataModel.compoundName)
            const compound = this.compoundsById.get(compoundDefDataModel.id);
            if (compound === undefined) {
                console.error('compoundDefDataModel', compoundDefDataModel.id, 'not yet processed in', this.constructor.name, 'validatePermalinks');
                continue;
            }
            const permalink = compound.relativePermalink;
            assert(permalink !== undefined);
            // console.log('permalink:', permalink)
            if (pagePermalinksById.has(compoundDefDataModel.id)) {
                console.error('Permalink clash for id', compoundDefDataModel.id);
            }
            if (pagePermalinksSet.has(permalink)) {
                console.error('Permalink clash for permalink', permalink, 'id:', compoundDefDataModel.id);
            }
            pagePermalinksById.set(compoundDefDataModel.id, permalink);
            pagePermalinksSet.add(permalink);
        }
    }
    // --------------------------------------------------------------------------
    cleanups() {
        for (const [, compound] of this.compoundsById) {
            compound._private._compoundDef = undefined;
        }
    }
    // --------------------------------------------------------------------------
    async writeFile({ filePath, bodyLines, frontMatter, title }) {
        const lines = [];
        lines.push('');
        lines.push(`<DoxygenPage version="${this.dataModel.doxygenindex?.version}">`);
        lines.push('');
        lines.push(...bodyLines);
        lines.push('');
        lines.push('</DoxygenPage>');
        lines.push('');
        const text = lines.join('\n');
        // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
        const frontMatterLines = [];
        frontMatterLines.push('---');
        frontMatterLines.push('');
        frontMatterLines.push('# DO NOT EDIT!');
        frontMatterLines.push('# Automatically generated via docusaurus-plugin-doxygen by Doxygen.');
        frontMatterLines.push('');
        for (const [key, value] of Object.entries(frontMatter)) {
            if (Array.isArray(value)) {
                frontMatterLines.push(`${key}:`);
                for (const arrayValue of frontMatter[key]) {
                    frontMatterLines.push(`  - ${arrayValue}`);
                }
            }
            else if (typeof value === 'boolean') {
                frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`);
            }
            else {
                frontMatterLines.push(`${key}: ${value}`);
            }
        }
        frontMatterLines.push('');
        // Skip date, to avoid unnecessary git commits.
        // frontMatterText += `date: ${formatDate(new Date())}\n`
        // frontMatterText += '\n'
        frontMatterLines.push('---');
        frontMatterLines.push('');
        if (text.includes('<Link')) {
            frontMatterLines.push('import Link from \'@docusaurus/Link\'');
        }
        // Theme components.
        if (text.includes('<CodeBlock')) {
            frontMatterLines.push('import CodeBlock from \'@theme/CodeBlock\'');
        }
        if (text.includes('<Admonition')) {
            frontMatterLines.push('import Admonition from \'@theme/Admonition\'');
        }
        frontMatterLines.push('');
        const componentNames = [
            'CodeLine',
            'DoxygenPage',
            'EnumerationList',
            'EnumerationListItem',
            'GeneratedByDoxygen',
            'Highlight',
            'IncludesList',
            'IncludesListItem',
            'MemberDefinition',
            'MembersIndex',
            'MembersIndexItem',
            'ParametersList',
            'ParametersListItem',
            'ProgramListing',
            'Reference',
            'SectionDefinition',
            'SectionUser',
            'TreeTable',
            'TreeTableRow',
            'XrefSect'
        ];
        // Add includes for the plugin components.
        for (const componentName of componentNames) {
            if (text.includes(`<${componentName}`)) {
                frontMatterLines.push(`import ${componentName} from '${pluginName}/components/${componentName}'`);
            }
        }
        frontMatterLines.push('');
        if (frontMatter.title === undefined && title !== undefined) {
            frontMatterLines.push(`# ${title}`);
            frontMatterLines.push('');
        }
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fileHandle = await fs.open(filePath, 'ax');
        await fileHandle.write(frontMatterLines.join('\n'));
        await fileHandle.write(text);
        await fileHandle.close();
    }
    // --------------------------------------------------------------------------
    renderElementsToMdxLines(elements) {
        if (!Array.isArray(elements)) {
            return [];
        }
        const lines = [];
        for (const element of elements) {
            lines.push(...this.renderElementToMdxLines(element));
        }
        return lines;
    }
    renderElementToMdxLines(element) {
        if (element === undefined) {
            return [];
        }
        if (typeof element === 'string') {
            return [escapeMdx(element)];
        }
        if (Array.isArray(element)) {
            const lines = [];
            for (const elementOfArray of element) {
                lines.push(...this.renderElementToMdxLines(elementOfArray));
            }
            return lines;
        }
        const linesRenderer = this.elementRenderers.getElementLinesRenderer(element);
        if (linesRenderer !== undefined) {
            return linesRenderer.renderToMdxLines(element);
        }
        const textRenderer = this.elementRenderers.getElementTextRenderer(element);
        if (textRenderer !== undefined) {
            return [textRenderer.renderToMdxText(element)];
        }
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error('no element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxLines');
        assert(false);
    }
    renderElementsToMdxText(elements) {
        if (elements === undefined) {
            return '';
        }
        let text = '';
        for (const element of elements) {
            text += this.renderElementToMdxText(element);
        }
        return text;
    }
    renderElementToMdxText(element) {
        if (element === undefined) {
            return '';
        }
        if (typeof element === 'string') {
            return escapeMdx(element);
        }
        if (Array.isArray(element)) {
            let text = '';
            for (const elementOfArray of element) {
                text += this.renderElementToMdxText(elementOfArray);
            }
            return text;
        }
        const textRenderer = this.elementRenderers.getElementTextRenderer(element);
        if (textRenderer !== undefined) {
            return textRenderer.renderToMdxText(element);
        }
        // console.warn('trying element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText')
        const linesRenderer = this.elementRenderers.getElementLinesRenderer(element);
        if (linesRenderer !== undefined) {
            return linesRenderer.renderToMdxLines(element).join('\n');
        }
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error('no element text renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText');
        return '';
    }
    // --------------------------------------------------------------------------
    getPermalink({ refid, kindref }) {
        // console.log(refid, kindref)
        let permalink;
        if (kindref === 'compound') {
            permalink = this.getPagePermalink(refid);
        }
        else if (kindref === 'member') {
            const compoundId = stripPermalinkAnchor(refid);
            // console.log('compoundId:', compoundId)
            if (compoundId === this.currentCompound?.id) {
                permalink = `#${getPermalinkAnchor(refid)}`;
            }
            else {
                permalink = `${this.getPagePermalink(compoundId)}/#${getPermalinkAnchor(refid)}`;
            }
        }
        else {
            console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink');
        }
        assert(permalink !== undefined && permalink.length > 1);
        return permalink;
    }
    getPagePermalink(refid) {
        const dataObject = this.compoundsById.get(refid);
        if (dataObject === undefined) {
            console.log('refid', refid);
        }
        assert(dataObject !== undefined);
        const pagePermalink = dataObject.relativePermalink;
        if (pagePermalink === undefined) {
            console.error('refid', refid, 'has no permalink');
        }
        assert(pagePermalink !== undefined);
        return `/${this.pluginOptions.outputFolderPath}/${pagePermalink}`;
    }
    getXrefPermalink(id) {
        // console.log('1', id, this.currentCompoundDef.id)
        const pagePart = id.replace(/_1.*/, '');
        const anchorPart = id.replace(/.*_1/, '');
        // console.log('2', part1, part2)
        if (this.currentCompound !== undefined && pagePart === this.currentCompound.id) {
            return `#${anchorPart}`;
        }
        else {
            return `/${this.pluginOptions.outputFolderPath}/pages/${pagePart}/#${anchorPart}`;
        }
    }
}
// ----------------------------------------------------------------------------
