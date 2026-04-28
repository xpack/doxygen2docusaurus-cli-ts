import assert from 'node:assert';
import { CompoundBase } from './compound-base-vm.js';
import { CollectionBase } from './collection-base.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { FileTreeEntry } from './tree-entries-vm.js';
import { Class } from './classes-vm.js';
import { Namespace } from './namespaces-vm.js';
import { Concept } from './concepts-vm.js';
export class FilesAndFolders extends CollectionBase {
    compoundFoldersById;
    compoundFilesById;
    topLevelFolders = [];
    topLevelFiles = [];
    constructor(workspace) {
        super(workspace);
        this.compoundFoldersById = new Map();
        this.compoundFilesById = new Map();
    }
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
    createCompoundsHierarchies() {
        for (const [, folder] of this.compoundFoldersById) {
            for (const childFolderId of folder.childrenFolderIds) {
                const childFolder = this.compoundFoldersById.get(childFolderId);
                assert(childFolder !== undefined);
                if (this.workspace.options.debug) {
                    console.log('childFolderId', childFolderId, childFolder.compoundName, 'has parent', folder.parent?.id ?? '(no parent id)', folder.compoundName);
                }
                childFolder.parent = folder;
                folder.children.push(childFolder);
            }
            for (const childFileId of folder.childrenFileIds) {
                const childFile = this.compoundFilesById.get(childFileId);
                if (childFile !== undefined) {
                    if (this.workspace.options.debug) {
                        console.log('childFileId', childFileId, childFile.compoundName, 'has parent', folder.parent?.id ?? '(no parent id)', folder.compoundName);
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
            this.workspace.viewModel.compoundsById.set(fileId, file);
        }
        for (const [folderId, folder] of this.compoundFoldersById) {
            if (folder.parent === undefined) {
                if (this.workspace.options.debug) {
                    console.log('topFolderId:', folderId, folder.compoundName);
                }
                this.topLevelFolders.push(folder);
            }
        }
        for (const [fileId, file] of this.compoundFilesById) {
            if (file.parent === undefined) {
                if (this.workspace.options.debug) {
                    console.log('topFileId:', fileId, file.compoundName);
                }
                this.topLevelFiles.push(file);
            }
            const { locationFilePath } = file;
            assert(locationFilePath !== undefined);
            this.workspace.filesByPath.set(locationFilePath, file);
            if (this.workspace.options.debug) {
                console.log('filesByPath.set', locationFilePath);
            }
        }
        for (const [, folder] of this.compoundFoldersById) {
            let parentPath = '';
            if (folder.parent !== undefined) {
                if (folder.parent instanceof Folder) {
                    parentPath = `${this.getRelativePathRecursively(folder.parent)}/`;
                }
            }
            folder.relativePath = `${parentPath}${folder.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(folder.relativePath);
            folder.relativePermalink = `folders/${sanitizedPath}`;
            folder.sidebarId = `folders/${flattenPath(sanitizedPath)}`;
        }
        for (const [, file] of this.compoundFilesById) {
            let parentPath = '';
            if (file.parent !== undefined) {
                if (file.parent instanceof Folder) {
                    parentPath = `${this.getRelativePathRecursively(file.parent)}/`;
                }
            }
            file.relativePath = `${parentPath}${file.compoundName}`;
            const sanitizedPath = sanitizeHierarchicalPath(file.relativePath);
            file.relativePermalink = `files/${sanitizedPath}`;
            file.sidebarId = `files/${flattenPath(sanitizedPath)}`;
        }
    }
    getRelativePathRecursively(folder) {
        let parentPath = '';
        if (folder.parent !== undefined) {
            if (folder.parent instanceof Folder) {
                parentPath = `${this.getRelativePathRecursively(folder.parent)}/`;
            }
        }
        return `${parentPath}${folder.compoundName}`;
    }
    addSidebarItems(sidebarCategory) {
        const indicesSet = this.workspace.indicesMaps.get('files');
        if (indicesSet === undefined) {
            return;
        }
        const filesCategory = {
            type: 'category',
            label: 'Files',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}indices/files/index`,
            },
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Hierarchy',
                    link: {
                        type: 'doc',
                        id: `${this.workspace.sidebarBaseId}indices/files/index`,
                    },
                    collapsed: true,
                    items: [],
                },
            ],
        };
        for (const folder of this.topLevelFolders) {
            const item = this.createFolderSidebarItemRecursively(folder);
            if (item !== undefined) {
                ;
                filesCategory.items[0].items.push(item);
            }
        }
        for (const file of this.topLevelFiles) {
            const item = this.createFileSidebarItem(file);
            if (item !== undefined) {
                ;
                filesCategory.items[0].items.push(item);
            }
        }
        if (indicesSet.has('all')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'All',
                id: `${this.workspace.sidebarBaseId}indices/files/all`,
            });
        }
        if (indicesSet.has('concepts')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Concepts',
                id: `${this.workspace.sidebarBaseId}indices/files/concepts`,
            });
        }
        if (indicesSet.has('classes')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Classes',
                id: `${this.workspace.sidebarBaseId}indices/files/classes`,
            });
        }
        if (indicesSet.has('namespaces')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Namespaces',
                id: `${this.workspace.sidebarBaseId}indices/files/namespaces`,
            });
        }
        if (indicesSet.has('functions')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Functions',
                id: `${this.workspace.sidebarBaseId}indices/files/functions`,
            });
        }
        if (indicesSet.has('variables')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Variables',
                id: `${this.workspace.sidebarBaseId}indices/files/variables`,
            });
        }
        if (indicesSet.has('typedefs')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Typedefs',
                id: `${this.workspace.sidebarBaseId}indices/files/typedefs`,
            });
        }
        if (indicesSet.has('enums')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Enums',
                id: `${this.workspace.sidebarBaseId}indices/files/enums`,
            });
        }
        if (indicesSet.has('enumvalues')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Enum Values',
                id: `${this.workspace.sidebarBaseId}indices/files/enumvalues`,
            });
        }
        if (indicesSet.has('defines')) {
            filesCategory.items.push({
                type: 'doc',
                label: 'Macro Definitions',
                id: `${this.workspace.sidebarBaseId}indices/files/defines`,
            });
        }
        sidebarCategory.items.push(filesCategory);
    }
    createFolderSidebarItemRecursively(folder) {
        if (folder.sidebarLabel === undefined || folder.sidebarId == undefined) {
            return undefined;
        }
        const categoryItem = {
            type: 'category',
            label: folder.sidebarLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}${folder.sidebarId}`,
            },
            className: 'doxyEllipsis',
            collapsed: true,
            items: [],
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
        if (file.sidebarLabel === undefined || file.sidebarId === undefined) {
            return undefined;
        }
        const docItem = {
            type: 'doc',
            label: file.sidebarLabel,
            className: 'doxyEllipsis',
            id: `${this.workspace.sidebarBaseId}${file.sidebarId}`,
        };
        return docItem;
    }
    createNavbarItems() {
        const navbarItem = {
            label: 'Files',
            to: `${this.workspace.menuBaseUrl}files/`,
        };
        return [navbarItem];
    }
    async generateIndexDotMdFile() {
        if (this.topLevelFolders.length === 0 && this.topLevelFiles.length === 0) {
            return;
        }
        const filePath = `${this.workspace.outputFolderPath}indices/files/index.md`;
        const permalink = 'files';
        const frontMatter = {
            title: 'Files & Folders',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            description: 'The files and folders that contributed content to this site',
            custom_edit_url: null,
            keywords: ['doxygen', 'files', 'folders', 'reference'],
        };
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
        const lines = [];
        lines.push('The files & folders that contributed content to this site are:');
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        if (this.workspace.options.verbose) {
            console.log(`Writing files index file '${filePath}'...`);
        }
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
    generateIndexMdFileRecursively(folder, depth) {
        const lines = [];
        const label = this.workspace.renderString(folder.compoundName, 'html');
        const permalink = this.workspace.getPagePermalink(folder.id);
        if (permalink === undefined || permalink.length === 0) {
            return [];
        }
        let description = '';
        if (folder.briefDescriptionHtmlString !== undefined &&
            folder.briefDescriptionHtmlString.length > 0) {
            description = folder.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconClass: 'doxyIconFolder',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description,
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
        const lines = [];
        const label = this.workspace.renderString(file.compoundName, 'html');
        const permalink = this.workspace.getPagePermalink(file.id, true);
        if (permalink === undefined || permalink.length === 0) {
            return [];
        }
        let description = '';
        if (file.briefDescriptionHtmlString !== undefined &&
            file.briefDescriptionHtmlString.length > 0) {
            description = file.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconClass: 'doxyIconFile',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description,
        }));
        return lines;
    }
    isVisibleInSidebar() {
        for (const [, compound] of this.collectionCompoundsById) {
            if (compound instanceof File && compound.hasAnyContent()) {
                return true;
            }
            else if (compound instanceof Folder && compound.children.length > 0) {
                return true;
            }
        }
        console.log('none');
        return false;
    }
    async generatePerInitialsIndexMdFiles() {
        if (this.topLevelFiles.length === 0) {
            return;
        }
        const allUnorderedEntriesMap = new Map();
        for (const [, compound] of this.collectionCompoundsById) {
            if (!(compound instanceof File)) {
                continue;
            }
            if (compound.innerCompounds !== undefined) {
                if (this.workspace.options.debug) {
                    console.log(compound.indexName, Array.from(compound.innerCompounds.keys()));
                }
                const conceptCompoundDef = compound.innerCompounds.get('innerConcepts');
                if (conceptCompoundDef?.innerConcepts !== undefined) {
                    for (const innerConcept of conceptCompoundDef.innerConcepts) {
                        const compoundConcept = this.workspace.viewModel.compoundsById.get(innerConcept.refid);
                        if (compoundConcept instanceof Concept) {
                            const conceptEntry = new FileTreeEntry(compoundConcept, compound);
                            allUnorderedEntriesMap.set(conceptEntry.id, conceptEntry);
                        }
                    }
                }
                const classCompoundDef = compound.innerCompounds.get('innerClasses');
                if (classCompoundDef?.innerClasses !== undefined) {
                    for (const innerClass of classCompoundDef.innerClasses) {
                        const compoundClass = this.workspace.viewModel.compoundsById.get(innerClass.refid);
                        if (compoundClass instanceof Class) {
                            const classEntry = new FileTreeEntry(compoundClass, compound);
                            allUnorderedEntriesMap.set(classEntry.id, classEntry);
                        }
                    }
                }
                const namespaceCompoundDef = compound.innerCompounds.get('innerNamespaces');
                if (namespaceCompoundDef?.innerNamespaces !== undefined) {
                    for (const innerNamespace of namespaceCompoundDef.innerNamespaces) {
                        const compoundNamespace = this.workspace.viewModel.compoundsById.get(innerNamespace.refid);
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
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'all',
            title: 'Files Definitions Index',
            description: 'The definitions part of the files are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => true,
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'concepts',
            title: 'Files Concepts Index',
            description: 'The concepts defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'concept',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'classes',
            title: 'Files Classes Index',
            description: 'The classes, structs, unions defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'class' || kind === 'struct' || kind === 'union',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'namespaces',
            title: 'Files Namespaces Index',
            description: 'The namespaces defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'namespace',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'functions',
            title: 'Files Functions Index',
            description: 'The functions defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'function',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'variables',
            title: 'Files Variables Index',
            description: 'The variables defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'variable',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'typedefs',
            title: 'Files Type Definitions Index',
            description: 'The typedefs defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'typedef',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'enums',
            title: 'Files Enums Index',
            description: 'The enums defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'enum',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'enumvalues',
            title: 'Files Enum Values Index',
            description: 'The enum values defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'enumvalue',
        });
        await this.generateIndexFile({
            group: 'files',
            fileKind: 'defines',
            title: 'Files Macro Definitions Index',
            description: 'The macros defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'define',
        });
    }
}
export class Folder extends CompoundBase {
    childrenFileIds = [];
    childrenFolderIds = [];
    relativePath = '';
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        if (Array.isArray(compoundDef.innerDirs)) {
            for (const ref of compoundDef.innerDirs) {
                this.childrenIds.push(ref.refid);
                this.childrenFolderIds.push(ref.refid);
            }
        }
        if (Array.isArray(compoundDef.innerFiles)) {
            for (const ref of compoundDef.innerFiles) {
                this.childrenIds.push(ref.refid);
                this.childrenFileIds.push(ref.refid);
            }
        }
        const { compoundName } = compoundDef;
        this.sidebarLabel = compoundName;
        this.indexName = compoundName;
        this.treeEntryName = compoundName;
        this.pageTitle = `\`${this.sidebarLabel}\` Folder`;
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
        if (this.hasChildren()) {
            return true;
        }
        return super.hasAnyContent();
    }
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@dir ${this.collection.workspace.renderString(this.relativePath, 'html')}`;
        const morePermalink = '#details';
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink,
        }));
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Dirs', 'Files'],
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription,
        }));
        lines.push(...this.renderSectionsToLines());
        return lines;
    }
    initializeLate() {
        super.initializeLate();
        const { workspace } = this.collection;
        if (!this.hasAnyContent()) {
            if (!workspace.options.suggestToDoDescriptions) {
                console.log(this.kind, this.compoundName, 'has no content, not shown');
                this.sidebarId = undefined;
                this.sidebarLabel = undefined;
                this.relativePermalink = undefined;
                return;
            }
            else {
                if (workspace.options.verbose) {
                    console.log(this.kind, this.compoundName, 'has no content, see the TODO description');
                }
            }
        }
    }
}
export class File extends CompoundBase {
    relativePath = '';
    listingLineNumbers = new Set();
    programListing;
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        const { compoundName } = compoundDef;
        assert(compoundName.length > 0);
        this.sidebarLabel = compoundName;
        this.indexName = compoundName;
        this.treeEntryName = compoundName;
        this.pageTitle = `\`${this.sidebarLabel}\` File`;
        this.createSections();
    }
    initializeLate() {
        super.initializeLate();
        const compoundDef = this._private._compoundDef;
        assert(compoundDef !== undefined);
        const { programListing } = compoundDef;
        this.programListing = programListing;
        if (this.collection.workspace.options.renderProgramListing) {
            if (this.programListing?.codelines !== undefined) {
                for (const codeline of this.programListing.codelines) {
                    if (codeline.lineno !== undefined) {
                        this.listingLineNumbers.add(codeline.lineno.valueOf());
                    }
                }
            }
        }
        const { workspace } = this.collection;
        if (!this.hasAnyContent()) {
            if (!workspace.options.suggestToDoDescriptions) {
                console.log(this.kind, this.compoundName, 'has no content, not shown');
                this.sidebarId = undefined;
                this.sidebarLabel = undefined;
                this.relativePermalink = undefined;
                return;
            }
            else {
                if (workspace.options.verbose) {
                    console.log(this.kind, this.compoundName, 'has no content, see the TODO description');
                }
            }
        }
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
        if (this.includes !== undefined) {
            return true;
        }
        return super.hasAnyContent();
    }
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@file ${this.collection.workspace.renderString(this.relativePath, 'html')}`;
        const morePermalink = '#details';
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink,
        }));
        lines.push(...this.renderIncludesIndexToLines());
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Namespaces', 'Classes', 'Concepts'],
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription,
        }));
        lines.push(...this.renderSectionsToLines());
        if (this.programListing !== undefined &&
            this.collection.workspace.options.renderProgramListing) {
            lines.push('');
            lines.push('## File Listing');
            lines.push('');
            lines.push('The file content with the documentation metadata removed is:');
            lines.push(...this.collection.workspace.renderElementToLines(this.programListing, 'html'));
        }
        return lines;
    }
}
//# sourceMappingURL=files-and-folders-vm.js.map