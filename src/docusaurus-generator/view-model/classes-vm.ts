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
import { escapeHtml, escapeMdx, flattenPath, sanitizeHierarchicalPath, sanitizeName } from '../utils.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../types.js'
import { SectionDefCloneDataModel, SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js'
import { Section } from './members-vm.js'
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel } from '../../data-model/compounds/compoundreftype-dm.js'
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js'
import { IndexEntry } from './indices-vm.js'

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
    this.collectionCompoundsById.set(compoundDef.id, classs)

    return classs
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // Recreate classes hierarchies.
    for (const [classId, base] of this.collectionCompoundsById) {
      const classs = base as Class
      for (const baseClassId of classs.baseClassIds) {
        const baseClass = this.collectionCompoundsById.get(baseClassId) as Class
        assert(baseClass !== undefined)
        // console.log('baseClassId', baseClassId, 'has child', classId)
        baseClass.children.push(classs)

        classs.baseClasses.push(baseClass)
      }
    }

    for (const [classId, base] of this.collectionCompoundsById) {
      const classs = base as Class
      if (classs.baseClassIds.length === 0) {
        // console.log('topLevelClassId:', classId)
        this.topLevelClasses.push(classs)
      }
    }
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (): SidebarItem[] {
    // Add classes to the sidebar.
    // Top level classes are added below a Class category
    const classesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Classes',
      link: {
        type: 'doc',
        id: `${this.workspace.permalinkBaseUrl}classes/index`
      },
      collapsed: true,
      items: []
    }

    classesCategory.items.push({
      type: 'category',
      label: '#Index',
      link: {
        type: 'doc',
        id: `${this.workspace.permalinkBaseUrl}index/classes/all`
      },
      collapsed: true,
      items: [
        {
          type: 'doc',
          label: 'All',
          id: `${this.workspace.permalinkBaseUrl}index/classes/all`
        },
        {
          type: 'doc',
          label: 'Classes',
          id: `${this.workspace.permalinkBaseUrl}index/classes/classes`
        },
        {
          type: 'doc',
          label: 'Functions',
          id: `${this.workspace.permalinkBaseUrl}index/classes/functions`
        },
        {
          type: 'doc',
          label: 'Variables',
          id: `${this.workspace.permalinkBaseUrl}index/classes/variables`
        },
        {
          type: 'doc',
          label: 'Typedefs',
          id: `${this.workspace.permalinkBaseUrl}index/classes/typedefs`
        }
      ]
    })

    for (const classs of this.topLevelClasses) {
      classesCategory.items.push(this.createSidebarItemRecursively(classs))
    }

    return [classesCategory]
  }

  private createSidebarItemRecursively (classs: Class): SidebarItem {
    if (classs.children.length === 0) {
      const docItem: SidebarDocItem = {
        type: 'doc',
        label: classs.sidebarLabel,
        id: `${this.workspace.permalinkBaseUrl}${classs.docusaurusId}`
      }
      return docItem
    } else {
      const categoryItem: SidebarCategoryItem = {
        type: 'category',
        label: classs.sidebarLabel,
        link: {
          type: 'doc',
          id: `${this.workspace.permalinkBaseUrl}${classs.docusaurusId}`
        },
        collapsed: true,
        items: []
      }

      for (const childClass of classs.children) {
        categoryItem.items.push(this.createSidebarItemRecursively(childClass as Class))
      }

      return categoryItem
    }
  }

  // --------------------------------------------------------------------------

  override createMenuItems (): MenuItem[] {
    const menuItem: MenuItem = {
      label: 'Classes',
      to: `/${this.workspace.pluginOptions.outputFolderPath}/classes/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath
    const filePath = `${outputFolderPath}/classes/index.mdx`
    const permalink = 'classes'

    const frontMatter: FrontMatter = {
      title: 'The Classes Reference',
      slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'classes', 'reference']
    }

    const lines: string[] = []

    lines.push('The classes, structs, union and interfaces used by this project are:')

    lines.push('')
    lines.push('<TreeTable>')

    for (const classs of this.topLevelClasses) {
      lines.push(...this.generateIndexMdxFileRecursively(classs, 1))
    }

    lines.push('')
    lines.push('</TreeTable>')

    console.log(`Writing classes index file ${filePath}...`)
    await this.workspace.writeMdxFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxFileRecursively (classs: Class, depth: number): string[] {
    // console.log(util.inspect(classs, { compact: false, depth: 999 }))

    const lines: string[] = []

    const permalink = this.workspace.getPagePermalink(classs.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C',
      struct: 'S'
    }

    let iconLetter: string | undefined = iconLetters[classs.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', classs.kind, 'not supported yet in', this.constructor.name, '(using ?)')
      iconLetter = '?'
    }

    const label = escapeMdx(classs.unqualifiedName)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push(`  itemIconLetter="${iconLetter}"`)
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth = "${depth}" >`)

    if (classs.briefDescriptionMdxText !== undefined && classs.briefDescriptionMdxText.length > 0) {
      lines.push(classs.briefDescriptionMdxText.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (classs.children.length > 0) {
      for (const childClass of classs.children) {
        lines.push(...this.generateIndexMdxFileRecursively(childClass as Class, depth + 1))
      }
    }

    return lines
  }

  override async generatePerInitialsIndexMdxFiles (): Promise<void> {
    const allUnorderedEntriesMap: Map<string, IndexEntry> = new Map()
    for (const [compoundId, compound] of this.collectionCompoundsById) {
      const compoundEntry = new IndexEntry(compound as Class)
      allUnorderedEntriesMap.set(compoundEntry.id, compoundEntry)
      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new IndexEntry(member)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
        }
      }
    }

    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}/index/classes/all.mdx`
      const permalink = 'index/classes/all'

      const frontMatter: FrontMatter = {
        title: 'The Classes and Members Index',
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'classes', 'index']
      }

      const lines: string[] = []

      lines.push('The classes, structs, union interfaces and their members, variables, types used by this project are:')

      const orderedEntriesMap = this.orderPerInitials(allUnorderedEntriesMap)

      lines.push(...this.outputEntries(orderedEntriesMap))

      console.log(`Writing index file ${filePath}...`)
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}/index/classes/classes.mdx`
      const permalink = 'index/classes/classes'

      const frontMatter: FrontMatter = {
        title: 'The Classes Index',
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
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
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}/index/classes/functions.mdx`
      const permalink = 'index/classes/functions'

      const frontMatter: FrontMatter = {
        title: 'The Class Functions Index',
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
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
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}/index/classes/variables.mdx`
      const permalink = 'index/classes/variables'

      const frontMatter: FrontMatter = {
        title: 'The Class Variables Index',
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
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
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------

    {
      const filePath = `${outputFolderPath}/index/classes/typedefs.mdx`
      const permalink = 'index/classes/typedefs'

      const frontMatter: FrontMatter = {
        title: 'The Class Type Definitions Index',
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
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
      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines: lines
      })
    }

    // ------------------------------------------------------------------------
  }

  orderPerInitials (entriesMap: Map<string, IndexEntry>): Map<string, IndexEntry[]> {
    const entriesPerInitialsMap: Map<string, IndexEntry[]> = new Map()

    for (const [id, entry] of entriesMap) {
      const initial: string = entry.name.charAt(0)
      let mapArray = entriesPerInitialsMap.get(initial)
      if (mapArray === undefined) {
        mapArray = []
        entriesPerInitialsMap.set(initial, mapArray)
      }
      mapArray.push(entry)
    }

    const orderedMap: Map<string, IndexEntry[]> = new Map()
    const orderedInitials = Array.from(entriesPerInitialsMap.keys()).sort()
    for (const initial of orderedInitials) {
      const unorderedArray = entriesPerInitialsMap.get(initial)
      assert(unorderedArray !== undefined)
      const orderedArray = unorderedArray.sort((a, b) => {
        let nameComparison = a.name.localeCompare(b.name)
        if (nameComparison !== 0) {
          return nameComparison
        }
        nameComparison = a.longName.localeCompare(b.longName)
        return nameComparison
      })
      orderedMap.set(initial, orderedArray)
    }

    return orderedMap
  }

  outputEntries (entriesPerInitialsMap: Map<string, IndexEntry[]>): string[] {
    const lines: string[] = []

    for (const initial of entriesPerInitialsMap.keys()) {
      lines.push('')
      lines.push(`## - ${escapeMdx(initial)} -`)
      lines.push('')
      const mapArray = entriesPerInitialsMap.get(initial)
      assert(mapArray !== undefined)
      for (const entry of mapArray) {
        let kind = ''
        if (entry.objectKind === 'compound') {
          kind = `${entry.kind} `
        }
        lines.push(`- ${escapeMdx(entry.name)}: <Link to="${entry.permalink}">${kind}${escapeMdx(entry.longName)}</Link>`)
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Class extends CompoundBase {
  // Due to multiple-inheritance, there can be multiple parents.
  baseClassIds: string[] = []
  baseClasses: Class[] = []

  fullyQualifiedName: string = '?'
  unqualifiedName: string = '?'
  templateParameters: string = ''

  classFullNameMdxText: string = '?'
  templateMdxText: string | undefined

  // Shortcut, use data model objects.
  baseCompoundRefs: BaseCompoundRefDataModel[] | undefined
  derivedCompoundRefs: DerivedCompoundRefDataModel[] | undefined

  templateParamList: TemplateParamListDataModel | undefined
  // --------------------------------------------------------------------------

  constructor (collection: Classes, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Class.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.baseCompoundRefs)) {
      for (const ref of compoundDef.baseCompoundRefs) {
        // console.log('component', compoundDef.id, 'has base', ref.refid)
        if (ref.refid !== undefined) {
          this.baseClassIds.push(ref.refid)
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
      indexNameTemplateParameters = this.renderTemplateParameterNamesToMdxText(compoundDef.templateParamList)
    }

    this.sidebarLabel = this.unqualifiedName

    this.indexName = `${this.unqualifiedName}${indexNameTemplateParameters}`

    const kind = compoundDef.kind
    const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    this.pageTitle = `The \`${escapeHtml(this.unqualifiedName)}\` ${kindCapitalised}`
    if (compoundDef.templateParamList !== undefined) {
      this.pageTitle += ' Template'
    }
    this.pageTitle += ' Reference'

    const pluralKind = (kind === 'class' ? 'classes' : 'structs')

    // Turn the namespace into a hierarchical path. Keep the dot.
    let sanitizedPath: string = sanitizeHierarchicalPath(this.fullyQualifiedName.replaceAll(/::/g, '/'))
    if (this.templateParameters?.length > 0) {
      sanitizedPath += sanitizeName(this.templateParameters)
    }
    this.relativePermalink = `${pluralKind}/${sanitizedPath}`

    // Replace slash with dash.
    this.docusaurusId = `${pluralKind}/${flattenPath(sanitizedPath)}`

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        if ((compoundDef.kind === 'class' || compoundDef.kind === 'struct') &&
          (sectionDef.kind === 'public-func' || sectionDef.kind === 'protected-func' || sectionDef.kind === 'private-func')) {
          this.sections.push(...this.splitSections(this, sectionDef))
        } else {
          if (sectionDef.hasMembers()) {
            this.sections.push(new Section(this, sectionDef))
          }
        }
      }
    }

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

    let classFullName = this.fullyQualifiedName
    if (this.templateParameters.length > 0) {
      classFullName += escapeMdx(this.templateParameters)
    } else {
      classFullName += escapeMdx(this.renderTemplateParameterNamesToMdxText(compoundDef.templateParamList))
    }
    this.classFullNameMdxText = classFullName

    if (compoundDef.templateParamList?.params !== undefined) {
      this.templateMdxText = escapeMdx(this.renderTemplateParametersToMdxText({
        templateParamList: compoundDef.templateParamList,
        withDefaults: true
      }))
    }

    this.baseCompoundRefs = compoundDef.baseCompoundRefs
    this.derivedCompoundRefs = compoundDef.derivedCompoundRefs
    this.templateParamList = compoundDef.templateParamList
  }

  private splitSections (classs: Class, sectionDef: SectionDefDataModel): Section[] {
    const sections: Section[] = []

    const constructorSectionsDef: SectionDefCloneDataModel = new SectionDefCloneDataModel(sectionDef)
    constructorSectionsDef.adjustKind('constructor')

    const destructorSectionsDef: SectionDefCloneDataModel = new SectionDefCloneDataModel(sectionDef)
    destructorSectionsDef.adjustKind('destructor')

    const functionsSectionsDef: SectionDefCloneDataModel = new SectionDefCloneDataModel(sectionDef)

    if (sectionDef.memberDefs !== undefined) {
      constructorSectionsDef.memberDefs = undefined
      destructorSectionsDef.memberDefs = undefined
      functionsSectionsDef.memberDefs = undefined

      for (const memberDef of sectionDef.memberDefs) {
        // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
        if (memberDef.name === classs.unqualifiedName) {
          if (constructorSectionsDef.memberDefs === undefined) {
            constructorSectionsDef.memberDefs = []
          }
          constructorSectionsDef.memberDefs.push(memberDef)
        } else if (memberDef.name.replace('~', '') === classs.unqualifiedName) {
          assert(destructorSectionsDef.memberDefs === undefined)
          destructorSectionsDef.memberDefs = [memberDef]
        } else {
          if (functionsSectionsDef.memberDefs === undefined) {
            functionsSectionsDef.memberDefs = []
          }
          functionsSectionsDef.memberDefs.push(memberDef)
        }
      }
    }

    if (constructorSectionsDef.hasMembers()) {
      sections.push(new Section(this, constructorSectionsDef))
    }

    if (destructorSectionsDef.hasMembers()) {
      sections.push(new Section(this, destructorSectionsDef))
    }

    if (functionsSectionsDef.hasMembers()) {
      sections.push(new Section(this, functionsSectionsDef))
    }

    return sections
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    frontMatter.toc_max_heading_level = 3

    const descriptionTodo = `@${this.kind} ${escapeMdx(this.compoundName)}`

    const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToMdxText({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push('')
    lines.push('## Declaration')

    const classs = (this.collection as Classes).collectionCompoundsById.get(this.id) as Class
    assert(classs !== undefined)

    // const classFullName = this.classFullNameMdxText

    if (this.templateMdxText !== undefined) {
      lines.push('')
      // Intentionally on two lines.
      lines.push(`<CodeBlock>template ${this.templateMdxText}`)
      lines.push(`${this.kind} ${this.classFullNameMdxText};</CodeBlock>`)
    } else {
      lines.push('')
      lines.push(`<CodeBlock>${this.kind} ${this.classFullNameMdxText};</CodeBlock>`)
    }

    lines.push(...this.renderIncludesIndexToMdxLines())

    if (this.kind === 'class') {
      if (this.baseCompoundRefs !== undefined) {
        lines.push('')
        if (this.baseCompoundRefs.length > 1) {
          lines.push('## Base classes')
        } else {
          lines.push('## Base class')
        }
        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const baseCompoundRef of this.baseCompoundRefs) {
          // console.log(util.inspect(baseCompoundRef, { compact: false, depth: 999 }))

          if (baseCompoundRef.refid !== undefined) {
            const baseClass = (this.collection as Classes).collectionCompoundsById.get(baseCompoundRef.refid) as Class
            assert(baseClass !== undefined)

            lines.push(...baseClass.renderIndexToMdxLines())
          } else {
            const itemName = escapeMdx(baseCompoundRef.text)
            lines.push('')
            lines.push('<MembersIndexItem')
            lines.push(`  type="${this.kind}"`)
            lines.push(`  name={<>${itemName}</>}>`)
            lines.push('</MembersIndexItem>')
          }
        }

        lines.push('')
        lines.push('</MembersIndex>')
      } else if ('baseClassIds' in classs && classs.baseClassIds.length > 0) {
        lines.push('')
        if (classs.baseClassIds.length > 1) {
          lines.push('## Base classes')
        } else {
          lines.push('## Base class')
        }

        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const baseClassId of classs.baseClassIds) {
          const baseClass = (this.collection as Classes).collectionCompoundsById.get(baseClassId) as Class
          assert(baseClass !== undefined)
          // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))

          lines.push(...baseClass.renderIndexToMdxLines())
        }

        lines.push('')
        lines.push('</MembersIndex>')
      }

      if (this.derivedCompoundRefs !== undefined) {
        lines.push('')
        lines.push('## Derived Classes')

        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const derivedCompoundRef of this.derivedCompoundRefs) {
          // console.log(util.inspect(derivedCompoundRef, { compact: false, depth: 999 }))

          if (derivedCompoundRef.refid !== undefined) {
            const derivedClass = (this.collection as Classes).collectionCompoundsById.get(derivedCompoundRef.refid) as Class
            assert(derivedClass !== undefined)

            lines.push(...derivedClass.renderIndexToMdxLines())
          } else {
            const itemName = escapeMdx(derivedCompoundRef.text.trim())
            lines.push('')
            lines.push('<MembersIndexItem')
            lines.push(`  type="${this.kind}"`)
            lines.push(`  name={<>${itemName}</>}>`)
            lines.push('</MembersIndexItem>')
          }
        }

        lines.push('')
        lines.push('</MembersIndex>')
      } else if ('derivedClassIds' in classs && classs.childrenIds.length > 0) {
        lines.push('')
        lines.push('## Derived Classes')

        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const derivedClassId of classs.childrenIds) {
          const derivedClass = (this.collection as Classes).collectionCompoundsById.get(derivedClassId) as Class
          assert(derivedClass !== undefined)
          // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))

          lines.push(...derivedClass.renderIndexToMdxLines())
        }

        lines.push('')
        lines.push('</MembersIndex>')
      }
    }

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: []
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      detailedDescriptionMdxText: this.detailedDescriptionMdxText,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    if (this.locationMdxText !== undefined) {
      lines.push(this.locationMdxText)
    }

    lines.push(...this.renderSectionsToMdxLines())

    lines.push(...this.renderGeneratedFromToMdxLines())

    return lines
  }

  renderIndexToMdxLines (): string[] {
    // console.log(util.inspect(this, { compact: false, depth: 999 }))
    const lines: string[] = []

    const workspace = this.collection.workspace

    const permalink = workspace.getPagePermalink(this.id)

    const itemType = this.kind
    const itemName = `<Link to="${permalink}">${escapeMdx(this.indexName)}</Link>`

    lines.push('<MembersIndexItem')
    lines.push(`  type="${itemType}"`)
    if (itemName.includes('<') || itemName.includes('&')) {
      lines.push(`  name={<>${itemName}</>}>`)
    } else {
      lines.push(`  name="${itemName}">`)
    }

    const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? `${permalink}/#details` : undefined
    const briefDescriptionMdxText: string | undefined = this.briefDescriptionMdxText
    if ((briefDescriptionMdxText ?? '').length > 0) {
      lines.push(this.renderBriefDescriptionToMdxText({
        briefDescriptionMdxText,
        morePermalink
      }))
    }

    lines.push('</MembersIndexItem>')

    return lines
  }
}

// ----------------------------------------------------------------------------
