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
import { ParaDataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { CollectionBase } from './collection-base.js'
import { AbstractRefType } from '../../data-model/compounds/reftype-dm.js'
import { joinWithLast } from '../utils.js'
import { Section } from './members-vm.js'
import { TemplateParamListDataModel } from '../../data-model/compounds/templateparamlisttype-dm.js'
import { RefTextDataModel } from '../../data-model/compounds/reftexttype-dm.js'
import { DefValDataModel } from '../../data-model/compounds/linkedtexttype-dm.js'
import { LocationDataModel } from '../../data-model/compounds/locationtype-dm.js'
import { FilesAndFolders } from './files-and-folders-vm.js'
import { IncludesDataModel } from '../../data-model/compounds/inctype-dm.js'
import { SectionDefByKindDataModel, SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js'
import { AbstractMemberBaseType } from '../../data-model/compounds/memberdeftype-dm.js'
import { ReferenceDataModel, ReferencedByDataModel } from '../../data-model/compounds/referencetype-dm.js'

// ----------------------------------------------------------------------------

export abstract class CompoundBase {
  kind: string = ''
  compoundName: string = ''

  id: string = ''

  // The collection this compound is part of.
  collection: CollectionBase

  titleHtmlString: string | undefined

  locationFilePath: string | undefined

  // --------------------------------------------------------------------------

  // Not used for classes, see Class.baseClasses.
  parent?: CompoundBase

  // Set in 2 steps, first the Ids and then, when all objects are in, the references.
  // Folder objects use separate arrays for files and folders children.
  childrenIds: string[] = []

  children: CompoundBase[] = []

  /**
   * @brief Relative path to the output folder.
   *
   * Starts with plural kind.
   *
   * If undefined, the compound must not
   * be referred in the sidebar.
   */
  docusaurusId: string | undefined

  /**
   * @brief Short name, to fit the limited space in the sidebar.
   *
   * If undefined, the compound must not
   * be referred in the sidebar.
   */
  sidebarLabel: string | undefined

  /**
   * @brief The part below outputFolderPath.
   *
   * No leading slash.
   *
   * If undefined, the MD file for the compound must not be generated.
   */
  relativePermalink: string | undefined

  /** The name shown in the index section. */
  indexName: string = ''

  /** @brief The named used in the tree entry rendered in the top index pages. */
  treeEntryName: string = ''

  /** The name shown in the page title. */
  pageTitle: string = ''

  briefDescriptionHtmlString: string | undefined
  detailedDescriptionHtmlLines: string[] | undefined
  hasSect1InDescription: boolean = false

  locationLines: string[] | undefined

  sections: Section[] = []
  locationSet: Set<string> = new Set()

  // Shortcut
  includes: IncludesDataModel[] | undefined
  innerCompounds: Map<string, CompoundDefDataModel> | undefined

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
      this.titleHtmlString = this.collection.workspace.renderString(compoundDef.title, 'html')
    }

    if (compoundDef?.location?.file !== undefined) {
      this.locationFilePath = compoundDef.location.file
    }
  }

  createSections (classUnqualifiedName?: string | undefined): void {
    const reorderedSectionDefs = this.reorderSectionDefs(classUnqualifiedName)

    if (reorderedSectionDefs !== undefined) {
      const sections: Section[] = []
      for (const sectionDef of reorderedSectionDefs) {
        sections.push(new Section(this, sectionDef))
      }
      this.sections = sections.sort((a, b) => {
        return a.getSectionOrderByKind() - b.getSectionOrderByKind()
      })
    }
  }

  private reorderSectionDefs (classUnqualifiedName?: string | undefined): SectionDefDataModel[] | undefined {
    const sectionDefs = this._private._compoundDef?.sectionDefs
    if (sectionDefs === undefined) {
      return undefined
    }

    const resultSectionDefs: SectionDefDataModel[] = []
    const sectionDefsByKind: Map<string, SectionDefDataModel> = new Map()

    for (const sectionDef of sectionDefs) {
      if (sectionDef.kind === 'user-defined' && sectionDef.header !== undefined) {
        resultSectionDefs.push(sectionDef)
        continue
      }

      if (sectionDef.memberDefs !== undefined) {
        for (const memberDef of sectionDef.memberDefs) {
          const adjustedSectionKind: string = this.adjustSectionKind(sectionDef, memberDef, classUnqualifiedName)

          let mapSectionDef = sectionDefsByKind.get(adjustedSectionKind)
          if (mapSectionDef === undefined) {
            mapSectionDef = new SectionDefByKindDataModel(adjustedSectionKind)
            sectionDefsByKind.set(adjustedSectionKind, mapSectionDef)
          }
          if (mapSectionDef.memberDefs === undefined) {
            mapSectionDef.memberDefs = []
          }
          mapSectionDef.memberDefs.push(memberDef)
        }
      }

      if (sectionDef.members !== undefined) {
        for (const member of sectionDef.members) {
          const adjustedSectionKind: string = this.adjustSectionKind(sectionDef, member, classUnqualifiedName)

          let mapSectionDef = sectionDefsByKind.get(adjustedSectionKind)
          if (mapSectionDef === undefined) {
            mapSectionDef = new SectionDefByKindDataModel(adjustedSectionKind)
            sectionDefsByKind.set(adjustedSectionKind, mapSectionDef)
          }
          if (mapSectionDef.members === undefined) {
            mapSectionDef.members = []
          }
          mapSectionDef.members.push(member)
        }
      }
    }

    resultSectionDefs.push(...sectionDefsByKind.values())
    return resultSectionDefs
  }

  // <xsd:simpleType name="DoxMemberKind">
  //   <xsd:restriction base="xsd:string">
  //     <xsd:enumeration value="define" />
  //     <xsd:enumeration value="property" />
  //     <xsd:enumeration value="event" />
  //     <xsd:enumeration value="variable" />
  //     <xsd:enumeration value="typedef" />
  //     <xsd:enumeration value="enum" />
  //     <xsd:enumeration value="function" />
  //     <xsd:enumeration value="signal" />
  //     <xsd:enumeration value="prototype" />
  //     <xsd:enumeration value="friend" />
  //     <xsd:enumeration value="dcop" />
  //     <xsd:enumeration value="slot" />
  //     <xsd:enumeration value="interface" />
  //     <xsd:enumeration value="service" />
  //   </xsd:restriction>
  // </xsd:simpleType>

  private adjustSectionKind (sectionDef: SectionDefDataModel, memberBase: AbstractMemberBaseType, classUnqualifiedName: string | undefined): string {
    // In general, adjust to member kind.
    let adjustedSectionKind: string = memberBase.kind

    switch (memberBase.kind) {
      case 'function':
        // If public/protected/private, preserve the prefix.
        if (this.isOperator(memberBase.name)) {
          adjustedSectionKind = sectionDef.computeAdjustedKind('operator')
        } else if (classUnqualifiedName !== undefined) {
          if (memberBase.name === classUnqualifiedName) {
            adjustedSectionKind = sectionDef.computeAdjustedKind('constructorr')
          } else if (memberBase.name.replace('~', '') === classUnqualifiedName) {
            adjustedSectionKind = sectionDef.computeAdjustedKind('destructor')
          } else {
            adjustedSectionKind = sectionDef.computeAdjustedKind('func', 'function')
          }
        } else {
          adjustedSectionKind = sectionDef.computeAdjustedKind('func', 'function')
        }
        break

      case 'variable':
        adjustedSectionKind = sectionDef.computeAdjustedKind('attrib', 'variable')
        break

      case 'typedef':
        adjustedSectionKind = sectionDef.computeAdjustedKind('type', 'typedef')
        break

      case 'slot':
        adjustedSectionKind = sectionDef.computeAdjustedKind('slot')
        break

      // case 'define':
      // case 'property':
      // case 'event':
      // case 'enum':
      // case 'signal':
      // case 'prototype':
      // case 'friend':
      // case 'dcop':
      // case 'interface':
      // case 'service':
      default:
        // Adjust to member kind.
        adjustedSectionKind = memberBase.kind
        break
    }

    // console.log('adjustedSectionKind:', memberBase.kind, adjustedSectionKind)
    return adjustedSectionKind
  }

  initializeLate (): void {
    const workspace = this.collection.workspace

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    if (compoundDef.briefDescription !== undefined) {
      // console.log(compoundDef.briefDescription)

      assert(compoundDef.briefDescription.children !== undefined)
      if (compoundDef.briefDescription.children.length > 1) {
        assert(compoundDef.briefDescription.children[1] instanceof ParaDataModel)
        this.briefDescriptionHtmlString = workspace.renderElementsArrayToString(compoundDef.briefDescription.children[1].children, 'html').trim()
      } else {
        this.briefDescriptionHtmlString = workspace.renderElementToString(compoundDef.briefDescription, 'html').trim()
      }
    }

    if (compoundDef.detailedDescription !== undefined) {
      // console.log(compoundDef.detailedDescription)
      this.detailedDescriptionHtmlLines = workspace.renderElementToLines(compoundDef.detailedDescription, 'html')
    }

    if (this.kind === 'page') {
      // The location for pages is not usable.
    } else if (this.kind === 'dir') {
      // The location for folders is not used.
    } else {
      if (compoundDef.location !== undefined) {
        this.locationLines = this.renderLocationToLines(compoundDef.location)
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

  isOperator (name: string): boolean {
    // Two word operators, like
    if (name.startsWith('operator') && ' =!<>+-*/%&|^~,"(['.includes(name.charAt(8))) {
      return true
    }
    return false
  }

  // --------------------------------------------------------------------------

  abstract renderToLines (frontMatter: FrontMatter): string[]

  // --------------------------------------------------------------------------

  renderBriefDescriptionToHtmlString ({
    briefDescriptionHtmlString,
    todo = '',
    morePermalink
  }: {
    briefDescriptionHtmlString: string | undefined
    todo?: string
    morePermalink?: string | undefined
  }): string {
    let text: string = ''

    if (!this.collection.workspace.pluginOptions.suggestToDoDescriptions) {
      todo = ''
    }

    if (briefDescriptionHtmlString === undefined && todo.length === 0) {
      return ''
    }

    if (briefDescriptionHtmlString !== undefined && briefDescriptionHtmlString.length > 0) {
      text += '<p>'
      text += briefDescriptionHtmlString
      if (morePermalink !== undefined && morePermalink.length > 0) {
        text += ` <a href="${morePermalink}">`
        text += 'More...'
        text += '</a>'
      }
      text += '</p>'
    } else if (todo.length > 0) {
      text += `TODO: add <code>@brief</code> to <code>${todo}</code>`
    }

    return text
  }

  renderDetailedDescriptionToHtmlLines ({
    briefDescriptionHtmlString,
    detailedDescriptionHtmlLines,
    todo = '',
    showHeader,
    showBrief = false
  }: {
    briefDescriptionHtmlString?: string | undefined
    detailedDescriptionHtmlLines: string[] | undefined
    todo?: string
    showHeader: boolean
    showBrief?: boolean
  }): string[] {
    const lines: string[] = []

    if (!this.collection.workspace.pluginOptions.suggestToDoDescriptions) {
      todo = ''
    }

    // const workspace = this.collection.workspace
    if (showHeader) {
      if ((detailedDescriptionHtmlLines !== undefined && detailedDescriptionHtmlLines.length > 0) ||
        todo.length > 0 ||
        (showBrief && briefDescriptionHtmlString !== undefined && briefDescriptionHtmlString.length > 0)) {
        lines.push('')
        lines.push('## Description {#details}')
      }
    }

    if (showBrief) {
      if (showHeader) {
        lines.push('')
      }
      if (briefDescriptionHtmlString !== undefined && briefDescriptionHtmlString.length > 0) {
        // lines.push(`<p>${briefDescriptionNoParaString}</p>`)
        lines.push(`<p>${briefDescriptionHtmlString}</p>`)
      } else if (todo.length > 0) {
        lines.push(`TODO: add <code>@brief</code> to <code>${todo}</code>`)
      }
    }

    // console.log(util.inspect(detailedDescriptionLines, { compact: false, depth: 999 }))
    if (detailedDescriptionHtmlLines !== undefined && detailedDescriptionHtmlLines.length > 0) {
      lines.push('')
      lines.push(...detailedDescriptionHtmlLines)
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

  renderInnerIndicesToLines ({
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
            console.warn(innerKey, 'not processed for', this.compoundName, 'in renderInnerIndicesToLines')
            continue
          }
        }
      }
    }

    const workspace = this.collection.workspace

    for (const suffix of suffixes) {
      const innerKey = `inner${suffix}`
      const innerCompound = this.innerCompounds !== undefined ? (this.innerCompounds.get(innerKey)) : undefined
      const innerObjects = innerCompound !== undefined ? (innerCompound as any)[innerKey] as AbstractRefType[] : undefined

      if (innerObjects !== undefined && innerObjects.length > 0) {
        lines.push('')
        lines.push(`## ${suffix === 'Dirs' ? 'Folders' : (suffix === 'Groups' ? 'Topics' : suffix)} Index`)

        lines.push('')
        lines.push('<table class="doxyMembersIndex">')

        for (const innerObject of innerObjects) {
          // console.log(util.inspect(innerObject, { compact: false, depth: 999 }))
          const innerDataObject = workspace.compoundsById.get(innerObject.refid)
          if (innerDataObject !== undefined) {
            const kind = innerDataObject.kind
            const itemType = kind === 'dir' ? 'folder' : (kind === 'group' ? '&nbsp;' : kind)

            const permalink = workspace.getPagePermalink(innerObject.refid)

            // Debatable. The compound name has the full namespace, the index has the template signature.
            const name = this.collection.workspace.renderString(innerDataObject.indexName, 'html')

            let itemName
            if (permalink !== undefined && permalink.length > 0) {
              itemName = `<a href="${permalink}">${name}</a>`
            } else {
              itemName = name
            }

            const childrenLines: string[] = []

            const morePermalink = innerDataObject.renderDetailedDescriptionToHtmlLines !== undefined ? `${permalink}/#details` : undefined
            if (innerDataObject.briefDescriptionHtmlString !== undefined && innerDataObject.briefDescriptionHtmlString.length > 0) {
              childrenLines.push(this.renderBriefDescriptionToHtmlString({
                briefDescriptionHtmlString: innerDataObject.briefDescriptionHtmlString,
                morePermalink
              }))
            }

            lines.push('')

            lines.push(...this.collection.workspace.renderMembersIndexItemToHtmlLines({
              type: itemType,
              name: itemName,
              childrenLines
            }))
          } else {
            if (this.collection.workspace.pluginOptions.debug) {
              console.warn(innerObject)
            }
            if (this.collection.workspace.pluginOptions.verbose) {
              console.warn('Object not rendered in renderInnerIndicesToLines()')
            }
          }
        }

        lines.push('')
        lines.push('</table>')
      }
    }

    return lines
  }

  hasSections (): boolean {
    return (this.sections !== undefined) && (this.sections.length > 0)
  }

  renderSectionIndicesToLines (): string[] {
    const lines: string[] = []

    for (const section of this.sections) {
      // console.log(sectionDef)
      lines.push(...section.renderIndexToLines())
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderIncludesIndexToLines (): string[] {
    const lines: string[] = []

    const workspace = this.collection.workspace

    if (this.includes !== undefined) {
      const includeLines = workspace.renderElementsArrayToLines(this.includes, 'html')
      lines.push('')
      lines.push('## Included Headers')

      lines.push('')
      lines.push(`<div class="doxyIncludesList">${includeLines[0]}`)

      for (const includeLine of includeLines.slice(1)) {
        lines.push(includeLine)
      }

      lines.push('</div>')
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderSectionsToLines (): string[] {
    const lines: string[] = []

    if (this.sections !== undefined) {
      for (const section of this.sections) {
        lines.push(...section.renderToLines())
      }
    }

    return lines
  }

  renderLocationToLines (location: LocationDataModel | undefined): string[] {
    const lines: string[] = []
    let text: string = ''

    const workspace = this.collection.workspace

    if (location !== undefined) {
      // console.log('location.file:', location.file)
      if (location.file.includes('[')) {
        // Ignore cases like `[generated]`, encountered in llvm.
        return lines
      }
      const files: FilesAndFolders = workspace.viewModel.get('files') as FilesAndFolders
      assert(files !== undefined)

      // console.log('renderLocationToLines', this.kind, this.compoundName, this.id)
      const file = workspace.filesByPath.get(location.file)
      if (file !== undefined) {
        const permalink = workspace.getPagePermalink(file.id)
        assert(permalink !== undefined && permalink.length > 0)

        if (location.bodyfile !== undefined && location.file !== location.bodyfile) {
          text += '<p>'
          text += 'Declaration '
          if (location.line !== undefined) {
            text += 'at line '
            const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
            if (permalink !== undefined && permalink.length > 0 && file.listingLineNumbers.has(location.line)) {
              text += `<a href="${permalink}/#${lineAttribute}">${workspace.renderString(location.line?.toString() ?? '???', 'html')}</a>`
            } else {
              text += location.line?.toString()
            }
            text += ' of file '
          } else {
            text += ' in file '
          }
          const locationFile = workspace.renderString(path.basename(location.file) as string, 'html')
          if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${locationFile}</a>`
          } else {
            text += locationFile
          }

          const definitionFile = workspace.filesByPath.get(location.bodyfile)
          if (definitionFile !== undefined) {
            const definitionPermalink = workspace.getPagePermalink(definitionFile.id)

            text += ', definition '
            if (location.bodystart !== undefined) {
              text += 'at line '
              const lineStart = `l${location.bodystart?.toString().padStart(5, '0')}`
              if (definitionPermalink !== undefined && definitionPermalink.length > 0 && definitionFile.listingLineNumbers.has(location.bodystart)) {
                text += `<a href="${definitionPermalink}/#${lineStart}">${workspace.renderString(location.bodystart?.toString() ?? '???', 'html')}</a>`
              } else {
                text += location.bodystart?.toString()
              }
              text += ' of file '
            } else {
              text += ' in file '
            }
            const locationBodyFile = workspace.renderString(path.basename(location.bodyfile) as string, 'html')
            if (definitionPermalink !== undefined && definitionPermalink.length > 0) {
              text += `<a href="${definitionPermalink}">${locationBodyFile}</a>`
            } else {
              text += locationBodyFile
            }
          } else {
            if (this.collection.workspace.pluginOptions.verbose) {
              console.warn('File', location.bodyfile, 'not a location.')
            }
          }
          text += '.'
          text += '</p>'
          text += '\n'
        } else {
          text += '<p>'
          text += 'Definition '
          if (location.line !== undefined) {
            text += 'at line '
            const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
            if (permalink !== undefined && permalink.length > 0 && file.listingLineNumbers.has(location.line)) {
              text += `<a href="${permalink}/#${lineAttribute}">${workspace.renderString(location.line?.toString() ?? '???', 'html')}</a>`
            } else {
              text += location.line?.toString()
            }
            text += ' of file '
          } else {
            text += ' in file '
          }
          const locationFile = workspace.renderString(path.basename(location.file) as string, 'html')
          if (permalink !== undefined && permalink.length > 0) {
            text += `<a href="${permalink}">${locationFile}</a>`
          } else {
            text += locationFile
          }
          text += '.'
          text += '</p>'
          text += '\n'
        }
      } else {
        if (this.collection.workspace.pluginOptions.verbose) {
          console.warn('File', location.file, 'not a known location.')
        }
      }
    }

    if (text.length > 0) {
      lines.push('')
      lines.push(`${text}`)
    }

    return lines
  }

  renderGeneratedFromToLines (): string[] {
    const lines: string[] = []

    if (this.locationSet.size > 0) {
      lines.push('')
      lines.push('<hr/>')
      lines.push('')
      lines.push(`The documentation for this ${this.kind} was generated from the following file${this.locationSet.size > 1 ? 's' : ''}:`)
      lines.push('')

      lines.push('<ul>')

      const workspace = this.collection.workspace

      const sortedFiles = [...this.locationSet].sort((a, b) => a.localeCompare(b))
      for (const fileName of sortedFiles) {
        // console.log('search', fileName)
        const fileNameEscaped = workspace.renderString(path.basename(fileName), 'html')
        const file = workspace.filesByPath.get(fileName)
        if (file !== undefined) {
          const permalink = workspace.getPagePermalink(file.id)
          if (permalink !== undefined && permalink.length > 0) {
            lines.push(`<li><a href="${permalink}">${fileNameEscaped}</a></li>`)
          } else {
            lines.push(`<li>${fileNameEscaped}</li>`)
          }
        } else {
          lines.push(`<li>${fileNameEscaped}</li>`)
        }
      }
      lines.push('</ul>')
    }

    return lines
  }

  renderReferencesToHtmlString (references: ReferenceDataModel[] | undefined): string {
    let text: string = ''

    if (references === undefined || references.length === 0) {
      return ''
    }

    const workspace = this.collection.workspace

    const referenceLines: string[] = []

    for (const reference of references) {
      referenceLines.push(workspace.renderElementToString(reference, 'html'))
    }

    text += '<p>'
    if (referenceLines.length === 1) {
      text += 'Reference '
    } else {
      text += 'References '
    }
    text += joinWithLast(referenceLines, ', ', ' and ')
    text += '.'
    text += '</p>'
    text += '\n'

    return text
  }

  renderReferencedByToHtmlString (referencedBy: ReferencedByDataModel[] | undefined): string {
    let text: string = ''

    if (referencedBy === undefined || referencedBy.length === 0) {
      return ''
    }

    const workspace = this.collection.workspace

    const referenceLines: string[] = []

    for (const reference of referencedBy) {
      referenceLines.push(workspace.renderElementToString(reference, 'html'))
    }

    text += '<p>'
    text += 'Referenced by '
    text += joinWithLast(referenceLines, ', ', ' and ')
    text += '.'
    text += '</p>'
    text += '\n'

    return text
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
      assert(param.type.children !== undefined)
      for (const child of param.type.children) {
        if (typeof child === 'string') {
          paramString += child
        } else if (child as object instanceof RefTextDataModel) {
          paramString += (child as RefTextDataModel).text
        }
      }

      if (param.declname !== undefined) {
        paramString += ` ${param.declname}`
      }

      if (withDefaults) {
        if (param.defval !== undefined) {
          const defval: DefValDataModel = param.defval
          paramString += ' = '
          assert(defval.children !== undefined)
          for (const child of defval.children) {
            if (typeof child === 'string') {
              paramString += child
            } else if (child as object instanceof RefTextDataModel) {
              paramString += (child as RefTextDataModel).text
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

      let paramString = ''

      // declname? defname? order?
      if (param.declname !== undefined) {
        paramString += param.declname
      } else {
        assert(param.type.children !== undefined)
        for (const child of param.type.children) {
          if (typeof child === 'string') {
            // Extract the parameter name, passed as `class T`.
            paramString += child
          } else if (child as object instanceof RefTextDataModel) {
            paramString += (child as RefTextDataModel).text
          }
        }
      }

      const paramName = paramString.replaceAll(/class /g, '').replaceAll(/typename /g, '')
      templateParameterNames.push(paramName)
    }
    return templateParameterNames
  }

  renderTemplateParametersToString ({
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

  renderTemplateParameterNamesToString (templateParamList: TemplateParamListDataModel | undefined): string {
    let text = ''

    if (templateParamList?.params !== undefined) {
      const templateParameterNames: string[] = this.collectTemplateParameterNames(templateParamList)
      if (templateParameterNames.length > 0) {
        text += `<${templateParameterNames.join(', ')}>`
      }
    }
    return text
  }

  // --------------------------------------------------------------------------

  // Override it
  hasAnyContent (): boolean {
    if (this.briefDescriptionHtmlString !== undefined && this.briefDescriptionHtmlString.length > 0) {
      // console.log('has content brief', this.compoundName)
      return true
    }
    if (this.detailedDescriptionHtmlLines !== undefined && this.detailedDescriptionHtmlLines.length > 0) {
      // console.log('has content details', this.compoundName)
      return true
    }
    if (this.sections.length > 0) {
      // console.log('has content sections.length', this)
      return true
    }

    return false
  }
}

// ----------------------------------------------------------------------------
