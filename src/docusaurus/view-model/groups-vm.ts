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
import assert from 'node:assert'
// import * as fs from 'node:fs/promises'
// import path from 'node:path'

import { CompoundBase } from './compound-base-vm.js'
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CollectionBase } from './collection-base.js'
import type {
  MenuItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  SidebarItem,
  FrontMatter,
} from '../types.js'

// Support for collapsible tables is experimental.
// const useCollapsibleTable = false

// ----------------------------------------------------------------------------

export class Groups extends CollectionBase {
  // compoundsById: Map<string, Group>
  topLevelGroups: Group[] = []

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
    const group = new Group(this, compoundDef)
    this.collectionCompoundsById.set(group.id, group)

    return group
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies(): void {
    // Recreate groups hierarchies.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [groupId, group] of this.collectionCompoundsById) {
      for (const childGroupId of group.childrenIds) {
        const childGroup = this.collectionCompoundsById.get(childGroupId)
        assert(childGroup !== undefined)
        // console.log('groupId', childGroupId, 'has parent', groupId)
        childGroup.parent = group
        group.children.push(childGroup)
      }
    }

    // Create the top level groups list.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [groupId, group] of this.collectionCompoundsById) {
      if (group.parent === undefined) {
        // console.log('topGroupId:', groupId)
        this.topLevelGroups.push(group)
      }
    }
  }

  // --------------------------------------------------------------------------

  override addSidebarItems(sidebarCategory: SidebarCategory): void {
    const sidebarItems: SidebarItem[] = []

    for (const topLevelGroup of this.topLevelGroups) {
      const item = this.createSidebarItemRecursively(topLevelGroup)
      if (item !== undefined) {
        sidebarItems.push(item)
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
      })
    } else {
      sidebarCategory.items.push(...sidebarItems)
    }
  }

  private createSidebarItemRecursively(group: Group): SidebarItem | undefined {
    if (group.sidebarLabel === undefined) {
      return undefined
    }

    assert(group.docusaurusId !== undefined)
    if (group.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: group.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`,
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: group.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`,
        },
        collapsed: true,
        items: [],
      }

      for (const childGroup of group.children) {
        const item = this.createSidebarItemRecursively(childGroup as Group)
        if (item !== undefined) {
          categoryItem.items.push(item)
        }
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  override createMenuItems(): MenuItem[] {
    if (this.topLevelGroups.length > 1) {
      const menuItem: MenuItem = {
        label: 'Topics',
        to: `${this.workspace.menuBaseUrl}groups/`,
      }
      return [menuItem]
    } else {
      const topLevelGroup = this.topLevelGroups[0]
      assert(topLevelGroup.sidebarLabel !== undefined)
      assert(topLevelGroup.relativePermalink !== undefined)
      const menuItem: MenuItem = {
        label: topLevelGroup.sidebarLabel,
        to: `${this.workspace.menuBaseUrl}${topLevelGroup.relativePermalink}/`,
      }
      return [menuItem]
    }
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdFile(): Promise<void> {
    if (this.topLevelGroups.length <= 1) {
      return
    }

    const filePath = this.workspace.outputFolderPath + 'indices/groups/index.md'
    const permalink = 'groups'

    const frontMatter: FrontMatter = {
      title: 'Topics',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'topics', 'reference'],
    }

    const contentLines: string[] = []

    for (const group of this.topLevelGroups) {
      contentLines.push(...this.generateIndexMdFileRecursively(group, 1))
    }

    if (contentLines.length === 0) {
      return
    }

    const lines: string[] = []

    lines.push('The topics defined in this project are:')

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    if (this.workspace.options.verbose) {
      console.log(`Writing groups index file ${filePath}...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })
  }

  generateTopicsTable(): string[] {
    if (this.topLevelGroups.length === 0) {
      return []
    }

    const contentLines: string[] = []
    for (const group of this.topLevelGroups) {
      contentLines.push(...this.generateIndexMdFileRecursively(group, 1))
    }

    if (contentLines.length === 0) {
      return []
    }

    const lines: string[] = []

    const projectBrief =
      this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
    lines.push(`${projectBrief} topics with brief descriptions are:`)

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    return lines
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

  private generateIndexMdFileRecursively(
    group: Group,
    depth: number
  ): string[] {
    const lines: string[] = []

    const label = group.titleHtmlString ?? '???'

    const permalink = this.workspace.getPagePermalink(group.id)
    assert(permalink !== undefined && permalink.length > 0)

    let description = ''
    if (
      group.briefDescriptionHtmlString !== undefined &&
      group.briefDescriptionHtmlString.length > 0
    ) {
      description = group.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(
      ...this.workspace.renderTreeTableRowToHtmlLines({
        itemLabel: label,
        itemLink: permalink,
        depth,
        description,
      })
    )

    if (group.children.length > 0) {
      for (const childGroup of group.children) {
        lines.push(
          ...this.generateIndexMdFileRecursively(childGroup as Group, depth + 1)
        )
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Group extends CompoundBase {
  constructor(collection: Groups, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Group.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerGroups)) {
      for (const ref of compoundDef.innerGroups) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // The group title must be short.
    const { title } = compoundDef
    this.sidebarLabel =
      title !== undefined && title.length > 0
        ? title.trim().replace(/\.$/, '')
        : '???'

    const { sidebarLabel } = this
    this.indexName = sidebarLabel

    this.pageTitle = this.sidebarLabel

    const sanitizedPath = sanitizeHierarchicalPath(this.compoundName)
    this.relativePermalink = `groups/${sanitizedPath}`

    this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`

    this.createSections()

    // console.log('0', this.id)
    // console.log('1', this.compoundName, this.titleMdText)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@defgroup ${this.collection.workspace.renderString(
      this.compoundName,
      'html'
    )}`

    // const hasIndices =
    //   this.hasSect1InDescription &&
    //   (this.hasInnerIndices() || this.hasSections())
    let morePermalink = undefined
    if (this.hasInnerIndices() || this.hasSections()) {
      morePermalink = '#details'
    }

    lines.push(
      this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        todo: descriptionTodo,
        morePermalink,
      })
    )

    lines.push(
      ...this.renderInnerIndicesToLines({
        suffixes: ['Groups', 'Classes'],
      })
    )

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        todo: descriptionTodo,
        showHeader: !this.hasSect1InDescription,
        showBrief: this.hasInnerIndices() || this.hasSections(),
      })
    )

    lines.push(...this.renderSectionsToLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
