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
import path from 'node:path'

import { CompoundBase } from './compound-base-vm.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import { MenuItem, SidebarCategory, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { FrontMatter } from '../types.js'
import { IndexEntryBase, NamespaceIndexEntry } from './indices-vm.js'
import { Class } from './classes-vm.js'

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
    // Skip
    if (namespace.compoundName.length === 0) {
      if (namespace.children.length > 0) {
        console.error('Anonymous namespace', namespace.id, ' with children?')
      }
    } else {
      this.collectionCompoundsById.set(namespace.id, namespace)
    }

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

  override addSidebarItems (sidebarCategory: SidebarCategory): void {
    const indicesSet = this.workspace.indicesMaps.get('namespaces')
    if (indicesSet === undefined) {
      return
    }

    // Add namespaces to the sidebar.
    // Top level namespaces are added below a Namespaces category.
    const namespacesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Namespaces',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/index`
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Hierarchy',
          collapsed: true,
          items: []
        }
      ]
    }

    for (const namespace of this.topLevelNamespaces) {
      const item = this.createNamespaceItemRecursively(namespace)
      if (item !== undefined) {
        (namespacesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    if (indicesSet.has('all')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'All',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/all`
      })
    }

    if (indicesSet.has('classes')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Classes',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/classes`
      })
    }

    if (indicesSet.has('functions')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Functions',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/functions`
      })
    }

    if (indicesSet.has('variables')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Variables',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/variables`
      })
    }

    if (indicesSet.has('typedefs')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Typedefs',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/typedefs`
      })
    }

    if (indicesSet.has('enums')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Enums',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/enums`
      })
    }

    if (indicesSet.has('enumvalues')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Enum Values',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/enumvalues`
      })
    }

    sidebarCategory.items.push(namespacesCategory)
  }

  private createNamespaceItemRecursively (namespace: Namespace): SidebarItem | undefined {
    if (namespace.sidebarLabel === undefined) {
      return undefined
    }

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
        const item = this.createNamespaceItemRecursively(childNamespace as Namespace)
        if (item !== undefined) {
          categoryItem.items.push(item)
        }
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

  override async generateIndexDotMdFile (): Promise<void> {
    if (this.topLevelNamespaces.length === 0) {
      return
    }

    const filePath = `${this.workspace.outputFolderPath}indices/namespaces/index.md`
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
    lines.push('<table class="doxyTreeTable">')

    const contentLines: string[] = []

    for (const namespace of this.topLevelNamespaces) {
      contentLines.push(...this.generateIndexMdFileRecursively(namespace, 1))
    }

    if (contentLines.length === 0) {
      return
    }

    lines.push(...contentLines)

    lines.push('')
    lines.push('</table>')

    if (this.workspace.pluginOptions.verbose) {
      console.log(`Writing namespaces index file ${filePath}...`)
    }

    await this.workspace.writeMdFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdFileRecursively (namespace: Namespace, depth: number): string[] {
    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = this.workspace.renderString(namespace.indexName, 'html')

    const permalink = this.workspace.getPagePermalink(namespace.id)
    if (permalink === undefined || permalink.length === 0) {
      // console.log(namespace)
      return []
    }
    // assert(permalink !== undefined && permalink.length > 1)

    let description: string = ''
    if (namespace.briefDescriptionHtmlString !== undefined && namespace.briefDescriptionHtmlString.length > 0) {
      description = namespace.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
      itemIconLetter: 'N',
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    if (namespace.children.length > 0) {
      for (const childNamespace of namespace.children) {
        lines.push(...this.generateIndexMdFileRecursively(childNamespace as Namespace, depth + 1))
      }
    }

    return lines
  }

  // --------------------------------------------------------------------------

  override async generatePerInitialsIndexMdFiles (): Promise<void> {
    if (this.topLevelNamespaces.length === 0) {
      return
    }

    const allUnorderedEntriesMap: Map<string, IndexEntryBase> = new Map()

    for (const [compoundId, compound] of this.collectionCompoundsById) {
      const compoundEntry = new NamespaceIndexEntry(compound as Namespace, compound as Namespace)
      allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry)

      // console.log(compound.indexName)
      if (compound.innerCompounds !== undefined) {
        // console.log(compound.indexName, Array.from(compound.innerCompounds.keys()))
        const classCompoundDef = compound.innerCompounds.get('innerClasses')
        if (classCompoundDef?.innerClasses !== undefined) {
          for (const innerClass of classCompoundDef.innerClasses) {
            // console.log(innerClass.refid)
            const compoundClass = this.workspace.compoundsById.get(innerClass.refid) as Class
            if (compoundClass instanceof Class) {
              const classEntry = new NamespaceIndexEntry(compoundClass, compound as Namespace)
              allUnorderedEntriesMap.set(classEntry.id, classEntry)
            }
          }
        }
      }

      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new NamespaceIndexEntry(member, compound as Namespace)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
          if (member.enumValues !== undefined) {
            for (const enumValue of member.enumValues) {
              const enumValueEntry = new NamespaceIndexEntry(enumValue, compound as Namespace)
              allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry)
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'all',
      title: 'The Namespaces Definitions Index',
      description: 'The definitions part of the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (true)
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'classes',
      title: 'The Namespaces Classes Index',
      description: 'The classes, structs, unions defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'class' || kind === 'struct' || kind === 'union')
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'functions',
      title: 'The Namespaces Functions Index',
      description: 'The functions defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'function')
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'variables',
      title: 'The Namespaces Variables Index',
      description: 'The variables defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'variable')
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'typedefs',
      title: 'The Namespaces Type Definitions Index',
      description: 'The typedefs defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'typedef')
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'enums',
      title: 'The Namespaces Enums Index',
      description: 'The enums defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'enum')
      }
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'enumvalues',
      title: 'The Namespaces Enum Values Index',
      description: 'The enum values defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => {
        return (kind === 'enumvalue')
      }
    })

    // ------------------------------------------------------------------------
  }
}

// ============================================================================

export class Namespace extends CompoundBase {
  unqualifiedName: string = '???'
  isAnonymous: boolean = false

  constructor (collection: Namespaces, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Namespace.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerNamespaces)) {
      for (const ref of compoundDef.innerNamespaces) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // Tricky case: namespace { namespace CU { ... }}
    // id: "namespace_0d341223050020306256025223146376054302122106363020_1_1CU"
    // compoundname: "::CU"
    // location: "[generated]"

    if (/^namespace.*_0d\d{48}/.test(this.id)) {
      let fileName = ''
      if (compoundDef.location?.file !== undefined) {
        fileName = path.basename(compoundDef.location.file)
      }

      if (this.compoundName.startsWith('::')) {
        this.unqualifiedName = compoundDef.compoundName.replace(/.*::/, '')

        this.indexName = `anonymous{${fileName}}${this.compoundName}`

        const sanitizedPath = sanitizeHierarchicalPath(this.indexName.replaceAll('::', '/'))

        this.pageTitle = `The \`${this.indexName}\` Namespace Reference`

        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`
        this.sidebarLabel = this.unqualifiedName
      } else {
        this.unqualifiedName = `anonymous{${fileName}}`
        this.isAnonymous = true

        if (this.compoundName.length > 0) {
          this.indexName = `${this.compoundName}::${this.unqualifiedName}`
        } else {
          this.indexName = this.unqualifiedName
        }

        const sanitizedPath = sanitizeHierarchicalPath(this.indexName.replaceAll('::', '/'))

        // if (compoundDef.location?.file !== undefined) {
        //   sanitizedPath += `-${crypto.hash('md5', compoundDef.location?.file)}`
        // }

        this.pageTitle = `The \`${this.indexName}\` Namespace Reference`

        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`
        this.sidebarLabel = this.unqualifiedName
      }
    } else {
      // The compoundName is the fully qualified namespace name.
      // Keep only the last name.
      this.unqualifiedName = compoundDef.compoundName.replace(/.*::/, '').replaceAll(/anonymous_namespace\{/g, 'anonymous{')

      this.indexName = this.compoundName.replace(/.*::/, '').replaceAll(/anonymous_namespace\{/g, 'anonymous{')

      this.pageTitle = `The \`${this.unqualifiedName}\` Namespace Reference`

      const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundName.replaceAll('::', '/').replaceAll(/anonymous_namespace\{/g, 'anonymous{'))

      if (compoundDef.compoundName.length > 0) {
        // Skip un-named namespaces, and generated ones, since they can be duplicate.
        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`
        this.sidebarLabel = this.unqualifiedName
      } else {
        console.warn('Skipping unnamed namespace', compoundDef.id, compoundDef.location?.file)
      }
    }

    this.createSections()

    // console.log('0 id', this.id)
    // console.log('1 nm', this.compoundName)
    // console.log('2 pl', this.relativePermalink)
    // console.log('3 di', this.docusaurusId)
    // console.log('4 sb', this.sidebarLabel)
    // console.log('5 ix', this.indexName)
    // console.log()
  }

  override initializeLate (): void {
    super.initializeLate()

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.pluginOptions.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.docusaurusId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
  }

  override hasAnyContent (): boolean {
    // console.log('checking', this.compoundName)
    for (const childNamespace of this.children) {
      if (childNamespace.hasAnyContent()) {
        // console.log('has content', this)
        return true
      }
    }

    if (this.innerCompounds !== undefined) {
      if (this.innerCompounds.has('innerNamespaces')) {
        if (this.innerCompounds.size > 1) {
          // console.log('has content innerCompounds 1', this)
          return true
        }
      } else {
        if (this.innerCompounds.size > 0) {
          // console.log('has content innerCompounds 2', this)
          return true
        }
      }
    }

    // if (!super.hasAnyContent()) {
    //   console.log('has no content', this)
    // }
    return super.hasAnyContent()
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const workspace = this.collection.workspace

    const descriptionTodo = `@namespace ${workspace.renderString(this.compoundName, 'html')}`

    const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToHtmlString({
      briefDescriptionHtmlString: this.briefDescriptionHtmlString,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push('')
    lines.push('## Definition')

    lines.push('')
    lines.push('<div class="doxyDefinition">')
    const dots = workspace.renderString('{ ... }', 'html')
    if (this.compoundName.startsWith('anonymous_namespace{')) {
      lines.push(`namespace ${dots}`)
    } else {
      lines.push(`namespace ${workspace.renderString(this.compoundName, 'html')} ${dots}`)
    }
    lines.push('</div>')

    lines.push(...this.renderInnerIndicesToLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(...this.renderDetailedDescriptionToHtmlLines({
      briefDescriptionHtmlString: this.briefDescriptionHtmlString,
      detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToLines())

    lines.push(...this.renderGeneratedFromToLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
