/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025-2026 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can be
 * obtained from https://opensource.org/licenses/mit.
 */

// ----------------------------------------------------------------------------

// import * as util from 'node:util'
import assert from 'node:assert'

import { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import {
  FrontMatter,
  NavbarItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarItem,
} from '../types.js'
import { CollectionBase } from './collection-base.js'
import { CompoundBase } from './compound-base-vm.js'
import {
  flattenPath,
  sanitizeAnonymousNamespace,
  sanitizeHierarchicalPath,
} from '../utils.js'
import { Namespace, Namespaces } from './namespaces-vm.js'
import { ConceptEntry, TreeEntryBase } from './tree-entries-vm.js'

// ----------------------------------------------------------------------------

/**
 * Manages the collection of C++20 concept documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of concept-based documentation,
 * including namespace hierarchy association, sidebar generation, and
 * comprehensive index file creation. Concepts provide formal constraints
 * on template parameters, and their documentation is arranged within
 * the namespace hierarchy in which they are defined.
 *
 * @public
 */
export class Concepts extends CollectionBase {
  /**
   * Array of top-level concepts not nested in any namespace.
   *
   * @remarks
   * Contains concepts whose fully qualified name contains no `::` separator,
   * used for organising top-level concept entries in index pages and
   * the sidebar hierarchy.
   */
  topLevelConcepts: Concept[] = []

  // constructor(workspace: Workspace) {
  //   super(workspace)
  // }

  /**
   * Adds a concept compound to the collection.
   *
   * @remarks
   * Creates a new {@link Concept} instance from the compound definition
   * and registers it in the collection map for later processing.
   *
   * @param compoundDef - The compound definition data for the concept
   * @returns The created {@link Concept} instance
   */
  addChild(compoundDef: CompoundDefDataModel): CompoundBase {
    const concept = new Concept(this, compoundDef)
    this.collectionCompoundsById.set(concept.id, concept)

    return concept
  }

  /**
   * Creates hierarchical relationships between concepts and namespaces.
   *
   * @remarks
   * Iterates over all concept compounds and resolves their parent namespace
   * by stripping the last `::` component of the fully qualified name.
   * Concepts without a namespace qualifier are added to
   * {@link topLevelConcepts}. Concepts with a qualifying namespace that
   * cannot be found in the namespace collection are reported to the console.
   */
  createCompoundsHierarchies(): void {
    // throw new Error('Method not implemented.')
    for (const concept of this.collectionCompoundsById.values()) {
      assert(concept instanceof Concept)

      if (concept.compoundName.includes('::')) {
        const namespaceCompoundName = concept.compoundName.replace(
          /::[a-zA-Z0-9_]+$/,
          ''
        )
        const namespaces =
          this.workspace.viewModel.collections.get('namespaces')
        assert(namespaces !== undefined)
        const namespace = (
          namespaces as Namespaces
        ).findNamespaceByCompoundName(namespaceCompoundName)
        if (namespace !== undefined) {
          concept.parent = namespace
          namespace.concepts.push(concept)
          if (this.workspace.options.debug) {
            console.log(
              'concept',
              concept.compoundName,
              'has parent namespace',
              namespace.compoundName
            )
          }
        } else {
          console.log(
            'concept',
            concept.compoundName,
            'has no parent namespace'
          )
        }
      } else {
        if (this.workspace.options.debug) {
          this.topLevelConcepts.push(concept)
          console.log('topLevelConceptId:', concept.id, concept.compoundName)
        }
      }
    }
  }

  /**
   * Adds concept sidebar items to the provided sidebar category.
   *
   * @remarks
   * Creates a 'Concepts' category containing a hierarchical 'Hierarchy'
   * sub-category that mirrors the namespace tree, plus a flat 'All'
   * index entry. Only namespaces and concepts with sidebar metadata
   * are included.
   *
   * @param sidebarCategory - The sidebar category to populate with concept
   *   items
   */
  addSidebarItems(sidebarCategory: SidebarCategory): void {
    const indicesSet = this.workspace.indicesMaps.get('concepts')
    if (indicesSet === undefined) {
      return
    }

    const conceptsCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Concepts',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}indices/concepts/index`,
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Hierarchy',
          link: {
            type: 'doc',
            id: `${this.workspace.sidebarBaseId}indices/concepts/index`,
          },
          collapsed: true,
          items: [],
        },
      ],
    }

    const namespaces = this.workspace.viewModel.collections.get('namespaces')
    if (namespaces !== undefined) {
      for (const namespace of (namespaces as Namespaces).topLevelNamespaces) {
        const item = this.createNamespaceItemRecursively(namespace)
        if (item !== undefined) {
          ;(conceptsCategory.items[0] as SidebarCategoryItem).items.push(item)
        }
      }
    }

    for (const concept of this.topLevelConcepts) {
      const item = this.createConceptItem(concept)
      if (item !== undefined) {
        ;(conceptsCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    if (indicesSet.has('all')) {
      conceptsCategory.items.push({
        type: 'doc',
        label: 'All',
        id: `${this.workspace.sidebarBaseId}indices/concepts/all`,
      })
    }

    sidebarCategory.items.push(conceptsCategory)
  }

  /**
   * Recursively builds a sidebar item tree for a namespace and its concepts.
   *
   * @remarks
   * Returns `undefined` when the namespace lacks sidebar metadata or
   * contains no concepts anywhere in its subtree. Child namespaces are
   * processed recursively before individual concept items are appended.
   *
   * @param namespace - The namespace to create a sidebar item for
   * @returns A sidebar category item, or `undefined` if the namespace
   *   should be omitted
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

    if (!namespace.hasConceptsRecursively()) {
      return undefined
    }

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

    for (const concept of namespace.concepts) {
      const item = this.createConceptItem(concept)
      if (item !== undefined) {
        categoryItem.items.push(item)
      }
    }

    return categoryItem
  }

  /**
   * Creates a sidebar category item for a single concept.
   *
   * @remarks
   * Returns `undefined` when the concept lacks the sidebar identifier
   * or label required to construct a valid navigation entry.
   *
   * @param concept - The concept to create a sidebar item for
   * @returns A sidebar category item, or `undefined` if the concept
   *   should be omitted
   */
  private createConceptItem(concept: Concept): SidebarCategoryItem | undefined {
    if (concept.sidebarId === undefined || concept.sidebarLabel === undefined) {
      return undefined
    }

    const item: SidebarCategoryItem = {
      type: 'category',
      label: concept.sidebarLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}${concept.sidebarId}`,
      },
      collapsed: true,
      items: [],
    }

    return item
  }

  /**
   * Creates navbar items for the concepts section.
   *
   * @remarks
   * Returns a single navbar item linking to the top-level concepts index
   * page.
   *
   * @returns An array containing the concepts navbar item
   */
  createNavbarItems(): NavbarItem[] {
    const navbarItem: NavbarItem = {
      label: 'Concepts',
      to: `${this.workspace.menuBaseUrl}concepts/`,
    }
    return [navbarItem]
  }

  /**
   * Generates the main concepts index Markdown file.
   *
   * @remarks
   * Writes `indices/concepts/index.md` containing a hierarchical tree table
   * of all namespaces and their concepts. The file is skipped when the
   * collection contains no renderable content.
   */
  override async generateIndexDotMdFile(): Promise<void> {
    const filePath =
      this.workspace.outputFolderPath + 'indices/concepts/index.md'
    const permalink = 'concepts'

    const frontMatter: FrontMatter = {
      title: 'Concepts',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      description: 'The C++20 concepts defined in the project',
      custom_edit_url: null,
      keywords: ['doxygen', 'concepts', 'reference'],
    }

    const contentLines: string[] = []

    const namespaces = this.workspace.viewModel.collections.get('namespaces')
    if (namespaces !== undefined) {
      for (const namespace of (namespaces as Namespaces).topLevelNamespaces) {
        contentLines.push(
          ...this.generateNamespacesIndexMdLinesRecursively(namespace, 1)
        )
      }
    }

    contentLines.push(
      ...this.generateConceptsIndexMdFile(this.topLevelConcepts, 1)
    )

    if (contentLines.length === 0) {
      return
    }

    const lines: string[] = []

    lines.push('The C++20 concepts used by this project are:')

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    if (this.workspace.options.verbose) {
      console.log(`Writing concepts index file '${filePath}'...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })

    return
  }

  /**
   * Recursively generates index Markdown lines for a namespace subtree.
   *
   * @remarks
   * Produces an indented tree-table row for the namespace followed by rows
   * for its direct concepts and then recurses into child namespaces.
   * Returns an empty array when the namespace has no permalink or no
   * concepts anywhere in its subtree.
   *
   * @param namespace - The namespace to render
   * @param depth - The current indentation depth in the tree table
   * @returns An array of HTML lines for the namespace and its concepts
   */
  private generateNamespacesIndexMdLinesRecursively(
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

    if (!namespace.hasConceptsRecursively()) {
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

    lines.push('')
    lines.push(
      ...this.generateConceptsIndexMdFile(namespace.concepts, depth + 1)
    )

    if (namespace.children.length > 0) {
      for (const childNamespace of namespace.children) {
        if (childNamespace instanceof Namespace) {
          lines.push(
            ...this.generateNamespacesIndexMdLinesRecursively(
              childNamespace,
              depth + 1
            )
          )
        }
      }
    }

    return lines
  }

  /**
   * Generates index Markdown lines for a list of concepts.
   *
   * @remarks
   * Produces one tree-table row per concept that has a valid permalink.
   * Concepts without a permalink (i.e., those with no content and
   * `suggestToDoDescriptions` disabled) are silently skipped.
   *
   * @param concepts - The concepts to render
   * @param depth - The current indentation depth in the tree table
   * @returns An array of HTML lines, one tree-table row per concept
   */
  private generateConceptsIndexMdFile(
    concepts: Concept[],
    depth: number
  ): string[] {
    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    const lines: string[] = []

    for (const concept of concepts) {
      const label = this.workspace.renderString(concept.treeEntryName, 'html')

      const permalink = this.workspace.getPagePermalink(concept.id)
      if (permalink === undefined || permalink.length === 0) {
        // console.log(concept)
        continue
      }

      let description = ''
      if (
        concept.briefDescriptionHtmlString !== undefined &&
        concept.briefDescriptionHtmlString.length > 0
      ) {
        description = concept.briefDescriptionHtmlString.replace(/[.]$/, '')
      }

      lines.push(
        ...this.workspace.renderTreeTableRowToHtmlLines({
          itemIconLetter: 'R',
          itemLabel: label,
          itemLink: permalink,
          depth,
          description,
        })
      )
    }

    return lines
  }

  /**
   * Generates the flat 'all concepts' index Markdown file.
   *
   * @remarks
   * Writes a single alphabetical index file (`indices/concepts/all`) that
   * lists every concept in the collection regardless of namespace nesting.
   * The method returns immediately when the collection is empty.
   */
  override async generatePerInitialsIndexMdFiles(): Promise<void> {
    if (this.collectionCompoundsById.size === 0) {
      return
    }

    const allUnorderedEntriesMap = new Map<string, TreeEntryBase>()

    for (const [conceptId, concept] of this.collectionCompoundsById) {
      const entry = new ConceptEntry(concept as Concept)
      allUnorderedEntriesMap.set(conceptId, entry)
    }

    // ------------------------------------------------------------------------

    await this.generateIndexFile({
      group: 'concepts',
      fileKind: 'all',
      title: 'Concepts Definitions Index',
      description: 'The C++20 concepts defined in the project are:',
      map: allUnorderedEntriesMap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filter: (kind) => true,
    })
  }
}

// ============================================================================

/**
 * Represents a single C++20 concept documentation compound.
 *
 * @remarks
 * Encapsulates all information derived from a Doxygen compound definition
 * of kind `concept`, including template parameter specification, the
 * concept constraint expression, and the rendered documentation page.
 *
 * @public
 */
export class Concept extends CompoundBase {
  /**
   * The unqualified concept name, without any namespace prefix.
   *
   * @remarks
   * Derived from the fully qualified `compoundName` by stripping everything
   * up to and including the last `::`. Anonymous namespace markers are
   * also removed.
   */
  unqualifiedName = '???'

  /**
   * Rendered template parameter specification string.
   *
   * @remarks
   * Contains the comma-separated list of template parameter names as they
   * appear in the `template<...>` preamble of the concept definition.
   * Empty when the concept has no template parameters.
   */
  templateParameters = ''

  /**
   * The rendered HTML string representing the concept constraint expression.
   *
   * @remarks
   * Populated during {@link initializeLate} by rendering the Doxygen
   * `initializer` element. Defaults to `'???'` until initialised.
   */
  initializerString = '???'

  /**
   * Rendered HTML lines for the concept parts content.
   *
   * @remarks
   * Stores the rendered output of the Doxygen `conceptParts` element, which
   * may contain an ordered mixture of documentation fragments and code
   * fragments associated with the concept. Populated during
   * {@link initializeLate}, and appended to the generated page body by
   * {@link renderToLines}. The array remains empty when the compound does not
   * include any concept parts.
   */
  conceptPartsHtmlLines: string[] = []

  /**
   * Creates a new Concept instance.
   *
   * @remarks
   * Derives display names, permalink, and sidebar identifiers from the
   * compound definition. The constraint expression
   * ({@link initializerString}) is not rendered here; it is deferred to
   * {@link initializeLate} because it may reference other compounds that
   * have not yet been created.
   *
   * @param collection - The owning {@link Concepts} collection
   * @param compoundDef - The Doxygen compound definition data
   */
  constructor(collection: Concepts, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Class.constructor', util.inspect(compoundDef))

    // The compoundName is the fully qualified namespace name.
    // Keep only the last name.
    this.unqualifiedName = sanitizeAnonymousNamespace(
      compoundDef.compoundName.replace(/.*::/, '')
    )
    this.indexName = sanitizeAnonymousNamespace(
      this.compoundName.replace(/.*::/, '')
    )

    this.pageTitle = `\`${this.unqualifiedName}\` Concept`

    this.templateParameters = this.renderTemplateParameterNamesToString(
      compoundDef.templateParamList
    )

    const sanitizedPath: string = sanitizeHierarchicalPath(
      sanitizeAnonymousNamespace(this.compoundName.replaceAll('::', '/'))
    )

    this.relativePermalink = `concepts/${sanitizedPath}`
    this.sidebarId = `concepts/${flattenPath(sanitizedPath)}`
    const { unqualifiedName } = this
    this.sidebarLabel = unqualifiedName

    this.treeEntryName = this.indexName
  }

  /**
   * Performs late initialisation that depends on the full compound graph.
   *
   * @remarks
   * Renders the concept constraint expression after all compounds have
   * been created, since the initializer may contain cross-references.
   * Concepts with no content are hidden (permalink cleared) unless
   * `suggestToDoDescriptions` is enabled.
   */
  override initializeLate(): void {
    super.initializeLate()

    const { workspace } = this.collection

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (!workspace.options.suggestToDoDescriptions) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')

        this.sidebarId = undefined
        this.sidebarLabel = undefined
        this.relativePermalink = undefined

        return
      } else {
        if (workspace.options.verbose) {
          console.log(
            this.kind,
            this.compoundName,
            'has no content, see the TODO description'
          )
        }
      }
    }

    // There might be references to other compounds in the initializer,
    // so render it after all compounds are created.
    if (this._private._compoundDef?.initializer !== undefined) {
      this.initializerString = workspace
        .renderElementToLines(this._private._compoundDef.initializer, 'html')
        .join('<br/>\n')
        .replace(/template/, 'template ')
    }

    const conceptParts = this._private._compoundDef?.conceptParts
    if (conceptParts !== undefined) {
      this.conceptPartsHtmlLines = workspace.renderElementToLines(
        conceptParts,
        'html'
      )
      // console.log('conceptParts', this.conceptPartsHtmlLines)
    }
  }

  /**
   * Renders the concept documentation page body to an array of HTML lines.
   *
   * @remarks
   * Produces the brief description header, the `## Definition` section
   * containing the rendered constraint expression, and the detailed
   * description block. The `frontMatter` parameter is currently unused
   * but is required by the base class interface.
   *
   * @param frontMatter - The front matter object for the output page
   * @returns An array of Markdown/HTML lines forming the page body
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    // const { workspace } = this.collection

    const name = this.collection.workspace.renderString(
      this.compoundName,
      'html'
    )
    const descriptionTodo = `@concept ${name}`

    // The Description header is always shown.
    const morePermalink = '#details'

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

    lines.push(this.initializerString)
    lines.push('</div>')

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        todo: descriptionTodo,
        showHeader: true,
        showBrief: !this.hasSect1InDescription,
      })
    )

    if (this.locationLines !== undefined) {
      lines.push(...this.locationLines)
    }

    lines.push(...this.conceptPartsHtmlLines)

    // Currently here are no sections.
    // lines.push(...this.renderSectionsToLines())

    // Currently there are none.
    // lines.push(...this.renderGeneratedFromToLines())

    return lines
  }
}

// ----------------------------------------------------------------------------
