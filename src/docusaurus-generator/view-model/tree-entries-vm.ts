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

import { Class } from './classes-vm.js'
import { EnumValue, Member } from './members-vm.js'
import { Namespace } from './namespaces-vm.js'
import { File } from './files-and-folders-vm.js'
import { sanitizeAnonymousNamespace } from '../utils.js'

// ----------------------------------------------------------------------------

export class TreeEntryBase {
  /** @brief The short name shown in the left part of the index lines. */
  name: string = '???'
  /** @brief The full name, used internally as the second sort criteria. */
  longName: string = '???'

  /** @brief The internal id, used to compute the permalink. */
  id: string

  /**
   * @brief The compound or member kind.
   *
   * @details
   * classes: `class`, `struct`, `union`
   * namespaces: `namespace`
   * members: `function`, `variable`, `typedef`, `enum`, ...
   * enumvalue: `enumvalue`
   * */
  kind: string = '???'

  /** @brief displayed outside the link */
  linkKind: string = ''

  /** @brief The name of the linked target object. */
  linkName: string = '???'

  /** @brief The URL of the target object, including the anchor. */
  permalink?: string | undefined

  constructor (entry: Class | Namespace | Member | EnumValue) {
    if (entry instanceof Class) {
      this.id = entry.id

      // this.name = entry.unqualifiedName
      this.name = entry.collection.workspace.renderString(entry.treeEntryName, 'html')
      this.longName = entry.fullyQualifiedName
      // console.log(this.name, '    |   ', entry.indexName, entry.unqualifiedName, entry.fullyQualifiedName, entry.compoundName, entry.classFullName)

      this.kind = entry.kind // class, struct, union

      this.linkKind = entry.kind
      this.linkName = entry.fullyQualifiedName

      this.permalink = entry.collection.workspace.getPermalink({
        refid: entry.id,
        kindref: 'compound'
      })
    } else if (entry instanceof Namespace) {
      this.id = entry.id
      this.name = entry.treeEntryName
      this.longName = entry.unqualifiedName

      this.kind = entry.kind // namespace

      this.linkKind = entry.kind
      this.linkName = entry.treeEntryName
      this.permalink = entry.collection.workspace.getPermalink({
        refid: entry.id,
        kindref: 'compound'
      })
    } else if (entry instanceof Member) {
      this.id = entry.id
      this.name = entry.name
      this.longName = entry.qualifiedName ?? '???'

      this.kind = entry.kind

      this.permalink = entry.section.compound.collection.workspace.getPermalink({
        refid: entry.id,
        kindref: 'member'
      })
      if (this.kind === 'function') {
        this.name += '()'
      }
    } else if (entry instanceof EnumValue) {
      this.id = entry.id
      this.name = entry.name
      this.longName = entry.name

      this.kind = 'enumvalue'

      this.permalink = entry.member.section.compound.collection.workspace.getPermalink({
        refid: entry.id,
        kindref: 'member'
      })
    } else {
      this.id = '???'
      // Fallback for unknown object types.
      console.error('object type', typeof entry, 'not supported in', this.constructor.name)
    }
  }
}

export class ClassTreeEntry extends TreeEntryBase {
  constructor (entry: Class | Member | EnumValue, classs: Class) {
    super(entry)

    this.linkKind = classs.kind
    this.linkName = classs.classFullName

    // console.log(this)
  }
}

export class NamespaceTreeEntry extends TreeEntryBase {
  constructor (entry: Namespace | Class | Member | EnumValue, namespace: Namespace) {
    super(entry)

    this.linkKind = 'namespace'
    this.linkName = sanitizeAnonymousNamespace(namespace.compoundName)

    // console.log(this)
  }
}

export class FileTreeEntry extends TreeEntryBase {
  constructor (entry: Namespace | Class | Member | EnumValue, file: File) {
    super(entry)

    this.linkKind = 'file'
    this.linkName = file.relativePath

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------
