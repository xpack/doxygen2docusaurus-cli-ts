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

import { CompoundBase } from './compound-base-vm.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../../docusaurus-generator/utils.js'
import { CollectionBase } from './collection-base.js'
import { Workspace } from '../workspace.js'
import { SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../../docusaurus-generator/types.js'

// ----------------------------------------------------------------------------

export class Groups extends CollectionBase {
  compoundsById: Map<string, Group>
  topLevelGroups: Group[] = []

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    super(workspace)

    this.compoundsById = new Map()
  }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const group = new Group(this, compoundDef)
    this.compoundsById.set(compoundDef.id, group)

    return group
  }

  // --------------------------------------------------------------------------

  override createHierarchies (): void {
    // Recreate groups hierarchies.
    for (const [groupId, group] of this.compoundsById) {
      for (const childGroupId of group.childrenIds) {
        const childGroup = this.compoundsById.get(childGroupId)
        assert(childGroup !== undefined)
        // console.log('groupId', childGroupId, 'has parent', groupId)
        childGroup.parent = group
        group.children.push(childGroup)
      }
    }

    // Create the top level groups list.
    for (const [groupId, group] of this.compoundsById) {
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
      sidebarItems.push(this.createSidebarItemRecursively(topLevelGroup))
    }

    return sidebarItems
  }

  private createSidebarItemRecursively (group: Group): SidebarItem {
    if (group.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: group.sidebarLabel,
        id: `${this.workspace.permalinkBaseUrl}${group.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: group.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.permalinkBaseUrl}${group.docusaurusId}`
        },
        collapsed: true,
        items: []
      }

      for (const childGroup of group.children) {
        categoryItem.items.push(this.createSidebarItemRecursively(childGroup as Group))
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    // Home page for the API reference.
    // It diverts from Doxygen, since it renders the list of topics and
    // the main page.
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath
    const filePath = `${outputFolderPath}/index.mdx`

    const projectBrief = this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
    const permalink = '' // The root of the API sub-site.

    const frontMatter: FrontMatter = {
      title: `${projectBrief} API Reference`,
      slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
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
    lines.push('<TreeTable>')

    for (const group of this.topLevelGroups) {
      lines.push(...this.generateIndexMdxRecursively(group, 1))
    }

    lines.push('')
    lines.push('</TreeTable>')

    lines.push('')
    lines.push('For comparison, Doxygen pages, styled with the [doxygen-awesome-css](https://jothepro.github.io/doxygen-awesome-css/) plugin, continue to be available via the <Link to="pathname:///doxygen/topics.html">/doxygen/*</Link> URLs.')

    console.log(`Writing groups index file ${filePath}...`)

    await this.workspace.writeFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxRecursively (group: Group, depth: number): string[] {
    const lines: string[] = []

    const compoundDef = group.compoundDef
    const label = escapeMdx(compoundDef.title?.trim() ?? '?')

    const permalink = this.workspace.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth="${depth}">`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (group.children.length > 0) {
      for (const childGroup of group.children) {
        lines.push(...this.generateIndexMdxRecursively(childGroup as Group, depth + 1))
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
    this.sidebarLabel = this.compoundDef.title ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel} Reference`

    const sanitizedPath = sanitizeHierarchicalPath(this.compoundDef.compoundName)
    this.relativePermalink = `groups/${sanitizedPath}`

    this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`

    // console.log('1', this.compoundDef.compoundName, this.compoundDef.title)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('4', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const descriptionTodo = `@defgroup ${compoundDef.compoundName}`

    lines.push(this.renderBriefDescriptionToMdxText({
      todo: descriptionTodo,
      morePermalink: '#details'
    }))

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Groups', 'Classes']
    }))

    lines.push(...this.renderSectionDefIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    }))

    lines.push(...this.renderSectionDefsToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
