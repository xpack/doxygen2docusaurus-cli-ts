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
import type { File } from './files-and-folders-vm.js'
import { sanitizeAnonymousNamespace } from '../utils.js'

// ----------------------------------------------------------------------------

export class TreeEntryBase {
  /** @brief The short name shown in the left part of the index lines. */
  name = '???'
  /** @brief The full name, used internally as the second sort criteria. */
  longName = '???'

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
  kind = '???'

  /** @brief displayed outside the link */
  linkKind = ''

  /** @brief The name of the linked target object. */
  linkName = '???'

  /**
   * @brief The short name of the linked target object,
   * to be compared with name.
   */
  comparableLinkName = ''

  /** @brief The URL of the target object, including the anchor. */
  permalink?: string | undefined

  constructor(entry: Class | Namespace | Member | EnumValue) {
    if (entry instanceof Class) {
      const { id, collection, treeEntryName, fullyQualifiedName, kind } = entry
      this.id = id

      // this.name = entry.unqualifiedName
      this.name = collection.workspace.renderString(treeEntryName, 'html')
      this.longName = fullyQualifiedName
      // console.log(this.name, '    |   ', entry.indexName,
      // entry.unqualifiedName, entry.fullyQualifiedName, entry.compoundName,
      // entry.classFullName)

      this.kind = kind // class, struct, union

      this.linkKind = kind
      this.linkName = fullyQualifiedName

      this.permalink = collection.workspace.getPermalink({
        refid: id,
        kindref: 'compound',
      })
    } else if (entry instanceof Namespace) {
      const { id, treeEntryName, unqualifiedName, kind, collection } = entry
      this.id = id
      this.name = treeEntryName
      this.longName = unqualifiedName

      this.kind = kind // namespace

      this.linkKind = kind
      this.linkName = treeEntryName
      this.permalink = collection.workspace.getPermalink({
        refid: id,
        kindref: 'compound',
      })
    } else if (entry instanceof Member) {
      const { id, name, qualifiedName, kind, section } = entry
      this.id = id
      this.name = name
      this.longName = qualifiedName ?? '???'

      this.kind = kind

      this.permalink = section.compound.collection.workspace.getPermalink({
        refid: id,
        kindref: 'member',
      })
      if (this.kind === 'function') {
        this.name += '()'
      }
    } else if (entry instanceof EnumValue) {
      const { id, name, member } = entry
      this.id = id
      this.name = name
      this.longName = name

      this.kind = 'enumvalue'

      this.permalink =
        member.section.compound.collection.workspace.getPermalink({
          refid: id,
          kindref: 'member',
        })
    } else {
      this.id = '???'
      // Fallback for unknown object types.
      console.error(
        'object type',
        typeof entry,
        'not supported in',
        this.constructor.name
      )
    }
  }
}

export class ClassTreeEntry extends TreeEntryBase {
  constructor(entry: Class | Member | EnumValue, clazz: Class) {
    super(entry)

    const { kind, classFullName, collection, treeEntryName } = clazz
    this.linkKind = kind
    this.linkName = classFullName
    this.comparableLinkName = collection.workspace.renderString(
      treeEntryName,
      'html'
    )

    // console.log(this)
  }
}

export class NamespaceTreeEntry extends TreeEntryBase {
  constructor(
    entry: Namespace | Class | Member | EnumValue,
    namespace: Namespace
  ) {
    super(entry)

    this.linkKind = 'namespace'
    this.linkName = sanitizeAnonymousNamespace(namespace.compoundName)
    const { treeEntryName } = namespace
    this.comparableLinkName = treeEntryName
    // console.log(this)
  }
}

export class FileTreeEntry extends TreeEntryBase {
  constructor(entry: Namespace | Class | Member | EnumValue, file: File) {
    super(entry)

    this.linkKind = 'file'
    const { relativePath } = file
    this.linkName = relativePath

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------
