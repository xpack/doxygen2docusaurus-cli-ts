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
// ----------------------------------------------------------------------------
export class IndexEntry {
    constructor(object) {
        if (object instanceof Class) {
            // console.log(object.kind, object.unqualifiedName)
            this.name = object.unqualifiedName;
            this.kind = object.kind;
            this.id = object.id;
            this.objectKind = 'compound';
            this.longName = object.fullyQualifiedName ?? '???';
            this.className = `${object.kind} ${object.fullyQualifiedName ?? '???'}`;
            this.permalink = object.collection.workspace.getPermalink({
                refid: object.id,
                kindref: 'compound'
            });
            // console.log(this.kind, this.name, this.longName, this.className)
        }
        else if (object instanceof Member) {
            // console.log(object.kind, object.name)
            this.name = object.name;
            this.kind = object.kind;
            this.objectKind = 'member';
            this.id = object.id;
            this.longName = object.qualifiedName ?? '???';
            this.className = `${object.section.compound.kind} ${object.section.compound.classFullName}`;
            this.permalink = object.section.compound.collection.workspace.getPermalink({
                refid: object.id,
                kindref: 'member'
            });
            if (this.kind === 'function') {
                this.name += '()';
                // this.longName += object.argsstring
                // console.log(object)
            }
            // console.log(this.kind, this.name, this.longName, this.className)
            // if (object.name === '_setSymbolName' || object.name === '_getPrevTok') {
            //   console.log(object.section.compound)
            // }
        }
        else if (object instanceof EnumValue) {
            this.name = object.name;
            this.kind = 'enumvalue';
            this.objectKind = 'enumvalue';
            this.id = object.id;
            this.longName = object.name;
            this.className = `${object.member.section.compound.kind} ${object.member.section.compound.classFullName}`;
            this.permalink = object.member.section.compound.collection.workspace.getPermalink({
                refid: object.id,
                kindref: 'member'
            });
            // console.log(this.name, this.id, object.member.id)
        }
        else {
            console.error('object type not supported in IndexEntry');
            this.name = '???';
            this.kind = '???';
            this.objectKind = '???';
            this.longName = '???';
            this.className = '???';
            // this.permalink = ''
            this.id = '???';
        }
        // console.log(this)
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indices-vm.js.map