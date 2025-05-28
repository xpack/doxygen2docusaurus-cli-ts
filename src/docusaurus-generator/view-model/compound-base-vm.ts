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
import { Sect1DataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { CollectionBase } from './collection-base.js'
import { AbstractRefType } from '../../data-model/compounds/reftype-dm.js'
import { escapeHtml, escapeMdx } from '../utils.js'
import { Section } from './members-vm.js'
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js'
import { RefTextDataModel } from '../../data-model/compounds/reftexttype-dm.js'
import { DefValDataModel } from '../../data-model/compounds/linkedtexttype-dm.js'
import { LocationDataModel } from '../../data-model/compounds/locationtype-dm.js'
import { FilesAndFolders } from './files-and-folders-vm.js'
import { IncludesDataModel } from '../../data-model/compounds/inctype-dm.js'

// ----------------------------------------------------------------------------

export abstract class CompoundBase {
  // The collection this compound is part of.
  collection: CollectionBase

  kind: string = ''
  compoundName: string = ''
  id: string = ''

  titleMdxText: string | undefined
  locationFilePath: string | undefined

  // --------------------------------------------------------------------------

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
  detailedDescriptionMdxText: string | undefined
  hasSect1InDescription: boolean = false

  // labelMdxText: string | undefined
  locationMdxText: string | undefined

  // detailedDescriptionMdxLines: string[] | undefined

  sections: Section[] = []
  locationSet: Set<string> = new Set()

  // Shortcut
  includes: IncludesDataModel[] | undefined
  innerCompounds: Map<string, any> | undefined

  _private: {
    // Reference to the data model object.
    _compoundDef?: CompoundDefDataModel | undefined
  } = {}

  // --------------------------------------------------------------------------

  constructor (collection: CollectionBase, compoundDef: CompoundDefDataModel) {
    this._private._compoundDef = compoundDef

    this.collection = collection

    this.kind = compoundDef.kind
    this.compoundName = compoundDef.compoundName
    this.id = compoundDef.id

    if (compoundDef.title !== undefined) {
      this.titleMdxText = escapeMdx(compoundDef.title)
    }

    if (compoundDef?.location?.file !== undefined) {
      this.locationFilePath = compoundDef?.location?.file
    }
  }

  initializeLate (): void {
    const workspace = this.collection.workspace

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    if (compoundDef.briefDescription !== undefined) {
      this.briefDescriptionMdxText = workspace.renderElementToMdxText(compoundDef.briefDescription)
    }

    if (compoundDef.detailedDescription !== undefined) {
      this.detailedDescriptionMdxText = workspace.renderElementToMdxText(compoundDef.detailedDescription)

      for (const child of compoundDef.detailedDescription.children) {
        if (child instanceof Sect1DataModel) {
          this.hasSect1InDescription = true
          break
        }
      }
    }

    if (this.kind === 'page') {
      // The location for pages is not usable.
    } else if (this.kind === 'dir') {
      // The location for folders is not used.
    } else {
      if (compoundDef.location !== undefined) {
        this.locationMdxText = this.renderLocationToMdxText(compoundDef.location)
      }
    }

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        if (sectionDef.memberDefs !== undefined) {
          for (const memberDef of sectionDef.memberDefs) {
            if (memberDef.location !== undefined) {
              const file = memberDef.location.file
              this.locationSet.add(file)
              if (memberDef.location.bodyfile !== undefined) {
                this.locationSet.add(memberDef.location.bodyfile)
              }
            }
          }
        }
      }
    }

    if (compoundDef.includes !== undefined) {
      this.includes = compoundDef.includes
    }

    for (const innerKey of Object.keys(compoundDef)) {
      if (innerKey.startsWith('inner')) {
        if (this.innerCompounds === undefined) {
          this.innerCompounds = new Map()
        }
        this.innerCompounds.set(innerKey, compoundDef)
      }
    }
  }

  // --------------------------------------------------------------------------

  abstract renderToMdxLines (frontMatter: FrontMatter): string[]

  // --------------------------------------------------------------------------

  renderBriefDescriptionToMdxText ({
    briefDescriptionMdxText,
    todo = '',
    morePermalink
  }: {
    briefDescriptionMdxText: string | undefined
    todo?: string
    morePermalink?: string | undefined
  }): string {
    let text: string = ''

    // console.log(this

    if (briefDescriptionMdxText === undefined && todo.length === 0) {
      return ''
    }

    if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
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
    briefDescriptionMdxText,
    detailedDescriptionMdxText,
    todo = '',
    showHeader,
    showBrief = false
  }: {
    briefDescriptionMdxText?: string | undefined
    detailedDescriptionMdxText: string | undefined
    todo?: string
    showHeader: boolean
    showBrief?: boolean
  }): string[] {
    const lines: string[] = []

    // const workspace = this.collection.workspace
    if (showHeader) {
      if ((detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) ||
        todo.length > 0 ||
        (showBrief && briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0)) {
        lines.push('')
        lines.push('## Description {#details}')
      }
    }

    if (showBrief) {
      if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
        lines.push('')
        lines.push(briefDescriptionMdxText)
      } else if (todo.length > 0) {
        lines.push('')
        lines.push(`TODO: add <code>@brief</code> to <code>${todo}</code>`)
      }
    }

    // console.log(util.inspect(compoundDef.detailedDescription, { compact: false, depth: 999 }))
    if (detailedDescriptionMdxText !== undefined && detailedDescriptionMdxText.length > 0) {
      lines.push('')
      lines.push(detailedDescriptionMdxText)
    } else if (todo.length > 0) {
      lines.push('')
      lines.push(`TODO: add <code>@details</code> to <code>${todo}</code>`)
    }

    return lines
  }

  // --------------------------------------------------------------------------

  hasInnerIndices (): boolean {
    return (this.innerCompounds !== undefined) && (this.innerCompounds.size > 0)
  }

  renderInnerIndicesToMdxLines ({
    suffixes = []
  }: {
    suffixes?: string[]
  }): string[] {
    const lines: string[] = []

    if (this.innerCompounds !== undefined) {
      for (const innerKey of Object.keys(this.innerCompounds)) {
        if (innerKey.startsWith('inner')) {
          const suffix = innerKey.substring(5)
          if (!suffixes.includes(suffix)) {
            console.warn(innerKey, 'not processed for', this.compoundName, 'in renderInnerIndicesMdx')
            continue
          }
        }
      }
    }

    const workspace = this.collection.workspace

    for (const suffix of suffixes) {
      const innerKey = `inner${suffix}`
      const innerCompound = this.innerCompounds !== undefined ? (this.innerCompounds.get(innerKey)) : undefined
      const innerObjects = innerCompound !== undefined ? innerCompound[innerKey] as AbstractRefType[] : undefined

      if (innerObjects !== undefined && innerObjects.length > 0) {
        lines.push('')
        lines.push(`## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index`)

        lines.push('')
        lines.push('<MembersIndex>')

        for (const innerObject of innerObjects) {
          // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
          const innerDataObject = workspace.compoundsById.get(innerObject.refid)
          assert(innerDataObject !== undefined)

          const permalink = workspace.getPagePermalink(innerObject.refid)

          const kind = innerDataObject.kind

          const itemType = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind)
          const itemName = `<Link to="${permalink}">${escapeHtml(innerDataObject.indexName)}</Link>`

          lines.push('')
          lines.push('<MembersIndexItem')
          lines.push(`  type="${itemType}"`)
          if (itemName.includes('<') || itemName.includes('&')) {
            lines.push(`  name={<>${itemName}</>}>`)
          } else {
            lines.push(`  name="${itemName}">`)
          }

          const morePermalink = innerDataObject.renderDetailedDescriptionToMdxLines !== undefined ? `${permalink}/#details` : undefined
          if (innerDataObject.briefDescriptionMdxText !== undefined && innerDataObject.briefDescriptionMdxText.length > 0) {
            lines.push(this.renderBriefDescriptionToMdxText({
              briefDescriptionMdxText: innerDataObject.briefDescriptionMdxText,
              morePermalink
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

  hasSections (): boolean {
    return (this.sections !== undefined) && (this.sections.length > 0)
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

    const workspace = this.collection.workspace

    if (this.includes !== undefined) {
      lines.push('')
      lines.push('## Included Headers')

      lines.push('')
      lines.push('<IncludesList>')

      for (const include of this.includes) {
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
      // console.log('renderLocationToMdxText', this.kind, this.compoundName)
      const file = files.filesByPath.get(location.file)
      assert(file !== undefined)
      const permalink = workspace.getPagePermalink(file.id)

      text += '\n'
      if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
        text += 'Declaration '
        if (location.line !== undefined) {
          text += 'at line '
          const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
          if (!file.listingLineNumbers.has(location.line)) {
            text += location.line?.toString()
          } else {
            text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`
          }
          text += ' of file '
        } else {
          text += ' in file '
        }
        text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file) as string)}</Link>`

        const definitionFile = files.filesByPath.get(location.bodyfile)
        assert(definitionFile !== undefined)
        const definitionPermalink = workspace.getPagePermalink(definitionFile.id)

        text += ', definition '
        if (location.bodystart !== undefined) {
          text += 'at line '
          const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`
          if (!definitionFile.listingLineNumbers.has(location.bodystart)) {
            text += location.bodystart?.toString()
          } else {
            text += `<Link to="${definitionPermalink}/#${lineStart}">${escapeMdx(location.bodystart?.toString() ?? '?')}</Link>`
          }
          text += ' of file '
        } else {
          text += ' in file '
        }
        text += `<Link to="${definitionPermalink}">${escapeMdx(path.basename(location.bodyfile) as string)}</Link>`
        text += '.'
      } else {
        text += 'Definition '
        if (location.line !== undefined) {
          text += 'at line '
          const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
          if (!file.listingLineNumbers.has(location.line)) {
            text += location.line?.toString()
          } else {
            text += `<Link to="${permalink}/#${lineAttribute}">${escapeMdx(location.line?.toString() ?? '?')}</Link>`
          }
          text += ' of file '
        } else {
          text += ' in file '
        }
        text += `<Link to="${permalink}">${escapeMdx(path.basename(location.file) as string)}</Link>`
        text += '.'
      }
    }

    return text
  }

  renderGeneratedFromToMdxLines (): string[] {
    const lines: string[] = []

    if (this.locationSet.size > 0) {
      lines.push('')
      lines.push('<hr/>')
      lines.push('')
      lines.push(`The documentation for this ${this.kind} was generated from the following file${this.locationSet.size > 1 ? 's' : ''}:`)
      lines.push('')

      lines.push('<ul>')

      const workspace = this.collection.workspace
      const files: FilesAndFolders = workspace.viewModel.get('files') as FilesAndFolders

      const sortedFiles = [...this.locationSet].sort()
      for (const fileName of sortedFiles) {
        const file = files.filesByPath.get(fileName)
        assert(file !== undefined)
        const permalink = workspace.getPagePermalink(file.id)
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
            paramString += ' = '
            for (const child of defval.children) {
              if (typeof child === 'string') {
                paramString += child
              } else if (child as object instanceof RefTextDataModel) {
                paramString += (child as RefTextDataModel).text
              }
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
