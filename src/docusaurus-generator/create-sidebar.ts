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

import assert from 'assert'
import { DocusaurusGenerator } from './index.js'
import { SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../plugin/types.js'

// ----------------------------------------------------------------------------

export class Sidebar {
  generator: DocusaurusGenerator
  idPrefix = 'api/'

  constructor (generator: DocusaurusGenerator) {
    this.generator = generator
  }

  createItems (): SidebarItem[] {
    const sidebarItems: SidebarItem[] = []
    const generator = this.generator

    if (generator.groups.topLevelGroupIds.length > 0) {
      for (const id of generator.groups.topLevelGroupIds) {
        sidebarItems.push(this.createGroupItemRecursively(id))
      }
    }

    if (generator.namespaces.topLevelNamespaceIds.length > 0) {
      for (const id of generator.namespaces.topLevelNamespaceIds) {
        sidebarItems.push(this.createNamespaceItemRecursively(id))
      }
    }

    return sidebarItems
  }

  createGroupItemRecursively (id: string): SidebarItem {
    const group = this.generator.groups.membersById.get(id)
    assert(group !== undefined)
    const compoundDef = group.compoundDef
    assert(compoundDef.title !== undefined)
    const label = compoundDef.title
    const curedName: string = compoundDef.compoundName.replaceAll(/[^a-zA-Z0-9-]/g, '-')
    assert(compoundDef.title !== undefined && compoundDef.title)
    if (group.childrenGroupsIds.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label,
        id: `${this.idPrefix}groups/${curedName}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label,
        link: {
          type: 'doc',
          id: `${this.idPrefix}groups/${curedName}`
        },
        collapsed: true,
        items: []
      }
      for (const childId of group.childrenGroupsIds) {
        categoryItem.items.push(this.createGroupItemRecursively(childId))
      }
      return categoryItem
    }
  }

  createNamespaceItemRecursively (id: string): SidebarItem {
    const namespace = this.generator.namespaces.membersById.get(id)
    assert(namespace !== undefined)
    const compoundDef = namespace.compoundDef
    const label = namespace.unparentedName
    const curedName: string = compoundDef.compoundName.replaceAll('::', '-').replaceAll(/[^a-zA-Z0-9-]/g, '-')
    if (namespace.childrenNamespaceIds.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label,
        id: `${this.idPrefix}namespaces/${curedName}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label,
        link: {
          type: 'doc',
          id: `${this.idPrefix}namespaces/${curedName}`
        },
        collapsed: true,
        items: []
      }
      for (const childId of namespace.childrenNamespaceIds) {
        categoryItem.items.push(this.createNamespaceItemRecursively(childId))
      }
      return categoryItem
    }
  }
}
// ----------------------------------------------------------------------------
