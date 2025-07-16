import assert from 'node:assert';
import { CompoundBase } from './compound-base-vm.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { CollectionBase } from './collection-base.js';
export class Pages extends CollectionBase {
    addChild(compoundDef) {
        const page = new Page(this, compoundDef);
        this.collectionCompoundsById.set(page.id, page);
        if (page.id === 'indexpage') {
            this.workspace.mainPage = page;
        }
        return page;
    }
    createCompoundsHierarchies() {
    }
    addSidebarItems(sidebarCategory) {
        const pagesCategory = {
            type: 'category',
            label: 'Pages',
            collapsed: true,
            items: [],
        };
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (this.workspace.options.renderPagesAtTop &&
                page instanceof Page &&
                page.isTopPage()) {
                continue;
            }
            if (pageId === 'indexpage') {
                continue;
            }
            const { sidebarLabel } = page;
            if (sidebarLabel === undefined) {
                continue;
            }
            if (page.docusaurusId === undefined) {
                continue;
            }
            const id = this.workspace.sidebarBaseId + page.docusaurusId;
            const docItem = {
                type: 'doc',
                label: sidebarLabel,
                id,
            };
            pagesCategory.items.push(docItem);
        }
        if (pagesCategory.items.length > 0) {
            sidebarCategory.items.push(pagesCategory);
        }
    }
    createTopPagesSidebarItems(sidebarCategory) {
        if (!this.workspace.options.renderPagesAtTop) {
            return;
        }
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (pageId === 'indexpage' ||
                !(page instanceof Page && page.isTopPage())) {
                continue;
            }
            const { sidebarLabel: label } = page;
            if (label === undefined) {
                continue;
            }
            if (page.docusaurusId === undefined) {
                continue;
            }
            const id = `${this.workspace.sidebarBaseId}${page.docusaurusId}`;
            const docItem = {
                type: 'doc',
                label,
                id,
            };
            sidebarCategory.items.push(docItem);
        }
    }
    createMenuItems() {
        return [];
    }
    async generateIndexDotMdFile() {
    }
}
export class Page extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        const { title } = compoundDef;
        assert(title !== undefined);
        this.sidebarLabel = title.trim().replace(/\.$/, '');
        const { sidebarLabel } = this;
        this.indexName = sidebarLabel;
        this.treeEntryName = sidebarLabel;
        this.pageTitle = sidebarLabel;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `pages/${sanitizedPath}`;
        this.docusaurusId = `pages/${flattenPath(sanitizedPath)}`;
        assert(compoundDef.sectionDefs === undefined);
    }
    isTopPage() {
        if (this.id === 'deprecated' || this.id === 'todo') {
            return false;
        }
        return true;
    }
    renderToLines(frontMatter) {
        const lines = [];
        const morePermalink = this.detailedDescriptionHtmlLines !== undefined ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            morePermalink,
        }));
        lines.push(...this.renderInnerIndicesToLines({}));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            showHeader: false,
        }));
        lines.push(...this.renderSectionsToLines());
        return lines;
    }
}
//# sourceMappingURL=pages-vm.js.map