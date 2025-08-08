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

/**
 * Base class for tree entry objects used in hierarchical navigation.
 *
 * @remarks
 * Provides common functionality for entries that appear in tree-like
 * navigation structures, including index pages and hierarchical listings.
 * Handles name formatting, link generation, and sorting criteria.
 *
 * @public
 */
export class TreeEntryBase {
  /**
   * The short name shown in the left part of index lines.
   *
   * @remarks
   * Brief display name used for compact listings and navigation
   * structures where space is limited.
   */
  name = '???'

  /**
   * The full name used internally as the secondary sort criteria.
   *
   * @remarks
   * Complete qualified name used for precise sorting when multiple
   * entries have the same short name.
   */
  longName = '???'

  /**
   * The internal identifier used to compute the permalink.
   *
   * @remarks
   * Unique identifier that corresponds to the Doxygen compound or
   * member ID for generating navigation links.
   */
  id: string

  /**
   * The compound or member kind.
   *
   * @remarks
   * Indicates the type of documentation element this entry represents.
   * Examples include: 'class', 'struct', 'union', 'namespace', 'function',
   * 'variable', 'typedef', 'enum', 'enumvalue'.
   */
  kind = '???'

  /**
   * Kind label displayed outside the link.
   *
   * @remarks
   * Human-readable type description shown in index listings to help
   * users identify the nature of the linked element.
   */
  linkKind = ''

  /**
   * The name of the linked target object.
   *
   * @remarks
   * Display name used as the clickable text in navigation links,
   * typically formatted for user presentation.
   */
  linkName = '???'

  /**
   * The short name of the linked target object for comparison with name.
   *
   * @remarks
   * Simplified name used for determining when the entry name differs
   * from the link target name, enabling conditional display logic.
   */
  comparableLinkName = ''

  /**
   * The URL of the target object, including the anchor.
   *
   * @remarks
   * Complete permalink to the documentation page for this entry,
   * including any necessary anchor fragments for precise navigation.
   */
  permalink?: string | undefined

  /**
   * Creates a new tree entry from a compound or member object.
   *
   * @remarks
   * Initialises the tree entry by extracting relevant information from
   * the provided documentation object, setting up names, kinds, and
   * navigation properties based on the object type.
   *
   * @param entry - The documentation object to create an entry for
   */
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

/**
 * Tree entry specifically for class-type compounds in hierarchical views.
 *
 * @remarks
 * Extends the base tree entry functionality with class-specific formatting
 * and link generation. Handles proper display names and permalinks for
 * classes, structs, and unions in navigation structures.
 *
 * @public
 */
export class ClassTreeEntry extends TreeEntryBase {
  /**
   * Creates a new class tree entry.
   *
   * @remarks
   * Initialises the tree entry with class-specific information including
   * the full class name and appropriate link formatting for display
   * in hierarchical navigation structures.
   *
   * @param entry - The source entry object
   * @param clazz - The class object providing context
   */
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

/**
 * Tree entry specifically for namespace compounds in hierarchical views.
 *
 * @remarks
 * Extends the base tree entry functionality with namespace-specific
 * formatting and link generation. Handles anonymous namespace sanitisation
 * and proper display in navigation structures.
 *
 * @public
 */
export class NamespaceTreeEntry extends TreeEntryBase {
  /**
   * Creates a new namespace tree entry.
   *
   * @remarks
   * Initialises the tree entry with namespace-specific information,
   * including handling of anonymous namespaces and proper link
   * formatting for hierarchical display.
   *
   * @param entry - The source entry object
   * @param namespace - The namespace object providing context
   */
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

/**
 * Tree entry specifically for file compounds in hierarchical views.
 *
 * @remarks
 * Extends the base tree entry functionality with file-specific formatting
 * and link generation. Uses relative file paths for display and navigation
 * in file-based documentation structures.
 *
 * @public
 */
export class FileTreeEntry extends TreeEntryBase {
  /**
   * Creates a new file tree entry.
   *
   * @remarks
   * Initialises the tree entry with file-specific information using
   * the relative file path for display purposes in navigation structures.
   *
   * @param entry - The source entry object
   * @param file - The file object providing context
   */
  constructor(entry: Namespace | Class | Member | EnumValue, file: File) {
    super(entry)

    this.linkKind = 'file'
    const { relativePath } = file
    this.linkName = relativePath

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------
