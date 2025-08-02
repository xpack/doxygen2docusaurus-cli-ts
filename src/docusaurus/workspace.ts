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

import assert from 'node:assert'
import * as fs from 'node:fs/promises'
// import * as util from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ParaDataModel } from '../doxygen/data-model/compounds/descriptiontype-dm.js'
import { AbstractDataModelBase } from '../doxygen/data-model/types.js'
import { type DataModel } from '../doxygen/data-model/data-model.js'
import { Renderers } from './renderers/renderers.js'
import type { CliOptions } from './cli-options.js'
import type { FrontMatter } from './types.js'
import type { CompoundBase } from './view-model/compound-base-vm.js'
import { type File } from './view-model/files-and-folders-vm.js'
import { DoxygenFileOptions } from './view-model/options.js'
import { type Page } from './view-model/pages-vm.js'
import {
  stripPermalinkHexAnchor,
  getPermalinkAnchor,
  stripPermalinkTextAnchor,
} from './utils.js'
import { ViewModel } from './view-model/view-model.js'

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
  // From the project docusaurus.config.ts or defaults.
  options: CliOptions

  // The data parsed from the Doxygen XML files.
  dataModel: DataModel

  viewModel: ViewModel

  // The doxygen2docusaurus project path.
  projectPath: string

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

  writtenMdFilesCounter = 0
  writtenHtmlFilesCounter = 0

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

  // The order of entries in the sidebar and in the top menu dropdown.
  sidebarCollectionNames: string[] = [
    'groups',
    'namespaces',
    'classes',
    'files',
    'pages',
  ]

  // --------------------------------------------------------------------------

  constructor(dataModel: DataModel) {
    super()
    console.log()

    this.dataModel = dataModel
    this.options = dataModel.options

    // Like .../doxygen2docusaurus/dist/docusaurus/generator
    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    // doxygen2docusaurus
    this.projectPath = path.dirname(path.dirname(__dirname))
    // console.log(__dirname, this.projectPath)

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

    this.registerRenderers(this)

    this.viewModel = new ViewModel(this)
    this.viewModel.create()
  }

  // --------------------------------------------------------------------------

  async writeOutputMdFile({
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
    assert(this.dataModel.doxygenindex?.version !== undefined)
    assert(this.dataModel.projectVersion !== undefined)
    lines.push(
      '<p class="doxyGeneratedBy">Generated via ' +
        '<a href="https://github.com/xpack/doxygen2docusaurus">' +
        'doxygen2docusaurus</a> ' +
        this.dataModel.projectVersion +
        ' by ' +
        '<a href="https://www.doxygen.nl">Doxygen</a> ' +
        this.dataModel.doxygenindex.version +
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
      } else if (value == null) {
        frontMatterLines.push(`${key}: null`)
      } else {
        frontMatterLines.push(`${key}: ${value.toString()}`)
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

  skipElementsPara(
    elements: (AbstractDataModelBase | string)[] | undefined
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
        const tocItem = this.viewModel.descriptionTocItemsById.get(refid)
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
          const descriptionSection =
            this.viewModel.descriptionAnchorsById.get(refid)
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
    const dataObject: CompoundBase | undefined =
      this.viewModel.compoundsById.get(refid)
    if (dataObject === undefined) {
      if (this.options.debug && !noWarn) {
        console.warn('refid', refid, 'is not a known compound, no permalink')
      }
      return undefined
    }

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
