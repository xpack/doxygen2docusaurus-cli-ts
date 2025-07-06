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
import { CompoundBase } from './compound-base-vm.js';
import { CollectionBase } from './collection-base.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { FileTreeEntry } from './tree-entries-vm.js';
import { Class } from './classes-vm.js';
import { Namespace } from './namespaces-vm.js';
// ----------------------------------------------------------------------------
export class FilesAndFolders extends CollectionBase {
    // folders: Folders
    // --------------------------------------------------------------------------
    constructor(workspace) {
        super(workspace);
        this.topLevelFolders = [];
        this.topLevelFiles = [];
        // this.compoundsById = new Map()
        this.compoundFoldersById = new Map();
        this.compoundFilesById = new Map();
    }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        if (compoundDef.kind === 'file') {
            const file = new File(this, compoundDef);
            this.collectionCompoundsById.set(file.id, file);
            this.compoundFilesById.set(file.id, file);
            return file;
        }
        else if (compoundDef.kind === 'dir') {
            const folder = new Folder(this, compoundDef);
            this.collectionCompoundsById.set(folder.id, folder);
            this.compoundFoldersById.set(folder.id, folder);
            return folder;
        }
        else {
            throw new Error(`kind ${compoundDef.kind} not implemented in ${this.constructor.name}`);
        }
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // Recreate files and folders hierarchies.
        // console.log(this.compoundsById.size)
        for (const [folderId, folder] of this.compoundFoldersById) {
            for (const childFolderId of folder.childrenFolderIds) {
                const childFolder = this.compoundFoldersById.get(childFolderId);
                assert(childFolder !== undefined);
                if (this.workspace.pluginOptions.debug) {
                    console.log('childFolderId', childFolderId, childFolder.compoundName, 'has parent', folderId, folder.compoundName);
                }
                childFolder.parent = folder;
                folder.children.push(childFolder);
            }
            for (const childFileId of folder.childrenFileIds) {
                const childFile = this.compoundFilesById.get(childFileId);
                if (childFile !== undefined) {
                    if (this.workspace.pluginOptions.debug) {
                        console.log('childFileId', childFileId, childFile.compoundName, 'has parent', folderId, folder.compoundName);
                    }
                    childFile.parent = folder;
                    folder.children.push(childFile);
                }
                else {
                    console.warn(childFileId, 'not a child of', folder.id);
                }
            }
        }
        for (const [fileId, file] of this.compoundFilesById) {
            this.workspace.compoundsById.set(fileId, file);
        }
        for (const [folderId, folder] of this.compoundFoldersById) {
            if (folder.parent === undefined) {
                if (this.workspace.pluginOptions.debug) {
                    console.log('topFolderId:', folderId);
                }
                this.topLevelFolders.push(folder);
            }
        }
        for (const [fileId, file] of this.compoundFilesById) {
            if (file.parent === undefined) {
                // console.log('topFileId:', fileId)
                this.topLevelFiles.push(file);
            }
            const path = file.locationFilePath;
            assert(path !== undefined);
            this.workspace.filesByPath.set(path, file);
            if (this.workspace.pluginOptions.debug) {
                // console.log('filesByPath.set', path, file)
                console.log('filesByPath.set', path);
            }
        }
        for (const [folderId, folder] of this.compoundFoldersById) {
            let parentPath = '';
            if (folder.parent !== undefined) {
                parentPath = `${this.getRelativePathRecursively(folder.parent)}/`;
            }
            // console.log(folder.compoundName)
            folder.relativePath = `${parentPath}${folder.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(folder.relativePath);
            folder.relativePermalink = `folders/${sanitizedPath}`;
            folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`;
            // console.log('0', folder.id)
            // console.log('1', folder.compoundName)
            // console.log('2', folder.relativePermalink)
            // console.log('3', folder.docusaurusId)
            // console.log('4', folder.sidebarLabel)
            // console.log('5', folder.indexName)
            // console.log()
        }
        // Cannot be done in each object, since it needs the hierarchy.
        for (const [fileId, file] of this.compoundFilesById) {
            let parentPath = '';
            if (file.parent !== undefined) {
                parentPath = `${this.getRelativePathRecursively(file.parent)}/`;
            }
            // console.log(file.compoundName)
            file.relativePath = `${parentPath}${file.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(file.relativePath);
            file.relativePermalink = `files/${sanitizedPath}`;
            file.docusaurusId = `files/${flattenPath(sanitizedPath)}`;
            // console.log('0', file.id)
            // console.log('1', file.compoundName)
            // console.log('2', file.relativePermalink)
            // console.log('3', file.docusaurusId)
            // console.log('4', file.sidebarLabel)
            // console.log('5', file.indexName)
            // console.log()
        }
    }
    getRelativePathRecursively(folder) {
        let parentPath = '';
        if (folder.parent !== undefined) {
            parentPath = `${this.getRelativePathRecursively(folder.parent)}/`;
        }
        return `${parentPath}${folder.compoundName}`;
    }
    // --------------------------------------------------------------------------
    addSidebarItems(sidebarCategory) {
        const indicesSet = this.workspace.indicesMaps.get('files');
        if (indicesSet === undefined) {
            return;
        }
        // Add folders & files to the sidebar.
        // Top level folders & files are added below a Files category
        const filesCategory = {
            type: 'category',
            label: 'Files',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}indices/files/index`
            },
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Hierarchy',
                    collapsed: true,
                    items: []
                }
            ]
        };
        for (const folder of this.topLevelFolders) {
            const item = this.createFolderSidebarItemRecursively(folder);
            if (item !== undefined) {
                filesCategory.items[0].items.push(item);
            }
        }
        for (const file of this.topLevelFiles) {
            const item = this.createFileSidebarItem(file);
            if (item !== undefined) {
                filesCategory.items[0].items.push(item);
            }
        }
        if (indicesSet.has('all')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'All',
                id: `${this.workspace.sidebarBaseId}indices/files/all`
            });
        }
        if (indicesSet.has('classes')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Classes',
                id: `${this.workspace.sidebarBaseId}indices/files/classes`
            });
        }
        if (indicesSet.has('namespaces')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Namespaces',
                id: `${this.workspace.sidebarBaseId}indices/files/namespaces`
            });
        }
        if (indicesSet.has('functions')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Functions',
                id: `${this.workspace.sidebarBaseId}indices/files/functions`
            });
        }
        if (indicesSet.has('variables')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Variables',
                id: `${this.workspace.sidebarBaseId}indices/files/variables`
            });
        }
        if (indicesSet.has('typedefs')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Typedefs',
                id: `${this.workspace.sidebarBaseId}indices/files/typedefs`
            });
        }
        if (indicesSet.has('enums')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Enums',
                id: `${this.workspace.sidebarBaseId}indices/files/enums`
            });
        }
        if (indicesSet.has('enumvalues')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Enum Values',
                id: `${this.workspace.sidebarBaseId}indices/files/enumvalues`
            });
        }
        if (indicesSet.has('defines')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Macro Definitions',
                id: `${this.workspace.sidebarBaseId}indices/files/defines`
            });
        }
        sidebarCategory.items.push(filesCategory);
    }
    createFolderSidebarItemRecursively(folder) {
        if (folder.sidebarLabel === undefined) {
            return undefined;
        }
        const categoryItem = {
            type: 'category',
            label: folder.sidebarLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}${folder.docusaurusId}`
            },
            collapsed: true,
            items: []
        };
        for (const fileOrFolder of folder.children) {
            if (fileOrFolder instanceof Folder) {
                const item = this.createFolderSidebarItemRecursively(fileOrFolder);
                if (item !== undefined) {
                    categoryItem.items.push(item);
                }
            }
        }
        for (const fileOrFolder of folder.children) {
            if (fileOrFolder instanceof File) {
                const item = this.createFileSidebarItem(fileOrFolder);
                if (item !== undefined) {
                    categoryItem.items.push(item);
                }
            }
        }
        return categoryItem;
    }
    createFileSidebarItem(file) {
        if (file.sidebarLabel === undefined) {
            return undefined;
        }
        const docItem = {
            type: 'doc',
            label: file.sidebarLabel,
            id: `${this.workspace.sidebarBaseId}${file.docusaurusId}`
        };
        return docItem;
    }
    // --------------------------------------------------------------------------
    createMenuItems() {
        const menuItem = {
            label: 'Files',
            to: `${this.workspace.menuBaseUrl}files/`
        };
        return [menuItem];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdFile() {
        if (this.topLevelFolders.length === 0 && this.topLevelFiles.length === 0) {
            return;
        }
        const filePath = `${this.workspace.outputFolderPath}indices/files/index.md`;
        const permalink = 'files';
        const frontMatter = {
            title: 'The Files & Folders Reference',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'files', 'folders', 'reference']
        };
        const lines = [];
        lines.push('The files & folders that contributed content to this site are:');
        lines.push('');
        lines.push('<table class="doxyTreeTable">');
        const contentLines = [];
        for (const folder of this.topLevelFolders) {
            contentLines.push(...this.generateIndexMdFileRecursively(folder, 0));
        }
        for (const file of this.topLevelFiles) {
            contentLines.push(...this.generateFileIndexMd(file, 0));
        }
        if (contentLines.length === 0) {
            return;
        }
        lines.push(...contentLines);
        lines.push('');
        lines.push('</table>');
        if (this.workspace.pluginOptions.verbose) {
            console.log(`Writing files index file ${filePath}...`);
        }
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
    generateIndexMdFileRecursively(folder, depth) {
        // console.log(util.inspect(folder, { compact: false, depth: 999 }))
        const lines = [];
        const label = this.workspace.renderString(folder.compoundName, 'html');
        const permalink = this.workspace.getPagePermalink(folder.id);
        if (permalink === undefined || permalink.length === 0) {
            // console.log(namespace)
            return [];
        }
        let description = '';
        if (folder.briefDescriptionHtmlString !== undefined && folder.briefDescriptionHtmlString.length > 0) {
            description = folder.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconClass: 'doxyIconFolder',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description
        }));
        if (folder.children.length > 0) {
            for (const childFileOrFolder of folder.children) {
                if (childFileOrFolder instanceof Folder) {
                    lines.push(...this.generateIndexMdFileRecursively(childFileOrFolder, depth + 1));
                }
            }
            for (const childFileOrFolder of folder.children) {
                if (childFileOrFolder instanceof File) {
                    lines.push(...this.generateFileIndexMd(childFileOrFolder, depth + 1));
                }
            }
        }
        return lines;
    }
    generateFileIndexMd(file, depth) {
        // console.log(util.inspect(file, { compact: false, depth: 999 }))
        const lines = [];
        const label = this.workspace.renderString(file.compoundName, 'html');
        const permalink = this.workspace.getPagePermalink(file.id, true);
        if (permalink === undefined || permalink.length === 0) {
            return [];
        }
        let description = '';
        if (file.briefDescriptionHtmlString !== undefined && file.briefDescriptionHtmlString.length > 0) {
            description = file.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconClass: 'doxyIconFile',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description
        }));
        return lines;
    }
    hasCompounds() {
        for (const [compoundId, compound] of this.collectionCompoundsById) {
            if (compound.children.length > 0) {
                return true;
            }
        }
        return false;
    }
    async generatePerInitialsIndexMdFiles() {
        if (this.topLevelFiles.length === 0) {
            return;
        }
        const allUnorderedEntriesMap = new Map();
        for (const [compoundId, compound] of this.collectionCompoundsById) {
            if (compound.innerCompounds !== undefined) {
                // console.log(compound.indexName, Array.from(compound.innerCompounds.keys()))
                const classCompoundDef = compound.innerCompounds.get('innerClasses');
                if (classCompoundDef?.innerClasses !== undefined) {
                    for (const innerClass of classCompoundDef.innerClasses) {
                        // console.log(innerClass.refid)
                        const compoundClass = this.workspace.compoundsById.get(innerClass.refid);
                        if (compoundClass instanceof Class) {
                            const classEntry = new FileTreeEntry(compoundClass, compound);
                            allUnorderedEntriesMap.set(classEntry.id, classEntry);
                        }
                    }
                }
                const namespaceCompoundDef = compound.innerCompounds.get('innerNamespaces');
                if (namespaceCompoundDef?.innerNamespaces !== undefined) {
                    for (const innerNamespace of namespaceCompoundDef.innerNamespaces) {
                        // console.log(innerNamespace.refid)
                        const compoundNamespace = this.workspace.compoundsById.get(innerNamespace.refid);
                        if (compoundNamespace instanceof Namespace) {
                            const namespaceEntry = new FileTreeEntry(compoundNamespace, compound);
                            allUnorderedEntriesMap.set(namespaceEntry.id, namespaceEntry);
                        }
                    }
                }
            }
            for (const section of compound.sections) {
                for (const member of section.definitionMembers) {
                    const memberEntry = new FileTreeEntry(member, compound);
                    allUnorderedEntriesMap.set(memberEntry.id, memberEntry);
                    if (member.enumValues !== undefined) {
                        for (const enumValue of member.enumValues) {
                            const enumValueEntry = new FileTreeEntry(enumValue, compound);
                            allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry);
                        }
                    }
                }
            }
        }
        // ------------------------------------------------------------------------
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'all',
            title: 'The Files Definitions Index',
            description: 'The definitions part of the files are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (true);
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'classes',
            title: 'The Files Classes Index',
            description: 'The classes, structs, unions defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'class' || kind === 'struct' || kind === 'union');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'namespaces',
            title: 'The Files Namespaces Index',
            description: 'The namespaces defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'namespace');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'functions',
            title: 'The Files Functions Index',
            description: 'The functions defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'function');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'variables',
            title: 'The Files Variables Index',
            description: 'The variables defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'variable');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'typedefs',
            title: 'The Files Type Definitions Index',
            description: 'The typedefs defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'typedef');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'enums',
            title: 'The Files Enums Index',
            description: 'The enums defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'enum');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'enumvalues',
            title: 'The Files Enum Values Index',
            description: 'The enum values defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'enumvalue');
            }
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'defines',
            title: 'The Files Macro Definitions Index',
            description: 'The macros defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => {
                return (kind === 'define');
            }
        });
    }
}
// ----------------------------------------------------------------------------
export class Folder extends CompoundBase {
    // --------------------------------------------------------------------------
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.childrenFileIds = [];
        this.childrenFolderIds = [];
        this.relativePath = '';
        // console.log('folder:', util.inspect(compoundDef))
        // console.log('folder:', compoundDef.compoundName)
        if (Array.isArray(compoundDef.innerDirs)) {
            for (const ref of compoundDef.innerDirs) {
                // console.log('component', compoundDef.id, 'has child folder', ref.refid)
                this.childrenIds.push(ref.refid);
                this.childrenFolderIds.push(ref.refid);
            }
        }
        if (Array.isArray(compoundDef.innerFiles)) {
            for (const ref of compoundDef.innerFiles) {
                // console.log('component', compoundDef.id, 'has child file', ref.refid)
                this.childrenIds.push(ref.refid);
                this.childrenFileIds.push(ref.refid);
            }
        }
        this.sidebarLabel = compoundDef.compoundName ?? '???';
        this.indexName = this.sidebarLabel;
        this.treeEntryName = this.sidebarLabel;
        this.pageTitle = `The \`${this.sidebarLabel}\` Folder Reference`;
        this.createSections();
    }
    hasChildren() {
        for (const child of this.children) {
            if (child instanceof File) {
                return true;
            }
            else if (child instanceof Folder && child.hasChildren()) {
                return true;
            }
        }
        return false;
    }
    hasAnyContent() {
        // console.log('checking', this.compoundName)
        if (this.hasChildren()) {
            // console.log('has content children', this)
            return true;
        }
        // if (!super.hasAnyContent()) {
        //   console.log('has no content', this)
        // }
        return super.hasAnyContent();
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@dir ${this.collection.workspace.renderString(this.relativePath, 'html')}`;
        const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Dirs', 'Files']
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToLines());
        return lines;
    }
    initializeLate() {
        super.initializeLate();
        // console.log(this)
        if (!this.hasAnyContent()) {
            if (this.collection.workspace.pluginOptions.debug) {
                console.log(this.kind, this.compoundName, 'has no content, not shown');
            }
            this.docusaurusId = undefined;
            this.sidebarLabel = undefined;
            this.relativePermalink = undefined;
        }
    }
}
// ----------------------------------------------------------------------------
export class File extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.relativePath = '';
        this.listingLineNumbers = new Set();
        // console.log('file:', compoundDef.compoundName)
        // The compoundName is the actual file name, without path.
        assert(compoundDef.compoundName !== undefined);
        this.sidebarLabel = compoundDef.compoundName;
        this.indexName = this.sidebarLabel;
        this.treeEntryName = this.sidebarLabel;
        this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`;
        this.createSections();
    }
    initializeLate() {
        super.initializeLate();
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        this.programListing = compoundDef.programListing;
        if (this.collection.workspace.pluginOptions.renderProgramListing) {
            // Keep track of line number, since not all lines referred exist and
            // this might result in broken links.
            if (this.programListing?.codelines !== undefined) {
                for (const codeline of this.programListing?.codelines) {
                    if (codeline.lineno !== undefined) {
                        this.listingLineNumbers.add(codeline.lineno);
                    }
                }
            }
        }
        // console.log(this)
        if (!this.hasAnyContent()) {
            if (this.collection.workspace.pluginOptions.debug) {
                console.log(this.kind, this.compoundName, 'has no content, not shown');
            }
            this.docusaurusId = undefined;
            this.sidebarLabel = undefined;
            this.relativePermalink = undefined;
        }
    }
    hasAnyContent() {
        // console.log('checking', this.compoundName)
        if (this.childrenIds.length > 0) {
            // console.log('has content childrenIds', this)
            return true;
        }
        if (this.children.length > 0) {
            // console.log('has content children.length', this)
            return true;
        }
        if (this.innerCompounds !== undefined) {
            // console.log('has content innerCompounds', this)
            return true;
        }
        if (this.includes !== undefined) {
            // console.log('has content includes', this)
            return true;
        }
        // if (!super.hasAnyContent()) {
        //   console.log('has no content', this)
        // }
        return super.hasAnyContent();
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@file ${this.collection.workspace.renderString(this.relativePath, 'html')}`;
        const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push(...this.renderIncludesIndexToLines());
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Namespaces', 'Classes']
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToLines());
        if (this.programListing !== undefined && this.collection.workspace.pluginOptions.renderProgramListing) {
            lines.push('');
            lines.push('## File Listing');
            lines.push('');
            lines.push('The file content with the documentation metadata removed is:');
            lines.push(...this.collection.workspace.renderElementToLines(this.programListing, 'html'));
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=files-and-folders-vm.js.map