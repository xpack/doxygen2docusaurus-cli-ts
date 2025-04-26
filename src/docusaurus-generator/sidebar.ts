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

import assert from 'assert'

import { SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../plugin/types.js'
import { DocusaurusGenerator } from './index.js'

// ----------------------------------------------------------------------------

export class Sidebar {
  generator: DocusaurusGenerator
  idPrefix: string

  constructor (generator: DocusaurusGenerator) {
    this.generator = generator
    assert(this.generator.pluginOptions.outputFolderPath !== undefined)
    this.idPrefix = this.generator.pluginOptions.outputFolderPath.replace(/^docs[/]/, '') + '/'
  }

  createItems (): SidebarItem[] {
    const sidebarItems: SidebarItem[] = []
    const generator = this.generator

    // Add groups to the sidebar.
    // Top level groups are added directly to the top sidebar.
    if (generator.groups.topLevelGroupIds.length > 0) {
      for (const id of generator.groups.topLevelGroupIds) {
        sidebarItems.push(this.createGroupItemRecursively(id))
      }
    }

    if (generator.namespaces.topLevelNamespaceIds.length > 0) {
      // Add namespaces to the sidebar.
      // Top level namespaces are added below a Namespaces category.
      const namespacesCategory: SidebarCategoryItem = {
        type: 'category',
        label: 'Namespaces',
        link: {
          type: 'doc',
          id: 'api/namespaces/index'
        },
        collapsed: true,
        items: []
      }

      for (const id of generator.namespaces.topLevelNamespaceIds) {
        namespacesCategory.items.push(this.createNamespaceItemRecursively(id))
      }

      sidebarItems.push(namespacesCategory)
    }

    if (generator.classes.topLevelClassIds.length > 0) {
      // Add classes to the sidebar.
      // Top level classes are added below a Class category
      const classesCategory: SidebarCategoryItem = {
        type: 'category',
        label: 'Classes',
        link: {
          type: 'doc',
          id: 'api/classes/index'
        },
        collapsed: true,
        items: []
      }
      for (const id of generator.classes.topLevelClassIds) {
        classesCategory.items.push(this.createClassItemRecursively(id))
      }

      sidebarItems.push(classesCategory)
    }

    if (generator.folders.topLevelFolderIds.length > 0 || generator.files.topLevelFileIds.length > 0) {
      // Add folders & files to the sidebar.
      // Top level folders & files are added below a Files category
      const filesCategory: SidebarCategoryItem = {
        type: 'category',
        label: 'Files',
        link: {
          type: 'doc',
          id: 'api/folders/index'
        },
        collapsed: true,
        items: []
      }

      if (generator.folders.topLevelFolderIds.length > 0) {
        for (const id of generator.folders.topLevelFolderIds) {
          filesCategory.items.push(this.createFolderItemRecursively(id))
        }
      }
      if (generator.files.topLevelFileIds.length > 0) {
        for (const id of generator.files.topLevelFileIds) {
          filesCategory.items.push(this.createFileItem(id))
        }
      }

      sidebarItems.push(filesCategory)
    }

    if (generator.pages.membersById.size > 0) {
      const pagesCategory: SidebarCategoryItem = {
        type: 'category',
        label: 'Pages',
        collapsed: true,
        items: []
      }

      for (const [key, page] of generator.pages.membersById.entries()) {
        const label: string = page.compoundDef.title ?? key
        const id: string = `${this.idPrefix}pages/${key as string}`
        const docItem: SidebarDocItem = {
          type: 'doc',
          label,
          id
        }

        pagesCategory.items.push(docItem)
      }

      sidebarItems.push(pagesCategory)
    }

    return sidebarItems
  }

  createGroupItemRecursively (groupId: string): SidebarItem {
    const group = this.generator.groups.membersById.get(groupId)
    assert(group !== undefined)

    if (group.childrenIds.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: group.sidebarLabel,
        id: `${this.idPrefix}${group.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: group.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.idPrefix}${group.docusaurusId}`
        },
        collapsed: true,
        items: []
      }
      for (const childId of group.childrenIds) {
        categoryItem.items.push(this.createGroupItemRecursively(childId))
      }
      return categoryItem
    }
  }

  createNamespaceItemRecursively (namespaceId: string): SidebarItem {
    const namespace = this.generator.namespaces.membersById.get(namespaceId)
    assert(namespace !== undefined)

    if (namespace.childrenIds.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: namespace.sidebarLabel,
        id: `${this.idPrefix}${namespace.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: namespace.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.idPrefix}${namespace.docusaurusId}`
        },
        collapsed: true,
        items: []
      }
      for (const childId of namespace.childrenIds) {
        categoryItem.items.push(this.createNamespaceItemRecursively(childId))
      }
      return categoryItem
    }
  }

  createFolderItemRecursively (folderId: string): SidebarItem {
    const folder = this.generator.folders.membersById.get(folderId)
    assert(folder !== undefined)

    const categoryItem: SidebarCategoryItem = {
      type: 'category',
      label: folder.sidebarLabel,
      link: {
        type: 'doc',
        id: `${this.idPrefix}${folder.docusaurusId}`
      },
      collapsed: true,
      items: []
    }

    // Add the folders first.
    for (const childId of folder.childrenIds) {
      categoryItem.items.push(this.createFolderItemRecursively(childId))
    }

    // Then the files.
    for (const childId of folder.childrenFileIds) {
      categoryItem.items.push(this.createFileItem(childId))
    }

    return categoryItem
  }

  createFileItem (fileId: string): SidebarDocItem {
    const file = this.generator.files.membersById.get(fileId)
    assert(file !== undefined)

    const docItem: SidebarDocItem = {
      type: 'doc',
      label: file.sidebarLabel,
      id: `${this.idPrefix}${file.docusaurusId}`
    }
    return docItem
  }

  createClassItemRecursively (namespaceId: string): SidebarItem {
    const classs = this.generator.classes.membersById.get(namespaceId)
    assert(classs !== undefined)

    if (classs.childrenIds.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: classs.sidebarLabel,
        id: `${this.idPrefix}${classs.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: classs.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.idPrefix}${classs.docusaurusId}`
        },
        collapsed: true,
        items: []
      }
      for (const childId of classs.childrenIds) {
        categoryItem.items.push(this.createClassItemRecursively(childId))
      }
      return categoryItem
    }
  }
}

// ----------------------------------------------------------------------------
