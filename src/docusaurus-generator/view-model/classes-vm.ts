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
import { Workspace } from '../workspace.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath, sanitizeName } from '../utils.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../types.js'
import { SectionDefCloneDataModel, SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js'
import { Section } from './members-vm.js'

// ----------------------------------------------------------------------------

export class Classes extends CollectionBase {
  compoundsById: Map<string, Class>
  topLevelClasses: Class[] = []

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    super(workspace)

    this.compoundsById = new Map()
  }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const classs = new Class(this, compoundDef)
    this.compoundsById.set(compoundDef.id, classs)

    return classs
  }

  // --------------------------------------------------------------------------

  override createHierarchies (): void {
    // Recreate classes hierarchies.
    for (const [classId, classs] of this.compoundsById) {
      for (const baseClassId of classs.baseClassIds) {
        const baseClass = this.compoundsById.get(baseClassId)
        assert(baseClass !== undefined)
        // console.log('baseClassId', baseClassId, 'has child', classId)
        baseClass.children.push(classs)

        classs.baseClasses.push(baseClass)
      }
    }

    for (const [classId, classs] of this.compoundsById) {
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
    await this.workspace.writeFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxFileRecursively (classs: Class, depth: number): string[] {
    // console.log(util.inspect(classs, { compact: false, depth: 999 }))

    const lines: string[] = []

    const compoundDef = classs.compoundDef

    const permalink = this.workspace.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C',
      struct: 'S'
    }

    let iconLetter: string | undefined = iconLetters[compoundDef.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', compoundDef.kind, 'not supported yet in', this.constructor.name, '(using ?)')
      iconLetter = '?'
    }

    const label = escapeMdx(classs.unqualifiedName)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push(`  itemIconLetter="${iconLetter}"`)
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth = "${depth}" >`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (classs.children.length > 0) {
      for (const childClass of classs.children) {
        lines.push(...this.generateIndexMdxFileRecursively(childClass as Class, depth + 1))
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
      console.log('baburiba', compoundDef.compoundName, indexNameTemplateParameters)
    } else if (compoundDef.templateParamList !== undefined) {
      indexNameTemplateParameters = this.renderTemplateParameterNamesToMdxText(compoundDef.templateParamList)
    }

    this.sidebarLabel = this.unqualifiedName

    this.indexName = `${this.unqualifiedName}${indexNameTemplateParameters}`

    const kind = compoundDef.kind
    const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    this.pageTitle = `The \`${this.unqualifiedName}\` ${kindCapitalised}`
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

    // if (sectionDef.members !== undefined) {
    //   constructorSectionsDef.members = undefined
    //   destructorSectionsDef.members = undefined
    //   functionsSectionsDef.members = undefined

    //   for (const member of sectionDef.members) {
    //     // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    //     if (member.name === classs.unqualifiedName) {
    //       if (constructorSectionsDef.members === undefined) {
    //         constructorSectionsDef.members = []
    //       }
    //       constructorSectionsDef.members.push(member)
    //     } else if (member.name.replace('~', '') === classs.unqualifiedName) {
    //       assert(destructorSectionsDef.members === undefined)
    //       destructorSectionsDef.members = [member]
    //     } else {
    //       if (functionsSectionsDef.members === undefined) {
    //         functionsSectionsDef.members = []
    //       }
    //       functionsSectionsDef.members.push(member)
    //     }
    //   }
    // }

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

    const compoundDef = this.compoundDef
    const kind = compoundDef.kind
    const descriptionTodo = `@${kind} ${compoundDef.compoundName}`

    lines.push(this.renderBriefDescriptionToMdxText({
      todo: descriptionTodo,
      morePermalink: '#details'
    }))

    lines.push('')
    lines.push('## Declaration')

    const classs = (this.collection as Classes).compoundsById.get(compoundDef.id)
    assert(classs !== undefined)

    let classFullName = classs.fullyQualifiedName
    if (classs.templateParameters.length > 0) {
      classFullName += escapeMdx(classs.templateParameters)
    } else {
      classFullName += escapeMdx(this.renderTemplateParameterNamesToMdxText(compoundDef.templateParamList))
    }

    if (compoundDef.templateParamList?.params !== undefined) {
      const template = escapeMdx(this.renderTemplateParametersToMdxText({
        templateParamList: compoundDef.templateParamList,
        withDefaults: true
      }))

      lines.push('')
      // Intentionally on two lines.
      lines.push(`<CodeBlock>template ${template}`)
      lines.push(`${kind} ${classFullName};</CodeBlock>`)
    } else {
      lines.push('')
      lines.push(`<CodeBlock>${kind} ${classFullName};</CodeBlock>`)
    }

    lines.push(...this.renderIncludesIndexToMdxLines())

    if (kind === 'class') {
      if (compoundDef.baseCompoundRefs !== undefined) {
        lines.push('')
        if (compoundDef.baseCompoundRefs.length > 1) {
          lines.push('## Base classes')
        } else {
          lines.push('## Base class')
        }
        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const baseCompoundRef of compoundDef.baseCompoundRefs) {
          // console.log(util.inspect(baseCompoundRef, { compact: false, depth: 999 }))

          if (baseCompoundRef.refid !== undefined) {
            const baseClass = (this.collection as Classes).compoundsById.get(baseCompoundRef.refid)
            assert(baseClass !== undefined)

            lines.push(...baseClass.renderIndexToMdxLines())
          } else {
            const itemName = escapeMdx(baseCompoundRef.text)
            lines.push('')
            lines.push('<MembersIndexItem')
            lines.push(`  type="${kind}"`)
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
          const baseClass = (this.collection as Classes).compoundsById.get(baseClassId)
          assert(baseClass !== undefined)
          // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))

          lines.push(...baseClass.renderIndexToMdxLines())
        }

        lines.push('')
        lines.push('</MembersIndex>')
      }

      if (compoundDef.derivedCompoundRefs !== undefined) {
        lines.push('')
        lines.push('## Derived Classes')

        lines.push('')
        lines.push('<MembersIndex>')
        lines.push('')

        for (const derivedCompoundRef of compoundDef.derivedCompoundRefs) {
          // console.log(util.inspect(derivedCompoundRef, { compact: false, depth: 999 }))

          if (derivedCompoundRef.refid !== undefined) {
            const derivedClass = (this.collection as Classes).compoundsById.get(derivedCompoundRef.refid)
            assert(derivedClass !== undefined)

            lines.push(...derivedClass.renderIndexToMdxLines())
          } else {
            const itemName = escapeMdx(derivedCompoundRef.text.trim())
            lines.push('')
            lines.push('<MembersIndexItem')
            lines.push(`  type="${kind}"`)
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
          const derivedClass = (this.collection as Classes).compoundsById.get(derivedClassId)
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
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    }))

    lines.push(this.renderLocationToMdxText(compoundDef.location))

    lines.push(...this.renderSectionsToMdxLines())

    lines.push(...this.renderGeneratedFromToMdxLines())

    return lines
  }

  renderIndexToMdxLines (): string[] {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const workspace = this.collection.workspace

    const permalink = workspace.getPagePermalink(compoundDef.id)

    const itemType = compoundDef.kind
    const itemName = `<Link to="${permalink}">${escapeMdx(this.indexName)}</Link>`

    lines.push('<MembersIndexItem')
    lines.push(`  type="${itemType}"`)
    lines.push(`  name={${itemName}}>`)

    const briefDescriptionMdxText: string | undefined = this.briefDescriptionMdxText
    if ((briefDescriptionMdxText ?? '').length > 0) {
      lines.push(this.renderBriefDescriptionToMdxText({
        briefDescriptionMdxText,
        morePermalink: `${permalink}/#details`
      }))
    }

    lines.push('</MembersIndexItem>')

    return lines
  }
}

// ----------------------------------------------------------------------------
