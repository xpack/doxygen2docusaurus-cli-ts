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
// import * as fs from 'node:fs/promises'
import assert from 'node:assert';
/**
 * Base class for managing collections of documentation compounds.
 *
 * @remarks
 * Provides common functionality for organising and managing different
 * types of documentation collections such as classes, namespaces, files,
 * and groups. Handles hierarchy creation, sidebar generation, and index
 * file creation.
 *
 * @public
 */
export class CollectionBase {
    /** The workspace instance providing global configuration and utilities. */
    workspace;
    /** Map storing compound instances indexed by their unique identifiers. */
    collectionCompoundsById;
    // --------------------------------------------------------------------------
    /**
     * Creates a new collection base instance.
     *
     * @remarks
     * Initialises the workspace reference and creates an empty map for
     * storing compound instances indexed by their identifiers.
     *
     * @param workspace - The workspace instance containing global configuration
     */
    constructor(workspace) {
        this.workspace = workspace;
        this.collectionCompoundsById = new Map();
    }
    /**
     * Generates index files organised by initial letters.
     *
     * @remarks
     * Optional method that can be overridden to create alphabetical
     * index pages when the collection is large enough to warrant
     * subdivision by initial letters.
     */
    async generatePerInitialsIndexMdFiles() {
        // Nothing at this level. Override it where needed.
    }
    /**
     * Determines whether the collection should appear in the sidebar.
     *
     * @remarks
     * Collections are visible in the sidebar when they contain at least
     * one compound. Empty collections are hidden to avoid clutter.
     *
     * @returns True if the collection has compounds and should be visible
     */
    isVisibleInSidebar() {
        return this.collectionCompoundsById.size > 0;
    }
    // --------------------------------------------------------------------------
    /**
     * Organises tree entries by their initial letters for alphabetical indexing.
     *
     * @remarks
     * Groups collection entries by their first letter to enable creation
     * of alphabetical index pages. Handles special characters like tildes
     * and ensures consistent lowercase grouping.
     *
     * @param entriesMap - Map of tree entries to organise
     * @returns Map grouping entries by their initial letters
     */
    orderPerInitials(entriesMap) {
        const entriesPerInitialsMap = new Map();
        for (const [, entry] of entriesMap) {
            const initial = entry.name
                .replace(/^[~]/, '')
                .charAt(0)
                .toLowerCase();
            if (initial.length > 0) {
                let mapArray = entriesPerInitialsMap.get(initial);
                if (mapArray === undefined) {
                    mapArray = [];
                    entriesPerInitialsMap.set(initial, mapArray);
                }
                mapArray.push(entry);
            }
        }
        const orderedMap = new Map();
        const orderedInitials = Array.from(entriesPerInitialsMap.keys()).sort();
        for (const initial of orderedInitials) {
            const unorderedArray = entriesPerInitialsMap.get(initial);
            assert(unorderedArray !== undefined);
            const orderedArray = unorderedArray.sort((a, b) => {
                let nameComparison = a.name
                    .replace(/^[~]/, '')
                    .localeCompare(b.name.replace(/^[~]/, ''), undefined, {
                    sensitivity: 'accent',
                });
                if (nameComparison !== 0) {
                    return nameComparison;
                }
                nameComparison = a.longName.localeCompare(b.longName, undefined, {
                    sensitivity: 'accent',
                });
                return nameComparison;
            });
            orderedMap.set(initial, orderedArray);
        }
        return orderedMap;
    }
    /**
     * Generates output entries for alphabetical index pages.
     *
     * @remarks
     * Creates formatted lists of entries organised by initial letters,
     * producing HTML markup suitable for inclusion in Markdown index
     * pages. Includes entry names, types, and navigation links.
     *
     * @param entriesPerInitialsMap - Map of entries grouped by initials
     * @returns Array of formatted output lines for the index
     */
    outputEntries(entriesPerInitialsMap) {
        const lines = [];
        let totalCount = 0;
        for (const initial of entriesPerInitialsMap.keys()) {
            lines.push('');
            lines.push(`## - ${initial.toUpperCase()} -`);
            lines.push('');
            lines.push('<ul>');
            const mapArray = entriesPerInitialsMap.get(initial);
            assert(mapArray !== undefined);
            for (const entry of mapArray) {
                const linkName = entry.linkName;
                const { name } = entry;
                const kind = entry.kind
                    .replace(/enumvalue/, 'enum value')
                    .replace(/define/, 'macro definition');
                let text = '';
                text += `<li><b>${name}</b>: `;
                text += 'as ';
                if (name !== entry.comparableLinkName) {
                    text += `${kind} `;
                    text += 'in ';
                }
                if (entry.linkKind.length > 0) {
                    text += entry.linkKind;
                    text += ' ';
                }
                if (entry.permalink !== undefined && entry.permalink.length > 0) {
                    text += `<a href="${entry.permalink}">${linkName}</a>`;
                }
                else {
                    text += linkName;
                }
                text += '</li>';
                lines.push(text);
            }
            lines.push('</ul>');
            if (mapArray.length > 1) {
                lines.push(`<p>${mapArray.length.toString()} entries</p>`);
            }
            totalCount += mapArray.length;
        }
        lines.push('<br/>');
        lines.push(`<p>Total: ${totalCount.toString()} entries.</p>`);
        return lines;
    }
    /**
     * Generates a filtered index file for a specific kind of entries.
     *
     * @remarks
     * Creates alphabetically organised index pages for specific entry types
     * within the collection. Applies filtering to include only relevant
     * entries, organises them by initial letters, and generates Markdown
     * files with proper frontmatter and navigation links.
     *
     * @param params - Object containing index file generation parameters
     * @param params.group - The collection group name for file organisation
     * @param params.fileKind - The specific kind of entries to include
     * @param params.title - The page title for the generated index
     * @param params.description - The descriptive text for the index page
     * @param params.map - Map of all available entries to filter from
     * @param params.filter - Function to determine which entries to include
     */
    async generateIndexFile({ group, fileKind, title, description, map, filter, }) {
        const filteredMap = new Map();
        for (const [id, entry] of map) {
            if (filter(entry.kind)) {
                filteredMap.set(id, entry);
            }
        }
        if (filteredMap.size === 0) {
            // There are no index entries.
            return;
        }
        if (!this.workspace.indicesMaps.has(group)) {
            // Add the empty set at the first usage.
            this.workspace.indicesMaps.set(group, new Set());
        }
        this.workspace.indicesMaps.get(group)?.add(fileKind);
        const orderedEntries = this.orderPerInitials(filteredMap);
        const { outputFolderPath } = this.workspace;
        const filePath = `${outputFolderPath}indices/${group}/${fileKind}.md`;
        const permalink = `indices/${group}/${fileKind}`;
        const frontMatter = {
            title,
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', group, 'index'],
        };
        const lines = [];
        lines.push(`<p>${description}</p>`);
        lines.push(...this.outputEntries(orderedEntries));
        if (this.workspace.options.verbose) {
            console.log(`Writing ${group} index file ${filePath}...`);
        }
        await this.workspace.writeOutputMdFile({
            filePath,
            frontMatter,
            bodyLines: lines,
        });
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=collection-base.js.map