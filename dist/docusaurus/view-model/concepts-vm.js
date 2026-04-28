import assert from 'node:assert';
import { CollectionBase } from './collection-base.js';
import { CompoundBase } from './compound-base-vm.js';
import { flattenPath, sanitizeAnonymousNamespace, sanitizeHierarchicalPath, } from '../utils.js';
import { Namespace } from './namespaces-vm.js';
import { ConceptEntry } from './tree-entries-vm.js';
export class Concepts extends CollectionBase {
    topLevelConcepts = [];
    addChild(compoundDef) {
        const concept = new Concept(this, compoundDef);
        this.collectionCompoundsById.set(concept.id, concept);
        return concept;
    }
    createCompoundsHierarchies() {
        for (const concept of this.collectionCompoundsById.values()) {
            assert(concept instanceof Concept);
            if (concept.compoundName.includes('::')) {
                const namespaceCompoundName = concept.compoundName.replace(/::[a-zA-Z0-9_]+$/, '');
                const namespaces = this.workspace.viewModel.collections.get('namespaces');
                assert(namespaces !== undefined);
                const namespace = namespaces.findNamespaceByCompoundName(namespaceCompoundName);
                if (namespace !== undefined) {
                    concept.parent = namespace;
                    namespace.concepts.push(concept);
                    if (this.workspace.options.debug) {
                        console.log('concept', concept.compoundName, 'has parent namespace', namespace.compoundName);
                    }
                }
                else {
                    console.log('concept', concept.compoundName, 'has no parent namespace');
                }
            }
            else {
                if (this.workspace.options.debug) {
                    this.topLevelConcepts.push(concept);
                    console.log('topLevelConceptId:', concept.id, concept.compoundName);
                }
            }
        }
    }
    addSidebarItems(sidebarCategory) {
        const indicesSet = this.workspace.indicesMaps.get('concepts');
        if (indicesSet === undefined) {
            return;
        }
        const conceptsCategory = {
            type: 'category',
            label: 'Concepts',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}indices/concepts/index`,
            },
            collapsed: true,
            items: [
                {
                    type: 'category',
                    label: 'Hierarchy',
                    link: {
                        type: 'doc',
                        id: `${this.workspace.sidebarBaseId}indices/concepts/index`,
                    },
                    collapsed: true,
                    items: [],
                },
            ],
        };
        const namespaces = this.workspace.viewModel.collections.get('namespaces');
        if (namespaces !== undefined) {
            for (const namespace of namespaces.topLevelNamespaces) {
                const item = this.createNamespaceItemRecursively(namespace);
                if (item !== undefined) {
                    ;
                    conceptsCategory.items[0].items.push(item);
                }
            }
        }
        for (const concept of this.topLevelConcepts) {
            const item = this.createConceptItem(concept);
            if (item !== undefined) {
                ;
                conceptsCategory.items[0].items.push(item);
            }
        }
        if (indicesSet.has('all')) {
            conceptsCategory.items.push({
                type: 'doc',
                label: 'All',
                id: `${this.workspace.sidebarBaseId}indices/concepts/all`,
            });
        }
        sidebarCategory.items.push(conceptsCategory);
    }
    createNamespaceItemRecursively(namespace) {
        if (namespace.sidebarLabel === undefined ||
            namespace.sidebarId === undefined) {
            return undefined;
        }
        if (!namespace.hasConcepts()) {
            return undefined;
        }
        const categoryItem = {
            type: 'category',
            label: namespace.sidebarLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}${namespace.sidebarId}`,
            },
            className: 'doxyEllipsis',
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
        for (const concept of namespace.concepts) {
            const item = this.createConceptItem(concept);
            if (item !== undefined) {
                categoryItem.items.push(item);
            }
        }
        return categoryItem;
    }
    createConceptItem(concept) {
        if (concept.sidebarId === undefined || concept.sidebarLabel === undefined) {
            return undefined;
        }
        const item = {
            type: 'category',
            label: concept.sidebarLabel,
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}${concept.sidebarId}`,
            },
            collapsed: true,
            items: [],
        };
        return item;
    }
    createNavbarItems() {
        const navbarItem = {
            label: 'Concepts',
            to: `${this.workspace.menuBaseUrl}concepts/`,
        };
        return [navbarItem];
    }
    async generateIndexDotMdFile() {
        const filePath = this.workspace.outputFolderPath + 'indices/concepts/index.md';
        const permalink = 'concepts';
        const frontMatter = {
            title: 'Concepts',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            description: 'The C++20 concepts defined in the project',
            custom_edit_url: null,
            keywords: ['doxygen', 'concepts', 'reference'],
        };
        const contentLines = [];
        const namespaces = this.workspace.viewModel.collections.get('namespaces');
        if (namespaces !== undefined) {
            for (const namespace of namespaces.topLevelNamespaces) {
                contentLines.push(...this.generateNamespacesIndexMdLinesRecursively(namespace, 1));
            }
        }
        contentLines.push(...this.generateConceptsIndexMdFile(this.topLevelConcepts, 1));
        if (contentLines.length === 0) {
            return;
        }
        const lines = [];
        lines.push('The C++20 concepts used by this project are:');
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        if (this.workspace.options.verbose) {
            console.log(`Writing concepts index file '${filePath}'...`);
        }
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
        return;
    }
    generateNamespacesIndexMdLinesRecursively(namespace, depth) {
        const lines = [];
        const label = this.workspace.renderString(namespace.treeEntryName, 'html');
        const permalink = this.workspace.getPagePermalink(namespace.id);
        if (permalink === undefined || permalink.length === 0) {
            return [];
        }
        if (!namespace.hasConcepts()) {
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
        lines.push('');
        lines.push(...this.generateConceptsIndexMdFile(namespace.concepts, depth + 1));
        if (namespace.children.length > 0) {
            for (const childNamespace of namespace.children) {
                if (childNamespace instanceof Namespace) {
                    lines.push(...this.generateNamespacesIndexMdLinesRecursively(childNamespace, depth + 1));
                }
            }
        }
        return lines;
    }
    generateConceptsIndexMdFile(concepts, depth) {
        const lines = [];
        for (const concept of concepts) {
            const label = this.workspace.renderString(concept.treeEntryName, 'html');
            const permalink = this.workspace.getPagePermalink(concept.id);
            if (permalink === undefined || permalink.length === 0) {
                continue;
            }
            let description = '';
            if (concept.briefDescriptionHtmlString !== undefined &&
                concept.briefDescriptionHtmlString.length > 0) {
                description = concept.briefDescriptionHtmlString.replace(/[.]$/, '');
            }
            lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
                itemIconLetter: 'R',
                itemLabel: label,
                itemLink: permalink,
                depth,
                description,
            }));
        }
        return lines;
    }
    async generatePerInitialsIndexMdFiles() {
        if (this.collectionCompoundsById.size === 0) {
            return;
        }
        const allUnorderedEntriesMap = new Map();
        for (const [conceptId, concept] of this.collectionCompoundsById) {
            const entry = new ConceptEntry(concept);
            allUnorderedEntriesMap.set(conceptId, entry);
        }
        await this.generateIndexFile({
            group: 'concepts',
            fileKind: 'all',
            title: 'Concepts Definitions Index',
            description: 'The C++20 concepts defined in the project are:',
            map: allUnorderedEntriesMap,
            filter: (kind) => true,
        });
    }
}
export class Concept extends CompoundBase {
    unqualifiedName = '???';
    templateParameters = '';
    initializerString = '???';
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.unqualifiedName = sanitizeAnonymousNamespace(compoundDef.compoundName.replace(/.*::/, ''));
        this.indexName = sanitizeAnonymousNamespace(this.compoundName.replace(/.*::/, ''));
        this.pageTitle = `\`${this.unqualifiedName}\` Concept`;
        this.templateParameters = this.renderTemplateParameterNamesToString(compoundDef.templateParamList);
        const sanitizedPath = sanitizeHierarchicalPath(sanitizeAnonymousNamespace(this.compoundName.replaceAll('::', '/')));
        this.relativePermalink = `concepts/${sanitizedPath}`;
        this.sidebarId = `concepts/${flattenPath(sanitizedPath)}`;
        const { unqualifiedName } = this;
        this.sidebarLabel = unqualifiedName;
        this.treeEntryName = this.indexName;
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
        if (this._private._compoundDef?.initializer !== undefined) {
            this.initializerString = workspace
                .renderElementToLines(this._private._compoundDef.initializer, 'html')
                .join('<br/>\n')
                .replace(/template/, 'template ');
        }
    }
    renderToLines(frontMatter) {
        const lines = [];
        const name = this.collection.workspace.renderString(this.compoundName, 'html');
        const descriptionTodo = `@concept ${name}`;
        const morePermalink = '#details';
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink,
        }));
        lines.push('');
        lines.push('## Definition');
        lines.push('');
        lines.push('<div class="doxyDefinition">');
        lines.push(this.initializerString);
        lines.push('</div>');
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: true,
            showBrief: !this.hasSect1InDescription,
        }));
        lines.push(...this.renderGeneratedFromToLines());
        return lines;
    }
}
//# sourceMappingURL=concepts-vm.js.map