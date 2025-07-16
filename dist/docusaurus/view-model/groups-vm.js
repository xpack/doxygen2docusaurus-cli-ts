import assert from 'node:assert';
import { CompoundBase } from './compound-base-vm.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { CollectionBase } from './collection-base.js';
export class Groups extends CollectionBase {
    topLevelGroups = [];
    addChild(compoundDef) {
        const group = new Group(this, compoundDef);
        this.collectionCompoundsById.set(group.id, group);
        return group;
    }
    createCompoundsHierarchies() {
        for (const [groupId, group] of this.collectionCompoundsById) {
            for (const childGroupId of group.childrenIds) {
                const childGroup = this.collectionCompoundsById.get(childGroupId);
                assert(childGroup !== undefined);
                childGroup.parent = group;
                group.children.push(childGroup);
            }
        }
        for (const [groupId, group] of this.collectionCompoundsById) {
            if (group.parent === undefined) {
                this.topLevelGroups.push(group);
            }
        }
    }
    addSidebarItems(sidebarCategory) {
        const sidebarItems = [];
        for (const topLevelGroup of this.topLevelGroups) {
            const item = this.createSidebarItemRecursively(topLevelGroup);
            if (item !== undefined) {
                sidebarItems.push(item);
            }
        }
        if (this.topLevelGroups.length > 1) {
            sidebarCategory.items.push({
                type: 'category',
                label: 'Topics',
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}indices/groups/index`,
                },
                collapsed: true,
                items: sidebarItems,
            });
        }
        else {
            sidebarCategory.items.push(...sidebarItems);
        }
    }
    createSidebarItemRecursively(group) {
        if (group.sidebarLabel === undefined) {
            return undefined;
        }
        if (group.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: group.sidebarLabel,
                id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`,
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: group.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`,
                },
                collapsed: true,
                items: [],
            };
            for (const childGroup of group.children) {
                const item = this.createSidebarItemRecursively(childGroup);
                if (item !== undefined) {
                    categoryItem.items.push(item);
                }
            }
            return categoryItem;
        }
    }
    createMenuItems() {
        if (this.topLevelGroups.length > 1) {
            const menuItem = {
                label: 'Topics',
                to: `${this.workspace.menuBaseUrl}groups/`,
            };
            return [menuItem];
        }
        else {
            const topLevelGroup = this.topLevelGroups[0];
            const menuItem = {
                label: `${topLevelGroup.sidebarLabel}`,
                to: `${this.workspace.menuBaseUrl}${topLevelGroup.relativePermalink}/`,
            };
            return [menuItem];
        }
    }
    async generateIndexDotMdFile() {
        if (this.topLevelGroups.length <= 1) {
            return;
        }
        const filePath = this.workspace.outputFolderPath + 'indices/groups/index.md';
        const permalink = 'groups';
        const frontMatter = {
            title: 'The Topics Reference',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            custom_edit_url: null,
            keywords: ['doxygen', 'topics', 'reference'],
        };
        const contentLines = [];
        for (const group of this.topLevelGroups) {
            contentLines.push(...this.generateIndexMdFileRecursively(group, 1));
        }
        if (contentLines.length === 0) {
            return;
        }
        const lines = [];
        lines.push('The topics defined in this project are:');
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        if (this.workspace.options.verbose) {
            console.log(`Writing groups index file ${filePath}...`);
        }
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
    generateTopicsTable() {
        if (this.topLevelGroups.length === 0) {
            return [];
        }
        const contentLines = [];
        for (const group of this.topLevelGroups) {
            contentLines.push(...this.generateIndexMdFileRecursively(group, 1));
        }
        if (contentLines.length === 0) {
            return [];
        }
        const lines = [];
        const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF');
        lines.push(`${projectBrief} topics with brief descriptions are:`);
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        return lines;
    }
    generateIndexMdFileRecursively(group, depth) {
        const lines = [];
        const label = group.titleHtmlString ?? '???';
        const permalink = this.workspace.getPagePermalink(group.id);
        assert(permalink !== undefined && permalink.length > 0);
        let description = '';
        if (group.briefDescriptionHtmlString !== undefined &&
            group.briefDescriptionHtmlString.length > 0) {
            description = group.briefDescriptionHtmlString.replace(/[.]$/, '');
        }
        lines.push('');
        lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
            itemLabel: label,
            itemLink: permalink,
            depth,
            description,
        }));
        if (group.children.length > 0) {
            for (const childGroup of group.children) {
                lines.push(...this.generateIndexMdFileRecursively(childGroup, depth + 1));
            }
        }
        return lines;
    }
}
export class Group extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        if (Array.isArray(compoundDef.innerGroups)) {
            for (const ref of compoundDef.innerGroups) {
                this.childrenIds.push(ref.refid);
            }
        }
        const { title } = compoundDef;
        this.sidebarLabel =
            title !== undefined && title.length > 0
                ? title.trim().replace(/\.$/, '')
                : '???';
        const { sidebarLabel } = this;
        this.indexName = sidebarLabel;
        this.pageTitle = `The ${this.sidebarLabel} Reference`;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `groups/${sanitizedPath}`;
        this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`;
        this.createSections();
    }
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@defgroup ${this.collection.workspace.renderString(this.compoundName, 'html')}`;
        let morePermalink = undefined;
        if (this.hasInnerIndices() || this.hasSections()) {
            morePermalink = '#details';
        }
        lines.push(this.renderBriefDescriptionToHtmlString({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            todo: descriptionTodo,
            morePermalink,
        }));
        lines.push(...this.renderInnerIndicesToLines({
            suffixes: ['Groups', 'Classes'],
        }));
        lines.push(...this.renderSectionIndicesToLines());
        lines.push(...this.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString: this.briefDescriptionHtmlString,
            detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
            todo: descriptionTodo,
            showHeader: !this.hasSect1InDescription,
            showBrief: this.hasInnerIndices() || this.hasSections(),
        }));
        lines.push(...this.renderSectionsToLines());
        return lines;
    }
}
//# sourceMappingURL=groups-vm.js.map