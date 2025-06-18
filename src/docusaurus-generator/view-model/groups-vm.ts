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

import * as util from 'node:util'
import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import path from 'node:path'

import { CompoundBase } from './compound-base-vm.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CollectionBase } from './collection-base.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { collapsibleTableRow, FrontMatter } from '../types.js'
import { Pages } from './pages-vm.js'

// Support for collapsible tables is experimental.
const useCollapsibleTable = false

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

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const group = new Group(this, compoundDef)
    this.collectionCompoundsById.set(group.id, group)

    return group
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // Recreate groups hierarchies.
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
    for (const [groupId, group] of this.collectionCompoundsById) {
      if (group.parent === undefined) {
        // console.log('topGroupId:', groupId)
        this.topLevelGroups.push(group)
      }
    }
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (): SidebarItem[] {
    const sidebarItems: SidebarItem[] = []

    for (const topLevelGroup of this.topLevelGroups) {
      const item = this.createSidebarItemRecursively(topLevelGroup)
      if (item !== undefined) {
        sidebarItems.push(item)
      }
    }

    return sidebarItems
  }

  private createSidebarItemRecursively (group: Group): SidebarItem | undefined {
    if (group.sidebarLabel === undefined) {
      return undefined
    }

    if (group.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: group.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: group.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${group.docusaurusId}`
        },
        collapsed: true,
        items: []
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

  override createMenuItems (): MenuItem[] {
    const menuItems: MenuItem[] = []
    for (const topLevelGroup of this.topLevelGroups) {
      const menuItem: MenuItem = {
        label: `${topLevelGroup.sidebarLabel}`,
        to: `${this.workspace.menuBaseUrl}${topLevelGroup.relativePermalink}/`
      }
      menuItems.push(menuItem)
    }

    return menuItems
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    if (this.topLevelGroups.length === 0) {
      return
    }

    // Home page for the API reference.
    // It diverts from Doxygen, since it renders the list of topics and
    // the main page.
    const outputFolderPath = this.workspace.outputFolderPath
    const filePath = `${outputFolderPath}index.md`
    const jsonFileName = 'index-table.json'

    if (useCollapsibleTable) {
      const jsonFilePath = `${outputFolderPath}${jsonFileName}`

      const tableData: collapsibleTableRow[] = []

      for (const group of this.topLevelGroups) {
        tableData.push(this.generateTableRowRecursively(group))
      }
      const jsonString = JSON.stringify(tableData, null, 2)

      console.log(`Writing groups index table file ${jsonFilePath}...`)

      await fs.mkdir(path.dirname(jsonFilePath), { recursive: true })
      const fileHandle = await fs.open(jsonFilePath, 'ax')

      await fileHandle.write(jsonString)
      await fileHandle.close()
    }

    const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
    const permalink = '' // The root of the API sub-site.

    // This is the top index.md file (@mainpage)
    const frontMatter: FrontMatter = {
      title: `${projectBrief} API Reference`,
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'reference']
    }

    // const docusaurusGenerator = this.pageGenerators.get('group')
    // assert(docusaurusGenerator !== undefined)
    // const bodyText = await docusaurusGenerator.renderIndexMdx()

    const lines: string[] = []

    lines.push(`${projectBrief} topics with brief descriptions are:`)

    lines.push('')
    if (useCollapsibleTable) {
      lines.push('<CollapsibleTreeTable rows={tableData} />')
    } else {
      lines.push('<table class="doxyTreeTable">')

      for (const group of this.topLevelGroups) {
        lines.push(...this.generateIndexMdxFileRecursively(group, 1))
      }

      lines.push('')
      lines.push('</table>')
    }

    const pages = this.workspace.viewModel.get('pages') as Pages
    const detailedDescriptionMdxText = pages.mainPage?.detailedDescriptionLines
    if (detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) {
      lines.push('')
      assert(pages.mainPage !== undefined)
      lines.push(...pages.mainPage?.renderDetailedDescriptionToLines({
        briefDescriptionString: pages.mainPage?.briefDescriptionString,
        detailedDescriptionLines: pages.mainPage?.detailedDescriptionLines,
        showHeader: true,
        showBrief: !pages.mainPage?.hasSect1InDescription
      }))
    }

    lines.push('')
    lines.push(':::note')
    lines.push('For comparison, the original Doxygen html pages, styled with the <a href="https://jothepro.github.io/doxygen-awesome-css/">doxygen-awesome-css</a> plugin, continue to be available via the <a href="pathname:///doxygen/topics.html"><code>.../doxygen/*.html</b></code> URLs.')
    lines.push(':::')

    console.log(`Writing groups index file ${filePath}...`)

    if (useCollapsibleTable) {
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        frontMatterCodeLines: [
          `import tableData from './${jsonFileName}'`
        ],
        bodyLines: lines
      })
    } else {
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }
  }

  private generateTableRowRecursively (group: Group): collapsibleTableRow {
    const label = group.titleMdxText ?? '?'

    const permalink = this.workspace.getPagePermalink(group.id)
    assert(permalink !== undefined && permalink.length > 1)

    const description: string = group.briefDescriptionString?.replace(/[.]$/, '') ?? ''

    const tableRow: collapsibleTableRow = {
      id: group.id,
      label,
      link: permalink,
      description
    }

    if (group.children.length > 0) {
      tableRow.children = []
      for (const childGroup of group.children) {
        tableRow.children.push(this.generateTableRowRecursively(childGroup as Group))
      }
    }

    return tableRow
  }

  private generateIndexMdxFileRecursively (group: Group, depth: number): string[] {
    const lines: string[] = []

    const label = group.titleMdxText ?? '?'

    const permalink = this.workspace.getPagePermalink(group.id)
    assert(permalink !== undefined && permalink.length > 1)

    let description: string = ''
    if (group.briefDescriptionString !== undefined && group.briefDescriptionString.length > 0) {
      description = group.briefDescriptionString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToLines({
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    if (group.children.length > 0) {
      for (const childGroup of group.children) {
        lines.push(...this.generateIndexMdxFileRecursively(childGroup as Group, depth + 1))
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Group extends CompoundBase {
  constructor (collection: Groups, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Group.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerGroups)) {
      for (const ref of compoundDef.innerGroups) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // The group title must be short.
    this.sidebarLabel = compoundDef.title ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel} Reference`

    const sanitizedPath = sanitizeHierarchicalPath(this.compoundName)
    this.relativePermalink = `groups/${sanitizedPath}`

    this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`

    this.createSections()

    // console.log('0', this.id)
    // console.log('1', this.compoundName, this.titleMdxText)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@defgroup ${escapeMdx(this.compoundName)}`

    const hasIndices = (this.renderDetailedDescriptionToLines !== undefined || this.hasSect1InDescription) && (this.hasInnerIndices() || this.hasSections())
    const morePermalink = hasIndices ? '#details' : undefined

    lines.push(this.renderBriefDescriptionToString({
      briefDescriptionString: this.briefDescriptionString,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Groups', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToLines({
      briefDescriptionString: this.briefDescriptionString,
      detailedDescriptionLines: this.detailedDescriptionLines,
      todo: descriptionTodo,
      showHeader: !this.hasSect1InDescription,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
