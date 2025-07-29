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

import { CompoundBase } from './compound-base-vm.js'
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CollectionBase } from './collection-base.js'
import type {
  MenuItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  FrontMatter,
} from '../types.js'

// ----------------------------------------------------------------------------

export class Pages extends CollectionBase {
  // compoundsById: Map<string, Page>

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
    const page = new Page(this, compoundDef)
    this.collectionCompoundsById.set(page.id, page)

    if (page.id === 'indexpage') {
      this.workspace.mainPage = page
    }
    return page
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies(): void {
    // There are no pages hierarchies.
  }

  // --------------------------------------------------------------------------

  override addSidebarItems(sidebarCategory: SidebarCategory): void {
    // Add pages to the sidebar.
    // They are organised as a flat list, no hierarchies.
    const pagesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Pages',
      // There is no index page.
      collapsed: true,
      items: [],
    }

    for (const [pageId, page] of this.collectionCompoundsById) {
      if (
        this.workspace.options.renderPagesAtTop &&
        page instanceof Page &&
        page.isTopPage()
      ) {
        continue
      }

      if (pageId === 'indexpage') {
        continue
      }

      const { sidebarLabel } = page
      if (sidebarLabel === undefined || page.sidebarId === undefined) {
        continue
      }

      const id = this.workspace.sidebarBaseId + page.sidebarId
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: sidebarLabel,
        id,
      }

      pagesCategory.items.push(docItem)
    }

    if (pagesCategory.items.length > 0) {
      sidebarCategory.items.push(pagesCategory)
    }
  }

  createTopPagesSidebarItems(sidebarCategory: SidebarCategory): void {
    // Add pages to the sidebar.
    if (!this.workspace.options.renderPagesAtTop) {
      // Do not show pages to the top.
      return
    }

    for (const [pageId, page] of this.collectionCompoundsById) {
      // Skip special pages.
      if (
        pageId === 'indexpage' ||
        !(page instanceof Page && page.isTopPage())
      ) {
        continue
      }

      if (page.sidebarLabel === undefined || page.sidebarId === undefined) {
        continue
      }

      const docItem: SidebarDocItem = {
        type: 'doc',
        label: page.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${page.sidebarId}`,
      }

      sidebarCategory.items.push(docItem)
    }
  }

  // --------------------------------------------------------------------------

  override createMenuItems(): MenuItem[] {
    // Pages do not show on the menu.
    // Reference 'this' to satisfy the linter.
    return []
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdFile(): Promise<void> {
    // There is no pages index.
  }
}

// ----------------------------------------------------------------------------

export class Page extends CompoundBase {
  constructor(collection: Pages, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    const { title } = compoundDef
    assert(title !== undefined)
    this.sidebarLabel = title.trim().replace(/\.$/, '')

    const { sidebarLabel } = this
    this.indexName = sidebarLabel
    this.treeEntryName = sidebarLabel

    this.pageTitle = sidebarLabel

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundName)
    this.relativePermalink = `pages/${sanitizedPath}`

    this.sidebarId = `pages/${flattenPath(sanitizedPath)}`

    // SectionDefs for pages?
    assert(compoundDef.sectionDefs === undefined)

    // console.log('0', this.id)
    // console.log('1', this.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  isTopPage(): boolean {
    if (this.id === 'deprecated' || this.id === 'todo') {
      return false
    }
    return true
  }

  // --------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const morePermalink =
      this.detailedDescriptionHtmlLines !== undefined ? '#details' : undefined

    lines.push(
      this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        morePermalink,
      })
    )

    lines.push(...this.renderInnerIndicesToLines({}))

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        showHeader: false,
      })
    )

    lines.push(...this.renderSectionsToLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
