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
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { CompoundBase } from './compound-base-vm.js';
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js';
import { CollectionBase } from './collection-base.js';
import { Section } from './members-vm.js';
// Support for collapsible tables is experimental.
const useCollapsibleTable = false;
// ----------------------------------------------------------------------------
export class Groups extends CollectionBase {
    constructor() {
        super(...arguments);
        // compoundsById: Map<string, Group>
        this.topLevelGroups = [];
    }
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    addChild(compoundDef) {
        const group = new Group(this, compoundDef);
        this.collectionCompoundsById.set(compoundDef.id, group);
        return group;
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        // Recreate groups hierarchies.
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
        for (const [groupId, group] of this.collectionCompoundsById) {
            if (group.parent === undefined) {
                // console.log('topGroupId:', groupId)
                this.topLevelGroups.push(group);
            }
        }
    }
    // --------------------------------------------------------------------------
    createSidebarItems() {
        const sidebarItems = [];
        for (const topLevelGroup of this.topLevelGroups) {
            sidebarItems.push(this.createSidebarItemRecursively(topLevelGroup));
        }
        return sidebarItems;
    }
    createSidebarItemRecursively(group) {
        if (group.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: group.sidebarLabel,
                id: `${this.workspace.permalinkBaseUrl}${group.docusaurusId}`
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: group.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.permalinkBaseUrl}${group.docusaurusId}`
                },
                collapsed: true,
                items: []
            };
            for (const childGroup of group.children) {
                categoryItem.items.push(this.createSidebarItemRecursively(childGroup));
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
                to: `/${this.workspace.pluginOptions.outputFolderPath}/${topLevelGroup.relativePermalink}/`
            };
            menuItems.push(menuItem);
        }
        return menuItems;
    }
    // --------------------------------------------------------------------------
    async generateIndexDotMdxFile() {
        // Home page for the API reference.
        // It diverts from Doxygen, since it renders the list of topics and
        // the main page.
        const outputFolderPath = this.workspace.pluginOptions.outputFolderPath;
        const filePath = `${outputFolderPath}/index.mdx`;
        const jsonFileName = 'index-table.json';
        if (useCollapsibleTable) {
            const jsonFilePath = `${outputFolderPath}/${jsonFileName}`;
            const tableData = [];
            for (const group of this.topLevelGroups) {
                tableData.push(this.generateTableRowRecursively(group));
            }
            const jsonString = JSON.stringify(tableData, null, 2);
            console.log(`Writing groups index table file ${jsonFilePath}...`);
            await fs.mkdir(path.dirname(jsonFilePath), { recursive: true });
            const fileHandle = await fs.open(jsonFilePath, 'ax');
            await fileHandle.write(jsonString);
            await fileHandle.close();
        }
        const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF');
        const permalink = ''; // The root of the API sub-site.
        // This is the top index.mdx file (@mainpage)
        const frontMatter = {
            title: `${projectBrief} API Reference`,
            slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', 'reference']
        };
        // const docusaurusGenerator = this.pageGenerators.get('group')
        // assert(docusaurusGenerator !== undefined)
        // const bodyText = await docusaurusGenerator.renderIndexMdx()
        const lines = [];
        lines.push(`${projectBrief} topics with brief descriptions are:`);
        lines.push('');
        if (useCollapsibleTable) {
            lines.push('<CollapsibleTreeTable rows={tableData} />');
        }
        else {
            lines.push('<TreeTable>');
            for (const group of this.topLevelGroups) {
                lines.push(...this.generateIndexMdxFileRecursively(group, 1));
            }
            lines.push('');
            lines.push('</TreeTable>');
        }
        const pages = this.workspace.viewModel.get('pages');
        const detailedDescriptionMdxText = pages.mainPage?.detailedDescriptionMdxText;
        if (detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) {
            lines.push('');
            assert(pages.mainPage !== undefined);
            lines.push(...pages.mainPage?.renderDetailedDescriptionToMdxLines({
                briefDescriptionMdxText: pages.mainPage?.briefDescriptionMdxText,
                detailedDescriptionMdxText: pages.mainPage?.detailedDescriptionMdxText,
                showHeader: true,
                showBrief: !pages.mainPage?.hasSect1InDescription
            }));
        }
        lines.push('');
        lines.push(':::note');
        lines.push('For comparison, the original Doxygen html pages, styled with the [doxygen-awesome-css](https://jothepro.github.io/doxygen-awesome-css/) plugin, continue to be available via the <Link to="pathname:///doxygen/topics.html">/doxygen/*</Link> URLs.');
        lines.push(':::');
        console.log(`Writing groups index file ${filePath}...`);
        if (useCollapsibleTable) {
            await this.workspace.writeMdxFile({
                filePath,
                frontMatter,
                frontMatterCodeLines: [
                    `import tableData from './${jsonFileName}'`
                ],
                bodyLines: lines
            });
        }
        else {
            await this.workspace.writeMdxFile({
                filePath,
                frontMatter,
                bodyLines: lines
            });
        }
    }
    generateTableRowRecursively(group) {
        const label = group.titleMdxText ?? '?';
        const permalink = this.workspace.getPagePermalink(group.id);
        assert(permalink !== undefined && permalink.length > 1);
        const description = group.briefDescriptionMdxText?.replace(/[.]$/, '') ?? '';
        const tableRow = {
            id: group.id,
            label,
            link: permalink,
            description
        };
        if (group.children.length > 0) {
            tableRow.children = [];
            for (const childGroup of group.children) {
                tableRow.children.push(this.generateTableRowRecursively(childGroup));
            }
        }
        return tableRow;
    }
    generateIndexMdxFileRecursively(group, depth) {
        const lines = [];
        const label = group.titleMdxText ?? '?';
        const permalink = this.workspace.getPagePermalink(group.id);
        assert(permalink !== undefined && permalink.length > 1);
        lines.push('');
        lines.push('<TreeTableRow');
        lines.push(`  itemLabel="${label}"`);
        lines.push(`  itemLink="${permalink}"`);
        lines.push(`  depth="${depth}">`);
        if (group.briefDescriptionMdxText !== undefined && group.briefDescriptionMdxText.length > 0) {
            lines.push(group.briefDescriptionMdxText.replace(/[.]$/, ''));
        }
        lines.push('</TreeTableRow>');
        if (group.children.length > 0) {
            for (const childGroup of group.children) {
                lines.push(...this.generateIndexMdxFileRecursively(childGroup, depth + 1));
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
        this.sidebarLabel = compoundDef.title ?? '?';
        this.indexName = this.sidebarLabel;
        this.pageTitle = `The ${this.sidebarLabel} Reference`;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `groups/${sanitizedPath}`;
        this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`;
        if (compoundDef.sectionDefs !== undefined) {
            for (const sectionDef of compoundDef.sectionDefs) {
                if (sectionDef.hasMembers()) {
                    this.sections.push(new Section(this, sectionDef));
                }
            }
        }
        // console.log('1', this.compoundName, this.titleMdxText)
        // console.log('2', this.relativePermalink)
        // console.log('3', this.docusaurusId)
        // console.log('4', this.sidebarLabel)
        // console.log('4', this.indexName)
        // console.log()
    }
    // --------------------------------------------------------------------------
    renderToMdxLines(frontMatter) {
        const lines = [];
        const descriptionTodo = `@defgroup ${escapeMdx(this.compoundName)}`;
        const hasIndices = (this.renderDetailedDescriptionToMdxLines !== undefined || this.hasSect1InDescription) && (this.hasInnerIndices() || this.hasSections());
        const morePermalink = hasIndices ? '#details' : undefined;
        lines.push(this.renderBriefDescriptionToMdxText({
            briefDescriptionMdxText: this.briefDescriptionMdxText,
            todo: descriptionTodo,
            morePermalink
        }));
        lines.push(...this.renderInnerIndicesToMdxLines({
            suffixes: ['Groups', 'Classes']
        }));
        lines.push(...this.renderSectionIndicesToMdxLines());
        // if (this.hasSect1InDescription) {
        //   lines.push('')
        //   lines.push('<Link id="#details" />')
        // }
        lines.push(...this.renderDetailedDescriptionToMdxLines({
            briefDescriptionMdxText: this.briefDescriptionMdxText,
            detailedDescriptionMdxText: this.detailedDescriptionMdxText,
            todo: descriptionTodo,
            showHeader: !this.hasSect1InDescription,
            showBrief: !this.hasSect1InDescription
        }));
        lines.push(...this.renderSectionsToMdxLines());
        return lines;
    }
}
// ----------------------------------------------------------------------------
