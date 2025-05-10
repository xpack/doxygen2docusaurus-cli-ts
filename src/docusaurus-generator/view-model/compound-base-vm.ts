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

  renderSectionDefIndicesToMdxLines (): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef
    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        // console.log(sectionDef)
        lines.push(...this.renderSectionDefIndexToMdxLines({
          sectionDef
        }))
      }
    }

    return lines
  }

  renderSectionDefIndexToMdxLines ({
    sectionDef
  }: {
    sectionDef: SectionDefDataModel
  }): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const header = this.getHeaderByKind(sectionDef)
    // console.log(header)
    if (header.length === 0) {
      return lines
    }

    const workspace = this.collection.workspace

    // console.log(sectionDef)
    if (sectionDef.memberDefs !== undefined || sectionDef.members !== undefined) {
      lines.push('')
      lines.push(`## ${escapeMdx(header)} Index`)

      lines.push('')
      lines.push('<MembersIndex>')

      if (sectionDef.memberDefs !== undefined) {
        for (const memberDef of sectionDef.memberDefs) {
          lines.push(...this.renderMemberDefIndexToMdxLines({ memberDef, sectionDef }))
        }
      }

      if (sectionDef.members !== undefined) {
        for (const member of sectionDef.members) {
          const memberDef = workspace.memberDefsById.get(member.refid)
          assert(memberDef !== undefined)

          lines.push(...this.renderMemberDefIndexToMdxLines({ memberDef, sectionDef }))
        }
      }

      lines.push('')
      lines.push('</MembersIndex>')
    }
    return lines
  }

  // --------------------------------------------------------------------------

  renderIncludesIndexMdx (): string[] {
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

  renderClassIndexMdx (classs: Class): string[] {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))
    const lines: string[] = []

    const compoundDef = classs.compoundDef

    const workspace = this.collection.workspace

    const permalink = workspace.getPagePermalink(compoundDef.id)

    const itemType = compoundDef.kind
    const itemName = `<Link to="${permalink}">${escapeMdx(classs.indexName)}</Link>`

    lines.push('<MembersIndexItem')
    lines.push(`  type="${itemType}"`)
    lines.push(`  name={${itemName}}>`)

    const briefDescriptionMdxText: string | undefined = classs.briefDescriptionMdxText
    if ((briefDescriptionMdxText ?? '').length > 0) {
      lines.push(this.renderBriefDescriptionToMdxText({
        briefDescriptionMdxText,
        morePermalink: `${permalink}/#details`
      }))
    }

    lines.push('</MembersIndexItem>')

    return lines
  }

  renderMemberDefIndexToMdxLines ({
    memberDef,
    sectionDef
  }: {
    memberDef: MemberDefDataModel
    sectionDef: SectionDefDataModel
  }): string[] {
    // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const workspace = this.collection.workspace

    const permalink = workspace.getPermalink({ refid: memberDef.id, kindref: 'member' })
    assert(permalink !== undefined && permalink.length > 1)

    const name = escapeMdx(memberDef.name)

    let itemType = ''
    let itemName = `<Link to="${permalink}">${name}</Link>`

    const templateParamList = memberDef.templateparamlist ?? compoundDef.templateParamList
    // const templateParameters = this.renderTemplateParametersMdx({ templateParamList, withDefaults: true })

    switch (memberDef.kind) {
      case 'typedef':
        itemType = 'using'
        if (memberDef.type !== undefined) {
          itemName += ' = '
          itemName += workspace.renderElementToMdxText(memberDef.type).trim()
        }
        break

      case 'function':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          const type = workspace.renderElementToMdxText(memberDef.type).trim()

          let trailingType = false
          if ((this.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
              (type.includes('&lt;') && type.includes('&gt;'))
            )
          )) {
            trailingType = true
          }

          if (memberDef.constexpr?.valueOf() && !type.includes('constexpr')) {
            itemType += 'constexpr '
          }

          if (memberDef.argsstring !== undefined) {
            itemName += ' '
            itemName += escapeMdx(memberDef.argsstring)
          }

          if (trailingType) {
            if (!itemType.includes('auto')) {
              itemType += 'auto '
            }
            // WARNING: Doxygen shows this, but the resulting line is too long.
            itemName += escapeMdx(' -> ')
            itemName += type
          } else {
            itemType += type
          }

          if (memberDef.initializer !== undefined) {
            itemName += ' '
            itemName += workspace.renderElementToMdxText(memberDef.initializer)
          }
        }
        break

      case 'variable':
        itemType += workspace.renderElementToMdxText(memberDef.type).trim()
        if (memberDef.initializer !== undefined) {
          itemName += ' '
          itemName += workspace.renderElementToMdxText(memberDef.initializer)
        }
        break

      case 'enum':
        itemType = 'enum'
        if (memberDef.strong?.valueOf()) {
          itemType += ' class'
        }
        break

      default:
        console.error('member kind', memberDef.kind, 'not implemented yet in', this.constructor.name, 'renderMethodDefIndexMdx')
    }

    lines.push('')
    lines.push('<MembersIndexItem')

    if (itemType.length > 0) {
      if (itemType.includes('<') || itemType.includes('&')) {
        lines.push(`  type={<>${itemType}</>}`)
      } else {
        lines.push(`  type="${itemType}"`)
      }
    } else {
      lines.push('  type="&nbsp;"')
    }
    if (itemName.includes('<') || itemName.includes('&')) {
      lines.push(`  name={<>${itemName}</>}>`)
    } else {
      lines.push(`  name="${itemName}">`)
    }

    const briefDescriptionMdxText: string = workspace.renderElementToMdxText(memberDef.briefDescription)
    if (briefDescriptionMdxText.length > 0) {
      lines.push(this.renderBriefDescriptionToMdxText({
        briefDescriptionMdxText,
        morePermalink: `${permalink}` // No #details, it is already an anchor.
      }))
    }

    lines.push('</MembersIndexItem>')

    return lines
  }

  // --------------------------------------------------------------------------

  renderSectionDefsToMdxLines (): string[] {
    const lines: string[] = []

    if (this.compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of this.compoundDef.sectionDefs) {
        lines.push(...this.renderSectionDefMdx({
          sectionDef
        }))
      }
    }

    return lines
  }

  renderSectionDefMdx ({
    sectionDef
  }: {
    sectionDef: SectionDefDataModel
  }): string[] {
    const lines: string[] = []

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return lines
    }

    if (sectionDef.memberDefs === undefined) {
      return lines
    }

    // TODO: filter out members defined in other compounds.
    let memberDefs = sectionDef.memberDefs

    lines.push('')
    lines.push('<SectionDefinition>')

    const sectionLabels: string[] = []

    const workspace = this.collection.workspace

    if ((this.compoundDef.kind === 'class' || this.compoundDef.kind === 'struct') && sectionDef.kind === 'public-func') {
      const classs = workspace.compoundsById.get(this.compoundDef.id) as Class
      const constructors: MemberDefDataModel[] = []
      let destructor: MemberDefDataModel | undefined
      const methods = []
      for (const memberDef of sectionDef.memberDefs) {
        // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
        if (memberDef.name === classs.unqualifiedName) {
          constructors.push(memberDef)
        } else if (memberDef.name.replace('~', '') === classs.unqualifiedName) {
          assert(destructor === undefined)
          destructor = memberDef
        } else {
          methods.push(memberDef)
        }
      }

      if (constructors.length > 0) {
        lines.push('')
        lines.push('## Constructors')

        for (const constructor of constructors) {
          lines.push(...this.renderMemberDefMdx({
            memberDef: constructor,
            compoundDef: this.compoundDef,
            sectionLabels,
            isFunction: true
          }))
        }
      }

      if (destructor !== undefined) {
        lines.push('')
        lines.push('## Destructor')

        lines.push(...this.renderMemberDefMdx({
          memberDef: destructor,
          compoundDef: this.compoundDef,
          sectionLabels,
          isFunction: true
        }))
      }

      memberDefs = methods
    }

    lines.push('')
    lines.push(`## ${escapeMdx(header)}`)

    const isFunction: boolean = sectionDef.kind === 'public-func'

    for (const memberDef of memberDefs) {
      lines.push(...this.renderMemberDefMdx({
        memberDef,
        compoundDef: this.compoundDef,
        sectionLabels,
        isFunction
      }))
    }

    lines.push('')
    lines.push('</SectionDefinition>')

    return lines
  }

  private renderMemberDefMdx ({
    memberDef,
    compoundDef,
    sectionLabels,
    isFunction
  }: {
    memberDef: MemberDefDataModel
    compoundDef: CompoundDefDataModel
    sectionLabels: string[]
    isFunction: boolean
  }): string[] {
    // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    const lines: string[] = []

    const labels: string[] = [...sectionLabels]
    if (memberDef.inline?.valueOf()) {
      labels.push('inline')
    }
    if (memberDef.explicit?.valueOf()) {
      labels.push('explicit')
    }
    if (memberDef.nodiscard?.valueOf()) {
      labels.push('nodiscard')
    }
    if (memberDef.constexpr?.valueOf()) {
      labels.push('constexpr')
    }
    if (memberDef.prot === 'protected') {
      labels.push('protected')
    }
    if (memberDef.staticc?.valueOf()) {
      labels.push('static')
    }
    if (memberDef.virt !== undefined && memberDef.virt === 'virtual') {
      labels.push('virtual')
    }
    // WARNING: there is no explicit attribute for 'delete'.
    if (memberDef.argsstring?.endsWith('=delete')) {
      labels.push('delete')
    }
    // WARNING: there is no explicit attribute for 'default'.
    if (memberDef.argsstring?.endsWith('=default')) {
      labels.push('default')
    }
    if (memberDef.strong?.valueOf()) {
      labels.push('strong')
    }

    // WARNING: could not find how to generate 'inherited'.

    // Validation checks.
    // const passed via the prototype.
    if (memberDef.mutable?.valueOf()) {
      console.error(util.inspect(memberDef, { compact: false, depth: 999 }))
      console.error(memberDef.constructor.name, 'mutable not yet rendered in', this.constructor.name)
    }

    const workspace = this.collection.workspace

    const templateParamList = memberDef.templateparamlist ?? compoundDef.templateParamList
    const templateParameters = this.renderTemplateParametersToMdxText({ templateParamList, withDefaults: true })

    const id = getPermalinkAnchor(memberDef.id)
    const name = memberDef.name + (isFunction ? '()' : '')

    lines.push('')
    lines.push(`### ${escapeMdx(name)} {#${id}}`)

    // console.log(memberDef.kind)
    switch (memberDef.kind) {
      case 'function':
      case 'typedef':
      case 'variable':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          assert(memberDef.definition !== undefined)
          let prototype = escapeMdx(memberDef.definition)
          if (memberDef.kind === 'function') {
            prototype += ' ('

            if (memberDef.params !== undefined) {
              const params: string[] = []
              for (const param of memberDef.params) {
                params.push(workspace.renderElementToMdxText(param))
              }
              prototype += params.join(', ')
            }

            prototype += ')'
          }

          if (memberDef.initializer !== undefined) {
            prototype += ` ${workspace.renderElementToMdxText(memberDef.initializer)}`
          }

          if (memberDef.constt?.valueOf()) {
            prototype += ' const'
          }

          lines.push('')
          lines.push('<MemberDefinition')
          if (templateParameters.length > 0) {
            const template = escapeMdx(`template ${templateParameters}`)
            lines.push(`  template={<>${template}</>}`)
          }
          lines.push(`  prototype={<>${prototype}</>}${labels.length === 0 ? '>' : ''}`)
          if (labels.length > 0) {
            lines.push(`  labels = {["${labels.join('", "')}"]}>`)
          }

          const memberBriefDefinition = workspace.renderElementToMdxText(memberDef.briefDescription)
          if (memberBriefDefinition.length > 0) {
            lines.push(memberBriefDefinition)
          }

          lines.push(...this.renderDetailedDescriptionToMdxLines({
            detailedDescription: memberDef.detailedDescription,
            showHeader: false
          }))

          lines.push(this.renderLocationToMdxText(memberDef.location))

          lines.push('</MemberDefinition>')
        }

        break

      case 'enum':
        {
          let prototype = 'enum '
          if (memberDef.strong?.valueOf()) {
            prototype += 'class '
          }
          prototype += escapeMdx(memberDef.qualifiedName ?? '?')

          lines.push('')
          lines.push('<MemberDefinition')
          lines.push(`  prototype={<>${prototype}</>}${labels.length === 0 ? '>' : ''}`)
          if (labels.length > 0) {
            lines.push(` labels = {["${labels.join('", "')}"]}>`)
          }

          const memberBriefDefinition = workspace.renderElementToMdxText(memberDef.briefDescription)
          if (memberBriefDefinition.length > 0) {
            lines.push(memberBriefDefinition)
          }

          lines.push(...this.renderEnumToMdxLines(memberDef))

          lines.push(...this.renderDetailedDescriptionToMdxLines({
            detailedDescription: memberDef.detailedDescription,
            showHeader: false
          }))

          lines.push(this.renderLocationToMdxText(memberDef.location))

          lines.push('</MemberDefinition>')
        }

        break

      default:
        lines.push('')
        console.warn('memberDef', memberDef.kind, memberDef.name, 'not implemented yet in', this.constructor.name, 'renderMemberDefMdx')
    }

    return lines
  }

  renderEnumToMdxLines (memberDef: MemberDefDataModel): string[] {
    const lines: string[] = []

    const workspace = this.collection.workspace

    lines.push('')
    lines.push('<EnumerationList title="Enumeration values">')

    if (memberDef.enumvalues !== undefined) {
      for (const enumValue of memberDef.enumvalues) {
        let briefDescription: string = workspace.renderElementToMdxText(enumValue.briefDescription).replace(/[.]$/, '')
        const permalink = workspace.getPermalink({ refid: enumValue.id, kindref: 'member' })
        const value = workspace.renderElementToMdxText(enumValue.initializer)
        if (value.length > 0) {
          briefDescription += ` (${value})`
        }

        lines.push('')
        lines.push(`<Link id="${permalink}" />`)
        lines.push(`<EnumerationListItem name="${enumValue.name.trim()}">`)
        lines.push(`${briefDescription}`)
        lines.push('</EnumerationListItem>')
      }
    }
    lines.push('')
    lines.push('</EnumerationList>')

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

  // <xsd:simpleType name="DoxSectionKind">
  //   <xsd:restriction base="xsd:string">
  //     <xsd:enumeration value="user-defined" />
  //     <xsd:enumeration value="public-type" />
  //     <xsd:enumeration value="public-func" />
  //     <xsd:enumeration value="public-attrib" />
  //     <xsd:enumeration value="public-slot" />
  //     <xsd:enumeration value="signal" />
  //     <xsd:enumeration value="dcop-func" />
  //     <xsd:enumeration value="property" />
  //     <xsd:enumeration value="event" />
  //     <xsd:enumeration value="public-static-func" />
  //     <xsd:enumeration value="public-static-attrib" />
  //     <xsd:enumeration value="protected-type" />
  //     <xsd:enumeration value="protected-func" />
  //     <xsd:enumeration value="protected-attrib" />
  //     <xsd:enumeration value="protected-slot" />
  //     <xsd:enumeration value="protected-static-func" />
  //     <xsd:enumeration value="protected-static-attrib" />
  //     <xsd:enumeration value="package-type" />
  //     <xsd:enumeration value="package-func" />
  //     <xsd:enumeration value="package-attrib" />
  //     <xsd:enumeration value="package-static-func" />
  //     <xsd:enumeration value="package-static-attrib" />
  //     <xsd:enumeration value="private-type" />
  //     <xsd:enumeration value="private-func" />
  //     <xsd:enumeration value="private-attrib" />
  //     <xsd:enumeration value="private-slot" />
  //     <xsd:enumeration value="private-static-func" />
  //     <xsd:enumeration value="private-static-attrib" />
  //     <xsd:enumeration value="friend" />
  //     <xsd:enumeration value="related" />
  //     <xsd:enumeration value="define" />
  //     <xsd:enumeration value="prototype" />
  //     <xsd:enumeration value="typedef" />
  //     <xsd:enumeration value="enum" />
  //     <xsd:enumeration value="func" />
  //     <xsd:enumeration value="var" />
  //   </xsd:restriction>
  // </xsd:simpleType>

  getHeaderByKind (sectionDef: SectionDefDataModel): string {
    const headersByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Public Member Typedefs',
      'public-func': 'Public Member Functions',
      'public-attrib': 'Public Member Attributes',
      // 'public-slot': 'Member ?',
      'public-static-func': 'Public Static Functions',
      'public-static-attrib': 'Public Static Attributes',

      // 'signal': '',
      // 'dcop-func': '',
      // 'property': '',
      // 'event': '',

      'package-type': 'Package Member Typedefs',
      'package-func': 'Package Member Functions',
      'package-attrib': 'Package Member Attributes',
      'package-static-func': 'Package Static Functions',
      'package-static-attrib': 'Package Static Attributes',

      'protected-type': 'Protected Member Typedefs',
      'protected-func': 'Protected Member Functions',
      'protected-attrib': 'Protected Member Attributes',
      // 'protected-slot': 'Protected ?',
      'protected-static-func': 'Protected Static Functions',
      'protected-static-attrib': 'Protected Static Attributes',

      'private-type': 'Private Member Typedefs',
      'private-func': 'Private Member Functions',
      'private-attrib': 'Private Member Attributes',
      // 'private-slot': 'Private ?',
      'private-static-func': 'Private Static Functions',
      'private-static-attrib': 'Private Static Attributes',

      // 'friend': '',
      // 'related': '',
      // 'define': '',
      // 'prototype': '',

      typedef: 'Typedefs',
      enum: 'Enumerations',
      func: 'Functions',
      var: 'Variables'

    }

    const header = headersByKind[sectionDef.kind]
    if (header === undefined) {
      console.error(sectionDef, { compact: false, depth: 999 })
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name, 'getHeaderByKind')
      return ''
    }

    return header.trim()
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
