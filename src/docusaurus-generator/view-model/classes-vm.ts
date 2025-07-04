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
import crypto from 'node:crypto'

import { CompoundBase } from './compound-base-vm.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { MenuItem, SidebarCategory, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../types.js'
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from '../../data-model/compounds/compoundreftype-dm.js'
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js'
import { IndexEntry } from './indices-vm.js'

// ----------------------------------------------------------------------------

const kindsPlurals: Record<string, string> = {
  class: 'Classes',
  struct: 'Structs',
  union: 'Unions'
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

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const classs = new Class(this, compoundDef)
    this.collectionCompoundsById.set(classs.id, classs)

    return classs
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // Recreate classes hierarchies.
    for (const [classId, base] of this.collectionCompoundsById) {
      const classs = base as Class
      for (const baseClassId of classs.baseClassIds) {
        // console.log(classId, baseClassId)
        const baseClass = this.collectionCompoundsById.get(baseClassId) as Class
        if (baseClass !== undefined) {
          // console.log('baseClassId', baseClassId, 'has child', classId)
          baseClass.children.push(classs)

          classs.baseClasses.push(baseClass)
        } else {
          console.warn(baseClassId, 'ignored as base class for', classId)
        }
      }
    }

    for (const [classId, base] of this.collectionCompoundsById) {
      const classs = base as Class
      if (classs.baseClassIds.size === 0) {
        // console.log('topLevelClassId:', classId)
        this.topLevelClasses.push(classs)
      }
    }
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (sidebarCategory: SidebarCategory): void {
    // Add classes to the sidebar.
    // Top level classes are added below a Class category
    const classesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Classes',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}index/classes/index`
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Hierarchy',
          collapsed: true,
          items: []
        },
        {
          type: 'doc',
          label: 'All',
          id: `${this.workspace.sidebarBaseId}index/classes/all`
        },
        {
          type: 'doc',
          label: 'Classes',
          id: `${this.workspace.sidebarBaseId}index/classes/classes`
        },
        {
          type: 'doc',
          label: 'Functions',
          id: `${this.workspace.sidebarBaseId}index/classes/functions`
        },
        {
          type: 'doc',
          label: 'Variables',
          id: `${this.workspace.sidebarBaseId}index/classes/variables`
        },
        {
          type: 'doc',
          label: 'Typedefs',
          id: `${this.workspace.sidebarBaseId}index/classes/typedefs`
        },
        {
          type: 'doc',
          label: 'Enums',
          id: `${this.workspace.sidebarBaseId}index/classes/enums`
        },
        {
          type: 'doc',
          label: 'Enum Values',
          id: `${this.workspace.sidebarBaseId}index/classes/enumvalues`
        }
      ]
    }

    for (const classs of this.topLevelClasses) {
      const item = this.createSidebarItemRecursively(classs)
      if (item !== undefined) {
        (classesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    sidebarCategory.items.push(classesCategory)
  }

  private createSidebarItemRecursively (classs: Class): SidebarItem | undefined {
    if (classs.sidebarLabel === undefined) {
      return undefined
    }

    if (classs.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: classs.sidebarLabel,
        id: `${this.workspace.sidebarBaseId}${classs.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: classs.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.sidebarBaseId}${classs.docusaurusId}`
        },
        collapsed: true,
        items: []
      }

      for (const child of classs.children) {
        const item = this.createSidebarItemRecursively(child as Class)
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
      label: 'Classes',
      to: `${this.workspace.menuBaseUrl}classes/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdFile (): Promise<void> {
    if (this.topLevelClasses.length === 0) {
      return
    }

    const filePath = `${this.workspace.outputFolderPath}index/classes/index.md`
    const permalink = 'classes'

    const frontMatter: FrontMatter = {
      title: 'The Classes Reference',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'classes', 'reference']
    }

    const lines: string[] = []

    lines.push('The classes, structs, union and interfaces used by this project are:')

    lines.push('')
    lines.push('<table class="doxyTreeTable">')

    for (const classs of this.topLevelClasses) {
      lines.push(...this.generateIndexMdFileRecursively(classs, 1))
    }

    lines.push('')
    lines.push('</table>')

    console.log(`Writing classes index file ${filePath}...`)
    await this.workspace.writeMdFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdFileRecursively (classs: Class, depth: number): string[] {
    // console.log(util.inspect(classs, { compact: false, depth: 999 }))

    const lines: string[] = []

    const permalink = this.workspace.getPagePermalink(classs.id)
    assert(permalink !== undefined && permalink.length > 0)

    const iconLetters: Record<string, string> = {
      class: 'C',
      struct: 'S',
      union: 'U'
    }

    let iconLetter: string | undefined = iconLetters[classs.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', classs.kind, 'not supported yet in', this.constructor.name, '(using ?)')
      iconLetter = '?'
    }

    const label = this.workspace.renderString(classs.unqualifiedName, 'html')

    let description: string = ''
    if (classs.briefDescriptionHtmlString !== undefined && classs.briefDescriptionHtmlString.length > 0) {
      description = classs.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
      itemIconLetter: iconLetter,
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    if (classs.children.length > 0) {
      for (const childClass of classs.children) {
        lines.push(...this.generateIndexMdFileRecursively(childClass as Class, depth + 1))
      }
    }

    return lines
  }

  override async generatePerInitialsIndexMdFiles (): Promise<void> {
    if (this.topLevelClasses.length === 0) {
      return
    }

    const allUnorderedEntriesMap: Map<string, IndexEntry> = new Map()
    for (const [compoundId, compound] of this.collectionCompoundsById) {
      const compoundEntry = new IndexEntry(compound as Class)
      allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry)
      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new IndexEntry(member)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
          if (member.enumValues !== undefined) {
            for (const enumValue of member.enumValues) {
              const enumValueEntry = new IndexEntry(enumValue)
              allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry)
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------

    const outputFolderPath = this.workspace.outputFolderPath

    {
      const filePath = `${outputFolderPath}index/classes/all.md`
      const permalink = 'index/classes/all'

      const frontMatter: FrontMatter = {
        title: 'The Classes and Members Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The classes, structs, union interfaces and their members, variables, types used by this project are:')

      const orderedEntriesMap = this.orderPerInitials(allUnorderedEntriesMap)

      lines.push(...this.outputEntries(orderedEntriesMap))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/classes.md`
      const permalink = 'index/classes/classes'

      const frontMatter: FrontMatter = {
        title: 'The Classes Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The classes, structs, union interfaces used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.objectKind === 'compound') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/functions.md`
      const permalink = 'index/classes/functions'

      const frontMatter: FrontMatter = {
        title: 'The Class Functions Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The class member functions used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.kind === 'function') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/variables.md`
      const permalink = 'index/classes/variables'

      const frontMatter: FrontMatter = {
        title: 'The Class Variables Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The class member variables used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.kind === 'variable') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/typedefs.md`
      const permalink = 'index/classes/typedefs'

      const frontMatter: FrontMatter = {
        title: 'The Class Type Definitions Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The class member type definitions used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.kind === 'typedef') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/enums.md`
      const permalink = 'index/classes/enums'

      const frontMatter: FrontMatter = {
        title: 'The Class Enums Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The class member enum definitions used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.kind === 'enum') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}index/classes/enumvalues.md`
      const permalink = 'index/classes/enumvalues'

      const frontMatter: FrontMatter = {
        title: 'The Class Enum Values Index',
        slug: `${this.workspace.slugBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The class member enum values used by this project are:')

      const classesUnorderedMap: Map<string, IndexEntry> = new Map()
      for (const [id, entry] of allUnorderedEntriesMap) {
        if (entry.kind === 'enumvalue') {
          classesUnorderedMap.set(id, entry)
        }
      }
      const orderedEntries = this.orderPerInitials(classesUnorderedMap)

      lines.push(...this.outputEntries(orderedEntries))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------
  }
}

// ============================================================================

export class Class extends CompoundBase {
  // Due to multiple-inheritance, there can be multiple parents.
  baseClassIds: Set<string> = new Set()
  baseClasses: Class[] = []

  fullyQualifiedName: string = '???'
  unqualifiedName: string = '???'
  templateParameters: string = ''

  classFullName: string = '???'
  template: string | undefined

  // Shortcuts, use data model objects.
  // WARNING: May be duplicate.
  baseCompoundRefs: BaseCompoundRefDataModel[] | undefined
  derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined

  templateParamList: TemplateParamListDataModel | undefined

  // --------------------------------------------------------------------------

  constructor (collection: Classes, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Class.constructor', util.inspect(compoundDef))

    const workspace = this.collection.workspace

    if (Array.isArray(compoundDef.baseCompoundRefs)) {
      for (const ref of compoundDef.baseCompoundRefs) {
        // console.log('component', compoundDef.id, 'has base', ref.refid)
        if (ref.refid !== undefined) {
          this.baseClassIds.add(ref.refid)
        }
      }
    }

    // Remove the template parameters.
    this.fullyQualifiedName = compoundDef.compoundName.replace(/<.*>/, '')
    // Remove the namespaces(s).
    this.unqualifiedName = this.fullyQualifiedName.replace(/.*::/, '')

    const index = compoundDef.compoundName.indexOf('<')
    let indexNameTemplateParameters = ''
    if (index >= 0) {
      indexNameTemplateParameters = compoundDef.compoundName.substring(index).replace(/^< /, '<').replace(/ >$/, '>')
      this.templateParameters = indexNameTemplateParameters
    } else if (compoundDef.templateParamList !== undefined) {
      indexNameTemplateParameters = this.renderTemplateParameterNamesToString(compoundDef.templateParamList)
    }

    this.sidebarLabel = this.unqualifiedName

    this.indexName = `${this.unqualifiedName}${indexNameTemplateParameters}`

    const kind = compoundDef.kind
    const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    this.pageTitle = `The \`${workspace.renderString(this.unqualifiedName, 'html')}\` ${kindCapitalised}`
    if (compoundDef.templateParamList !== undefined) {
      this.pageTitle += ' Template'
    }
    this.pageTitle += ' Reference'

    assert(kindsPlurals[kind] !== undefined)
    const pluralKind = kindsPlurals[kind].toLowerCase()

    // Turn the namespace into a hierarchical path. Keep the dot.
    let sanitizedPath: string = sanitizeHierarchicalPath(this.fullyQualifiedName.replaceAll(/::/g, '/'))
    if (this.templateParameters?.length > 0) {
      // sanitizedPath += sanitizeName(this.templateParameters)
      sanitizedPath += `-${crypto.hash('md5', this.templateParameters)}`
    }
    this.relativePermalink = `${pluralKind}/${sanitizedPath}`

    // Replace slash with dash.
    this.docusaurusId = `${pluralKind}/${flattenPath(sanitizedPath)}`

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

  override initializeLate (): void {
    super.initializeLate()

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    const workspace = this.collection.workspace

    let classFullName = this.fullyQualifiedName
    if (this.templateParameters.length > 0) {
      classFullName += workspace.renderString(this.templateParameters, 'html')
    } else {
      classFullName += workspace.renderString(this.renderTemplateParameterNamesToString(compoundDef.templateParamList), 'html')
    }
    this.classFullName = classFullName

    if (compoundDef.templateParamList?.params !== undefined) {
      this.template = workspace.renderString(this.renderTemplateParametersToString({
        templateParamList: compoundDef.templateParamList,
        withDefaults: true
      }), 'html')
    }

    this.baseCompoundRefs = compoundDef.baseCompoundRefs
    this.derivedCompoundRefs = compoundDef.derivedCompoundRefs
    this.templateParamList = compoundDef.templateParamList
  }

  override hasAnyContent (): boolean {
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

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const workspace = this.collection.workspace

    const descriptionTodo = `@${this.kind} ${this.collection.workspace.renderString(this.compoundName, 'html')}`

    const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToHtmlString({
      briefDescriptionHtmlString: this.briefDescriptionHtmlString,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push('')
    lines.push('## Declaration')

    const classs = (this.collection as Classes).collectionCompoundsById.get(this.id) as Class
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
        const baseCompoundRefs: Map<string, BaseCompoundRefDataModel> = new Map()
        for (const baseCompoundRef of this.baseCompoundRefs) {
          if (!baseCompoundRefs.has(baseCompoundRef.text)) {
            baseCompoundRefs.set(baseCompoundRef.text, baseCompoundRef)
          }
        }

        lines.push('')
        if (baseCompoundRefs.size > 1) {
          lines.push(`## Base ${kindsPlurals[this.kind]?.toLowerCase()}`)
        } else {
          lines.push(`## Base ${this.kind}`)
        }
        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const baseCompoundRef of baseCompoundRefs.values()) {
          // console.log(util.inspect(baseCompoundRef, { compact: false, depth: 999 }))

          if (baseCompoundRef.refid !== undefined) {
            const baseClass = (this.collection as Classes).collectionCompoundsById.get(baseCompoundRef.refid) as Class
            if (baseClass !== undefined) {
              lines.push(...baseClass.renderIndexToLines())
              continue
            }
          }
          const itemName = workspace.renderString(baseCompoundRef.text, 'html')
          lines.push('')

          lines.push(...workspace.renderMembersIndexItemToHtmlLines({
            type: this.kind,
            name: itemName
          }))
        }

        lines.push('')
        lines.push('</table>')
      } else if ('baseClassIds' in classs && classs.baseClassIds.size > 0) {
        lines.push('')
        if (classs.baseClassIds.size > 1) {
          lines.push(`## Base ${kindsPlurals[this.kind]?.toLowerCase()}`)
        } else {
          lines.push(`## Base ${this.kind}`)
        }

        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const baseClassId of classs.baseClassIds) {
          const baseClass = (this.collection as Classes).collectionCompoundsById.get(baseClassId) as Class
          if (baseClass !== undefined) {
            // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))
            lines.push(...baseClass.renderIndexToLines())
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
          // console.log(util.inspect(derivedCompoundRef, { compact: false, depth: 999 }))

          if (derivedCompoundRef.refid !== undefined) {
            const derivedClass = (this.collection as Classes).collectionCompoundsById.get(derivedCompoundRef.refid) as Class
            if (derivedClass !== undefined) {
              lines.push(...derivedClass.renderIndexToLines())
            } else {
              if (this.collection.workspace.pluginOptions.verbose) {
                console.warn('Derived class id', derivedCompoundRef.refid, 'not a defined class')
              }

              const itemName = workspace.renderString(derivedCompoundRef.text.trim(), 'html')
              lines.push('')
              lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
                type: this.kind,
                name: itemName
              }))
            }
          } else {
            const itemName = workspace.renderString(derivedCompoundRef.text.trim(), 'html')
            lines.push('')
            lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
              type: this.kind,
              name: itemName
            }))
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
          const derivedClass = (this.collection as Classes).collectionCompoundsById.get(derivedClassId) as Class
          if (derivedClass !== undefined) {
            // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))
            lines.push(...derivedClass.renderIndexToLines())
          } else {
            console.warn('Derived class id', derivedClassId, 'not a class')
          }
        }

        lines.push('')
        lines.push('</table>')
      }
    }

    lines.push(...this.renderInnerIndicesToLines({
      suffixes: []
    }))

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(...this.renderDetailedDescriptionToHtmlLines({
      briefDescriptionHtmlString: this.briefDescriptionHtmlString,
      detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    if (this.locationLines !== undefined) {
      lines.push(...this.locationLines)
    }

    lines.push(...this.renderSectionsToLines())

    lines.push(...this.renderGeneratedFromToLines())

    return lines
  }

  renderIndexToLines (): string[] {
    // console.log(util.inspect(this, { compact: false, depth: 999 }))
    const lines: string[] = []

    const workspace = this.collection.workspace

    const permalink = workspace.getPagePermalink(this.id)

    const indexName = this.collection.workspace.renderString(this.indexName, 'html')
    const itemType = this.kind
    let itemName
    if (permalink !== undefined && permalink.length > 0) {
      itemName = `<a href="${permalink}">${indexName}</a>`
    } else {
      itemName = indexName
    }

    lines.push('')

    const childrenLines: string[] = []
    const morePermalink = this.renderDetailedDescriptionToHtmlLines !== undefined ? `${permalink}/#details` : undefined
    const briefDescriptionHtmlString: string | undefined = this.briefDescriptionHtmlString
    if ((briefDescriptionHtmlString ?? '').length > 0) {
      childrenLines.push(this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString,
        morePermalink
      }))
    }

    lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
      type: itemType,
      name: itemName,
      childrenLines
    }))

    return lines
  }
}

// ----------------------------------------------------------------------------
