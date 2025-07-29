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
import crypto from 'node:crypto'

import { CompoundBase } from './compound-base-vm.js'
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import {
  flattenPath,
  sanitizeAnonymousNamespace,
  sanitizeHierarchicalPath,
} from '../utils.js'
import type {
  MenuItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  SidebarItem,
  FrontMatter,
} from '../types.js'
import type {
  BaseCompoundRefDataModel,
  DerivedCompoundRefDataModel,
} from '../../doxygen/data-model/compounds/compoundreftype-dm.js'
import type { TemplateParamListDataModel } from '../../doxygen/data-model/compounds/templateparamlisttype-dm.js'
import { ClassTreeEntry, type TreeEntryBase } from './tree-entries-vm.js'

// ----------------------------------------------------------------------------

const kindsPlurals: Record<string, string> = {
  class: 'Classes',
  struct: 'Structs',
  union: 'Unions',
}

// ----------------------------------------------------------------------------

export class Classes extends CollectionBase {
  // compoundsById: Map<string, Class>
  topLevelClasses: Class[] = []

  // --------------------------------------------------------------------------

  // constructor (workspace: Workspace) {
  //   super(workspace)

  //   // this.compoundsById = new Map()
  // }

  // --------------------------------------------------------------------------

  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
    const classs = new Class(this, compoundDef)
    this.collectionCompoundsById.set(classs.id, classs)

    return classs
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies(): void {
    // Recreate classes hierarchies.
    for (const [classId, classs] of this.collectionCompoundsById) {
      if (!(classs instanceof Class)) {
        continue
      }

      for (const baseClassId of classs.baseClassIds) {
        // console.log(classId, baseClassId)
        const baseClass = this.collectionCompoundsById.get(baseClassId)
        if (baseClass instanceof Class) {
          // console.log('baseClassId', baseClassId, 'has child', classId)
          baseClass.children.push(classs)

          classs.baseClasses.push(baseClass)
        } else {
          if (this.workspace.options.debug) {
            console.log(baseClass)
          }
          console.warn(baseClassId, 'ignored as base class for', classId)
        }
      }
    }

    for (const [classId, classs] of this.collectionCompoundsById) {
      if (!(classs instanceof Class)) {
        continue
      }

      if (classs.baseClassIds.size === 0) {
        if (this.workspace.options.debug) {
          console.log('topLevelClassId:', classId)
        }
        this.topLevelClasses.push(classs)
      }
    }
  }

  // --------------------------------------------------------------------------

  override addSidebarItems(sidebarCategory: SidebarCategory): void {
    const indicesSet = this.workspace.indicesMaps.get('classes')
    if (indicesSet === undefined) {
      return
    }

    // Add classes to the sidebar.
    // Top level classes are added below a Class category
    const classesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Classes',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}indices/classes/index`,
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

    // Add the hierarchy.
    for (const classs of this.topLevelClasses) {
      const item = this.createSidebarItemRecursively(classs)
      if (item !== undefined) {
        ;(classesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    // Add the rest of the entries.
    if (indicesSet.has('classes')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'All',
        id: `${this.workspace.sidebarBaseId}indices/classes/all`,
      })
    }

    if (indicesSet.has('classes')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Classes',
        id: `${this.workspace.sidebarBaseId}indices/classes/classes`,
      })
    }

    if (indicesSet.has('functions')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Functions',
        id: `${this.workspace.sidebarBaseId}indices/classes/functions`,
      })
    }

    if (indicesSet.has('variables')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Variables',
        id: `${this.workspace.sidebarBaseId}indices/classes/variables`,
      })
    }

    if (indicesSet.has('typedefs')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Typedefs',
        id: `${this.workspace.sidebarBaseId}indices/classes/typedefs`,
      })
    }

    if (indicesSet.has('enums')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Enums',
        id: `${this.workspace.sidebarBaseId}indices/classes/enums`,
      })
    }

    if (indicesSet.has('enumvalues')) {
      classesCategory.items.push({
        type: 'doc',
        label: 'Enum Values',
        id: `${this.workspace.sidebarBaseId}indices/classes/enumvalues`,
      })
    }

    sidebarCategory.items.push(classesCategory)
  }

  private createSidebarItemRecursively(classs: Class): SidebarItem | undefined {
    if (classs.sidebarLabel === undefined || classs.sidebarId === undefined) {
      return undefined
    }

    if (classs.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: classs.sidebarLabel,
        className: 'doxyEllipsis',
        id: `${this.workspace.sidebarBaseId}${classs.sidebarId}`,
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: classs.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${classs.sidebarId}`,
        },
        className: 'doxyEllipsis',
        collapsed: true,
        items: [],
      }

      for (const child of classs.children) {
        if (child instanceof Class) {
          const item = this.createSidebarItemRecursively(child)
          if (item !== undefined) {
            categoryItem.items.push(item)
          }
        }
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  override createMenuItems(): MenuItem[] {
    const menuItem: MenuItem = {
      label: 'Classes',
      to: `${this.workspace.menuBaseUrl}classes/`,
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdFile(): Promise<void> {
    if (this.topLevelClasses.length === 0) {
      return
    }

    const filePath =
      this.workspace.outputFolderPath + 'indices/classes/index.md'
    const permalink = 'classes'

    const frontMatter: FrontMatter = {
      title: 'Classes',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'classes', 'reference'],
    }

    const contentLines: string[] = []
    for (const classs of this.topLevelClasses) {
      contentLines.push(...this.generateIndexMdFileRecursively(classs, 1))
    }

    if (contentLines.length === 0) {
      return
    }

    const lines: string[] = []

    lines.push(
      'The classes, structs, union and interfaces used by this project are:'
    )

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    if (this.workspace.options.verbose) {
      console.log(`Writing classes index file ${filePath}...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })
  }

  private generateIndexMdFileRecursively(
    classs: Class,
    depth: number
  ): string[] {
    // console.log(util.inspect(classs, { compact: false, depth: 999 }))

    const lines: string[] = []

    const permalink = this.workspace.getPagePermalink(classs.id)
    assert(permalink !== undefined && permalink.length > 0)

    const iconLetters: Record<string, string> = {
      class: 'C',
      struct: 'S',
      union: 'U',
    }

    let iconLetter: string | undefined = iconLetters[classs.kind]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (iconLetter === undefined) {
      console.error(
        'Icon kind',
        classs.kind,
        'not supported yet in',
        this.constructor.name,
        '(using ?)'
      )
      iconLetter = '?'
    }

    const label = this.workspace.renderString(classs.treeEntryName, 'html')

    let description = ''
    if (
      classs.briefDescriptionHtmlString !== undefined &&
      classs.briefDescriptionHtmlString.length > 0
    ) {
      description = classs.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(
      ...this.workspace.renderTreeTableRowToHtmlLines({
        itemIconLetter: iconLetter,
        itemLabel: label,
        itemLink: permalink,
        depth,
        description,
      })
    )

    if (classs.children.length > 0) {
      for (const childClass of classs.children) {
        lines.push(
          ...this.generateIndexMdFileRecursively(childClass as Class, depth + 1)
        )
      }
    }

    return lines
  }

  override async generatePerInitialsIndexMdFiles(): Promise<void> {
    if (this.topLevelClasses.length === 0) {
      return
    }

    const allUnorderedEntriesMap = new Map<string, TreeEntryBase>()

    for (const [, compound] of this.collectionCompoundsById) {
      if (!(compound instanceof Class)) {
        continue
      }

      const compoundEntry = new ClassTreeEntry(compound, compound)
      allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry)
      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new ClassTreeEntry(member, compound)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
          if (member.enumValues !== undefined) {
            for (const enumValue of member.enumValues) {
              const enumValueEntry = new ClassTreeEntry(enumValue, compound)
              allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry)
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'all',
      title: 'Classes and Members Index',
      description: 'The classes, structs, unions and their members are:',
      map: allUnorderedEntriesMap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filter: (kind) => true,
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'classes',
      title: 'Classes Index',
      description: 'The classes, structs, unions defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) =>
        kind === 'class' || kind === 'struct' || kind === 'union',
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'functions',
      title: 'Class Functions Index',
      description: 'The class member functions defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'function',
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'variables',
      title: 'Class Variables Index',
      description: 'The class member variables defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'variable',
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'typedefs',
      title: 'Class Type Definitions Index',
      description: 'The class member typedefs defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'typedef',
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'enums',
      title: 'Class Enums Index',
      description: 'The class member enums defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enum',
    })

    await this.generateIndexFile({
      group: 'classes',
      fileKind: 'enumvalues',
      title: 'Class Enum Values Index',
      description: 'The class member enum values defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enumvalue',
    })

    // ------------------------------------------------------------------------
  }
}

// ============================================================================

export class Class extends CompoundBase {
  // Due to multiple-inheritance, there can be multiple parents.
  baseClassIds = new Set<string>()
  baseClasses: Class[] = []

  fullyQualifiedName = '???'
  unqualifiedName = '???'
  templateParameters = ''

  classFullName = '???'
  template: string | undefined

  // Shortcuts, use data model objects.
  // WARNING: May be duplicate.
  baseCompoundRefs: BaseCompoundRefDataModel[] | undefined
  derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined

  templateParamList: TemplateParamListDataModel | undefined

  // --------------------------------------------------------------------------

  constructor(collection: Classes, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Class.constructor', util.inspect(compoundDef))

    const { workspace } = this.collection

    if (Array.isArray(compoundDef.baseCompoundRefs)) {
      for (const ref of compoundDef.baseCompoundRefs) {
        // console.log('component', compoundDef.id, 'has base', ref.refid)
        if (ref.refid !== undefined) {
          this.baseClassIds.add(ref.refid)
        }
      }
    }

    // Remove the template parameters.
    this.fullyQualifiedName = sanitizeAnonymousNamespace(
      compoundDef.compoundName.replace(/<.*>/, '')
    )
    // Remove the namespaces(s).
    this.unqualifiedName = this.fullyQualifiedName.replace(/.*::/, '')

    const index = compoundDef.compoundName.indexOf('<')
    let indexNameTemplateParameters = ''
    if (index >= 0) {
      indexNameTemplateParameters = compoundDef.compoundName
        .substring(index)
        .replace(/^< /, '<')
        .replace(/ >$/, '>')
      this.templateParameters = indexNameTemplateParameters
    } else if (compoundDef.templateParamList !== undefined) {
      indexNameTemplateParameters = this.renderTemplateParameterNamesToString(
        compoundDef.templateParamList
      )
    }

    this.indexName = `${this.unqualifiedName}${indexNameTemplateParameters}`
    this.sidebarLabel = this.indexName

    if (this.indexName.length < 42) {
      const { indexName } = this
      this.treeEntryName = indexName
    } else {
      this.treeEntryName = `${this.unqualifiedName}<...>`
    }

    const { kind } = compoundDef
    const kindCapitalised =
      kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    const nameHtml = workspace.renderString(this.unqualifiedName, 'html')
    this.pageTitle = `\`${nameHtml}\` ${kindCapitalised}`
    if (compoundDef.templateParamList !== undefined) {
      this.pageTitle += ' Template'
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    assert(kindsPlurals[kind] !== undefined)
    const pluralKind = kindsPlurals[kind].toLowerCase()

    // Turn the namespace into a hierarchical path. Keep the dot.
    let sanitizedPath: string = sanitizeHierarchicalPath(
      this.fullyQualifiedName.replaceAll(/::/g, '/')
    )
    if (this.templateParameters.length > 0) {
      // sanitizedPath += sanitizeName(this.templateParameters)
      sanitizedPath += `-${crypto.hash('md5', this.templateParameters)}`
    }
    this.relativePermalink = `${pluralKind}/${sanitizedPath}`

    // Replace slash with dash.
    this.sidebarId = `${pluralKind}/${flattenPath(sanitizedPath)}`

    this.createSections(this.unqualifiedName)

    // console.log('0', compoundDef.id)
    // console.log('1', compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log('6', this.templateParameters)
    // console.log()
  }

  override initializeLate(): void {
    super.initializeLate()

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    const { workspace } = this.collection

    const { fullyQualifiedName } = this
    let classFullName = fullyQualifiedName
    if (this.templateParameters.length > 0) {
      classFullName += workspace.renderString(this.templateParameters, 'html')
    } else {
      classFullName += workspace.renderString(
        this.renderTemplateParameterNamesToString(
          compoundDef.templateParamList
        ),
        'html'
      )
    }
    this.classFullName = classFullName

    if (compoundDef.templateParamList?.params !== undefined) {
      this.template = workspace.renderString(
        this.renderTemplateParametersToString({
          templateParamList: compoundDef.templateParamList,
          withDefaults: true,
        }),
        'html'
      )
    }

    const { baseCompoundRefs, derivedCompoundRefs, templateParamList } =
      compoundDef
    this.baseCompoundRefs = baseCompoundRefs
    this.derivedCompoundRefs = derivedCompoundRefs
    this.templateParamList = templateParamList
  }

  override hasAnyContent(): boolean {
    if (this.childrenIds.length > 0) {
      return true
    }
    if (this.children.length > 0) {
      return true
    }
    if (this.innerCompounds !== undefined) {
      return true
    }
    if (this.sections.length > 0) {
      return true
    }
    if (this.includes !== undefined) {
      return true
    }

    return super.hasAnyContent()
  }

  // --------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const { workspace } = this.collection

    const name = this.collection.workspace.renderString(
      this.compoundName,
      'html'
    )
    const descriptionTodo = `@${this.kind} ${name}`

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
    lines.push('## Declaration')

    let classs: Class | undefined = undefined
    if ('collectionCompoundsById' in this.collection) {
      const candidate = (
        this.collection as { collectionCompoundsById: Map<string, unknown> }
      ).collectionCompoundsById.get(this.id)
      if (candidate instanceof Class) {
        classs = candidate
      }
    }
    assert(classs !== undefined)

    lines.push('')
    lines.push('<div class="doxyDeclaration">')
    if (this.template !== undefined) {
      lines.push(`template ${this.template}`)
    }
    lines.push(`${this.kind} ${this.classFullName} { ... }`)
    lines.push('</div>')

    lines.push(...this.renderIncludesIndexToLines())

    if (this.kind === 'class' || this.kind === 'struct') {
      if (this.baseCompoundRefs !== undefined) {
        const baseCompoundRefs = new Map<string, BaseCompoundRefDataModel>()
        for (const baseCompoundRef of this.baseCompoundRefs) {
          if (!baseCompoundRefs.has(baseCompoundRef.text)) {
            baseCompoundRefs.set(baseCompoundRef.text, baseCompoundRef)
          }
        }

        lines.push('')
        if (baseCompoundRefs.size > 1) {
          lines.push(`## Base ${kindsPlurals[this.kind].toLowerCase()}`)
        } else {
          lines.push(`## Base ${this.kind}`)
        }
        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const baseCompoundRef of baseCompoundRefs.values()) {
          // console.log(
          //   util.inspect(baseCompoundRef, { compact: false, depth: 999 })
          // )

          if (baseCompoundRef.refid !== undefined) {
            const { collection } = this
            const baseClass = collection.collectionCompoundsById.get(
              baseCompoundRef.refid
            )
            if (baseClass instanceof Class) {
              lines.push(...baseClass.renderIndexToLines())
              continue
            }
          }
          const itemName = workspace.renderString(baseCompoundRef.text, 'html')
          lines.push('')

          lines.push(
            ...workspace.renderMembersIndexItemToHtmlLines({
              type: this.kind,
              name: itemName,
            })
          )
        }

        lines.push('')
        lines.push('</table>')
      } else if ('baseClassIds' in classs && classs.baseClassIds.size > 0) {
        lines.push('')
        if (classs.baseClassIds.size > 1) {
          lines.push(`## Base ${kindsPlurals[this.kind].toLowerCase()}`)
        } else {
          lines.push(`## Base ${this.kind}`)
        }

        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const baseClassId of classs.baseClassIds) {
          const { collection } = this
          if (collection instanceof Classes) {
            const baseClass =
              collection.collectionCompoundsById.get(baseClassId)
            if (baseClass instanceof Class) {
              // console.log(
              //   util.inspect(
              //     derivedCompoundDef, { compact: false, depth: 999 }
              //   )
              // )
              lines.push(...baseClass.renderIndexToLines())
            }
          }
        }

        lines.push('')
        lines.push('</table>')
      }

      if (this.derivedCompoundRefs !== undefined) {
        lines.push('')
        lines.push(`## Derived ${kindsPlurals[this.kind]}`)

        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const derivedCompoundRef of this.derivedCompoundRefs) {
          // console.log(
          //   util.inspect(derivedCompoundRef, { compact: false, depth: 999 })
          // )

          if (derivedCompoundRef.refid !== undefined) {
            let derivedClass: Class | undefined = undefined
            if (
              'collectionCompoundsById' in this.collection &&
              typeof derivedCompoundRef.refid === 'string'
            ) {
              const collection = this.collection as {
                collectionCompoundsById: Map<string, unknown>
              }
              const candidate = collection.collectionCompoundsById.get(
                derivedCompoundRef.refid
              )
              if (candidate instanceof Class) {
                derivedClass = candidate
              }
            }
            if (derivedClass !== undefined) {
              lines.push(...derivedClass.renderIndexToLines())
            } else {
              if (this.collection.workspace.options.verbose) {
                console.warn(
                  'Derived class id',
                  derivedCompoundRef.refid,
                  'not a defined class'
                )
              }

              const itemName = workspace.renderString(
                derivedCompoundRef.text.trim(),
                'html'
              )
              lines.push('')
              lines.push(
                ...this.collection.workspace.renderMembersIndexItemToHtmlLines({
                  type: this.kind,
                  name: itemName,
                })
              )
            }
          } else {
            const itemName = workspace.renderString(
              derivedCompoundRef.text.trim(),
              'html'
            )
            lines.push('')
            lines.push(
              ...this.collection.workspace.renderMembersIndexItemToHtmlLines({
                type: this.kind,
                name: itemName,
              })
            )
          }
        }

        lines.push('')
        lines.push('</table>')
      } else if ('derivedClassIds' in classs && classs.childrenIds.length > 0) {
        lines.push('')
        lines.push(`## Derived ${kindsPlurals[this.kind]}`)

        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const derivedClassId of classs.childrenIds) {
          const { collection } = this
          const derivedClassCandidate =
            collection.collectionCompoundsById.get(derivedClassId)
          if (derivedClassCandidate instanceof Class) {
            // console.log(
            //   util.inspect(
            //     derivedCompoundDef,
            //     { compact: false, depth: 999 }
            //   )
            // )
            lines.push(...derivedClassCandidate.renderIndexToLines())
          } else {
            console.warn('Derived class id', derivedClassId, 'not a class')
          }
        }

        lines.push('')
        lines.push('</table>')
      }
    }

    lines.push(
      ...this.renderInnerIndicesToLines({
        suffixes: [],
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

    if (this.locationLines !== undefined) {
      lines.push(...this.locationLines)
    }

    lines.push(...this.renderSectionsToLines())

    lines.push(...this.renderGeneratedFromToLines())

    return lines
  }

  renderIndexToLines(): string[] {
    // console.log(util.inspect(this, { compact: false, depth: 999 }))
    const lines: string[] = []

    const { workspace } = this.collection

    const permalink = workspace.getPagePermalink(this.id)

    const indexName = this.collection.workspace.renderString(
      this.indexName,
      'html'
    )
    const { kind: itemType } = this
    let itemName = ''
    if (permalink !== undefined && permalink.length > 0) {
      itemName = `<a href="${permalink}">${indexName}</a>`
    } else {
      itemName = indexName
    }

    lines.push('')

    const childrenLines: string[] = []
    assert(permalink !== undefined)
    const morePermalink =
      this.detailedDescriptionHtmlLines !== undefined
        ? `${permalink}/#details`
        : undefined
    const briefDescriptionHtmlString: string | undefined =
      this.briefDescriptionHtmlString
    if ((briefDescriptionHtmlString ?? '').length > 0) {
      childrenLines.push(
        this.renderBriefDescriptionToHtmlString({
          briefDescriptionHtmlString,
          morePermalink,
        })
      )
    }

    lines.push(
      ...this.collection.workspace.renderMembersIndexItemToHtmlLines({
        type: itemType,
        name: itemName,
        childrenLines,
      })
    )

    return lines
  }
}

// ----------------------------------------------------------------------------
