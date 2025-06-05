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
import * as fs from 'node:fs/promises'
import path from 'node:path'

import { DataModel } from '../data-model/types.js'
import { PluginOptions } from '../plugin/options.js'
import { Groups } from './view-model/groups-vm.js'
import { CollectionBase } from './view-model/collection-base.js'
import { Classes } from './view-model/classes-vm.js'
import { DoxygenFileOptions } from './view-model/options.js'
import { ElementLinesRendererBase, ElementTextRendererBase } from './elements-renderers/element-renderer-base.js'
import { escapeMdx, getPermalinkAnchor, stripPermalinkAnchor } from './utils.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { Namespaces } from './view-model/namespaces-vm.js'
import { FilesAndFolders } from './view-model/files-and-folders-vm.js'
import { Pages } from './view-model/pages-vm.js'
import { FrontMatter } from './types.js'
import { pluginName } from '../plugin/docusaurus.js'
import { Member } from './view-model/members-vm.js'
import { Renderers } from './elements-renderers/renderers.js'

// ----------------------------------------------------------------------------

export class Workspace {
  // The data parsed from the Doxygen XML files.
  dataModel: DataModel
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  // Docusaurus site configuration
  siteConfig: any

  // The actions object passed from the plugin.
  pluginActions: any

  collectionNamesByKind: Record<string, string> = {
    group: 'groups',
    namespace: 'namespaces',
    class: 'classes',
    struct: 'classes',
    file: 'files',
    dir: 'files',
    page: 'pages'
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
  sidebarCollectionNames: string[] = ['groups', 'namespaces', 'classes', 'files', 'pages']

  // View model objects.
  compoundsById: Map<string, CompoundBase> = new Map()

  membersById: Map<String, Member> = new Map()

  currentCompound: CompoundBase | undefined

  elementRenderers: Renderers

  // --------------------------------------------------------------------------

  constructor ({
    dataModel,
    pluginOptions,
    siteConfig,
    pluginActions = undefined
  }: {
    dataModel: DataModel
    pluginOptions: PluginOptions
    siteConfig: any
    pluginActions?: any
  }) {
    console.log()

    this.dataModel = dataModel
    this.pluginOptions = pluginOptions
    this.siteConfig = siteConfig
    this.pluginActions = pluginActions

    this.doxygenOptions = new DoxygenFileOptions(this.dataModel.doxyfile?.options)

    const docsFolderPath = this.pluginOptions.docsFolderPath.replace(/^[/]/, '').replace(/[/]$/, '')
    const apiFolderPath = this.pluginOptions.apiFolderPath.replace(/^[/]/, '').replace(/[/]$/, '')

    this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`

    this.sidebarBaseId = `${apiFolderPath}/`

    const docsBaseUrl = this.pluginOptions.docsBaseUrl.replace(/^[/]/, '').replace(/[/]$/, '')
    const apiBaseUrl = this.pluginOptions.apiBaseUrl.replace(/^[/]/, '').replace(/[/]$/, '')

    this.absoluteBaseUrl = `${this.siteConfig.baseUrl}${docsBaseUrl}/${apiBaseUrl}/`
    this.pageBaseUrl = `${this.siteConfig.baseUrl}${docsBaseUrl}/${apiBaseUrl}/`
    this.slugBaseUrl = `/${apiBaseUrl}/`
    this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}/`
    // console.log('absoluteBaseUrl:', this.absoluteBaseUrl)

    // Create the view-model objects.
    this.viewModel = new Map()

    this.viewModel.set('groups', new Groups(this))
    this.viewModel.set('namespaces', new Namespaces(this))
    this.viewModel.set('classes', new Classes(this))
    this.viewModel.set('files', new FilesAndFolders(this))
    this.viewModel.set('pages', new Pages(this))

    this.elementRenderers = new Renderers(this)

    this.createVieModelObjects()
    this.createCompoundsHierarchies()

    this.createMembersMap()

    this.initializeCompoundsLate()
    this.initializeMemberLate()

    this.validatePermalinks()

    this.cleanups()
  }

  // --------------------------------------------------------------------------

  createVieModelObjects (): void {
    console.log('Creating view model objects...')
    for (const compoundDefDataModel of this.dataModel.compoundDefs) {
      let added = false
      const collectionName = this.collectionNamesByKind[compoundDefDataModel.kind]
      if (collectionName !== undefined) {
        const collection = this.viewModel.get(collectionName)
        if (collection !== undefined) {
          // Create the compound object and add it to the parent collection.
          const compound = collection.addChild(compoundDefDataModel)
          // Also add it to the global compounds map.
          this.compoundsById.set(compoundDefDataModel.id, compound)
          added = true
        }
      }
      if (!added) {
        // console.error(util.inspect(compoundDefDataModel, { compact: false, depth: 999 }))
        console.error('compoundDefDataModel', compoundDefDataModel.kind, 'not implemented yet in', this.constructor.name)
      }
    }
    if (this.pluginOptions.verbose) {
      console.log(this.compoundsById.size, 'compound definitions')
    }
  }

  // --------------------------------------------------------------------------

  createCompoundsHierarchies (): void {
    console.log('Creating compounds hierarchies...')

    for (const [collectionName, collection] of this.viewModel) {
      // console.log('createHierarchies:', collectionName)
      collection.createCompoundsHierarchies()
    }
  }

  // --------------------------------------------------------------------------

  // Required since references can be resolved only after all objects are in.
  initializeCompoundsLate (): void {
    console.log('Performing compounds late initializations...')

    for (const [collectionName, collection] of this.viewModel) {
      // console.log('createHierarchies:', collectionName)
      for (const [compoundId, compound] of collection.collectionCompoundsById) {
        this.currentCompound = compound
        // console.log(compound.compoundName)
        compound.initializeLate()
      }
    }
    this.currentCompound = undefined
  }

  // --------------------------------------------------------------------------

  createMembersMap (): void {
    console.log('Creating member definitions map...')
    for (const [, compound] of this.compoundsById) {
      // console.log(compound.kind, compound.compoundName, compound.id)
      if (compound.sections !== undefined) {
        for (const section of compound.sections) {
          if (section.indexMembers !== undefined) {
            // console.log('  ', sectionDef.kind)
            for (const member of section.indexMembers) {
              if (member instanceof Member) {
                const memberCompoundId = stripPermalinkAnchor(member.id)
                if (memberCompoundId !== compound.id) {
                  // Skip member definitions from different compounds.
                  // Hopefully they are defined properly there.
                  // console.log('member from another compound', compoundId, 'skipped')
                } else {
                  // console.log('    ', memberDef.kind, memberDef.id)
                  if (this.membersById.has(member.id)) {
                    console.warn('member already in map', member.id, 'in', this.membersById.get(member.id)?.name)
                  } else {
                    this.membersById.set(member.id, member)
                  }
                }
              }
            }
          }
        }
      }
    }
    if (this.pluginOptions.verbose) {
      console.log(this.membersById.size, 'member definitions')
    }
  }

  // --------------------------------------------------------------------------

  // Required since references can be resolved only after all objects are in.
  initializeMemberLate (): void {
    console.log('Performing members late initializations...')
    for (const [, compound] of this.compoundsById) {
      // console.log(compound.kind, compound.compoundName, compound.id)
      this.currentCompound = compound
      if (compound.sections !== undefined) {
        for (const section of compound.sections) {
          section.initializeLate()
          if (section.indexMembers !== undefined) {
            // console.log('  ', sectionDef.kind)
            for (const member of section.indexMembers) {
              if (member instanceof Member) {
                member.initializeLate()
              }
            }
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
  validatePermalinks (): void {
    console.log('Validating permalinks...')

    // const outputFolderPath = this.options.outputFolderPath

    const pagePermalinksById: Map<string, string> = new Map()
    const pagePermalinksSet: Set<string> = new Set()

    for (const compoundDefDataModel of this.dataModel.compoundDefs) {
      // console.log(compoundDefDataModel.kind, compoundDefDataModel.compoundName)

      const compound: CompoundBase | undefined = this.compoundsById.get(compoundDefDataModel.id)
      if (compound === undefined) {
        console.error('compoundDefDataModel', compoundDefDataModel.id, 'not yet processed in', this.constructor.name, 'validatePermalinks')
        continue
      }

      const permalink = compound.relativePermalink
      assert(permalink !== undefined)
      // console.log('permalink:', permalink)

      if (pagePermalinksById.has(compoundDefDataModel.id)) {
        console.error('Permalink clash for id', compoundDefDataModel.id)
      }
      if (pagePermalinksSet.has(permalink)) {
        console.error('Permalink clash for permalink', permalink, 'id:', compoundDefDataModel.id)
      }
      pagePermalinksById.set(compoundDefDataModel.id, permalink)
      pagePermalinksSet.add(permalink)
    }
  }

  // --------------------------------------------------------------------------

  cleanups (): void {
    for (const [, compound] of this.compoundsById) {
      compound._private._compoundDef = undefined
    }
  }

  // --------------------------------------------------------------------------

  async writeMdxFile ({
    filePath,
    bodyLines,
    frontMatter,
    frontMatterCodeLines,
    title
  }: {
    filePath: string
    bodyLines: string[]
    frontMatter: FrontMatter
    frontMatterCodeLines?: string[]
    title?: string
  }): Promise<void> {
    const lines: string[] = []

    lines.push('')
    lines.push('<DoxygenPage pluginConfig={pluginConfig}>')
    lines.push('')
    lines.push(...bodyLines)
    lines.push('')
    lines.push('</DoxygenPage>')
    lines.push('')

    // Hack to prevent Docusaurus replace legit content with emojis.
    const text = lines.join('\n').replaceAll(':thread:', "{':thread:'}").replaceAll(':flags:', "{':flags:'}")

    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    const frontMatterLines: string[] = []

    frontMatterLines.push('---')
    frontMatterLines.push('')
    frontMatterLines.push('# DO NOT EDIT!')
    frontMatterLines.push('# Automatically generated via docusaurus-plugin-doxygen by Doxygen.')
    frontMatterLines.push('')
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterLines.push(`${key}:`)
        for (const arrayValue of frontMatter[key] as string[]) {
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

    if (text.includes('<Link')) {
      frontMatterLines.push('import Link from \'@docusaurus/Link\'')
    }

    // Theme components.
    if (text.includes('<CodeBlock')) {
      frontMatterLines.push('import CodeBlock from \'@theme/CodeBlock\'')
    }
    if (text.includes('<Admonition')) {
      frontMatterLines.push('import Admonition from \'@theme/Admonition\'')
    }

    frontMatterLines.push('')

    const componentNames = [
      'CodeLine',
      'CollapsibleTreeTable',
      'DoxygenPage',
      'EnumerationList',
      'EnumerationListItem',
      'GeneratedByDoxygen',
      'Highlight',
      'IncludesList',
      'IncludesListItem',
      'MemberDefinition',
      'MembersIndex',
      'MembersIndexItem',
      'ParametersList',
      'ParametersListItem',
      'ProgramListing',
      'Reference',
      'SectionDefinition',
      'SectionUser',
      'TreeTable',
      'TreeTableRow',
      'XrefSect'
    ]

    // Add includes for the plugin components.
    for (const componentName of componentNames) {
      if (text.includes(`<${componentName}`)) {
        frontMatterLines.push(`import ${componentName} from '${pluginName}/components/${componentName}'`)
      }
    }

    if (frontMatterCodeLines !== undefined && frontMatterCodeLines.length > 0) {
      frontMatterLines.push('')
      for (const line of frontMatterCodeLines) {
        frontMatterLines.push(line)
      }
    }

    frontMatterLines.push('')
    frontMatterLines.push('import pluginConfig from \'@site/docusaurus-plugin-doxygen-config.json\'')

    frontMatterLines.push('')
    if (frontMatter.title === undefined && title !== undefined) {
      frontMatterLines.push(`# ${title}`)
      frontMatterLines.push('')
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(frontMatterLines.join('\n'))
    await fileHandle.write(text)

    await fileHandle.close()
  }

  // --------------------------------------------------------------------------

  renderElementsToMdxLines (elements: Object[] | undefined): string[] {
    if (!Array.isArray(elements)) {
      return []
    }

    const lines: string[] = []

    for (const element of elements) {
      lines.push(...this.renderElementToMdxLines(element))
    }

    return lines
  }

  renderElementToMdxLines (element: Object | undefined): string[] {
    if (element === undefined) {
      return []
    }

    if (typeof element === 'string') {
      return [escapeMdx(element)]
    }

    if (Array.isArray(element)) {
      const lines: string[] = []
      for (const elementOfArray of element) {
        lines.push(...this.renderElementToMdxLines(elementOfArray))
      }
      return lines
    }

    const linesRenderer: ElementLinesRendererBase | undefined = this.elementRenderers.getElementLinesRenderer(element)
    if (linesRenderer !== undefined) {
      return linesRenderer.renderToMdxLines(element)
    }

    const textRenderer: ElementTextRendererBase | undefined = this.elementRenderers.getElementTextRenderer(element)
    if (textRenderer !== undefined) {
      return [textRenderer.renderToMdxText(element)]
    }

    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error('no element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxLines')
    assert(false)
  }

  renderElementsToMdxText (elements: Object[] | undefined): string {
    if (elements === undefined) {
      return ''
    }

    let text = ''
    for (const element of elements) {
      text += this.renderElementToMdxText(element)
    }

    return text
  }

  renderElementToMdxText (element: Object | undefined): string {
    if (element === undefined) {
      return ''
    }

    if (typeof element === 'string') {
      return escapeMdx(element)
    }

    if (Array.isArray(element)) {
      let text = ''
      for (const elementOfArray of element) {
        text += this.renderElementToMdxText(elementOfArray)
      }
      return text
    }

    const textRenderer: ElementTextRendererBase | undefined = this.elementRenderers.getElementTextRenderer(element)
    if (textRenderer !== undefined) {
      return textRenderer.renderToMdxText(element)
    }

    // console.warn('trying element lines renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText')
    const linesRenderer: ElementLinesRendererBase | undefined = this.elementRenderers.getElementLinesRenderer(element)
    if (linesRenderer !== undefined) {
      return linesRenderer.renderToMdxLines(element).join('\n')
    }

    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error('no element text renderer for', element.constructor.name, 'in', this.constructor.name, 'renderElementToMdxText')
    return ''
  }

  // --------------------------------------------------------------------------

  getPermalink ({
    refid,
    kindref
  }: {
    refid: string
    kindref: string // 'compound', 'member'
  }): string {
    // console.log(refid, kindref)
    // if (refid.endsWith('ga45942bdeee4fb61db5a7dc3747cb7193')) {
    //   console.log(refid, kindref)
    // }
    let permalink: string | undefined
    if (kindref === 'compound') {
      permalink = this.getPagePermalink(refid)
    } else if (kindref === 'member') {
      const compoundId = stripPermalinkAnchor(refid)
      // console.log('compoundId:', compoundId)
      // if (this.currentCompound !== undefined && compoundId === this.currentCompound.id) {
      //   permalink = `#${getPermalinkAnchor(refid)}`
      // } else {
      permalink = `${this.getPagePermalink(compoundId)}/#${getPermalinkAnchor(refid)}`
      // }
    } else {
      console.error('Unsupported kindref', kindref, 'for', refid, 'in', this.constructor.name, 'getPermalink')
    }

    assert(permalink !== undefined && permalink.length > 1)
    // if (refid.endsWith('ga45942bdeee4fb61db5a7dc3747cb7193')) {
    //   console.log(permalink)
    // }
    return permalink
  }

  getPagePermalink (refid: string): string {
    const dataObject: CompoundBase | undefined = this.compoundsById.get(refid)
    if (dataObject === undefined) {
      console.log('refid', refid)
    }
    assert(dataObject !== undefined)

    const pagePermalink = dataObject.relativePermalink
    if (pagePermalink === undefined) {
      console.error('refid', refid, 'has no permalink')
    }

    assert(pagePermalink !== undefined)
    return `${this.pageBaseUrl}${pagePermalink}`
  }

  getXrefPermalink (id: string): string {
    // console.log('1', id, this.currentCompoundDef.id)
    const pagePart = id.replace(/_1.*/, '')
    const anchorPart = id.replace(/.*_1/, '')
    // console.log('2', part1, part2)
    // if (this.currentCompound !== undefined && pagePart === this.currentCompound.id) {
    //   return `#${anchorPart}`
    // } else {
    return `${this.pageBaseUrl}pages/${pagePart}/#${anchorPart}`
    // }
  }

  // In utils:
  // export function stripPermalinkAnchor (refid: string): string
  // export function getPermalinkAnchor (refid: string): string
}

// ----------------------------------------------------------------------------
