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
// ----------------------------------------------------------------------------
// import * as util from 'node:util'
import assert from 'node:assert';
// import * as fs from 'node:fs/promises'
// import path from 'node:path'
import { CompoundBase } from './compound-base-vm.js';
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { CollectionBase } from './collection-base.js';
// Support for collapsible tables is experimental.
// const useCollapsibleTable = false
// ----------------------------------------------------------------------------
export class Groups extends CollectionBase {
    // compoundsById: Map<string, Group>
    topLevelGroups = [];
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        const group = new Group(this, compoundDef);
        this.collectionCompoundsById.set(group.id, group);
        return group;
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // Recreate groups hierarchies.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [groupId, group] of this.collectionCompoundsById) {
            for (const childGroupId of group.childrenIds) {
                const childGroup = this.collectionCompoundsById.get(childGroupId);
                assert(childGroup !== undefined);
                // console.log('groupId', childGroupId, 'has parent', groupId)
                childGroup.parent = group;
                group.children.push(childGroup);
            }
        }
        // Create the top level groups list.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [groupId, group] of this.collectionCompoundsById) {
            if (group.parent === undefined) {
                // console.log('topGroupId:', groupId)
                this.topLevelGroups.push(group);
            }
        }
    }
    // --------------------------------------------------------------------------
    addSidebarItems(sidebarCategory) {
        const sidebarItems = [];
        for (const topLevelGroup of this.topLevelGroups) {
            const item = this.createSidebarItemRecursively(topLevelGroup);
            if (item !== undefined) {
                sidebarItems.push(item);
            }
        }
        sidebarCategory.items.push(...sidebarItems);
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
    // --------------------------------------------------------------------------
    createMenuItems() {
        const menuItems = [];
        for (const topLevelGroup of this.topLevelGroups) {
            const menuItem = {
                label: `${topLevelGroup.sidebarLabel}`,
                to: `${this.workspace.menuBaseUrl}${topLevelGroup.relativePermalink}/`,
            };
            menuItems.push(menuItem);
        }
        return menuItems;
    }
    // --------------------------------------------------------------------------
    // eslint-disable-next-line @typescript-eslint/class-methods-use-this, @typescript-eslint/no-empty-function
    async generateIndexDotMdFile() { }
    // if (useCollapsibleTable) {
    //   const jsonFilePath = `${outputFolderPath}${jsonFileName}`
    //   const tableData: collapsibleTableRow[] = []
    //   for (const group of this.topLevelGroups) {
    //     tableData.push(this.generateTableRowRecursively(group))
    //   }
    //   const jsonString = JSON.stringify(tableData, null, 2)
    //   console.log(`Writing groups index table file ${jsonFilePath}...`)
    //   await fs.mkdir(path.dirname(jsonFilePath), { recursive: true })
    //   const fileHandle = await fs.open(jsonFilePath, 'ax')
    //   await fileHandle.write(jsonString)
    //   await fileHandle.close()
    // }
    // const lines: string[] = []
    // lines.push(`<p>${projectBrief} topics with brief descriptions are:</p>`)
    // lines.push('')
    // if (useCollapsibleTable) {
    //   lines.push('<CollapsibleTreeTable rows={tableData} />')
    // } else {
    //   lines.push('<table class="doxyTreeTable">')
    //   for (const group of this.topLevelGroups) {
    //     lines.push(...this.generateIndexMdFileRecursively(group, 1))
    //   }
    //   lines.push('')
    //   lines.push('</table>')
    // }
    // console.log(`Writing groups index file ${filePath}...`)
    // if (useCollapsibleTable) {
    //   await this.workspace.writeMdFile({
    //     filePath,
    //     frontMatter,
    //     frontMatterCodeLines: [
    //       `import tableData from './${jsonFileName}'`
    //     ],
    //     bodyLines: lines
    //   })
    // } else {
    //   await this.workspace.writeMdFile({
    //     filePath,
    //     frontMatter,
    //     bodyLines: lines
    //   })
    // }
    generateTopicsTable() {
        if (this.topLevelGroups.length === 0) {
            return [];
        }
        const contentLines = [];
        for (const group of this.topLevelGroups) {
            contentLines.push(...this.generateIndexMdFileRecursively(group, 1));
        }
        if (contentLines.length === 0) {
            return;
        }
        const lines = [];
        const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF');
        lines.push(`${projectBrief} topics with brief descriptions are:`);
        lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }));
        return lines;
    }
    // private generateTableRowRecursively (group: Group): collapsibleTableRow {
    //   const label = group.title ?? '???'
    //   const permalink = this.workspace.getPagePermalink(group.id)
    //   assert(permalink !== undefined && permalink.length > 1)
    //   const description: string =
    //     group.briefDescriptionString?.replace(/[.]$/, '') ?? ''
    //   const tableRow: collapsibleTableRow = {
    //     id: group.id,
    //     label,
    //     link: permalink,
    //     description
    //   }
    //   if (group.children.length > 0) {
    //     tableRow.children = []
    //     for (const childGroup of group.children) {
    //       tableRow.children.push(
    //         this.generateTableRowRecursively(childGroup as Group)
    //       )
    //     }
    //   }
    //   return tableRow
    // }
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
// ----------------------------------------------------------------------------
export class Group extends CompoundBase {
    constructor(collection, compoundDef) {
        super(collection, compoundDef);
        // console.log('Group.constructor', util.inspect(compoundDef))
        if (Array.isArray(compoundDef.innerGroups)) {
            for (const ref of compoundDef.innerGroups) {
                // console.log('component', compoundDef.id, 'has child', ref.refid)
                this.childrenIds.push(ref.refid);
            }
        }
        // The group title must be short.
        const { title } = compoundDef;
        this.sidebarLabel = title ?? '???';
        const { sidebarLabel } = this;
        this.indexName = sidebarLabel;
        this.pageTitle = `The ${this.sidebarLabel} Reference`;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `groups/${sanitizedPath}`;
        this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`;
        this.createSections();
        // console.log('0', this.id)
        // console.log('1', this.compoundName, this.titleMdText)
        // console.log('2', this.relativePermalink)
        // console.log('3', this.docusaurusId)
        // console.log('4', this.sidebarLabel)
        // console.log('5', this.indexName)
        // console.log()
    }
    // --------------------------------------------------------------------------
    renderToLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@defgroup ${this.collection.workspace.renderString(this.compoundName, 'html')}`;
        // const hasIndices =
        //   this.hasSect1InDescription &&
        //   (this.hasInnerIndices() || this.hasSections())
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
// ----------------------------------------------------------------------------
//# sourceMappingURL=groups-vm.js.map