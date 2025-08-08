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
/**
 * Manages the collection of group documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of group-based documentation,
 * including nested group hierarchies, sidebar generation, and index
 * file creation. Groups provide a way to organise related documentation
 * elements beyond the natural file and namespace structure.
 *
 * @public
 */
export class Groups extends CollectionBase {
    // compoundsById: Map<string, Group>
    /**
     * Array of top-level groups without parent groups.
     *
     * @remarks
     * Contains groups that are not nested within other groups,
     * used for organising hierarchical displays and group trees.
     */
    topLevelGroups = [];
    // --------------------------------------------------------------------------
    // constructor (workspace: Workspace) {
    //   super(workspace)
    //   // this.compoundsById = new Map()
    // }
    // --------------------------------------------------------------------------
    /**
     * Adds a group compound to the collection.
     *
     * @remarks
     * Creates a new Group instance from the compound definition and registers
     * it in the collection for later processing and hierarchy creation.
     *
     * @param compoundDef - The compound definition for the group
     * @returns The created Group instance
     */
    addChild(compoundDef) {
        const group = new Group(this, compoundDef);
        this.collectionCompoundsById.set(group.id, group);
        return group;
    }
    // --------------------------------------------------------------------------
    /**
     * Creates hierarchical relationships between group compounds.
     *
     * @remarks
     * Establishes parent-child relationships based on group nesting data,
     * building the group hierarchy tree and identifying top-level groups
     * that have no parent groups.
     */
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
    /**
     * Adds group sidebar items to the provided sidebar category.
     *
     * @remarks
     * Creates hierarchical sidebar navigation for groups, either as a "Topics"
     * category when multiple top-level groups exist, or as individual items
     * when only one top-level group is present.
     *
     * @param sidebarCategory - The sidebar category to populate with group items
     *
     * @public
     */
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
    /**
     * Creates sidebar items recursively for group hierarchies.
     *
     * @remarks
     * Generates appropriate sidebar structure based on group nesting, creating
     * document items for leaf groups and category items for groups with children.
     * This method builds the hierarchical navigation structure.
     *
     * @param group - The group to create a sidebar item for
     * @returns The created sidebar item, or undefined if the group is not
     *   displayable
     *
     * @private
     */
    createSidebarItemRecursively(group) {
        if (group.sidebarLabel === undefined || group.sidebarId === undefined) {
            return undefined;
        }
        if (group.children.length === 0) {
            const docItem = {
                type: 'doc',
                label: group.sidebarLabel,
                id: `${this.workspace.sidebarBaseId}${group.sidebarId}`,
            };
            return docItem;
        }
        else {
            const categoryItem = {
                type: 'category',
                label: group.sidebarLabel,
                link: {
                    type: 'doc',
                    id: `${this.workspace.sidebarBaseId}${group.sidebarId}`,
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
    /**
     * Creates navbar items for group navigation.
     *
     * @remarks
     * Generates appropriate navbar entries based on the number of top-level
     * groups. Creates a "Topics" navigation item when multiple groups exist,
     * or a direct link to the single group when only one is present.
     *
     * @returns Array of navbar items for group navigation
     *
     * @public
     */
    createNavbarItems() {
        if (this.topLevelGroups.length > 1) {
            const navbarItem = {
                label: 'Topics',
                to: `${this.workspace.menuBaseUrl}groups/`,
            };
            return [navbarItem];
        }
        else {
            const topLevelGroup = this.topLevelGroups[0];
            assert(topLevelGroup.sidebarLabel !== undefined);
            assert(topLevelGroup.relativePermalink !== undefined);
            const navbarItem = {
                label: topLevelGroup.sidebarLabel,
                to: `${this.workspace.menuBaseUrl}${topLevelGroup.relativePermalink}/`,
            };
            return [navbarItem];
        }
    }
    // --------------------------------------------------------------------------
    /**
     * Generates the main groups index Markdown file.
     *
     * @remarks
     * Creates a comprehensive index file for topics when multiple top-level
     * groups exist. The index includes a hierarchical tree table showing
     * all groups with their descriptions and navigation links.
     *
     * @public
     */
    async generateIndexDotMdFile() {
        if (this.topLevelGroups.length <= 1) {
            return;
        }
        const filePath = this.workspace.outputFolderPath + 'indices/groups/index.md';
        const permalink = 'groups';
        const frontMatter = {
            title: 'Topics',
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
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
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
    /**
     * Generates a topics table for embedding in other documentation.
     *
     * @remarks
     * Creates an HTML tree table representation of all top-level groups with
     * their brief descriptions. This method is used to embed topic summaries
     * in main documentation pages or overview sections.
     *
     * @returns Array of HTML lines representing the topics table
     *
     * @public
     */
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
    /**
     * Recursively generates index content for group hierarchies.
     *
     * @remarks
     * Creates hierarchical HTML tree table rows for groups and their children,
     * including appropriate indentation and navigation links. This method
     * builds the complete nested structure for group documentation indices.
     *
     * @param group - The group to generate index content for
     * @param depth - The current nesting depth for indentation
     * @returns Array of HTML lines representing the group hierarchy
     *
     * @private
     */
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
/**
 * Represents a group compound for topic-based documentation organisation.
 *
 * @remarks
 * Groups provide a logical organisation method for related documentation
 * elements beyond the natural file and namespace structure. They support
 * hierarchical nesting and are commonly used for thematic documentation
 * organisation in complex projects.
 *
 * @public
 */
export class Group extends CompoundBase {
    /**
     * Initialises a new Group instance from compound definition data.
     *
     * @remarks
     * Processes the group metadata including nested group relationships,
     * title extraction, and permalink generation. Sets up the group for
     * integration into the documentation hierarchy and navigation structure.
     *
     * @param collection - The parent Groups collection
     * @param compoundDef - The compound definition containing group metadata
     *
     * @public
     */
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
        this.sidebarLabel =
            title !== undefined && title.length > 0
                ? title.trim().replace(/\.$/, '')
                : '???';
        const { sidebarLabel } = this;
        this.indexName = sidebarLabel;
        this.pageTitle = this.sidebarLabel;
        const sanitizedPath = sanitizeHierarchicalPath(this.compoundName);
        this.relativePermalink = `groups/${sanitizedPath}`;
        this.sidebarId = `groups/${flattenPath(sanitizedPath)}`;
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
    /**
     * Renders the group documentation to Markdown lines.
     *
     * @remarks
     * Generates comprehensive group documentation including brief description,
     * inner compound indices, section indices, detailed description, and
     * sections. The output follows Docusaurus conventions for topic pages
     * with appropriate navigation and content organisation.
     *
     * @param frontMatter - The front matter configuration for the page
     * @returns Array of Markdown lines representing the group documentation
     *
     * @public
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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