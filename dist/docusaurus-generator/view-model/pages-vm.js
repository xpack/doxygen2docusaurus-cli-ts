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
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { CollectionBase } from './collection-base.js';
// ----------------------------------------------------------------------------
export class Pages extends CollectionBase {
    // compoundsById: Map<string, Page>
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        const page = new Page(this, compoundDef);
        this.collectionCompoundsById.set(page.id, page);
        if (page.id === 'indexpage') {
            this.workspace.mainPage = page;
        }
        return page;
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // There are no pages hierarchies.
    }
    // --------------------------------------------------------------------------
    createSidebarItems(sidebarCategory) {
        // Add pages to the sidebar.
        // They are organised as a flat list, no hierarchies.
        const pagesCategory = {
            type: 'category',
            label: 'Pages',
            // There is no index page.
            collapsed: true,
            items: []
        };
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (!this.workspace.pluginOptions.renderPagesAtTop || !page.isTopPage()) {
                const label = page.sidebarLabel;
                if (label === undefined) {
                    continue;
                }
                const id = `${this.workspace.sidebarBaseId}${page.docusaurusId}`;
                const docItem = {
                    type: 'doc',
                    label,
                    id
                };
                pagesCategory.items.push(docItem);
            }
        }
        if (pagesCategory.items.length > 0) {
            sidebarCategory.items.push(pagesCategory);
        }
    }
    createTopPagesSidebarItems(sidebarCategory) {
        // Add pages to the sidebar.
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (!this.workspace.pluginOptions.renderPagesAtTop) {
                // Do not show pages to the top.
                continue;
            }
            // Skip special pages.
            if (pageId === 'indexpage' || !page.isTopPage()) {
                continue;
            }
            const label = page.sidebarLabel;
            if (label === undefined) {
                continue;
            }
            const id = `${this.workspace.sidebarBaseId}${page.docusaurusId}`;
            const docItem = {
                type: 'doc',
                label,
                id
            };
            sidebarCategory.items.push(docItem);
        }
    }
    // --------------------------------------------------------------------------
    createMenuItems() {
        // Pages do not show on the menu.
        return [];
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdFile() {
        // There is no pages index.
    }
}
// ----------------------------------------------------------------------------
export class Page extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        assert(compoundDef.title !== undefined);
        this.sidebarLabel = compoundDef.title.trim().replace(/\.$/, '');
        this.indexName = this.sidebarLabel;
        // this.pageTitle = `The ${this.sidebarLabel}`
        this.pageTitle = this.sidebarLabel;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `pages/${sanitizedPath}`;
        this.docusaurusId = `pages/${flattenPath(sanitizedPath)}`;
        // SectionDefs for pages?
        assert(compoundDef.sectionDefs === undefined);
        // console.log('0', this.id)
        // console.log('1', this.compoundName)
        // console.log('2', this.relativePermalink)
        // console.log('3', this.docusaurusId)
        // console.log('4', this.sidebarLabel)
        // console.log('5', this.indexName)
        // console.log()
    }
    // --------------------------------------------------------------------------
    isTopPage() {
        if (this.id === 'deprecated' || this.id === 'todo') {
            return false;
        }
        return true;
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const morePermalink = this.detailedDescriptionMarkdownLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToString({
            briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
            morePermalink
        }));
        lines.push(...this.renderInnerIndicesToLines({}));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToLines({
            briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
            detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
            showHeader: false
        }));
        lines.push(...this.renderSectionsToLines());
        return lines;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=pages-vm.js.map