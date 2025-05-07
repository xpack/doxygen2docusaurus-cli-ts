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
import { escapeMdx, flattenPath, sanitizeHierarchicalPath, sanitizeName } from '../../docusaurus-generator/utils.js'
import { SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../../docusaurus-generator/types.js'

// ----------------------------------------------------------------------------

export class Classes extends CollectionBase {
  compoundsById: Map<string, Class>
  topLevelClasses: Class[] = []

  constructor (workspace: Workspace) {
    super(workspace)

    this.compoundsById = new Map()
  }

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    const classs = new Class(this, compoundDef)
    this.compoundsById.set(compoundDef.id, classs)

    return classs
  }

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

  override async generateIndexDotMdxFile (): Promise<void> {
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath
    const filePath = `${outputFolderPath}/classes/index.mdx`
    const permalink = 'classes'

    const frontMatter: FrontMatter = {
      title: 'The Classes Reference',
      slug: `${this.workspace.permalinkBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'classes', 'reference']
    }

    const lines: string[] = []

    lines.push('The classes, structs, union and interfaces used by this project are:')

    lines.push('')
    lines.push('<TreeTable>')

    for (const classs of this.topLevelClasses) {
      lines.push(...this.generateIndexMdxRecursively(classs, 1))
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

  private generateIndexMdxRecursively (classs: Class, depth: number): string[] {
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
    lines.push(`<TreeTableRow itemIconLetter="${iconLetter}" itemLabel="${label}" itemLink="${permalink}" depth = "${depth}" >`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (classs.children.length > 0) {
      for (const childClass of classs.children) {
        lines.push(...this.generateIndexMdxRecursively(childClass as Class, depth + 1))
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Class extends CompoundBase {
  collection: Classes

  // Due to multiple-inheritance, there can be multiple parents.
  baseClassIds: string[] = []
  baseClasses: Class[] = []

  fullyQualifiedName: string = '?'
  unqualifiedName: string = '?'
  templateParameters: string = ''

  constructor (collection: Classes, compoundDef: CompoundDefDataModel) {
    super(compoundDef)

    this.collection = collection

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
    if (index >= 0) {
      this.templateParameters = compoundDef.compoundName.substring(index)
    }

    this.sidebarLabel = this.unqualifiedName

    this.indexName = this.unqualifiedName + (this.templateParameters ?? '')

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

    // console.log('1', compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log('6', this.templateParameters)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
