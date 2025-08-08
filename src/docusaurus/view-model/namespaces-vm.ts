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
import path from 'node:path'

import { CompoundBase } from './compound-base-vm.js'
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import type {
  NavbarItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  SidebarItem,
  FrontMatter,
} from '../types.js'
import {
  flattenPath,
  sanitizeAnonymousNamespace,
  sanitizeHierarchicalPath,
} from '../utils.js'
import type { TreeEntryBase } from './tree-entries-vm.js'
import { NamespaceTreeEntry } from './tree-entries-vm.js'
import { Class } from './classes-vm.js'

// ----------------------------------------------------------------------------

/**
 * Manages the collection of namespace documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of namespace-based documentation,
 * including nested namespace hierarchies, sidebar generation, and comprehensive
 * index file creation. Namespaces provide logical code organisation beyond
 * file boundaries, supporting complex software architectures.
 *
 * @public
 */
export class Namespaces extends CollectionBase {
  /**
   * Array of top-level namespaces without parent namespaces.
   *
   * @remarks
   * Contains namespaces that are not nested within other namespaces,
   * used for organising hierarchical displays and namespace trees.
   */
  topLevelNamespaces: Namespace[] = []

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  /**
   * Adds a namespace compound to the collection.
   *
   * @remarks
   * Creates a new Namespace instance from the compound definition and registers
   * it in the collection for later processing. Anonymous namespaces with empty
   * names are skipped unless they contain child namespaces.
   *
   * @param compoundDef - The compound definition for the namespace
   * @returns The created Namespace instance
   *
   * @public
   */
  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
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

  /**
   * Creates hierarchical relationships between namespace compounds.
   *
   * @remarks
   * Establishes parent-child relationships based on namespace nesting data,
   * building the namespace hierarchy tree and identifying top-level namespaces
   * that have no parent. This enables proper nested namespace navigation
   * and documentation organisation.
   *
   * @public
   */
  override createCompoundsHierarchies(): void {
    // Recreate namespaces hierarchies.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [namespaceId, namespace] of this.collectionCompoundsById) {
      for (const childNamespaceId of namespace.childrenIds) {
        const childNamespace =
          this.collectionCompoundsById.get(childNamespaceId)
        assert(childNamespace !== undefined)
        // console.log('namespaceId', childNamespaceId,'has parent',
        // namespaceId)
        childNamespace.parent = namespace
        namespace.children.push(childNamespace)
      }
    }

    // Create the top level namespace list.
    for (const [namespaceId, namespace] of this.collectionCompoundsById) {
      if (namespace.parent === undefined) {
        if (namespace instanceof Namespace) {
          if (this.workspace.options.debug) {
            console.log('topLevelNamespaces:', namespaceId)
          }
          this.topLevelNamespaces.push(namespace)
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Adds namespace sidebar items to the provided sidebar category.
   *
   * @remarks
   * Creates comprehensive namespace navigation including hierarchical namespace
   * trees and specialised indices for classes, functions, variables, typedefs,
   * enums, and enum values. The structure provides multiple access paths to
   * namespace content for improved user navigation.
   *
   * @param sidebarCategory - The sidebar category to populate with namespace
   *   items
   *
   * @public
   */
  override addSidebarItems(sidebarCategory: SidebarCategory): void {
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
        id: `${this.workspace.sidebarBaseId}indices/namespaces/index`,
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Hierarchy',
          collapsed: true,
          items: [],
        },
      ],
    }

    for (const namespace of this.topLevelNamespaces) {
      const item = this.createNamespaceItemRecursively(namespace)
      if (item !== undefined) {
        ;(namespacesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    if (indicesSet.has('all')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'All',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/all`,
      })
    }

    if (indicesSet.has('classes')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Classes',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/classes`,
      })
    }

    if (indicesSet.has('functions')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Functions',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/functions`,
      })
    }

    if (indicesSet.has('variables')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Variables',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/variables`,
      })
    }

    if (indicesSet.has('typedefs')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Typedefs',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/typedefs`,
      })
    }

    if (indicesSet.has('enums')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Enums',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/enums`,
      })
    }

    if (indicesSet.has('enumvalues')) {
      namespacesCategory.items.push({
        type: 'doc',
        label: 'Enum Values',
        id: `${this.workspace.sidebarBaseId}indices/namespaces/enumvalues`,
      })
    }

    sidebarCategory.items.push(namespacesCategory)
  }

  /**
   * Creates sidebar items recursively for namespace hierarchies.
   *
   * @remarks
   * Generates appropriate sidebar structure based on namespace nesting,
   * creating document items for leaf namespaces and category items for
   * namespaces with children. This method builds the hierarchical navigation
   * structure with proper ellipsis styling for nested content.
   *
   * @param namespace - The namespace to create a sidebar item for
   * @returns The created sidebar item, or undefined if the namespace is not
   *   displayable
   *
   * @private
   */
  private createNamespaceItemRecursively(
    namespace: Namespace
  ): SidebarItem | undefined {
    if (
      namespace.sidebarLabel === undefined ||
      namespace.sidebarId === undefined
    ) {
      return undefined
    }

    if (namespace.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: namespace.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${namespace.sidebarId}`,
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: namespace.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${namespace.sidebarId}`,
        },
        className: 'doxyEllipsis',
        collapsed: true,
        items: [],
      }

      for (const childNamespace of namespace.children) {
        if (childNamespace instanceof Namespace) {
          const item = this.createNamespaceItemRecursively(childNamespace)
          if (item !== undefined) {
            categoryItem.items.push(item)
          }
        }
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Creates navbar items for namespace navigation.
   *
   * @remarks
   * Generates a navigation bar item that provides access to the main
   * namespaces index page, enabling users to explore namespace hierarchies
   * and specialised namespace indices from the top-level navigation.
   *
   * @returns Array containing the namespaces navbar item
   *
   * @public
   */
  override createNavbarItems(): NavbarItem[] {
    const navbarItem: NavbarItem = {
      label: 'Namespaces',
      to: `${this.workspace.menuBaseUrl}namespaces/`,
    }
    return [navbarItem]
  }

  // --------------------------------------------------------------------------

  /**
   * Generates the main namespaces index Markdown file.
   *
   * @remarks
   * Creates a comprehensive index file for namespaces when top-level namespaces
   * exist. The index includes a hierarchical tree table showing all namespaces
   * with their descriptions and navigation links, providing a complete overview
   * of the project's namespace organisation.
   *
   * @public
   */
  override async generateIndexDotMdFile(): Promise<void> {
    if (this.topLevelNamespaces.length === 0) {
      return
    }

    const filePath =
      this.workspace.outputFolderPath + 'indices/namespaces/index.md'
    const permalink = 'namespaces'

    const frontMatter: FrontMatter = {
      title: 'Namespaces',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'namespaces', 'reference'],
    }

    const contentLines: string[] = []

    for (const namespace of this.topLevelNamespaces) {
      contentLines.push(...this.generateIndexMdFileRecursively(namespace, 1))
    }

    if (contentLines.length === 0) {
      return
    }

    const lines: string[] = []

    lines.push('The namespaces used by this project are:')

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    if (this.workspace.options.verbose) {
      console.log(`Writing namespaces index file ${filePath}...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })
  }

  /**
   * Recursively generates index content for namespace hierarchies.
   *
   * @remarks
   * Creates hierarchical HTML tree table rows for namespaces and their
   * children, including appropriate indentation, icons, and navigation links.
   * This method builds the complete nested structure for namespace
   * documentation indices with proper depth handling.
   *
   * @param namespace - The namespace to generate index content for
   * @param depth - The current nesting depth for indentation
   * @returns Array of HTML lines representing the namespace hierarchy
   *
   * @private
   */
  private generateIndexMdFileRecursively(
    namespace: Namespace,
    depth: number
  ): string[] {
    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = this.workspace.renderString(namespace.treeEntryName, 'html')

    const permalink = this.workspace.getPagePermalink(namespace.id)
    if (permalink === undefined || permalink.length === 0) {
      // console.log(namespace)
      return []
    }
    // assert(permalink !== undefined && permalink.length > 1)

    let description = ''
    if (
      namespace.briefDescriptionHtmlString !== undefined &&
      namespace.briefDescriptionHtmlString.length > 0
    ) {
      description = namespace.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(
      ...this.workspace.renderTreeTableRowToHtmlLines({
        itemIconLetter: 'N',
        itemLabel: label,
        itemLink: permalink,
        depth,
        description,
      })
    )

    if (namespace.children.length > 0) {
      for (const childNamespace of namespace.children) {
        if (childNamespace instanceof Namespace) {
          lines.push(
            ...this.generateIndexMdFileRecursively(childNamespace, depth + 1)
          )
        }
      }
    }

    return lines
  }

  // --------------------------------------------------------------------------

  /**
   * Generates specialised namespace index files by content type.
   *
   * @remarks
   * Creates comprehensive index files for different types of namespace content
   * including all definitions, classes, functions, variables, typedefs, enums,
   * and enum values. Each index provides filtered views of namespace content
   * for targeted exploration and documentation access.
   *
   * @public
   */
  override async generatePerInitialsIndexMdFiles(): Promise<void> {
    if (this.topLevelNamespaces.length === 0) {
      return
    }

    const allUnorderedEntriesMap = new Map<string, TreeEntryBase>()

    for (const [, compound] of this.collectionCompoundsById) {
      if (!(compound instanceof Namespace)) {
        continue
      }

      const compoundEntry = new NamespaceTreeEntry(compound, compound)
      allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry)

      // console.log(compound.indexName)
      if (compound.innerCompounds !== undefined) {
        // console.log(compound.indexName,
        // Array.from(compound.innerCompounds.keys()))
        const classCompoundDef = compound.innerCompounds.get('innerClasses')
        if (classCompoundDef?.innerClasses !== undefined) {
          for (const innerClass of classCompoundDef.innerClasses) {
            // console.log(innerClass.refid)
            const compoundClass = this.workspace.viewModel.compoundsById.get(
              innerClass.refid
            )
            if (compoundClass instanceof Class) {
              const classEntry = new NamespaceTreeEntry(compoundClass, compound)
              allUnorderedEntriesMap.set(classEntry.id, classEntry)
            }
          }
        }
      }

      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new NamespaceTreeEntry(member, compound)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
          if (member.enumValues !== undefined) {
            for (const enumValue of member.enumValues) {
              const enumValueEntry = new NamespaceTreeEntry(enumValue, compound)
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
      title: 'Namespaces Definitions Index',
      description: 'The definitions part of the namespaces are:',
      map: allUnorderedEntriesMap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filter: (kind) => true,
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'classes',
      title: 'Namespaces Classes Index',
      description:
        'The classes, structs, unions defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) =>
        kind === 'class' || kind === 'struct' || kind === 'union',
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'functions',
      title: 'Namespaces Functions Index',
      description: 'The functions defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'function',
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'variables',
      title: 'Namespaces Variables Index',
      description: 'The variables defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'variable',
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'typedefs',
      title: 'Namespaces Type Definitions Index',
      description: 'The typedefs defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'typedef',
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'enums',
      title: 'Namespaces Enums Index',
      description: 'The enums defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enum',
    })

    await this.generateIndexFile({
      group: 'namespaces',
      fileKind: 'enumvalues',
      title: 'Namespaces Enum Values Index',
      description: 'The enum values defined in the namespaces are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enumvalue',
    })

    // ------------------------------------------------------------------------
  }
}

// ============================================================================

/**
 * Represents a namespace compound for code organisation documentation.
 *
 * @remarks
 * Namespaces provide logical code organisation beyond file boundaries,
 * supporting complex software architectures with hierarchical structure.
 * Handles both named and anonymous namespaces with appropriate documentation
 * generation, including special handling for compiler-generated anonymous
 * namespaces.
 *
 * @public
 */
export class Namespace extends CompoundBase {
  /**
   * The unqualified namespace name without scope.
   *
   * @remarks
   * Contains the simple name of the namespace without parent scope
   * qualifiers, used for display and navigation purposes.
   */
  unqualifiedName = '???'

  /**
   * Indicates if this is an anonymous namespace.
   *
   * @remarks
   * True for anonymous namespaces that don't have explicit names,
   * affecting how the namespace is displayed and documented.
   */
  isAnonymous = false

  /**
   * Initialises a new Namespace instance from compound definition data.
   *
   * @remarks
   * Processes namespace metadata including nested namespace relationships,
   * name extraction, and permalink generation. Handles special cases for
   * anonymous namespaces and compiler-generated namespace structures.
   * Sets up the namespace for integration into the documentation hierarchy.
   *
   * @param collection - The parent Namespaces collection
   * @param compoundDef - The compound definition containing namespace metadata
   *
   * @public
   */
  constructor(collection: Namespaces, compoundDef: CompoundDefDataModel) {
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

        const sanitizedPath = sanitizeHierarchicalPath(
          this.indexName.replaceAll('::', '/')
        )

        this.pageTitle = `\`${this.indexName}\` Namespace`

        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.sidebarId = `namespaces/${flattenPath(sanitizedPath)}`
        const { unqualifiedName } = this
        this.sidebarLabel = unqualifiedName
      } else {
        this.unqualifiedName = `anonymous{${fileName}}`
        this.isAnonymous = true

        if (this.compoundName.length > 0) {
          this.indexName = `${this.compoundName}::${this.unqualifiedName}`
        } else {
          const { unqualifiedName } = this
          this.indexName = unqualifiedName
        }

        const sanitizedPath = sanitizeHierarchicalPath(
          this.indexName.replaceAll('::', '/')
        )

        // if (compoundDef.location?.file !== undefined) {
        //   sanitizedPath +=
        //     `-${crypto.hash('md5', compoundDef.location?.file)}`
        // }

        this.pageTitle = `\`${this.indexName}\` Namespace`

        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.sidebarId = `namespaces/${flattenPath(sanitizedPath)}`
        const { unqualifiedName } = this
        this.sidebarLabel = unqualifiedName
      }
    } else {
      // The compoundName is the fully qualified namespace name.
      // Keep only the last name.
      this.unqualifiedName = sanitizeAnonymousNamespace(
        compoundDef.compoundName.replace(/.*::/, '')
      )

      this.indexName = sanitizeAnonymousNamespace(
        this.compoundName.replace(/.*::/, '')
      )

      this.pageTitle = `\`${this.unqualifiedName}\` Namespace`

      const sanitizedPath: string = sanitizeHierarchicalPath(
        sanitizeAnonymousNamespace(this.compoundName.replaceAll('::', '/'))
      )

      if (compoundDef.compoundName.length > 0) {
        // Skip un-named namespaces, and generated ones,
        // since they can be duplicate.
        this.relativePermalink = `namespaces/${sanitizedPath}`
        this.sidebarId = `namespaces/${flattenPath(sanitizedPath)}`
        const { unqualifiedName } = this
        this.sidebarLabel = unqualifiedName
      } else {
        console.warn(
          'Skipping unnamed namespace',
          compoundDef.id,
          compoundDef.location?.file
        )
      }
    }

    const { indexName } = this
    this.treeEntryName = indexName

    this.createSections()

    // console.log('0 id', this.id)
    // console.log('1 nm', this.compoundName)
    // console.log('2 pl', this.relativePermalink)
    // console.log('3 di', this.docusaurusId)
    // console.log('4 sb', this.sidebarLabel)
    // console.log('5 ix', this.indexName)
    // console.log()
  }

  /**
   * Performs late initialisation for namespaces with content validation.
   *
   * @remarks
   * Validates namespace content and conditionally disables sidebar generation
   * for empty namespaces. This ensures that namespaces without meaningful
   * documentation do not appear in the generated sidebar navigation.
   *
   * @public
   */
  override initializeLate(): void {
    super.initializeLate()

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.options.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.sidebarId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
  }

  /**
   * Determines if the namespace has any documentable content.
   *
   * @remarks
   * Checks for child namespaces with content, inner compounds beyond just
   * nested namespaces, and base class content to determine if the namespace
   * should be included in documentation. This method helps filter empty
   * namespaces from the generated output.
   *
   * @returns True if the namespace contains documentable content, false
   *   otherwise
   *
   * @public
   */
  override hasAnyContent(): boolean {
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

  /**
   * Renders the namespace documentation to Markdown lines.
   *
   * @remarks
   * Generates comprehensive namespace documentation including brief
   * description, namespace definition syntax, inner compound indices, section
   * indices, detailed description, and sections. The output follows Docusaurus
   * conventions for namespace pages with proper navigation and content
   * organisation.
   *
   * @param frontMatter - The front matter configuration for the page
   * @returns Array of Markdown lines representing the namespace documentation
   *
   * @public
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const { workspace } = this.collection

    const descriptionTodo = `@namespace ${workspace.renderString(
      this.compoundName,
      'html'
    )}`

    const morePermalink =
      this.detailedDescriptionHtmlLines !== undefined ? '#details' : undefined

    lines.push(
      this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        todo: descriptionTodo,
        morePermalink,
      })
    )

    lines.push('')
    lines.push('## Definition')

    lines.push('')
    lines.push('<div class="doxyDefinition">')
    const dots = workspace.renderString('{ ... }', 'html')
    if (this.compoundName.startsWith('anonymous_namespace{')) {
      lines.push(`namespace ${dots}`)
    } else {
      lines.push(
        `namespace ${workspace.renderString(this.compoundName, 'html')} ${dots}`
      )
    }
    lines.push('</div>')

    lines.push(
      ...this.renderInnerIndicesToLines({
        suffixes: ['Namespaces', 'Classes'],
      })
    )

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        todo: descriptionTodo,
        showHeader: true,
        showBrief: !this.hasSect1InDescription,
      })
    )

    lines.push(...this.renderSectionsToLines())

    lines.push(...this.renderGeneratedFromToLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
