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
import { CollectionBase } from './collection-base.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { escapeHtml, escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { FrontMatter } from '../types.js'
import { Section } from './members-vm.js'

// ----------------------------------------------------------------------------

export class Namespaces extends CollectionBase {
  // compoundsById: Map<string, Namespace>
  topLevelNamespaces: Namespace[] = []

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const namespace = new Namespace(this, compoundDef)
    this.collectionCompoundsById.set(compoundDef.id, namespace)

    return namespace
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // Recreate namespaces hierarchies.
    for (const [namespaceId, namespace] of this.collectionCompoundsById) {
      for (const childNamespaceId of namespace.childrenIds) {
        const childNamespace = this.collectionCompoundsById.get(childNamespaceId)
        assert(childNamespace !== undefined)
        // console.log('namespaceId', childNamespaceId,'has parent', namespaceId)
        childNamespace.parent = namespace
        namespace.children.push(childNamespace)
      }
    }

    // Create the top level namespace list.
    for (const [namespaceId, namespace] of this.collectionCompoundsById) {
      if (namespace.parent === undefined) {
        this.topLevelNamespaces.push(namespace as Namespace)
      }
    }
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (): SidebarItem[] {
    // Add namespaces to the sidebar.
    // Top level namespaces are added below a Namespaces category.
    const namespacesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Namespaces',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}namespaces/index`
      },
      collapsed: true,
      items: []
    }

    for (const namespace of this.topLevelNamespaces) {
      namespacesCategory.items.push(this.createNamespaceItemRecursively(namespace))
    }

    return [namespacesCategory]
  }

  private createNamespaceItemRecursively (namespace: Namespace): SidebarItem {
    if (namespace.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: namespace.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: namespace.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${namespace.docusaurusId}`
        },
        collapsed: true,
        items: []
      }

      for (const childNamespace of namespace.children) {
        categoryItem.items.push(this.createNamespaceItemRecursively(childNamespace as Namespace))
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  override createMenuItems (): MenuItem[] {
    const menuItem: MenuItem = {
      label: 'Namespaces',
      to: `${this.workspace.menuBaseUrl}namespaces/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    const filePath = `${this.workspace.outputFolderPath}namespaces/index.mdx`
    const permalink = 'namespaces'

    const frontMatter: FrontMatter = {
      title: 'The Namespaces Reference',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'namespaces', 'reference']
    }

    const lines: string[] = []

    lines.push('The namespaces used by this project are:')

    lines.push('')
    lines.push('<TreeTable>')

    for (const namespace of this.topLevelNamespaces) {
      lines.push(...this.generateIndexMdxFileRecursively(namespace, 1))
    }

    lines.push('')
    lines.push('</TreeTable>')

    console.log(`Writing namespaces index file ${filePath}...`)
    await this.workspace.writeMdxFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxFileRecursively (namespace: Namespace, depth: number): string[] {
    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = escapeMdx(namespace.unqualifiedName)

    const permalink = this.workspace.getPagePermalink(namespace.id)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push('  itemIconLetter="N"')
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth="${depth}">`)

    if (namespace.briefDescriptionMdxText !== undefined && namespace.briefDescriptionMdxText.length > 0) {
      lines.push(namespace.briefDescriptionMdxText.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (namespace.children.length > 0) {
      for (const childNamespace of namespace.children) {
        lines.push(...this.generateIndexMdxFileRecursively(childNamespace as Namespace, depth + 1))
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Namespace extends CompoundBase {
  unqualifiedName: string = '?'

  constructor (collection: Namespaces, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Namespace.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerNamespaces)) {
      for (const ref of compoundDef.innerNamespaces) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // The compoundName is the fully qualified namespace name.
    // Keep only the last name.
    this.sidebarLabel = compoundDef.compoundName.replace(/.*::/, '').replace(/anonymous_namespace\{/, 'anonymous{')

    this.indexName = this.compoundName

    this.unqualifiedName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` Namespace Reference`

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundName.replaceAll('::', '/').replace(/anonymous_namespace\{/, 'anonymous{'))
    this.relativePermalink = `namespaces/${sanitizedPath}`

    this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`

    this.createSections()

    // console.log('1', this.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('4', this.indexName)
    // console.log()
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@namespace ${escapeMdx(this.compoundName)}`

    const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToMdxText({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push('')
    lines.push('## Definition')
    lines.push('')

    const dots = escapeHtml('{ ... }')
    if (this.compoundName.startsWith('anonymous_namespace{')) {
      lines.push(`<CodeBlock>namespace ${dots}</CodeBlock>`)
    } else {
      lines.push(`<CodeBlock>namespace ${escapeMdx(this.compoundName)} ${dots}</CodeBlock>`)
    }

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      detailedDescriptionMdxText: this.detailedDescriptionMdxText,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToMdxLines())

    lines.push(...this.renderGeneratedFromToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
