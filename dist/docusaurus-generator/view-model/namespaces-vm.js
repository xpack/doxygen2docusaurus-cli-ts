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
import path from 'node:path';
import { CompoundBase } from './compound-base-vm.js';
import { CollectionBase } from './collection-base.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
// ----------------------------------------------------------------------------
export class Namespaces extends CollectionBase {
    constructor() {
        super(...arguments);
        // compoundsById: Map<string, Namespace>
        this.topLevelNamespaces = [];
    }
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        const namespace = new Namespace(this, compoundDef);
        // Skip
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
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // Recreate namespaces hierarchies.
        for (const [namespaceId, namespace] of this.collectionCompoundsById) {
            for (const childNamespaceId of namespace.childrenIds) {
                const childNamespace = this.collectionCompoundsById.get(childNamespaceId);
                assert(childNamespace !== undefined);
                // console.log('namespaceId', childNamespaceId,'has parent', namespaceId)
                childNamespace.parent = namespace;
                namespace.children.push(childNamespace);
            }
        }
        // Create the top level namespace list.
        for (const [namespaceId, namespace] of this.collectionCompoundsById) {
            if (namespace.parent === undefined) {
                this.topLevelNamespaces.push(namespace);
            }
        }
    }
    // --------------------------------------------------------------------------
    createSidebarItems(sidebarCategory) {
        // Add namespaces to the sidebar.
        // Top level namespaces are added below a Namespaces category.
        const namespacesCategory = {
            type: 'category',
            label: 'Namespaces',
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}index/namespaces/index`
            },
            collapsed: true,
            items: []
        };
        for (const namespace of this.topLevelNamespaces) {
            const item = this.createNamespaceItemRecursively(namespace);
            if (item !== undefined) {
                namespacesCategory.items.push(item);
            }
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
                id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: namespace.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`
                },
                collapsed: true,
                items: []
            };
            for (const childNamespace of namespace.children) {
                const item = this.createNamespaceItemRecursively(childNamespace);
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
            label: 'Namespaces',
            to: `${this.workspace.menuBaseUrl}namespaces/`
        };
        return [menuItem];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdFile() {
        if (this.topLevelNamespaces.length === 0) {
            return;
        }
        const filePath = `${this.workspace.outputFolderPath}index/namespaces/index.md`;
        const permalink = 'namespaces';
        const frontMatter = {
            title: 'The Namespaces Reference',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'namespaces', 'reference']
        };
        const lines = [];
        lines.push('The namespaces used by this project are:');
        lines.push('');
        lines.push('<table class="doxyTreeTable">');
        const contentLines = [];
        for (const namespace of this.topLevelNamespaces) {
            contentLines.push(...this.generateIndexMdFileRecursively(namespace, 1));
        }
        if (contentLines.length === 0) {
            return;
        }
        lines.push(...contentLines);
        lines.push('');
        lines.push('</table>');
        console.log(`Writing namespaces index file ${filePath}...`);
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
    generateIndexMdFileRecursively(namespace, depth) {
        // console.log(util.inspect(namespace, { compact: false, depth: 999 }))
        const lines = [];
        const label = this.workspace.renderString(namespace.unqualifiedName, 'html');
        const permalink = this.workspace.getPagePermalink(namespace.id);
        if (permalink === undefined || permalink.length === 0) {
            // console.log(namespace)
            return [];
        }
        // assert(permalink !== undefined && permalink.length > 1)
        let description = '';
        if (namespace.briefDescriptionHtmlString !== undefined && namespace.briefDescriptionHtmlString.length > 0) {
            description = namespace.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemIconLetter: 'N',
            itemLabel: label,
            itemLink: permalink,
            depth,
            description
        }));
        if (namespace.children.length > 0) {
            for (const childNamespace of namespace.children) {
                lines.push(...this.generateIndexMdFileRecursively(childNamespace, depth + 1));
            }
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class Namespace extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.unqualifiedName = '???';
        this.isAnonymous = false;
        // console.log('Namespace.constructor', util.inspect(compoundDef))
        if (Array.isArray(compoundDef.innerNamespaces)) {
            for (const ref of compoundDef.innerNamespaces) {
                // console.log('component', compoundDef.id, 'has child', ref.refid)
                this.childrenIds.push(ref.refid);
            }
        }
        // Tricky case: namespace { namespace CU { ... }}
        // id: "namespace_0d341223050020306256025223146376054302122106363020_1_1CU"
        // compoundname: "::CU"
        // location: "[generated]"
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
                this.sidebarLabel = this.unqualifiedName;
            }
            else {
                this.unqualifiedName = `anonymous{${fileName}}`;
                this.isAnonymous = true;
                if (this.compoundName.length > 0) {
                    this.indexName = `${this.compoundName}::${this.unqualifiedName}`;
                }
                else {
                    this.indexName = this.unqualifiedName;
                }
                const sanitizedPath = sanitizeHierarchicalPath(this.indexName.replaceAll('::', '/'));
                // if (compoundDef.location?.file !== undefined) {
                //   sanitizedPath += `-${crypto.hash('md5', compoundDef.location?.file)}`
                // }
                this.pageTitle = `The \`${this.indexName}\` Namespace Reference`;
                this.relativePermalink = `namespaces/${sanitizedPath}`;
                this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
                this.sidebarLabel = this.unqualifiedName;
            }
        }
        else {
            // The compoundName is the fully qualified namespace name.
            // Keep only the last name.
            this.unqualifiedName = compoundDef.compoundName.replace(/.*::/, '').replace(/anonymous_namespace\{/, 'anonymous{');
            this.indexName = this.compoundName.replaceAll(/anonymous_namespace\{/g, 'anonymous{');
            this.pageTitle = `The \`${this.unqualifiedName}\` Namespace Reference`;
            const sanitizedPath = sanitizeHierarchicalPath(this.compoundName.replaceAll('::', '/').replaceAll(/anonymous_namespace\{/g, 'anonymous{'));
            if (compoundDef.compoundName.length > 0) {
                // Skip un-named namespaces, and generated ones, since they can be duplicate.
                this.relativePermalink = `namespaces/${sanitizedPath}`;
                this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
                this.sidebarLabel = this.unqualifiedName;
            }
            else {
                console.warn('Skipping unnamed namespace', compoundDef.id, compoundDef.location?.file);
            }
        }
        this.createSections();
        // console.log('0 id', this.id)
        // console.log('1 nm', this.compoundName)
        // console.log('2 pl', this.relativePermalink)
        // console.log('3 di', this.docusaurusId)
        // console.log('4 sb', this.sidebarLabel)
        // console.log('5 ix', this.indexName)
        // console.log()
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
    hasAnyContent() {
        // console.log('checking', this.compoundName)
        for (const childNamespace of this.children) {
            if (childNamespace.hasAnyContent()) {
                // console.log('has content', this)
                return true;
            }
        }
        if (this.innerCompounds !== undefined) {
            if (this.innerCompounds.has('innerNamespaces')) {
                if (this.innerCompounds.size > 1) {
                    // console.log('has content innerCompounds 1', this)
                    return true;
                }
            }
            else {
                if (this.innerCompounds.size > 0) {
                    // console.log('has content innerCompounds 2', this)
                    return true;
                }
            }
        }
        // if (!super.hasAnyContent()) {
        //   console.log('has no content', this)
        // }
        return super.hasAnyContent();
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const workspace = this.collection.workspace;
        const descriptionTodo = `@namespace ${workspace.renderString(this.compoundName, 'html')}`;
        const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink
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
        lines.push(...this.renderGeneratedFromToLines());
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=namespaces-vm.js.map