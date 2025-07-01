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
import assert from 'node:assert';
import crypto from 'node:crypto';
import { CompoundBase } from './compound-base-vm.js';
import { CollectionBase } from './collection-base.js';
import { escapeHtml, flattenPath, renderString, sanitizeHierarchicalPath } from '../utils.js';
import { IndexEntry } from './indices-vm.js';
// ----------------------------------------------------------------------------
const kindsPlurals = {
    class: 'Classes',
    struct: 'Structs',
    union: 'Unions'
};
// ----------------------------------------------------------------------------
export class Classes extends CollectionBase {
    constructor() {
        super(...arguments);
        // compoundsById: Map<string, Class>
        this.topLevelClasses = [];
    }
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        const classs = new Class(this, compoundDef);
        this.collectionCompoundsById.set(classs.id, classs);
        return classs;
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // Recreate classes hierarchies.
        for (const [classId, base] of this.collectionCompoundsById) {
            const classs = base;
            for (const baseClassId of classs.baseClassIds) {
                // console.log(classId, baseClassId)
                const baseClass = this.collectionCompoundsById.get(baseClassId);
                if (baseClass !== undefined) {
                    // console.log('baseClassId', baseClassId, 'has child', classId)
                    baseClass.children.push(classs);
                    classs.baseClasses.push(baseClass);
                }
                else {
                    console.warn(baseClassId, 'ignored as base class for', classId);
                }
            }
        }
        for (const [classId, base] of this.collectionCompoundsById) {
            const classs = base;
            if (classs.baseClassIds.size === 0) {
                // console.log('topLevelClassId:', classId)
                this.topLevelClasses.push(classs);
            }
        }
    }
    // --------------------------------------------------------------------------
    createSidebarItems(sidebarCategory) {
        // Add classes to the sidebar.
        // Top level classes are added below a Class category
        const classesCategory = {
            type: 'category',
            label: 'Classes',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}index/classes/index`
            },
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Hierarchy',
                    collapsed: true,
                    items: []
                },
                {
                    type: 'doc',
                    label: 'All',
                    id: `${this.workspace.sidebarBaseId}index/classes/all`
                },
                {
                    type: 'doc',
                    label: 'Classes',
                    id: `${this.workspace.sidebarBaseId}index/classes/classes`
                },
                {
                    type: 'doc',
                    label: 'Functions',
                    id: `${this.workspace.sidebarBaseId}index/classes/functions`
                },
                {
                    type: 'doc',
                    label: 'Variables',
                    id: `${this.workspace.sidebarBaseId}index/classes/variables`
                },
                {
                    type: 'doc',
                    label: 'Typedefs',
                    id: `${this.workspace.sidebarBaseId}index/classes/typedefs`
                }
            ]
        };
        for (const classs of this.topLevelClasses) {
            const item = this.createSidebarItemRecursively(classs);
            if (item !== undefined) {
                classesCategory.items[0].items.push(item);
            }
        }
        sidebarCategory.items.push(classesCategory);
    }
    createSidebarItemRecursively(classs) {
        if (classs.sidebarLabel === undefined) {
            return undefined;
        }
        if (classs.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: classs.sidebarLabel,
                id: `${this.workspace.sidebarBaseId}${classs.docusaurusId}`
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: classs.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}${classs.docusaurusId}`
                },
                collapsed: true,
                items: []
            };
            for (const child of classs.children) {
                const item = this.createSidebarItemRecursively(child);
                if (item !== undefined) {
                    categoryItem.items.push(item);
                }
            }
            return categoryItem;
        }
    }
    // --------------------------------------------------------------------------
    createMenuItems() {
        const menuItem = {
            label: 'Classes',
            to: `${this.workspace.menuBaseUrl}classes/`
        };
        return [menuItem];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdFile() {
        if (this.topLevelClasses.length === 0) {
            return;
        }
        const filePath = `${this.workspace.outputFolderPath}index/classes/index.md`;
        const permalink = 'classes';
        const frontMatter = {
            title: 'The Classes Reference',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'classes', 'reference']
        };
        const lines = [];
        lines.push('The classes, structs, union and interfaces used by this project are:');
        lines.push('');
        lines.push('<table class="doxyTreeTable">');
        for (const classs of this.topLevelClasses) {
            lines.push(...this.generateIndexMdFileRecursively(classs, 1));
        }
        lines.push('');
        lines.push('</table>');
        console.log(`Writing classes index file ${filePath}...`);
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
    generateIndexMdFileRecursively(classs, depth) {
        // console.log(util.inspect(classs, { compact: false, depth: 999 }))
        const lines = [];
        const permalink = this.workspace.getPagePermalink(classs.id);
        assert(permalink !== undefined && permalink.length > 0);
        const iconLetters = {
            class: 'C',
            struct: 'S',
            union: 'U'
        };
        let iconLetter = iconLetters[classs.kind];
        if (iconLetter === undefined) {
            console.error('Icon kind', classs.kind, 'not supported yet in', this.constructor.name, '(using ?)');
            iconLetter = '?';
        }
        const label = escapeHtml(classs.unqualifiedName);
        let description = '';
        if (classs.briefDescriptionMarkdownString !== undefined && classs.briefDescriptionMarkdownString.length > 0) {
            description = classs.briefDescriptionMarkdownString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToLines({
            itemIconLetter: iconLetter,
            itemLabel: label,
            itemLink: permalink,
            depth,
            description
        }));
        if (classs.children.length > 0) {
            for (const childClass of classs.children) {
                lines.push(...this.generateIndexMdFileRecursively(childClass, depth + 1));
            }
        }
        return lines;
    }
    async generatePerInitialsIndexMdFiles() {
        if (this.topLevelClasses.length === 0) {
            return;
        }
        const allUnorderedEntriesMap = new Map();
        for (const [compoundId, compound] of this.collectionCompoundsById) {
            const compoundEntry = new IndexEntry(compound);
            allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry);
            for (const section of compound.sections) {
                for (const member of section.definitionMembers) {
                    const memberEntry = new IndexEntry(member);
                    allUnorderedEntriesMap.set(memberEntry.id, memberEntry);
                }
            }
        }
        // ------------------------------------------------------------------------
        const outputFolderPath = this.workspace.outputFolderPath;
        {
            const filePath = `${outputFolderPath}index/classes/all.md`;
            const permalink = 'index/classes/all';
            const frontMatter = {
                title: 'The Classes and Members Index',
                slug: `${this.workspace.slugBaseUrl}${permalink}`,
                // description: '...', // TODO
                custom_edit_url: null,
                keywords: ['doxygen', 'classes', 'index']
            };
            const lines = [];
            lines.push('The classes, structs, union interfaces and their members, variables, types used by this project are:');
            const orderedEntriesMap = this.orderPerInitials(allUnorderedEntriesMap);
            lines.push(...this.outputEntries(orderedEntriesMap));
            console.log(`Writing index file ${filePath}...`);
            await this.workspace.writeMdFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
        // ------------------------------------------------------------------------
        {
            const filePath = `${outputFolderPath}index/classes/classes.md`;
            const permalink = 'index/classes/classes';
            const frontMatter = {
                title: 'The Classes Index',
                slug: `${this.workspace.slugBaseUrl}${permalink}`,
                // description: '...', // TODO
                custom_edit_url: null,
                keywords: ['doxygen', 'classes', 'index']
            };
            const lines = [];
            lines.push('The classes, structs, union interfaces used by this project are:');
            const classesUnorderedMap = new Map();
            for (const [id, entry] of allUnorderedEntriesMap) {
                if (entry.objectKind === 'compound') {
                    classesUnorderedMap.set(id, entry);
                }
            }
            const orderedEntries = this.orderPerInitials(classesUnorderedMap);
            lines.push(...this.outputEntries(orderedEntries));
            console.log(`Writing index file ${filePath}...`);
            await this.workspace.writeMdFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
        // ------------------------------------------------------------------------
        {
            const filePath = `${outputFolderPath}index/classes/functions.md`;
            const permalink = 'index/classes/functions';
            const frontMatter = {
                title: 'The Class Functions Index',
                slug: `${this.workspace.slugBaseUrl}${permalink}`,
                // description: '...', // TODO
                custom_edit_url: null,
                keywords: ['doxygen', 'classes', 'index']
            };
            const lines = [];
            lines.push('The class member functions used by this project are:');
            const classesUnorderedMap = new Map();
            for (const [id, entry] of allUnorderedEntriesMap) {
                if (entry.kind === 'function') {
                    classesUnorderedMap.set(id, entry);
                }
            }
            const orderedEntries = this.orderPerInitials(classesUnorderedMap);
            lines.push(...this.outputEntries(orderedEntries));
            console.log(`Writing index file ${filePath}...`);
            await this.workspace.writeMdFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
        // ------------------------------------------------------------------------
        {
            const filePath = `${outputFolderPath}index/classes/variables.md`;
            const permalink = 'index/classes/variables';
            const frontMatter = {
                title: 'The Class Variables Index',
                slug: `${this.workspace.slugBaseUrl}${permalink}`,
                // description: '...', // TODO
                custom_edit_url: null,
                keywords: ['doxygen', 'classes', 'index']
            };
            const lines = [];
            lines.push('The class member variables used by this project are:');
            const classesUnorderedMap = new Map();
            for (const [id, entry] of allUnorderedEntriesMap) {
                if (entry.kind === 'variable') {
                    classesUnorderedMap.set(id, entry);
                }
            }
            const orderedEntries = this.orderPerInitials(classesUnorderedMap);
            lines.push(...this.outputEntries(orderedEntries));
            console.log(`Writing index file ${filePath}...`);
            await this.workspace.writeMdFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
        // ------------------------------------------------------------------------
        {
            const filePath = `${outputFolderPath}index/classes/typedefs.md`;
            const permalink = 'index/classes/typedefs';
            const frontMatter = {
                title: 'The Class Type Definitions Index',
                slug: `${this.workspace.slugBaseUrl}${permalink}`,
                // description: '...', // TODO
                custom_edit_url: null,
                keywords: ['doxygen', 'classes', 'index']
            };
            const lines = [];
            lines.push('The class member type definitions used by this project are:');
            const classesUnorderedMap = new Map();
            for (const [id, entry] of allUnorderedEntriesMap) {
                if (entry.kind === 'typedef') {
                    classesUnorderedMap.set(id, entry);
                }
            }
            const orderedEntries = this.orderPerInitials(classesUnorderedMap);
            lines.push(...this.outputEntries(orderedEntries));
            console.log(`Writing index file ${filePath}...`);
            await this.workspace.writeMdFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
        // ------------------------------------------------------------------------
    }
    orderPerInitials(entriesMap) {
        const entriesPerInitialsMap = new Map();
        for (const [id, entry] of entriesMap) {
            const initial = entry.name.charAt(0);
            let mapArray = entriesPerInitialsMap.get(initial);
            if (mapArray === undefined) {
                mapArray = [];
                entriesPerInitialsMap.set(initial, mapArray);
            }
            mapArray.push(entry);
        }
        const orderedMap = new Map();
        const orderedInitials = Array.from(entriesPerInitialsMap.keys()).sort();
        for (const initial of orderedInitials) {
            const unorderedArray = entriesPerInitialsMap.get(initial);
            assert(unorderedArray !== undefined);
            const orderedArray = unorderedArray.sort((a, b) => {
                let nameComparison = a.name.localeCompare(b.name);
                if (nameComparison !== 0) {
                    return nameComparison;
                }
                nameComparison = a.longName.localeCompare(b.longName);
                return nameComparison;
            });
            orderedMap.set(initial, orderedArray);
        }
        return orderedMap;
    }
    outputEntries(entriesPerInitialsMap) {
        const lines = [];
        for (const initial of entriesPerInitialsMap.keys()) {
            lines.push('');
            lines.push(`## - ${initial} -`);
            lines.push('');
            lines.push('<ul>');
            const mapArray = entriesPerInitialsMap.get(initial);
            assert(mapArray !== undefined);
            for (const entry of mapArray) {
                let kind = '';
                if (entry.objectKind === 'compound') {
                    kind = `${entry.kind} `;
                }
                if (entry.permalink !== undefined && entry.permalink.length > 0) {
                    lines.push(`<li>${escapeHtml(entry.name)}: <a href="${entry.permalink}">${kind}${escapeHtml(entry.longName)}</a></li>`);
                }
                else {
                    lines.push(`<li>${escapeHtml(entry.name)}: ${kind}${escapeHtml(entry.longName)}</li>`);
                }
            }
            lines.push('</ul>');
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class Class extends CompoundBase {
    // --------------------------------------------------------------------------
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        // Due to multiple-inheritance, there can be multiple parents.
        this.baseClassIds = new Set();
        this.baseClasses = [];
        this.fullyQualifiedName = '?';
        this.unqualifiedName = '?';
        this.templateParameters = '';
        this.classFullName = '?';
        // console.log('Class.constructor', util.inspect(compoundDef))
        if (Array.isArray(compoundDef.baseCompoundRefs)) {
            for (const ref of compoundDef.baseCompoundRefs) {
                // console.log('component', compoundDef.id, 'has base', ref.refid)
                if (ref.refid !== undefined) {
                    this.baseClassIds.add(ref.refid);
                }
            }
        }
        // Remove the template parameters.
        this.fullyQualifiedName = compoundDef.compoundName.replace(/<.*>/, '');
        // Remove the namespaces(s).
        this.unqualifiedName = this.fullyQualifiedName.replace(/.*::/, '');
        const index = compoundDef.compoundName.indexOf('<');
        let indexNameTemplateParameters = '';
        if (index >= 0) {
            indexNameTemplateParameters = compoundDef.compoundName.substring(index).replace(/^< /, '<').replace(/ >$/, '>');
            this.templateParameters = indexNameTemplateParameters;
        }
        else if (compoundDef.templateParamList !== undefined) {
            indexNameTemplateParameters = this.renderTemplateParameterNamesToString(compoundDef.templateParamList);
        }
        this.sidebarLabel = this.unqualifiedName;
        this.indexName = `${this.unqualifiedName}${indexNameTemplateParameters}`;
        const kind = compoundDef.kind;
        const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase();
        this.pageTitle = `The \`${escapeHtml(this.unqualifiedName)}\` ${kindCapitalised}`;
        if (compoundDef.templateParamList !== undefined) {
            this.pageTitle += ' Template';
        }
        this.pageTitle += ' Reference';
        assert(kindsPlurals[kind] !== undefined);
        const pluralKind = kindsPlurals[kind].toLowerCase();
        // Turn the namespace into a hierarchical path. Keep the dot.
        let sanitizedPath = sanitizeHierarchicalPath(this.fullyQualifiedName.replaceAll(/::/g, '/'));
        if (this.templateParameters?.length > 0) {
            // sanitizedPath += sanitizeName(this.templateParameters)
            sanitizedPath += `-${crypto.hash('md5', this.templateParameters)}`;
        }
        this.relativePermalink = `${pluralKind}/${sanitizedPath}`;
        // Replace slash with dash.
        this.docusaurusId = `${pluralKind}/${flattenPath(sanitizedPath)}`;
        this.createSections(this.unqualifiedName);
        // console.log('0', compoundDef.id)
        // console.log('1', compoundDef.compoundName)
        // console.log('2', this.relativePermalink)
        // console.log('3', this.docusaurusId)
        // console.log('4', this.sidebarLabel)
        // console.log('5', this.indexName)
        // console.log('6', this.templateParameters)
        // console.log()
    }
    initializeLate() {
        super.initializeLate();
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        let classFullName = this.fullyQualifiedName;
        if (this.templateParameters.length > 0) {
            classFullName += escapeHtml(this.templateParameters);
        }
        else {
            classFullName += escapeHtml(this.renderTemplateParameterNamesToString(compoundDef.templateParamList));
        }
        this.classFullName = classFullName;
        if (compoundDef.templateParamList?.params !== undefined) {
            this.template = escapeHtml(this.renderTemplateParametersToString({
                templateParamList: compoundDef.templateParamList,
                withDefaults: true
            }));
        }
        this.baseCompoundRefs = compoundDef.baseCompoundRefs;
        this.derivedCompoundRefs = compoundDef.derivedCompoundRefs;
        this.templateParamList = compoundDef.templateParamList;
    }
    hasAnyContent() {
        if (this.childrenIds.length > 0) {
            return true;
        }
        if (this.children.length > 0) {
            return true;
        }
        if (this.innerCompounds !== undefined) {
            return true;
        }
        if (this.sections.length > 0) {
            return true;
        }
        if (this.includes !== undefined) {
            return true;
        }
        return super.hasAnyContent();
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@${this.kind} ${escapeHtml(this.compoundName)}`;
        const morePermalink = this.renderDetailedDescriptionToLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToString({
            briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push('');
        lines.push('## Declaration');
        const classs = this.collection.collectionCompoundsById.get(this.id);
        assert(classs !== undefined);
        lines.push('');
        lines.push('<div class="doxyDeclaration">');
        if (this.template !== undefined) {
            lines.push(`template ${this.template}`);
        }
        lines.push(`${this.kind} ${this.classFullName} { ... }`);
        lines.push('</div>');
        lines.push(...this.renderIncludesIndexToLines());
        if (this.kind === 'class' || this.kind === 'struct') {
            if (this.baseCompoundRefs !== undefined) {
                const baseCompoundRefs = new Map();
                for (const baseCompoundRef of this.baseCompoundRefs) {
                    if (!baseCompoundRefs.has(baseCompoundRef.text)) {
                        baseCompoundRefs.set(baseCompoundRef.text, baseCompoundRef);
                    }
                }
                lines.push('');
                if (baseCompoundRefs.size > 1) {
                    lines.push(`## Base ${kindsPlurals[this.kind]?.toLowerCase()}`);
                }
                else {
                    lines.push(`## Base ${this.kind}`);
                }
                lines.push('');
                lines.push('<table class="doxyMembersIndex">');
                for (const baseCompoundRef of baseCompoundRefs.values()) {
                    // console.log(util.inspect(baseCompoundRef, { compact: false, depth: 999 }))
                    if (baseCompoundRef.refid !== undefined) {
                        const baseClass = this.collection.collectionCompoundsById.get(baseCompoundRef.refid);
                        if (baseClass !== undefined) {
                            lines.push(...baseClass.renderIndexToLines());
                            continue;
                        }
                    }
                    const itemName = renderString(baseCompoundRef.text, 'html');
                    lines.push('');
                    lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
                        type: this.kind,
                        name: itemName
                    }));
                }
                lines.push('');
                lines.push('</table>');
            }
            else if ('baseClassIds' in classs && classs.baseClassIds.size > 0) {
                lines.push('');
                if (classs.baseClassIds.size > 1) {
                    lines.push(`## Base ${kindsPlurals[this.kind]?.toLowerCase()}`);
                }
                else {
                    lines.push(`## Base ${this.kind}`);
                }
                lines.push('');
                lines.push('<table class="doxyMembersIndex">');
                for (const baseClassId of classs.baseClassIds) {
                    const baseClass = this.collection.collectionCompoundsById.get(baseClassId);
                    if (baseClass !== undefined) {
                        // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))
                        lines.push(...baseClass.renderIndexToLines());
                    }
                }
                lines.push('');
                lines.push('</table>');
            }
            if (this.derivedCompoundRefs !== undefined) {
                lines.push('');
                lines.push(`## Derived ${kindsPlurals[this.kind]}`);
                lines.push('');
                lines.push('<table class="doxyMembersIndex">');
                for (const derivedCompoundRef of this.derivedCompoundRefs) {
                    // console.log(util.inspect(derivedCompoundRef, { compact: false, depth: 999 }))
                    if (derivedCompoundRef.refid !== undefined) {
                        const derivedClass = this.collection.collectionCompoundsById.get(derivedCompoundRef.refid);
                        if (derivedClass !== undefined) {
                            lines.push(...derivedClass.renderIndexToLines());
                        }
                        else {
                            if (this.collection.workspace.pluginOptions.verbose) {
                                console.warn('Derived class id', derivedCompoundRef.refid, 'not a defined class');
                            }
                            const itemName = renderString(derivedCompoundRef.text.trim(), 'html');
                            lines.push('');
                            lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
                                type: this.kind,
                                name: itemName
                            }));
                        }
                    }
                    else {
                        const itemName = renderString(derivedCompoundRef.text.trim(), 'html');
                        lines.push('');
                        lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
                            type: this.kind,
                            name: itemName
                        }));
                    }
                }
                lines.push('');
                lines.push('</table>');
            }
            else if ('derivedClassIds' in classs && classs.childrenIds.length > 0) {
                lines.push('');
                lines.push(`## Derived ${kindsPlurals[this.kind]}`);
                lines.push('');
                lines.push('<table class="doxyMembersIndex">');
                for (const derivedClassId of classs.childrenIds) {
                    const derivedClass = this.collection.collectionCompoundsById.get(derivedClassId);
                    if (derivedClass !== undefined) {
                        // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))
                        lines.push(...derivedClass.renderIndexToLines());
                    }
                    else {
                        console.warn('Derived class id', derivedClassId, 'not a class');
                    }
                }
                lines.push('');
                lines.push('</table>');
            }
        }
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: []
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToLines({
            briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
            detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription
        }));
        if (this.locationLines !== undefined) {
            lines.push(...this.locationLines);
        }
        lines.push(...this.renderSectionsToLines());
        lines.push(...this.renderGeneratedFromToLines());
        return lines;
    }
    renderIndexToLines() {
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
        const lines = [];
        const workspace = this.collection.workspace;
        const permalink = workspace.getPagePermalink(this.id);
        const itemType = this.kind;
        let itemName;
        if (permalink !== undefined && permalink.length > 0) {
            itemName = `<a href="${permalink}">${escapeHtml(this.indexName)}</a>`;
        }
        else {
            itemName = `${escapeHtml(this.indexName)}`;
        }
        lines.push('');
        const childrenLines = [];
        const morePermalink = this.renderDetailedDescriptionToLines !== undefined ? `${permalink}/#details` : undefined;
        const briefDescriptionString = this.briefDescriptionMarkdownString;
        if ((briefDescriptionString ?? '').length > 0) {
            childrenLines.push(this.renderBriefDescriptionToString({
                briefDescriptionMarkdownString: briefDescriptionString,
                morePermalink
            }));
        }
        lines.push(...this.collection.workspace.renderMembersIndexItemToLines({
            type: itemType,
            name: itemName,
            childrenLines
        }));
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=classes-vm.js.map