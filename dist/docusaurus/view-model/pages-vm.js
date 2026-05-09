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
            link: {
                type: 'doc',
                id: `${this.workspace.sidebarBaseId}indices/pages/index`,
            },
            collapsed: true,
            items: [],
        };
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (this.workspace.options.listPagesAtTop &&
                page instanceof Page &&
                page.isTopPage()) {
                continue;
            }
            if (pageId === 'indexpage') {
                continue;
            }
            const { sidebarLabel } = page;
            if (sidebarLabel === undefined || page.sidebarId === undefined) {
                continue;
            }
            const id = this.workspace.sidebarBaseId + page.sidebarId;
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
        if (!this.workspace.options.listPagesAtTop) {
            return;
        }
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (pageId === 'indexpage' ||
                !(page instanceof Page && page.isTopPage())) {
                continue;
            }
            if (page.sidebarLabel === undefined || page.sidebarId === undefined) {
                continue;
            }
            const docItem = {
                type: 'doc',
                label: page.sidebarLabel,
                id: `${this.workspace.sidebarBaseId}${page.sidebarId}`,
            };
            sidebarCategory.items.push(docItem);
        }
    }
    createNavbarItems() {
        return [];
    }
    async generateIndexDotMdFile() {
        if (this.collectionCompoundsById.size === 0) {
            return;
        }
        const filePath = `${this.workspace.outputFolderPath}indices/pages/index.md`;
        const permalink = 'pages';
        const frontMatter = {
            title: 'Pages',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            description: 'The pages that contributed content to this site',
            custom_edit_url: null,
            keywords: ['doxygen', 'pages', 'reference'],
        };
        const lines = [];
        lines.push('The Doxygen contributed pages are:');
        lines.push('');
        for (const [pageId, page] of this.collectionCompoundsById) {
            if (pageId === 'indexpage') {
                continue;
            }
            if (page.sidebarLabel === undefined ||
                page.sidebarId === undefined ||
                page.relativePermalink === undefined) {
                continue;
            }
            const pagePermalink = this.workspace.pageBaseUrl + page.relativePermalink;
            lines.push(`- [${page.sidebarLabel}](${pagePermalink})`);
        }
        if (this.workspace.options.verbose) {
            console.log(`Writing pages index file '${filePath}'...`);
        }
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
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
        this.sidebarId = `pages/${flattenPath(sanitizedPath)}`;
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