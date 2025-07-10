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

/* eslint-disable max-lines */

import assert from 'node:assert'
import * as fs from 'node:fs/promises'
// import * as util from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { AbstractCompoundDefType } from '../doxygen/data-model/compounds/compounddef-dm.js'
import {
  AbstractDocSectType,
  AbstractDocAnchorType,
  ParaDataModel,
} from '../doxygen/data-model/compounds/descriptiontype-dm.js'
import {
  TocListDataModel,
  TocItemDataModel,
} from '../doxygen/data-model/compounds/tableofcontentstype-dm.js'
import {
  type DataModel,
  AbstractDataModelBase,
} from '../doxygen/data-model/types.js'
import { Renderers } from './renderers/renderers.js'
import type { CliOptions } from './options.js'
import type { FrontMatter } from './types.js'
import { Classes } from './view-model/classes-vm.js'
import type { CollectionBase } from './view-model/collection-base.js'
import type { CompoundBase } from './view-model/compound-base-vm.js'
import {
  DescriptionTocList,
  DescriptionTocItem,
  DescriptionAnchor,
} from './view-model/description-anchors.js'
import {
  type File,
  FilesAndFolders,
} from './view-model/files-and-folders-vm.js'
import { Groups } from './view-model/groups-vm.js'
import { Member } from './view-model/members-vm.js'
import { Namespaces } from './view-model/namespaces-vm.js'
import { DoxygenFileOptions } from './view-model/options.js'
import { type Page, Pages } from './view-model/pages-vm.js'
import {
  stripPermalinkHexAnchor,
  getPermalinkAnchor,
  stripPermalinkTextAnchor,
} from './utils.js'

// ----------------------------------------------------------------------------
// <xsd:simpleType name="DoxCompoundKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="class" />
//     <xsd:enumeration value="struct" />
//     <xsd:enumeration value="union" />
//     <xsd:enumeration value="interface" />
//     <xsd:enumeration value="protocol" />
//     <xsd:enumeration value="category" />
//     <xsd:enumeration value="exception" />
//     <xsd:enumeration value="service" />
//     <xsd:enumeration value="singleton" />
//     <xsd:enumeration value="module" />
//     <xsd:enumeration value="type" />
//     <xsd:enumeration value="file" />
//     <xsd:enumeration value="namespace" />
//     <xsd:enumeration value="group" />
//     <xsd:enumeration value="page" />
//     <xsd:enumeration value="example" />
//     <xsd:enumeration value="dir" />
//     <xsd:enumeration value="concept" />
//   </xsd:restriction>
// </xsd:simpleType>
// ----------------------------------------------------------------------------

export class Workspace extends Renderers {
  // The doxygen2docusaurus project path.
  projectPath: string

  // The data parsed from the Doxygen XML files.
  dataModel: DataModel
  // From the project docusaurus.config.ts or defaults.
  options: CliOptions

  collectionNamesByKind: Record<string, string> = {
    class: 'classes',
    struct: 'classes',
    union: 'classes',
    // interface
    // protocol
    // category
    // exception
    // service
    // singleton
    // module
    // type
    file: 'files',
    namespace: 'namespaces',
    group: 'groups',
    page: 'pages',
    // example
    dir: 'files',
    // concept
  }

  // The key is one of the above collection names.
  // groups, classes, namespaces, files, pages.
  viewModel: Map<string, CollectionBase>

  // The many options used by Doxygen during build.
  doxygenOptions: DoxygenFileOptions

  // Like `/micro-os-plus/docs/api/`.
  absoluteBaseUrl: string

  // Like `/micro-os-plus/docs/api/`.
  pageBaseUrl: string

  // Like `/api/`.
  slugBaseUrl: string

  // Like `/docs/api/`.
  menuBaseUrl: string

  // Like `docs/api/`.
  outputFolderPath: string

  // like `api/`.
  sidebarBaseId: string

  // The order of entries in the sidebar and in the top menu dropdown.
  sidebarCollectionNames: string[] = [
    'groups',
    'namespaces',
    'classes',
    'files',
    'pages',
  ]

  // View model objects.
  compoundsById = new Map<string, CompoundBase>()

  membersById = new Map<string, Member>()

  descriptionTocLists: DescriptionTocList[] = []
  descriptionTocItemsById = new Map<string, DescriptionTocItem>()

  descriptionAnchorsById = new Map<string, DescriptionAnchor>()

  currentCompound: CompoundBase | undefined

  writtenMdFilesCounter = 0
  writtenHtmlFilesCounter = 0

  mainPage: Page | undefined

  filesByPath = new Map<string, File>()

  /**
   * @brief Map to keep track of indices that have content.
   *
   * @details
   * The map keys are:
   * - classes
   * - namespaces
   * - files
   *
   * and the Set may include:
   * - all
   * - classes
   * - namespaces
   * - functions
   * - variables
   * - typedefs
   * - enums
   * - enumvalues
   */
  indicesMaps = new Map<string, Set<string>>()

  // --------------------------------------------------------------------------

  constructor({
    dataModel,
    options,
  }: {
    dataModel: DataModel
    options: CliOptions
  }) {
    super()
    console.log()

    // Like .../doxygen2docusaurus/dist/src/docusaurus/generator
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    // doxygen2docusaurus
    this.projectPath = path.dirname(path.dirname(__dirname))
    console.log(__dirname, this.projectPath)

    this.dataModel = dataModel
    this.options = options

    this.doxygenOptions = new DoxygenFileOptions(
      this.dataModel.doxyfile?.options
    )

    const docsFolderPath = this.options.docsFolderPath
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    const apiFolderPath = this.options.apiFolderPath
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')

    this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`

    this.sidebarBaseId = `${apiFolderPath}/`

    const docsBaseUrl = this.options.docsBaseUrl
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    let apiBaseUrl = this.options.apiBaseUrl
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    if (apiBaseUrl.length > 0) {
      apiBaseUrl += '/'
    }

    this.absoluteBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`
    this.pageBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`
    this.slugBaseUrl = `/${apiBaseUrl}`
    this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`
    // console.log('absoluteBaseUrl:', this.absoluteBaseUrl)
    // Create the view-model objects.
    this.viewModel = new Map()

    this.viewModel.set('groups', new Groups(this))
    this.viewModel.set('namespaces', new Namespaces(this))
    this.viewModel.set('classes', new Classes(this))
    this.viewModel.set('files', new FilesAndFolders(this))
    this.viewModel.set('pages', new Pages(this))

    this.registerRenderers(this)

    this.createVieModelObjects()
    this.createCompoundsHierarchies()

    this.createMembersMap()

    this.initializeCompoundsLate()
    this.initializeMemberLate()

    this.validatePermalinks()

    this.cleanups()
  }

  // --------------------------------------------------------------------------
  createVieModelObjects(): void {
    console.log('Creating view model objects...')
    for (const compoundDefDataModel of this.dataModel.compoundDefs) {
      let compound: CompoundBase | undefined = undefined
      const { kind } = compoundDefDataModel

      const collectionName: string | undefined =
        this.collectionNamesByKind[kind]
      const collection = this.viewModel.get(collectionName)
      if (collection !== undefined) {
        // Create the compound object and add it to the parent collection.
        // console.log(
        //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
        // )
        compound = collection.addChild(compoundDefDataModel)
        // Also add it to the global compounds map.
        this.compoundsById.set(compound.id, compound)
        // console.log('compoundsById.set', compound.kind, compound.id)
      }

      if (compound !== undefined) {
        if (
          compoundDefDataModel instanceof AbstractCompoundDefType &&
          compoundDefDataModel.detailedDescription !== undefined
        ) {
          this.findDescriptionIdsRecursively(
            compound,
            compoundDefDataModel.detailedDescription
          )
        }
      } else {
        // console.error(
        //   util.inspect(compoundDefDataModel, { compact: false, depth: 999 })
        // )
        console.error(
          'compoundDefDataModel',
          compoundDefDataModel.kind,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }
    if (this.options.verbose) {
      console.log(this.compoundsById.size, 'compound definitions')
    }
    // console.log(this.descriptionTocLists)
  }

  // eslint-disable-next-line complexity
  findDescriptionIdsRecursively(
    compound: CompoundBase,
    element: AbstractDataModelBase
  ): void {
    // console.log(compound.id, typeof element)
    if (element.children === undefined) {
      return
    }

    for (const childDataModel of element.children) {
      if (childDataModel instanceof TocListDataModel) {
        const tocList = new DescriptionTocList(compound)
        // console.log(elementChild)
        assert(childDataModel.tocItems !== undefined)
        for (const tocItemDataModel of childDataModel.tocItems) {
          if (tocItemDataModel instanceof TocItemDataModel) {
            const tocItem = new DescriptionTocItem(tocItemDataModel.id, tocList)
            tocList.tocItems.push(tocItem)
            this.descriptionTocItemsById.set(tocItem.id, tocItem)
          }
        }
        this.descriptionTocLists.push(tocList)
      } else if (childDataModel instanceof AbstractDocSectType) {
        if (childDataModel.id !== undefined) {
          const anchor = new DescriptionAnchor(compound, childDataModel.id)
          this.descriptionAnchorsById.set(anchor.id, anchor)
        }
        this.findDescriptionIdsRecursively(compound, childDataModel)
      } else if (childDataModel instanceof AbstractDocAnchorType) {
        // console.log(childDataModel)
        if (childDataModel.id.length > 0) {
          const section = new DescriptionAnchor(compound, childDataModel.id)
          this.descriptionAnchorsById.set(section.id, section)
        }
      } else if (childDataModel instanceof AbstractDataModelBase) {
        // if (childDataModel instanceof AbstractDocEntryType) {
        //   console.log(childDataModel)
        // }
        this.findDescriptionIdsRecursively(compound, childDataModel)
      }
    }
  }

  // --------------------------------------------------------------------------
  createCompoundsHierarchies(): void {
    console.log('Creating compounds hierarchies...')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.viewModel) {
      // console.log('createHierarchies:', collectionName)
      collection.createCompoundsHierarchies()
    }
  }

  // --------------------------------------------------------------------------
  // Required since references can be resolved only after all objects are in.
  initializeCompoundsLate(): void {
    console.log('Performing compounds late initializations...')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.viewModel) {
      // console.log('createHierarchies:', collectionName)
      for (const [, compound] of collection.collectionCompoundsById) {
        this.currentCompound = compound
        if (this.options.debug) {
          console.log(compound.kind, compound.compoundName)
        }
        compound.initializeLate()
      }
    }
    this.currentCompound = undefined
  }

  // --------------------------------------------------------------------------
  createMembersMap(): void {
    console.log('Creating member definitions map...')
    for (const [, compound] of this.compoundsById) {
      // console.log(compound.kind, compound.compoundName, compound.id)
      for (const section of compound.sections) {
        // console.log('  ', sectionDef.kind)
        for (const member of section.indexMembers) {
          if (member instanceof Member) {
            const memberCompoundId = stripPermalinkHexAnchor(member.id)
            if (memberCompoundId !== compound.id) {
              // Skip member definitions from different compounds.
              // Hopefully they are defined properly there.
              // console.log(
              //   'member from another compound', compoundId, 'skipped'
              // )
            } else {
              // console.log('    ', memberDef.kind, memberDef.id)
              // eslint-disable-next-line max-depth
              if (this.membersById.has(member.id)) {
                // eslint-disable-next-line max-depth
                if (this.options.verbose) {
                  console.warn(
                    'member already in map',
                    member.id,
                    'in',
                    this.membersById.get(member.id)?.name
                  )
                }
              } else {
                this.membersById.set(member.id, member)
              }
            }
          }
        }
      }
    }
    if (this.options.verbose) {
      console.log(this.membersById.size, 'member definitions')
    }
  }

  // --------------------------------------------------------------------------
  // Required since references can be resolved only after all objects are in.
  initializeMemberLate(): void {
    console.log('Performing members late initializations...')
    for (const [, compound] of this.compoundsById) {
      if (this.options.debug) {
        console.log(compound.kind, compound.compoundName, compound.id)
      }
      this.currentCompound = compound
      for (const section of compound.sections) {
        section.initializeLate()

        if (this.options.debug) {
          console.log('  ', section.kind)
        }
        for (const member of section.indexMembers) {
          if (member instanceof Member) {
            if (this.options.debug) {
              console.log('    ', member.kind, member.id)
            }
            member.initializeLate()
          }
        }
      }
    }
    this.currentCompound = undefined
  }

  // --------------------------------------------------------------------------
  /**
   * @brief Validate the uniqueness of permalinks.
   */
  // eslint-disable-next-line complexity
  validatePermalinks(): void {
    console.log('Validating permalinks...')

    const pagePermalinksById = new Map<string, string>()
    const compoundsByPermalink = new Map<string, Map<string, CompoundBase>>()

    for (const compoundDefDataModel of this.dataModel.compoundDefs) {
      // console.log(
      //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
      // )
      const { id } = compoundDefDataModel
      if (pagePermalinksById.has(id)) {
        console.warn('Duplicate id', id)
      }

      const compound: CompoundBase | undefined = this.compoundsById.get(id)
      if (compound === undefined) {
        console.error(
          'compoundDefDataModel',
          id,
          'not yet processed in',
          this.constructor.name,
          'validatePermalinks'
        )
        continue
      }

      // eslint-disable-next-line @typescript-eslint/prefer-destructuring
      const permalink = compound.relativePermalink
      if (permalink !== undefined) {
        // console.log('permalink:', permalink)
        let compoundsMap = compoundsByPermalink.get(permalink)
        if (compoundsMap === undefined) {
          compoundsMap = new Map()
          compoundsByPermalink.set(permalink, compoundsMap)
        }
        pagePermalinksById.set(id, permalink)
        if (!compoundsMap.has(compound.id)) {
          compoundsMap.set(compound.id, compound)
        }
      }
    }

    for (const [permalink, compoundsMap] of compoundsByPermalink) {
      if (compoundsMap.size > 1) {
        if (this.options.verbose) {
          console.warn(
            'Permalink',
            permalink,
            'has',
            compoundsMap.size,
            'occurrences:'
          )
        }
        let count = 1
        for (const [, compound] of compoundsMap) {
          const suffix = `-${count}`
          count += 1
          compound.relativePermalink += suffix
          compound.docusaurusId += suffix

          if (this.options.verbose) {
            console.warn('-', compound.relativePermalink, compound.id)
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  cleanups(): void {
    for (const [, compound] of this.compoundsById) {
      compound._private._compoundDef = undefined
    }
  }

  // --------------------------------------------------------------------------
  // eslint-disable-next-line complexity
  async writeMdFile({
    filePath,
    bodyLines,
    frontMatter,
    frontMatterCodeLines,
    title,
    pagePermalink,
  }: {
    filePath: string
    bodyLines: string[]
    frontMatter: FrontMatter
    frontMatterCodeLines?: string[]
    title?: string
    pagePermalink?: string
  }): Promise<void> {
    const lines: string[] = []

    lines.push('')
    lines.push('<div class="doxyPage">')

    if (frontMatter.title === undefined && title !== undefined) {
      lines.push('')
      lines.push(`# ${title}`)
    }

    lines.push('')
    lines.push(...bodyLines)
    lines.push('')
    lines.push('<hr/>')
    lines.push('')
    lines.push(
      '<p class="doxyGeneratedBy">Generated via ' +
        '<a href="https://github.com/xpack/doxygen2docusaurus">' +
        'doxygen2docusaurus</a> by ' +
        '<a href="https://www.doxygen.nl">Doxygen</a> ' +
        this.dataModel.doxygenindex?.version +
        '.' +
        '</p>'
    )
    lines.push('')
    lines.push('</div>')
    lines.push('')

    // Hack to prevent Docusaurus replace legit content with emojis.
    let text = lines.join('\n')
    if (pagePermalink !== undefined && pagePermalink.length > 0) {
      // Strip local page permalink from anchors.
      text = text.replaceAll(`"${pagePermalink}/#`, '"#')
    }

    // No longer needed for `.md`.
    // text = text.replaceAll(':thread:', "{':thread:'}")
    //   .replaceAll(':flags:', "{':flags:'}")
    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    const frontMatterLines: string[] = []

    frontMatterLines.push('---')
    frontMatterLines.push('')
    frontMatterLines.push('# DO NOT EDIT!')
    frontMatterLines.push(
      '# Automatically generated via doxygen2docusaurus by Doxygen.'
    )
    frontMatterLines.push('')
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterLines.push(`${key}:`)

        for (const arrayValue of value) {
          frontMatterLines.push(`  - ${arrayValue}`)
        }
      } else if (typeof value === 'boolean') {
        frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`)
      } else {
        frontMatterLines.push(`${key}: ${value}`)
      }
    }
    frontMatterLines.push('')

    // Skip date, to avoid unnecessary git commits.
    // frontMatterText += `date: ${formatDate(new Date())}\n`
    // frontMatterText += '\n'
    frontMatterLines.push('---')
    frontMatterLines.push('')

    if (frontMatterCodeLines !== undefined && frontMatterCodeLines.length > 0) {
      frontMatterLines.push('')
      for (const line of frontMatterCodeLines) {
        frontMatterLines.push(line)
      }
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(frontMatterLines.join('\n'))
    await fileHandle.write(text)

    await fileHandle.close()

    this.writtenMdFilesCounter += 1
  }

  // --------------------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  skipElementsPara(
    elements: Array<AbstractDataModelBase | string> | undefined
  ): void {
    if (elements === undefined) {
      return
    }

    for (const child of elements) {
      if (child instanceof ParaDataModel) {
        child.skipPara = true
      }
    }
  }

  // --------------------------------------------------------------------------
  getPermalink({
    refid,
    kindref,
  }: {
    refid: string
    kindref: string // 'compound', 'member'
  }): string | undefined {
    // console.log(refid, kindref)
    let permalink: string | undefined = undefined
    if (kindref === 'compound') {
      permalink = this.getPagePermalink(refid)
    } else if (kindref === 'member') {
      const anchor = getPermalinkAnchor(refid)
      const compoundId = stripPermalinkHexAnchor(refid)
      // console.log(
      //   'refid:', refid, 'compoundId:', compoundId, 'anchor:', anchor
      // )
      permalink = this.getPagePermalink(compoundId, true)
      if (permalink !== undefined) {
        permalink += `/#${anchor}`
      } else {
        const tocItem = this.descriptionTocItemsById.get(refid)
        if (tocItem !== undefined) {
          const { tocList } = tocItem
          permalink = this.getPagePermalink(tocList.compound.id)
          if (permalink !== undefined) {
            permalink += `/#${anchor}`
          } else {
            console.error(
              'Unknown permalink of',
              tocList.compound.id,
              'for',
              refid,
              'in',
              this.constructor.name,
              'getPermalink'
            )
          }
        } else {
          const descriptionSection = this.descriptionAnchorsById.get(refid)
          if (descriptionSection !== undefined) {
            permalink = this.getPagePermalink(descriptionSection.compound.id)
            if (permalink !== undefined) {
              permalink += `/#${anchor}`
            } else {
              console.error(
                'Unknown permalink of',
                descriptionSection.compound.id,
                'for',
                refid,
                'in',
                this.constructor.name,
                'getPermalink'
              )
            }
          } else {
            console.error(
              'Unknown permalink for',
              refid,
              'in',
              this.constructor.name,
              'getPermalink'
            )
          }
        }
      }
      // console.log(permalink)
      // }
    } else if (kindref === 'xrefsect') {
      const anchor = getPermalinkAnchor(refid)
      const compoundId = stripPermalinkTextAnchor(refid)
      // console.log(
      //   'refid:', refid, 'compoundId:', compoundId, 'anchor:', anchor
      // )
      permalink = this.getPagePermalink(compoundId, true)
      if (permalink !== undefined) {
        permalink += `/#${anchor}`
      } else {
        console.error(
          'Unknown permalink for',
          refid,
          'in',
          this.constructor.name,
          'getPermalink'
        )
      }
      // console.log(permalink)
      // }
    } else {
      console.error(
        'Unsupported kindref',
        kindref,
        'for',
        refid,
        'in',
        this.constructor.name,
        'getPermalink'
      )
    }

    return permalink
  }

  getPagePermalink(refid: string, noWarn = false): string | undefined {
    const dataObject: CompoundBase | undefined = this.compoundsById.get(refid)
    if (dataObject === undefined) {
      if (this.options.debug && !noWarn) {
        console.warn('refid', refid, 'is not a known compound, no permalink')
      }
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    const pagePermalink = dataObject.relativePermalink
    if (pagePermalink === undefined) {
      if (this.options.verbose && !noWarn) {
        console.warn('refid', refid, 'has no permalink')
      }
      return undefined
    }

    return `${this.pageBaseUrl}${pagePermalink}`
  }

  getXrefPermalink(id: string): string {
    // console.log('1', id, this.currentCompoundDef.id)
    const pagePart = id.replace(/_1.*/, '')
    const anchorPart = id.replace(/.*_1/, '')
    // console.log('2', part1, part2)
    // if (
    //   this.currentCompound !== undefined &&
    //   pagePart === this.currentCompound.id
    // ) {
    //   return `#${anchorPart}`
    // } else {
    return `${this.pageBaseUrl}pages/${pagePart}/#${anchorPart}`
    // }
  }
}

// ----------------------------------------------------------------------------
