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
  NavbarItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  FrontMatter,
} from '../types.js'

// ----------------------------------------------------------------------------

/**
 * Manages documentation pages collection for the generated site.
 *
 * @remarks
 * Handles the organisation and generation of standalone documentation
 * pages that are not part of the main API reference, such as the
 * main project page and custom documentation pages.
 *
 * @public
 */
export class Pages extends CollectionBase {
  // compoundsById: Map<string, Page>

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  /**
   * Adds a page compound to the collection.
   *
   * @remarks
   * Creates a new Page instance from the compound definition and registers
   * it in the collection. Special handling is provided for the main index
   * page which becomes the workspace's main page.
   *
   * @param compoundDef - The compound definition for the page
   * @returns The created Page instance
   */
  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
    const page = new Page(this, compoundDef)
    this.collectionCompoundsById.set(page.id, page)

    if (page.id === 'indexpage') {
      this.workspace.mainPage = page
    }
    return page
  }

  // --------------------------------------------------------------------------

  /**
   * Creates hierarchical relationships between page compounds.
   *
   * @remarks
   * Pages do not have hierarchical relationships, so this method
   * performs no operations. Pages are organised as a flat collection.
   */
  override createCompoundsHierarchies(): void {
    // There are no pages hierarchies.
  }

  // --------------------------------------------------------------------------

  /**
   * Adds page items to the sidebar navigation structure.
   *
   * @remarks
   * Creates a "Pages" category in the sidebar and populates it with
   * page entries. Top-level pages may be excluded based on configuration
   * settings when they are displayed at the top of the sidebar.
   *
   * @param sidebarCategory - The main sidebar category to populate
   */
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
        this.workspace.options.listPagesAtTop &&
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

  /**
   * Creates sidebar items for top-level pages at the root level.
   *
   * @remarks
   * Conditionally adds page items directly to the main sidebar category
   * when the configuration option to display pages at the top is enabled.
   * This provides prominent placement for important pages outside the
   * standard pages category.
   *
   * @param sidebarCategory - The main sidebar category to populate
   */
  createTopPagesSidebarItems(sidebarCategory: SidebarCategory): void {
    // Add pages to the sidebar.
    if (!this.workspace.options.listPagesAtTop) {
      // Do not list pages at the top of the sidebar.
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

  /**
   * Creates navigation bar items for pages.
   *
   * @remarks
   * Pages do not appear in the navigation bar by design, so this method
   * returns an empty array. The workspace's main navigation is handled
   * by other compound types such as namespaces and classes.
   *
   * @returns An empty array as pages are not included in navigation
   */
  override createNavbarItems(): NavbarItem[] {
    // Pages do not show on the menu.
    // Reference 'this' to satisfy the linter.
    return []
  }

  // --------------------------------------------------------------------------

  /**
   * Generates index file for pages collection.
   *
   * @remarks
   * Pages do not have a dedicated index file as they are organised
   * as individual standalone documents. This method performs no
   * operations to maintain interface consistency.
   *
   * @returns Promise that resolves immediately
   */
  override async generateIndexDotMdFile(): Promise<void> {
    // There is no pages index.
  }
}

// ----------------------------------------------------------------------------

/**
 * Represents an individual documentation page in the generated site.
 *
 * @remarks
 * Handles standalone documentation pages that are not part of the main
 * API reference structure. Pages can include special content such as
 * the main project page, deprecated items, and custom documentation.
 * The class manages permalink generation, sidebar positioning, and
 * content rendering for these standalone documents.
 *
 * @public
 */
export class Page extends CompoundBase {
  /**
   * Initialises a new Page instance.
   *
   * @remarks
   * Constructs the page with appropriate labels, permalinks, and identifiers
   * based on the compound definition. The page title is derived from the
   * compound's title, and relative permalinks are generated using sanitised
   * paths to ensure valid URLs.
   *
   * @param collection - The parent pages collection
   * @param compoundDef - The compound definition containing page data
   */
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

  /**
   * Determines whether the page should be displayed at the top level.
   *
   * @remarks
   * Special pages such as 'deprecated' and 'todo' are excluded from
   * top-level display as they are considered auxiliary content.
   * All other pages are eligible for prominent placement.
   *
   * @returns True if the page should appear at the top level
   */
  isTopPage(): boolean {
    if (this.id === 'deprecated' || this.id === 'todo') {
      return false
    }
    return true
  }

  // --------------------------------------------------------------------------

  /**
   * Renders the page content to markdown lines.
   *
   * @remarks
   * Generates the complete page content including brief descriptions,
   * inner indices, section indices, detailed descriptions, and sections.
   * A 'more' permalink is provided when detailed descriptions are available
   * to enable navigation to the detailed content section.
   *
   * @param frontMatter - The front matter configuration for the page
   * @returns Array of markdown lines representing the complete page content
   */
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
