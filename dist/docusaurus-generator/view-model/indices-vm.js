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
import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
import { Namespace } from './namespaces-vm.js';
// ----------------------------------------------------------------------------
export class IndexEntryBase {
    constructor(entry) {
        /** @brief The short name shown in the left part of the index lines. */
        this.name = '???';
        /** @brief The full name, used internally as the second sort criteria. */
        this.longName = '???';
        /**
         * @brief The compound or member kind.
         *
         * @details
         * classes: `class`, `struct`, `union`
         * namespaces: `namespace`
         * members: `function`, `variable`, `typedef`, `enum`, ...
         * enumvalue: `enumvalue`
         * */
        this.kind = '???';
        /** @brief displayed outside the link */
        this.linkKind = '';
        /** @brief The name of the linked target object. */
        this.linkName = '???';
        if (entry instanceof Class) {
            this.id = entry.id;
            // this.name = entry.unqualifiedName
            this.name = entry.collection.workspace.renderString(entry.treeEntryName, 'html');
            this.longName = entry.fullyQualifiedName;
            // console.log(this.name, '    |   ', entry.indexName, entry.unqualifiedName, entry.fullyQualifiedName, entry.compoundName, entry.classFullName)
            this.kind = entry.kind; // class, struct, union
            this.linkKind = entry.kind;
            this.linkName = entry.fullyQualifiedName;
            this.permalink = entry.collection.workspace.getPermalink({
                refid: entry.id,
                kindref: 'compound'
            });
        }
        else if (entry instanceof Namespace) {
            this.id = entry.id;
            this.name = entry.treeEntryName;
            this.longName = entry.unqualifiedName;
            this.kind = entry.kind; // namespace
            this.linkKind = entry.kind;
            this.linkName = entry.treeEntryName;
            this.permalink = entry.collection.workspace.getPermalink({
                refid: entry.id,
                kindref: 'compound'
            });
        }
        else if (entry instanceof Member) {
            this.id = entry.id;
            this.name = entry.name;
            this.longName = entry.qualifiedName ?? '???';
            this.kind = entry.kind;
            this.permalink = entry.section.compound.collection.workspace.getPermalink({
                refid: entry.id,
                kindref: 'member'
            });
            if (this.kind === 'function') {
                this.name += '()';
            }
        }
        else if (entry instanceof EnumValue) {
            this.id = entry.id;
            this.name = entry.name;
            this.longName = entry.name;
            this.kind = 'enumvalue';
            this.permalink = entry.member.section.compound.collection.workspace.getPermalink({
                refid: entry.id,
                kindref: 'member'
            });
        }
        else {
            this.id = '???';
            // Fallback for unknown object types.
            console.error('object type', typeof entry, 'not supported in', this.constructor.name);
        }
    }
}
export class ClassIndexEntry extends IndexEntryBase {
    constructor(entry, classs) {
        super(entry);
        this.linkKind = classs.kind;
        this.linkName = classs.classFullName;
        // console.log(this)
    }
}
export class NamespaceIndexEntry extends IndexEntryBase {
    constructor(entry, namespace) {
        super(entry);
        this.linkKind = 'namespace';
        this.linkName = namespace.compoundName;
        // console.log(this)
    }
}
export class FileIndexEntry extends IndexEntryBase {
    constructor(entry, file) {
        super(entry);
        this.linkKind = 'file';
        this.linkName = file.relativePath;
        // console.log(this)
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indices-vm.js.map