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
export class CollectionBase {
    // --------------------------------------------------------------------------
    constructor(workspace) {
        this.workspace = workspace;
        this.collectionCompoundsById = new Map();
    }
    async generatePerInitialsIndexMdFiles() {
        // Nothing at this level. Override it where needed.
    }
    hasCompounds() {
        return this.collectionCompoundsById.size > 0;
    }
    // --------------------------------------------------------------------------
    orderPerInitials(entriesMap) {
        const entriesPerInitialsMap = new Map();
        for (const [id, entry] of entriesMap) {
            const initial = entry.name.charAt(0).toLowerCase();
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
                let nameComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' });
                if (nameComparison !== 0) {
                    return nameComparison;
                }
                nameComparison = a.longName.localeCompare(b.longName, undefined, { sensitivity: 'accent' });
                return nameComparison;
            });
            orderedMap.set(initial, orderedArray);
        }
        return orderedMap;
    }
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
                const linkName = entry.linkName ?? '???';
                const name = entry.name;
                let text = '';
                text += `<li><b>${name}</b>: `;
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
                lines.push(`<p>${mapArray.length} entries</p>`);
            }
            totalCount += mapArray.length;
        }
        lines.push('<br/>');
        lines.push(`<p>Total: ${totalCount} entries.</p>`);
        return lines;
    }
    async generateIndexFile({ group, fileKind, title, description, map, filter }) {
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
        const outputFolderPath = this.workspace.outputFolderPath;
        const filePath = `${outputFolderPath}indices/${group}/${fileKind}.md`;
        const permalink = `indices/${group}/${fileKind}`;
        const frontMatter = {
            title,
            slug: `${this.workspace.slugBaseUrl}${permalink}`,
            // description: '...', // TODO
            custom_edit_url: null,
            keywords: ['doxygen', group, 'index']
        };
        const lines = [];
        lines.push(`<p>${description}</p>`);
        lines.push(...this.outputEntries(orderedEntries));
        if (this.workspace.pluginOptions.verbose) {
            console.log(`Writing ${group} index file ${filePath}...`);
        }
        await this.workspace.writeMdFile({
            filePath,
            frontMatter,
            bodyLines: lines
        });
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=collection-base.js.map