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

import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { FrontMatter } from '../types.js'
import { DetailedDescriptionDataModel, Sect1DataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { CollectionBase } from './collection-base.js'
import { AbstractRefType } from '../../data-model/compounds/reftype-dm.js'
import { escapeMdx, getPermalinkAnchor } from '../utils.js'
import { SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js'
import { MemberDefDataModel } from '../../data-model/compounds/memberdeftype-dm.js'
import { Class } from './classes-vm.js'
import { Section } from './members-vm.js'
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js'
import { RefTextDataModel } from '../../data-model/compounds/reftexttype-dm.js'
import { DefValDataModel } from '../../data-model/compounds/linkedtexttype-dm.js'
import { LocationDataModel } from '../../data-model/compounds/locationtype-dm.js'
import { FilesAndFolders } from './files-and-folders-vm.js'

// ----------------------------------------------------------------------------

export abstract class CompoundBase {
  // Reference to the data model object.
  compoundDef: CompoundDefDataModel

  // The collection this compound is part of.
  collection: CollectionBase

  // Not used for classes, see Class.baseClasses.
  parent?: CompoundBase

  // Set in 2 steps, first the Ids and then, when all objects are in, the references.
  // Folder objects use separate arrays for files and folders children.
  childrenIds: string[] = []
  children: CompoundBase[] = []

  /** Relative path to the output folder, starts with plural kind. */
  docusaurusId: string = ''

  /** Short name, to fit the limited space in the sidebar. */
  sidebarLabel: string = ''

  /** The part below outputFolderPath, no leading slash. */
  relativePermalink: string | undefined

  /** The name shown in the index section. */
  indexName: string = ''

  /** The name shown in the page title. */
  pageTitle: string = ''

  briefDescriptionMdxText: string | undefined

  sections: Section[] = []

  // --------------------------------------------------------------------------

  constructor (collection: CollectionBase, compoundDef: CompoundDefDataModel) {
    this.compoundDef = compoundDef

    this.collection = collection

    const workspace = this.collection.workspace

    if (this.compoundDef.briefDescription !== undefined) {
      this.briefDescriptionMdxText = workspace.renderElementToMdxText(this.compoundDef.briefDescription)
    }
  }

  // --------------------------------------------------------------------------

  abstract renderToMdxLines (frontMatter: FrontMatter): string[]

  // --------------------------------------------------------------------------

  renderBriefDescriptionToMdxText ({
    briefDescriptionMdxText = this.briefDescriptionMdxText,
    todo = '',
    morePermalink
  }: {
    briefDescriptionMdxText?: string | undefined
    todo?: string
    morePermalink?: string | undefined
  }): string {
    let text: string = ''

    // console.log(this)

    if (briefDescriptionMdxText === undefined) {
      return ''
    }

    if (briefDescriptionMdxText.length > 0) {
      text += briefDescriptionMdxText
      if (morePermalink !== undefined && morePermalink.length > 0) {
        text += ` <Link to="${morePermalink}">`
        text += 'More...'
        text += '</Link>'
      }
    } else if (todo.length > 0) {
      text += `TODO: add <code>@brief</code> to <code>${todo}</code>`
    }

    return text
  }

  renderDetailedDescriptionToMdxLines ({
    detailedDescription,
    todo = '',
    showHeader = true
  }: {
    detailedDescription: DetailedDescriptionDataModel | undefined
    todo?: string
    showHeader?: boolean
  }): string[] {
    const lines: string[] = []

    let hasSect1 = false
    if (detailedDescription !== undefined) {
      for (const child of detailedDescription?.children) {
        if (child instanceof Sect1DataModel) {
          hasSect1 = true
          break
        }
      }
    }

    const workspace = this.collection.workspace

    const detailedDescriptionMdxText: string = workspace.renderElementToMdxText(detailedDescription).trim()
    if (showHeader && !hasSect1) {
      if (detailedDescriptionMdxText.length > 0 || todo.length > 0) {
        lines.push('')
        lines.push('## Description {#details}')
      } else {
        if (todo.length > 0) {
          // Ensure an anchor is generated even if the top description is missing.
          lines.push('')
          lines.push('<Link id="#details" />')
        }
      }
    } else {
      if (todo.length > 0) {
        lines.push('')
        lines.push('<Link id="#details" />')
      }
    }

    // Deviate from Doxygen and do not repeat the brief in the detailed section.
    // console.log(util.inspect(compoundDef.detailedDescription, { compact: false, depth: 999 }))
    if (detailedDescriptionMdxText.length > 0) {
      lines.push('')
      lines.push(detailedDescriptionMdxText)
    } else if (todo.length > 0) {
      lines.push('')
      lines.push(`TODO: add <code>@details</code> to <code>${todo}</code>`)
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderInnerIndicesToMdxLines ({
    suffixes = []
  }: {
    suffixes?: string[]
  }): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef
    for (const innerKey of Object.keys(compoundDef)) {
      if (innerKey.startsWith('inner')) {
        const suffix = innerKey.substring(5)
        if (!suffixes.includes(suffix)) {
          console.warn(innerKey, 'not processed for', compoundDef.compoundName, 'in renderInnerIndicesMdx')
          continue
        }
      }
    }

    const workspace = this.collection.workspace

    for (const suffix of suffixes) {
      const innerKey = `inner${suffix}`
      const innerObjects = (compoundDef as any)[innerKey] as AbstractRefType[]

      if (innerObjects !== undefined && innerObjects.length > 0) {
        lines.push('')
        lines.push(`## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index`)

        lines.push('')
        lines.push('<MembersIndex>')

        for (const innerObject of innerObjects) {
          // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
          const innerDataObject = workspace.compoundsById.get(innerObject.refid)
          assert(innerDataObject !== undefined)

          const innerCompoundDef = innerDataObject.compoundDef
          assert(innerCompoundDef !== undefined)

          const permalink = workspace.getPagePermalink(innerObject.refid)

          const kind = innerCompoundDef.kind

          const itemType = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind)
          const itemName = `<Link to="${permalink}">${escapeMdx(innerDataObject.indexName)}</Link>`

          lines.push('')
          lines.push('<MembersIndexItem')
          lines.push(`  type="${itemType}"`)
          lines.push(`  name={${itemName}}>`)

          const briefDescriptionMdxText: string = workspace.renderElementToMdxText(innerCompoundDef.briefDescription)
          if (briefDescriptionMdxText.length > 0) {
            lines.push(this.renderBriefDescriptionToMdxText({
              briefDescriptionMdxText,
              morePermalink: `${permalink}/#details`
            }))
          }

          lines.push('</MembersIndexItem>')
        }

        lines.push('')
        lines.push('</MembersIndex>')
      }
    }

    return lines
  }

  renderSectionIndicesToMdxLines (): string[] {
    const lines: string[] = []

    for (const section of this.sections) {
      // console.log(sectionDef)
      lines.push(...section.renderIndexToMdxLines())
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderIncludesIndexToMdxLines (): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const workspace = this.collection.workspace

    if (compoundDef.includes !== undefined) {
      lines.push('')
      lines.push('## Included Headers')

      lines.push('')
      lines.push('<IncludesList>')

      for (const include of compoundDef.includes) {
        lines.push(workspace.renderElementToMdxText(include))
      }

      lines.push('</IncludesList>')
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderSectionsToMdxLines (): string[] {
    const lines: string[] = []

    if (this.sections !== undefined) {
      for (const section of this.sections) {
        lines.push(...section.renderToMdxLines())
      }
    }

    return lines
  }

  renderLocationToMdxText (location: LocationDataModel | undefined): string {
    let text: string = ''

    const workspace = this.collection.workspace

    if (location !== undefined) {
      // console.log(location.file)
      const files: FilesAndFolders = workspace.viewModel.get('files') as FilesAndFolders
      assert(files !== undefined)
      const file = files.filesByPath.get(location.file)
      assert(file !== undefined)
      const permalink = workspace.getPagePermalink(file.compoundDef.id)

      text += '\n'
      if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
        text += 'Declaration at line '
        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
        text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`
        text += ' of file '
        text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file) as string)}</Link>`

        const definitionFile = files.filesByPath.get(location.bodyfile)
        assert(definitionFile !== undefined)
        const definitionPermalink = workspace.getPagePermalink(definitionFile.compoundDef.id)

        text += ', definition at line '
        const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`
        text += `<Link to="${definitionPermalink}/#${lineStart}">${escapeMdx(location.bodystart?.toString() ?? '?')}</Link>`
        text += ' of file '
        text += `<Link to="${definitionPermalink}">${escapeMdx(path.basename(location.bodyfile) as string)}</Link>`
        text += '.'
      } else {
        text += 'Definition at line '
        const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
        text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`
        text += ' of file '
        text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file) as string)}</Link>`
        text += '.'
      }
    }

    return text
  }

  renderGeneratedFromToMdxLines (): string[] {
    const lines: string[] = []

    const compoundDef: CompoundDefDataModel = this.compoundDef
    const locationSet: Set<string> = new Set()

    const workspace = this.collection.workspace

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        if (sectionDef.memberDefs !== undefined) {
          for (const memberDef of sectionDef.memberDefs) {
            if (memberDef.location !== undefined) {
              const file = memberDef.location.file
              locationSet.add(file)
              if (memberDef.location.bodyfile !== undefined) {
                locationSet.add(memberDef.location.bodyfile)
              }
            }
          }
        }
      }
    }

    if (locationSet.size > 0) {
      lines.push('')
      lines.push('<hr/>')
      lines.push('')
      lines.push(`The documentation for this ${compoundDef.kind} was generated from the following file${locationSet.size > 1 ? 's' : ''}:`)
      lines.push('')

      lines.push('<ul>')

      const files: FilesAndFolders = workspace.viewModel.get('files') as FilesAndFolders

      const sortedFiles = [...locationSet].sort()
      for (const fileName of sortedFiles) {
        const file = files.filesByPath.get(fileName)
        assert(file !== undefined)
        const permalink = workspace.getPagePermalink(file.compoundDef.id)
        lines.push(`<li><Link to="${permalink}">${path.basename(fileName) as string}</Link></li>`)
      }
      lines.push('</ul>')
    }

    return lines
  }

  // --------------------------------------------------------------------------

  /**
   * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
   * @param templateParamList
   * @returns
   */
  collectTemplateParameters ({
    templateParamList,
    withDefaults = false
  }: {
    templateParamList: TemplateParamListDataModel | undefined
    withDefaults?: boolean
  }): string[] {
    if (templateParamList?.params === undefined) {
      return []
    }

    const templateParameters: string[] = []

    for (const param of templateParamList.params) {
      // console.log(util.inspect(param, { compact: false, depth: 999 }))
      assert(param.type !== undefined)

      let paramString = ''
      for (const child of param.type.children) {
        if (typeof child === 'string') {
          paramString += child
        } else if (child as object instanceof RefTextDataModel) {
          paramString += (child as RefTextDataModel).text
        }
        if (param.declname !== undefined) {
          paramString += ` ${param.declname}`
        }

        if (withDefaults) {
          if (param.defval !== undefined) {
            const defval: DefValDataModel = param.defval
            assert(defval.children.length === 1)
            if (typeof defval.children[0] === 'string') {
              paramString += ` = ${defval.children[0]}`
            } else if (defval.children[0] as object instanceof RefTextDataModel) {
              paramString += ` = ${(defval.children[0] as RefTextDataModel).text}`
            }
          }
        }
      }

      templateParameters.push(paramString)
    }

    return templateParameters
  }

  isTemplate (templateParamList: TemplateParamListDataModel | undefined): boolean {
    return (templateParamList?.params ?? []).length > 0
  }

  collectTemplateParameterNames (templateParamList: TemplateParamListDataModel): string[] {
    if (templateParamList?.params === undefined) {
      return []
    }

    const templateParameterNames: string[] = []

    for (const param of templateParamList.params) {
      // console.log(util.inspect(param, { compact: false, depth: 999 }))
      assert(param.type !== undefined)
      assert(param.type.children.length === 1)
      assert(typeof param.type.children[0] === 'string')
      let paramName = ''
      let paramString = ''

      // declname or defname?
      if (param.declname !== undefined) {
        paramString = param.declname
      } else if (typeof param.type.children[0] === 'string') {
        // Extract the parameter name, passed as `class T`.
        paramString = param.type.children[0]
      } else if (param.type.children[0] as object instanceof RefTextDataModel) {
        paramString = (param.type.children[0] as RefTextDataModel).text
      }
      paramName = paramString.replace(/class /, '')
      templateParameterNames.push(paramName)
    }
    return templateParameterNames
  }

  renderTemplateParametersToMdxText ({
    templateParamList,
    withDefaults = false
  }: {
    templateParamList: TemplateParamListDataModel | undefined
    withDefaults?: boolean
  }): string {
    let text = ''

    if (templateParamList?.params !== undefined) {
      const templateParameters: string[] = this.collectTemplateParameters({
        templateParamList,
        withDefaults
      })
      if (templateParameters.length > 0) {
        text += `<${templateParameters.join(', ')}>`
      }
    }
    return text
  }

  renderTemplateParameterNamesToMdxText (templateParamList: TemplateParamListDataModel | undefined): string {
    let text = ''

    if (templateParamList?.params !== undefined) {
      const templateParameterNames: string[] = this.collectTemplateParameterNames(templateParamList)
      if (templateParameterNames.length > 0) {
        text += `<${templateParameterNames.join(', ')}>`
      }
    }
    return text
  }
}

// ----------------------------------------------------------------------------
