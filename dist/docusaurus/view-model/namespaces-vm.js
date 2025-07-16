import assert from 'node:assert';
import path from 'node:path';
import { CompoundBase } from './compound-base-vm.js';
import { CollectionBase } from './collection-base.js';
import { flattenPath, sanitizeAnonymousNamespace, sanitizeHierarchicalPath, } from '../utils.js';
import { NamespaceTreeEntry } from './tree-entries-vm.js';
import { Class } from './classes-vm.js';
export class Namespaces extends CollectionBase {
    topLevelNamespaces = [];
    addChild(compoundDef) {
        const namespace = new Namespace(this, compoundDef);
        if (namespace.compoundName.length === 0) {
            if (namespace.children.length > 0) {
                console.error('Anonymous namespace', namespace.id, ' with children?');
            }
        }
        else {
            this.collectionCompoundsById.set(namespace.id, namespace);
        }
        return namespace;
    }
    createCompoundsHierarchies() {
        for (const [namespaceId, namespace] of this.collectionCompoundsById) {
            for (const childNamespaceId of namespace.childrenIds) {
                const childNamespace = this.collectionCompoundsById.get(childNamespaceId);
                assert(childNamespace !== undefined);
                childNamespace.parent = namespace;
                namespace.children.push(childNamespace);
            }
        }
        for (const [namespaceId, namespace] of this.collectionCompoundsById) {
            if (namespace.parent === undefined) {
                if (namespace instanceof Namespace) {
                    if (this.workspace.options.debug) {
                        console.log('topLevelNamespaces:', namespaceId);
                    }
                    this.topLevelNamespaces.push(namespace);
                }
            }
        }
    }
    addSidebarItems(sidebarCategory) {
        const indicesSet = this.workspace.indicesMaps.get('namespaces');
        if (indicesSet === undefined) {
            return;
        }
        const namespacesCategory = {
            type: 'category',
            label: 'Namespaces',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/index`,
            },
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Hierarchy',
                    collapsed: true,
                    items: [],
                },
            ],
        };
        for (const namespace of this.topLevelNamespaces) {
            const item = this.createNamespaceItemRecursively(namespace);
            if (item !== undefined) {
                ;
                namespacesCategory.items[0].items.push(item);
            }
        }
        if (indicesSet.has('all')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'All',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/all`,
            });
        }
        if (indicesSet.has('classes')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Classes',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/classes`,
            });
        }
        if (indicesSet.has('functions')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Functions',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/functions`,
            });
        }
        if (indicesSet.has('variables')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Variables',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/variables`,
            });
        }
        if (indicesSet.has('typedefs')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Typedefs',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/typedefs`,
            });
        }
        if (indicesSet.has('enums')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Enums',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/enums`,
            });
        }
        if (indicesSet.has('enumvalues')) {
            namespacesCategory.items.push({
                type: 'doc',
                label: 'Enum Values',
                id: `${this.workspace.sidebarBaseId}indices/namespaces/enumvalues`,
            });
        }
        sidebarCategory.items.push(namespacesCategory);
    }
    createNamespaceItemRecursively(namespace) {
        if (namespace.sidebarLabel === undefined) {
            return undefined;
        }
        if (namespace.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: namespace.sidebarLabel,
                id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`,
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: namespace.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`,
                },
                collapsed: true,
                items: [],
            };
            for (const childNamespace of namespace.children) {
                if (childNamespace instanceof Namespace) {
                    const item = this.createNamespaceItemRecursively(childNamespace);
                    if (item !== undefined) {
                        categoryItem.items.push(item);
                    }
                }
            }
            return categoryItem;
        }
    }
    createMenuItems() {
        const menuItem = {
            label: 'Namespaces',
            to: `${this.workspace.menuBaseUrl}namespaces/`,
        };
        return [menuItem];
    }
    async generateIndexDotMdFile() {
        if (this.topLevelNamespaces.length === 0) {
            return;
        }
        const filePath = this.workspace.outputFolderPath + 'indices/namespaces/index.md';
        const permalink = 'namespaces';
        const frontMatter = {
            title: 'The Namespaces Reference',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            custom_edit_url: null,
            keywords: ['doxygen', 'namespaces', 'reference'],
        };
        const contentLines = [];
        for (const namespace of this.topLevelNamespaces) {
            contentLines.push(...this.generateIndexMdFileRecursively(namespace, 1));
        }
        if (contentLines.length === 0) {
            return;
        }
        const lines = [];
        lines.push('The namespaces used by this project are:');
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        if (this.workspace.options.verbose) {
            console.log(`Writing namespaces index file ${filePath}...`);
        }
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
    generateIndexMdFileRecursively(namespace, depth) {
        const lines = [];
        const label = this.workspace.renderString(namespace.treeEntryName, 'html');
        const permalink = this.workspace.getPagePermalink(namespace.id);
        if (permalink === undefined || permalink.length === 0) {
            return [];
        }
        let description = '';
        if (namespace.briefDescriptionHtmlString !== undefined &&
            namespace.briefDescriptionHtmlString.length > 0) {
            description = namespace.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconLetter: 'N',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description,
        }));
        if (namespace.children.length > 0) {
            for (const childNamespace of namespace.children) {
                if (childNamespace instanceof Namespace) {
                    lines.push(...this.generateIndexMdFileRecursively(childNamespace, depth + 1));
                }
            }
        }
        return lines;
    }
    async generatePerInitialsIndexMdFiles() {
        if (this.topLevelNamespaces.length === 0) {
            return;
        }
        const allUnorderedEntriesMap = new Map();
        for (const [, compound] of this.collectionCompoundsById) {
            if (!(compound instanceof Namespace)) {
                continue;
            }
            const compoundEntry = new NamespaceTreeEntry(compound, compound);
            allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry);
            if (compound.innerCompounds !== undefined) {
                const classCompoundDef = compound.innerCompounds.get('innerClasses');
                if (classCompoundDef?.innerClasses !== undefined) {
                    for (const innerClass of classCompoundDef.innerClasses) {
                        const compoundClass = this.workspace.compoundsById.get(innerClass.refid);
                        if (compoundClass instanceof Class) {
                            const classEntry = new NamespaceTreeEntry(compoundClass, compound);
                            allUnorderedEntriesMap.set(classEntry.id, classEntry);
                        }
                    }
                }
            }
            for (const section of compound.sections) {
                for (const member of section.definitionMembers) {
                    const memberEntry = new NamespaceTreeEntry(member, compound);
                    allUnorderedEntriesMap.set(memberEntry.id, memberEntry);
                    if (member.enumValues !== undefined) {
                        for (const enumValue of member.enumValues) {
                            const enumValueEntry = new NamespaceTreeEntry(enumValue, compound);
                            allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry);
                        }
                    }
                }
            }
        }
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'all',
            title: 'The Namespaces Definitions Index',
            description: 'The definitions part of the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => true,
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'classes',
            title: 'The Namespaces Classes Index',
            description: 'The classes, structs, unions defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'class' || kind === 'struct' || kind === 'union',
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'functions',
            title: 'The Namespaces Functions Index',
            description: 'The functions defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'function',
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'variables',
            title: 'The Namespaces Variables Index',
            description: 'The variables defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'variable',
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'typedefs',
            title: 'The Namespaces Type Definitions Index',
            description: 'The typedefs defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'typedef',
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'enums',
            title: 'The Namespaces Enums Index',
            description: 'The enums defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'enum',
        });
        await this.generateIndexFile({
            group: 'namespaces',
            fileKind: 'enumvalues',
            title: 'The Namespaces Enum Values Index',
            description: 'The enum values defined in the namespaces are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => kind === 'enumvalue',
        });
    }
}
export class Namespace extends CompoundBase {
    unqualifiedName = '???';
    isAnonymous = false;
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        if (Array.isArray(compoundDef.innerNamespaces)) {
            for (const ref of compoundDef.innerNamespaces) {
                this.childrenIds.push(ref.refid);
            }
        }
        if (/^namespace.*_0d\d{48}/.test(this.id)) {
            let fileName = '';
            if (compoundDef.location?.file !== undefined) {
                fileName = path.basename(compoundDef.location.file);
            }
            if (this.compoundName.startsWith('::')) {
                this.unqualifiedName = compoundDef.compoundName.replace(/.*::/, '');
                this.indexName = `anonymous{${fileName}}${this.compoundName}`;
                const sanitizedPath = sanitizeHierarchicalPath(this.indexName.replaceAll('::', '/'));
                this.pageTitle = `The \`${this.indexName}\` Namespace Reference`;
                this.relativePermalink = `namespaces/${sanitizedPath}`;
                this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
                const { unqualifiedName } = this;
                this.sidebarLabel = unqualifiedName;
            }
            else {
                this.unqualifiedName = `anonymous{${fileName}}`;
                this.isAnonymous = true;
                if (this.compoundName.length > 0) {
                    this.indexName = `${this.compoundName}::${this.unqualifiedName}`;
                }
                else {
                    const { unqualifiedName } = this;
                    this.indexName = unqualifiedName;
                }
                const sanitizedPath = sanitizeHierarchicalPath(this.indexName.replaceAll('::', '/'));
                this.pageTitle = `The \`${this.indexName}\` Namespace Reference`;
                this.relativePermalink = `namespaces/${sanitizedPath}`;
                this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
                const { unqualifiedName } = this;
                this.sidebarLabel = unqualifiedName;
            }
        }
        else {
            this.unqualifiedName = sanitizeAnonymousNamespace(compoundDef.compoundName.replace(/.*::/, ''));
            this.indexName = sanitizeAnonymousNamespace(this.compoundName.replace(/.*::/, ''));
            this.pageTitle = `The \`${this.unqualifiedName}\` Namespace Reference`;
            const sanitizedPath = sanitizeHierarchicalPath(sanitizeAnonymousNamespace(this.compoundName.replaceAll('::', '/')));
            if (compoundDef.compoundName.length > 0) {
                this.relativePermalink = `namespaces/${sanitizedPath}`;
                this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
                const { unqualifiedName } = this;
                this.sidebarLabel = unqualifiedName;
            }
            else {
                console.warn('Skipping unnamed namespace', compoundDef.id, compoundDef.location?.file);
            }
        }
        const { indexName } = this;
        this.treeEntryName = indexName;
        this.createSections();
    }
    initializeLate() {
        super.initializeLate();
        if (!this.hasAnyContent()) {
            if (this.collection.workspace.options.debug) {
                console.log(this.kind, this.compoundName, 'has no content, not shown');
            }
            this.docusaurusId = undefined;
            this.sidebarLabel = undefined;
            this.relativePermalink = undefined;
        }
    }
    hasAnyContent() {
        for (const childNamespace of this.children) {
            if (childNamespace.hasAnyContent()) {
                return true;
            }
        }
        if (this.innerCompounds !== undefined) {
            if (this.innerCompounds.has('innerNamespaces')) {
                if (this.innerCompounds.size > 1) {
                    return true;
                }
            }
            else {
                if (this.innerCompounds.size > 0) {
                    return true;
                }
            }
        }
        return super.hasAnyContent();
    }
    renderToLines(frontMatter) {
        const lines = [];
        const { workspace } = this.collection;
        const descriptionTodo = `@namespace ${workspace.renderString(this.compoundName, 'html')}`;
        const morePermalink = this.detailedDescriptionHtmlLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink,
        }));
        lines.push('');
        lines.push('## Definition');
        lines.push('');
        lines.push('<div class="doxyDefinition">');
        const dots = workspace.renderString('{ ... }', 'html');
        if (this.compoundName.startsWith('anonymous_namespace{')) {
            lines.push(`namespace ${dots}`);
        }
        else {
            lines.push(`namespace ${workspace.renderString(this.compoundName, 'html')} ${dots}`);
        }
        lines.push('</div>');
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Namespaces', 'Classes'],
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
        lines.push(...this.renderGeneratedFromToLines());
        return lines;
    }
}
//# sourceMappingURL=namespaces-vm.js.map