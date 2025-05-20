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
        this.collectionCompoundsById.set(compoundDef.id, namespace);
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
    createSidebarItems() {
        // Add namespaces to the sidebar.
        // Top level namespaces are added below a Namespaces category.
        const namespacesCategory = {
            type: 'category',
            label: 'Namespaces',
            link: {
                type: 'doc',
                id: `${this.workspace.permalinkBaseUrl}namespaces/index`
            },
            collapsed: true,
            items: []
        };
        for (const namespace of this.topLevelNamespaces) {
            namespacesCategory.items.push(this.createNamespaceItemRecursively(namespace));
        }
        return [namespacesCategory];
    }
    createNamespaceItemRecursively(namespace) {
        if (namespace.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: namespace.sidebarLabel,
                id: `${this.workspace.permalinkBaseUrl}${namespace.docusaurusId}`
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: namespace.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.permalinkBaseUrl}${namespace.docusaurusId}`
                },
                collapsed: true,
                items: []
            };
            for (const childNamespace of namespace.children) {
                categoryItem.items.push(this.createNamespaceItemRecursively(childNamespace));
            }
            return categoryItem;
        }
    }
    // --------------------------------------------------------------------------
    createMenuItems() {
        const menuItem = {
            label: 'Namespaces',
            to: `/${this.workspace.pluginOptions.outputFolderPath}/namespaces/`
        };
        return [menuItem];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdxFile() {
        const outputFolderPath = this.workspace.pluginOptions.outputFolderPath;
        const filePath = `${outputFolderPath}/namespaces/index.mdx`;
        const permalink = 'namespaces';
        const frontMatter = {
            title: 'The Namespaces Reference',
            slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'namespaces', 'reference']
        };
        const lines = [];
        lines.push('The namespaces used by this project are:');
        lines.push('');
        lines.push('<TreeTable>');
        for (const namespace of this.topLevelNamespaces) {
            lines.push(...this.generateIndexMdxFileRecursively(namespace, 1));
        }
        lines.push('');
        lines.push('</TreeTable>');
        console.log(`Writing namespaces index file ${filePath}...`);
        await this.workspace.writeFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
    generateIndexMdxFileRecursively(namespace, depth) {
        // console.log(util.inspect(namespace, { compact: false, depth: 999 }))
        const lines = [];
        const label = escapeMdx(namespace.unqualifiedName);
        const permalink = this.workspace.getPagePermalink(namespace.id);
        assert(permalink !== undefined && permalink.length > 1);
        lines.push('');
        lines.push('<TreeTableRow');
        lines.push('  itemIconLetter="N"');
        lines.push(`  itemLabel="${label}"`);
        lines.push(`  itemLink="${permalink}"`);
        lines.push(`  depth="${depth}">`);
        if (namespace.briefDescriptionMdxText !== undefined && namespace.briefDescriptionMdxText.length > 0) {
            lines.push(namespace.briefDescriptionMdxText.replace(/[.]$/, ''));
        }
        lines.push('</TreeTableRow>');
        if (namespace.children.length > 0) {
            for (const childNamespace of namespace.children) {
                lines.push(...this.generateIndexMdxFileRecursively(childNamespace, depth + 1));
            }
        }
        return lines;
    }
}
// ----------------------------------------------------------------------------
export class Namespace extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        this.unqualifiedName = '?';
        // console.log('Namespace.constructor', util.inspect(compoundDef))
        if (Array.isArray(compoundDef.innerNamespaces)) {
            for (const ref of compoundDef.innerNamespaces) {
                // console.log('component', compoundDef.id, 'has child', ref.refid)
                this.childrenIds.push(ref.refid);
            }
        }
        // The compoundName is the fully qualified namespace name.
        // Keep only the last name.
        this.sidebarLabel = compoundDef.compoundName.replace(/.*::/, '');
        this.indexName = this.compoundName;
        this.unqualifiedName = this.sidebarLabel;
        this.pageTitle = `The \`${this.sidebarLabel}\` Namespace Reference`;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName.replaceAll('::', '/'));
        this.relativePermalink = `namespaces/${sanitizedPath}`;
        this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`;
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.hasMembers()) {
                    this.sections.push(new Section(this, sectionDef));
                }
            }
        }
        // console.log('1', this.compoundName)
        // console.log('2', this.relativePermalink)
        // console.log('3', this.docusaurusId)
        // console.log('4', this.sidebarLabel)
        // console.log('4', this.indexName)
        // console.log()
    }
    // --------------------------------------------------------------------------
    renderToMdxLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@namespace ${this.compoundName}`;
        const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToMdxText({
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push('');
        lines.push('## Definition');
        lines.push('');
        // Intentionally on two lines.
        lines.push(`<CodeBlock>namespace ${this.compoundName}</CodeBlock>`);
        lines.push(...this.renderInnerIndicesToMdxLines({
            suffixes: ['Namespaces', 'Classes']
        }));
        lines.push(...this.renderSectionIndicesToMdxLines());
        lines.push(...this.renderDetailedDescriptionToMdxLines({
            todo: descriptionTodo,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToMdxLines());
        lines.push(...this.renderGeneratedFromToMdxLines());
        return lines;
    }
}
// ----------------------------------------------------------------------------
