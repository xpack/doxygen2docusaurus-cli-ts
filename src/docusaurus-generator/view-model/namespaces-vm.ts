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
import { Workspace } from '../workspace.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { FrontMatter } from '../types.js'
import { Section } from './members-vm.js'

// ----------------------------------------------------------------------------

export class Namespaces extends CollectionBase {
  compoundsById: Map<string, Namespace>
  topLevelNamespaces: Namespace[] = []

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    super(workspace)

    this.compoundsById = new Map()
  }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const namespace = new Namespace(this, compoundDef)
    this.compoundsById.set(compoundDef.id, namespace)

    return namespace
  }

  // --------------------------------------------------------------------------

  override createHierarchies (): void {
    // Recreate namespaces hierarchies.
    for (const [namespaceId, namespace] of this.compoundsById) {
      for (const childNamespaceId of namespace.childrenIds) {
        const childNamespace = this.compoundsById.get(childNamespaceId)
        assert(childNamespace !== undefined)
        // console.log('namespaceId', childNamespaceId,'has parent', namespaceId)
        childNamespace.parent = namespace
        namespace.children.push(childNamespace)
      }
    }

    // Create the top level namespace list.
    for (const [namespaceId, namespace] of this.compoundsById) {
      if (namespace.parent === undefined) {
        this.topLevelNamespaces.push(namespace)
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
        id: `${this.workspace.permalinkBaseUrl}namespaces/index`
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
        id: `${this.workspace.permalinkBaseUrl}${namespace.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: namespace.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.permalinkBaseUrl}${namespace.docusaurusId}`
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
      to: `/${this.workspace.pluginOptions.outputFolderPath}/namespaces/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath
    const filePath = `${outputFolderPath}/namespaces/index.mdx`
    const permalink = 'namespaces'

    const frontMatter: FrontMatter = {
      title: 'The Namespaces Reference',
      slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'namespaces', 'reference']
    }

    const lines: string[] = []

    lines.push('The namespaces used by this project are:')

    lines.push('')
    lines.push('<TreeTable>')

    for (const namespace of this.topLevelNamespaces) {
      lines.push(...this.generateIndexMdxRecursively(namespace, 1))
    }

    lines.push('')
    lines.push('</TreeTable>')

    console.log(`Writing namespaces index file ${filePath}...`)
    await this.workspace.writeFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxRecursively (namespace: Namespace, depth: number): string[] {
    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    const lines: string[] = []

    const compoundDef = namespace.compoundDef

    const label = escapeMdx(namespace.indexName)

    const permalink = this.workspace.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push('  itemIconLetter="N"')
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth="${depth}">`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (namespace.children.length > 0) {
      for (const childNamespace of namespace.children) {
        lines.push(...this.generateIndexMdxRecursively(childNamespace as Namespace, depth + 1))
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Namespace extends CompoundBase {
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
    this.sidebarLabel = this.compoundDef.compoundName.replace(/.*::/, '')

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` Namespace Reference`

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundDef.compoundName.replaceAll('::', '/'))
    this.relativePermalink = `namespaces/${sanitizedPath}`

    this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        if (sectionDef.hasMembers()) {
          this.sections.push(new Section(this, sectionDef))
        }
      }
    }

    // console.log('1', this.compoundDef.compoundName)
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
    const descriptionTodo = `@namespace ${compoundDef.compoundName}`

    lines.push(this.renderBriefDescriptionToMdxText({
      todo: descriptionTodo,
      morePermalink: '#details'
    }))

    lines.push('')
    lines.push('## Fully Qualified Name')
    lines.push('')
    // Intentionally on two lines.
    lines.push(`<CodeBlock>${this.compoundDef.compoundName}</CodeBlock>`)

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    }))

    lines.push(...this.renderSectionsToMdxLines())

    lines.push(...this.renderGeneratedFromToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
