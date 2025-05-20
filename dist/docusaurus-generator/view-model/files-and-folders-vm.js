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
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { Section } from './members-vm.js';
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
        this.filesByPath = new Map();
    }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        if (compoundDef.kind === 'file') {
            const file = new File(this, compoundDef);
            this.collectionCompoundsById.set(compoundDef.id, file);
            this.compoundFilesById.set(compoundDef.id, file);
            return file;
        }
        else if (compoundDef.kind === 'dir') {
            const folder = new Folder(this, compoundDef);
            this.collectionCompoundsById.set(compoundDef.id, folder);
            this.compoundFoldersById.set(compoundDef.id, folder);
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
                // console.log('childFolderId', childFolderId, 'has parent', folderId)
                childFolder.parent = folder;
                folder.children.push(childFolder);
            }
            for (const childFileId of folder.childrenFileIds) {
                const childFile = this.compoundFilesById.get(childFileId);
                assert(childFile !== undefined);
                // console.log('childFileId', childFileId, 'has parent', folderId)
                childFile.parent = folder;
                folder.children.push(childFile);
            }
        }
        for (const [fileId, file] of this.compoundFilesById) {
            this.workspace.compoundsById.set(fileId, file);
        }
        for (const [folderId, folder] of this.compoundFoldersById) {
            if (folder.parent === undefined) {
                // console.log('topFolderId:', folderId)
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
            this.filesByPath.set(path, file);
            // console.log('filesByPath.set', path, file)
            // console.log('filesByPath.set', path)
        }
        for (const [folderId, folder] of this.compoundFoldersById) {
            let parentPath = '';
            if (folder.parent !== undefined) {
                parentPath = `${this.getRelativePathRecursively(folder.parent)}/`;
            }
            folder.relativePath = `${parentPath}${folder.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(folder.relativePath);
            folder.relativePermalink = `folders/${sanitizedPath}`;
            folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`;
            // console.log('1', file.compoundName)
            // console.log('2', file.relativePermalink)
            // console.log('3', file.docusaurusId)
            // console.log('4', file.sidebarLabel)
            // console.log('5', file.indexName)
            // console.log()
        }
        // Cannot be done in each object, since it needs the hierarchy.
        for (const [fileId, file] of this.compoundFilesById) {
            let parentPath = '';
            if (file.parent !== undefined) {
                parentPath = `${this.getRelativePathRecursively(file.parent)}/`;
            }
            file.relativePath = `${parentPath}${file.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(file.relativePath);
            file.relativePermalink = `files/${sanitizedPath}`;
            file.docusaurusId = `files/${flattenPath(sanitizedPath)}`;
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
    createSidebarItems() {
        // Add folders & files to the sidebar.
        // Top level folders & files are added below a Files category
        const filesCategory = {
            type: 'category',
            label: 'Files',
            link: {
                type: 'doc',
                id: `${this.workspace.permalinkBaseUrl}files/index`
            },
            collapsed: true,
            items: []
        };
        for (const folder of this.topLevelFolders) {
            filesCategory.items.push(this.createFolderSidebarItemRecursively(folder));
        }
        for (const file of this.topLevelFiles) {
            filesCategory.items.push(this.createFileSidebarItem(file));
        }
        return [filesCategory];
    }
    createFolderSidebarItemRecursively(folder) {
        const categoryItem = {
            type: 'category',
            label: folder.sidebarLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.permalinkBaseUrl}${folder.docusaurusId}`
            },
            collapsed: true,
            items: []
        };
        for (const fileOrFolder of folder.children) {
            if (fileOrFolder instanceof Folder) {
                categoryItem.items.push(this.createFolderSidebarItemRecursively(fileOrFolder));
            }
        }
        for (const fileOrFolder of folder.children) {
            if (fileOrFolder instanceof File) {
                categoryItem.items.push(this.createFileSidebarItem(fileOrFolder));
            }
        }
        return categoryItem;
    }
    createFileSidebarItem(file) {
        const docItem = {
            type: 'doc',
            label: file.sidebarLabel,
            id: `${this.workspace.permalinkBaseUrl}${file.docusaurusId}`
        };
        return docItem;
    }
    // --------------------------------------------------------------------------
    createMenuItems() {
        const menuItem = {
            label: 'Files',
            to: `/${this.workspace.pluginOptions.outputFolderPath}/files/`
        };
        return [menuItem];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdxFile() {
        const outputFolderPath = this.workspace.pluginOptions.outputFolderPath;
        const filePath = `${outputFolderPath}/files/index.mdx`;
        const permalink = 'files';
        const frontMatter = {
            title: 'The Files & Folders Reference',
            slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'files', 'folders', 'reference']
        };
        const lines = [];
        lines.push('The files & folders that contributed content to this site are:');
        lines.push('');
        lines.push('<TreeTable>');
        for (const folder of this.topLevelFolders) {
            lines.push(...this.generateIndexMdxFileRecursively(folder, 1));
        }
        for (const file of this.topLevelFiles) {
            lines.push(...this.generateFileIndexMdx(file, 1));
        }
        lines.push('');
        lines.push('</TreeTable>');
        console.log(`Writing files index file ${filePath}...`);
        await this.workspace.writeFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
    generateIndexMdxFileRecursively(folder, depth) {
        // console.log(util.inspect(folder, { compact: false, depth: 999 }))
        const lines = [];
        const label = escapeMdx(folder.compoundName);
        const permalink = this.workspace.getPagePermalink(folder.id);
        assert(permalink !== undefined && permalink.length > 1);
        lines.push('');
        lines.push('<TreeTableRow');
        lines.push('  itemIconClass="doxyIconFolder"');
        lines.push(`  itemLabel="${label}"`);
        lines.push(`  itemLink="${permalink}"`);
        lines.push(`  depth="${depth}">`);
        if (folder.briefDescriptionMdxText !== undefined && folder.briefDescriptionMdxText.length > 0) {
            lines.push(folder.briefDescriptionMdxText.replace(/[.]$/, ''));
        }
        lines.push('</TreeTableRow>');
        if (folder.children.length > 0) {
            for (const childFileOrFolder of folder.children) {
                if (childFileOrFolder instanceof Folder) {
                    lines.push(...this.generateIndexMdxFileRecursively(childFileOrFolder, depth + 1));
                }
            }
            for (const childFileOrFolder of folder.children) {
                if (childFileOrFolder instanceof File) {
                    lines.push(...this.generateFileIndexMdx(childFileOrFolder, depth + 1));
                }
            }
        }
        return lines;
    }
    generateFileIndexMdx(file, depth) {
        // console.log(util.inspect(file, { compact: false, depth: 999 }))
        const lines = [];
        const label = escapeMdx(file.compoundName);
        const permalink = this.workspace.getPagePermalink(file.id);
        assert(permalink !== undefined && permalink.length > 1);
        lines.push('');
        lines.push('<TreeTableRow');
        lines.push('  itemIconClass="doxyIconFile"');
        lines.push(`  itemLabel="${label}"`);
        lines.push(`  itemLink="${permalink}"`);
        lines.push(`  depth="${depth}">`);
        if (file.briefDescriptionMdxText !== undefined && file.briefDescriptionMdxText.length > 0) {
            lines.push(file.briefDescriptionMdxText.replace(/[.]$/, ''));
        }
        lines.push('</TreeTableRow>');
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class Folder extends CompoundBase {
    // --------------------------------------------------------------------------
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        // childrenIds & children - not used
        this.childrenFileIds = [];
        this.childrenFiles = [];
        this.childrenFolderIds = [];
        this.childrenFolders = [];
        this.relativePath = '';
        // console.log('Folder.constructor', util.inspect(compoundDef))
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
        this.sidebarLabel = compoundDef.compoundName ?? '?';
        this.indexName = this.sidebarLabel;
        this.pageTitle = `The \`${this.sidebarLabel}\` Folder Reference`;
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.hasMembers()) {
                    this.sections.push(new Section(this, sectionDef));
                }
            }
        }
    }
    // --------------------------------------------------------------------------
    renderToMdxLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@dir ${this.relativePath}`;
        const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToMdxText({
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push(...this.renderInnerIndicesToMdxLines({
            suffixes: ['Dirs', 'Files']
        }));
        lines.push(...this.renderSectionIndicesToMdxLines());
        lines.push(...this.renderDetailedDescriptionToMdxLines({
            todo: descriptionTodo,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToMdxLines());
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class File extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.relativePath = '';
        // The compoundName is the actual file name.
        this.sidebarLabel = compoundDef.compoundName ?? '?';
        this.indexName = this.sidebarLabel;
        this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`;
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.hasMembers()) {
                    this.sections.push(new Section(this, sectionDef));
                }
            }
        }
    }
    initializeLate() {
        super.initializeLate();
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        this.programListing = compoundDef.programListing;
    }
    // --------------------------------------------------------------------------
    renderToMdxLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@file ${this.relativePath}`;
        const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToMdxText({
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push(...this.renderIncludesIndexToMdxLines());
        lines.push(...this.renderInnerIndicesToMdxLines({
            suffixes: ['Namespaces', 'Classes']
        }));
        lines.push(...this.renderSectionIndicesToMdxLines());
        lines.push(...this.renderDetailedDescriptionToMdxLines({
            todo: descriptionTodo,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToMdxLines());
        if (this.programListing !== undefined) {
            lines.push('');
            lines.push('## File Listing');
            lines.push('');
            lines.push('The file content with the documentation metadata removed is:');
            lines.push(...this.collection.workspace.renderElementToMdxLines(this.programListing));
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
