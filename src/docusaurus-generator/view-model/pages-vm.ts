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
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CollectionBase } from './collection-base.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { Workspace } from '../workspace.js'
import { FrontMatter } from '../types.js'

// ----------------------------------------------------------------------------

export class Pages extends CollectionBase {
  // compoundsById: Map<string, Page>
  mainPage: Page | undefined

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const page = new Page(this, compoundDef)
    this.compoundsById.set(compoundDef.id, page)

    if (page.compoundDef.id === 'indexpage') {
      this.mainPage = page
    }

    return page
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // There are no pages hierarchies.
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (): SidebarItem[] {
    // Add pages to the sidebar.
    // They are organised as a flat list, no hierarchies.
    const pagesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Pages',
      // There is no index page.
      collapsed: true,
      items: []
    }

    for (const [pageId, page] of this.compoundsById) {
      const label: string = page.sidebarLabel
      const id: string = `${this.workspace.permalinkBaseUrl}${page.docusaurusId as string}`
      const docItem: SidebarDocItem = {
        type: 'doc',
        label,
        id
      }

      pagesCategory.items.push(docItem)
    }

    return [pagesCategory]
  }

  // --------------------------------------------------------------------------

  override createMenuItems (): MenuItem[] {
    // Pages do not show on the menu.
    return []
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    // There is no pages index.
  }
}

// ----------------------------------------------------------------------------

export class Page extends CompoundBase {
  constructor (collection: Pages, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    this.sidebarLabel = this.compoundDef.title ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel}`

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundDef.compoundName)
    this.relativePermalink = `pages/${sanitizedPath}`

    this.docusaurusId = `pages/${flattenPath(sanitizedPath)}`

    // SectionDefs for pages?
    assert(compoundDef.sectionDefs === undefined)

    // console.log('1', this.compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef

    lines.push(this.renderBriefDescriptionToMdxText({
      morePermalink: '#details'
    }))

    lines.push(...this.renderInnerIndicesToMdxLines({}))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      detailedDescription: compoundDef.detailedDescription,
      showHeader: false
    }))

    lines.push(...this.renderSectionsToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
