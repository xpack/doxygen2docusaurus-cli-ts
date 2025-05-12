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
import * as fs from 'node:fs/promises'

import { Workspace } from './workspace.js'
import { DataModel } from '../data-model/types.js'
import { PluginOptions } from '../plugin/options.js'
import { MenuDropdown, SidebarItem } from '../plugin/types.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { Page } from './view-model/pages-vm.js'
import { FrontMatter } from './types.js'
import { stripPermalinkAnchor } from './utils.js'
import { Member } from './view-model/members-vm.js'

export class DocusaurusGenerator {
  workspace: Workspace

  // --------------------------------------------------------------------------

  constructor ({
    dataModel,
    pluginOptions,
    siteConfig
  }: {
    dataModel: DataModel
    pluginOptions: PluginOptions
    siteConfig: any
  }) {
    console.log('DocusaurusGenerator.constructor()')
    this.workspace = new Workspace({
      dataModel,
      pluginOptions,
      siteConfig
    })
  }

  // --------------------------------------------------------------------------

  async generate (): Promise<void> {
    // console.log('DocusaurusGenerator2.generate()')

    // The compoundsById is created in the workspace as the objects are created.
    this.createCompoundsHierarchies()
    this.initializeCompoundsLate()
    this.createMembersMap()
    this.validatePermalinks()

    await this.prepareOutputFolder()
    await this.generateSidebar()
    await this.generateMenuDropdown()
    await this.generatePages()
    await this.generateIndexDotMdxFiles()
    await this.generateRedirects()
  }

  // --------------------------------------------------------------------------

  createCompoundsHierarchies (): void {
    console.log('Creating objects hierarchies...')

    for (const [collectionName, collection] of this.workspace.viewModel) {
      // console.log('createHierarchies:', collectionName)
      collection.createCompoundsHierarchies()
    }
  }

  initializeCompoundsLate (): void {
    console.log('Perform compound late initializations...')

    for (const [collectionName, collection] of this.workspace.viewModel) {
      // console.log('createHierarchies:', collectionName)
      for (const [compoundId, compound] of collection.compoundsById) {
        compound.initializeLate()
      }
    }
  }

  // --------------------------------------------------------------------------

  createMembersMap (): void {
    for (const [, compound] of this.workspace.compoundsById) {
      // console.log(compoundDef.kind, compoundDef.compoundName, compoundDef.id)
      if (compound.sections !== undefined) {
        for (const section of compound.sections) {
          if (section.members !== undefined) {
            // console.log('  ', sectionDef.kind)
            for (const member of section.members) {
              if (member instanceof Member) {
                const memberCompoundId = stripPermalinkAnchor(member.memberDef.id)
                if (memberCompoundId !== compound.compoundDef.id) {
                  // Skip member definitions from different compounds.
                  // Hopefully they are defined properly there.
                  // console.log('member from another compound', compoundId, 'skipped')
                } else {
                  // console.log('    ', memberDef.kind, memberDef.id)
                  if (this.workspace.membersById.has(member.memberDef.id)) {
                    console.warn('member already in map', member.memberDef.id, 'in', this.workspace.membersById.get(member.memberDef.id)?.name)
                  } else {
                    this.workspace.membersById.set(member.memberDef.id, member)
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(this.workspace.membersById.size, 'member definitions')
  }

  // --------------------------------------------------------------------------

  /**
   * @brief Validate the uniqueness of permalinks.
   */
  validatePermalinks (): void {
    console.log('Validating permalinks...')

    assert(this.workspace.pluginOptions.outputFolderPath)
    // const outputFolderPath = this.options.outputFolderPath

    const pagePermalinksById: Map<string, string> = new Map()
    const pagePermalinksSet: Set<string> = new Set()

    for (const compoundDef of this.workspace.dataModel.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName)

      const compound: CompoundBase | undefined = this.workspace.compoundsById.get(compoundDef.id)
      if (compound === undefined) {
        console.error('compoundDef', compoundDef.id, 'not yet processed in', this.constructor.name, 'validatePermalinks')
        continue
      }

      const permalink = compound.relativePermalink
      assert(permalink !== undefined)
      // console.log('permalink:', permalink)

      if (pagePermalinksById.has(compoundDef.id)) {
        console.error('Permalink clash for id', compoundDef.id)
      }
      if (pagePermalinksSet.has(permalink)) {
        console.error('Permalink clash for permalink', permalink, 'id:', compoundDef.id)
      }
      pagePermalinksById.set(compoundDef.id, permalink)
      pagePermalinksSet.add(permalink)
    }
  }

  // --------------------------------------------------------------------------

  // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  async prepareOutputFolder (): Promise<void> {
    assert(this.workspace.pluginOptions.outputFolderPath)
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath
    try {
      await fs.access(outputFolderPath)
      // Remove the folder if it exist.
      console.log(`Removing existing folder ${outputFolderPath}...`)
      await fs.rm(outputFolderPath, { recursive: true, force: true })
    } catch (err) {
      // The folder does not exist, nothing to remove.
    }
    // Create the folder as empty.
    await fs.mkdir(outputFolderPath, { recursive: true })
  }

  async generateSidebar (): Promise<void> {
    const sidebarItems: SidebarItem[] = []
    // This is the order of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection = this.workspace.viewModel.get(collectionName)
      if (collection !== undefined) {
        sidebarItems.push(...collection.createSidebarItems())
      }
    }

    // console.log('sidebarItems:', util.inspect(sidebarItems, { compact: false, depth: 999 }))
    const jsonString = JSON.stringify(sidebarItems, null, 2)

    const pluginOptions = this.workspace.pluginOptions
    const filePath = path.join(pluginOptions.outputFolderPath, pluginOptions.sidebarFileName)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(this.workspace.pluginOptions.outputFolderPath), { recursive: true })

    console.log(`Writing sidebar file ${filePath as string}...`)
    await fs.writeFile(filePath, jsonString, 'utf8')
  }

  async generateMenuDropdown (): Promise<void> {
    const pluginOptions = this.workspace.pluginOptions
    if (pluginOptions.menuDropdownFileName?.trim().length === 0) {
      return
    }

    const menuDropdown: MenuDropdown = {
      type: 'dropdown',
      label: 'API',
      to: `/${this.workspace.pluginOptions.outputFolderPath}/`,
      position: 'left',
      items: []
    }

    // This is the order of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection = this.workspace.viewModel.get(collectionName)
      if (collection !== undefined) {
        menuDropdown.items.push(...collection.createMenuItems())
      }
    }

    // console.log('sidebarItems:', util.inspect(sidebarItems, { compact: false, depth: 999 }))
    const jsonString = JSON.stringify(menuDropdown, null, 2)

    assert(pluginOptions.menuDropdownFileName)
    const filePath = path.join(pluginOptions.outputFolderPath, pluginOptions.menuDropdownFileName)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(this.workspace.pluginOptions.outputFolderPath), { recursive: true })

    console.log(`Writing menu dropdown file ${filePath as string}...`)
    await fs.writeFile(filePath, jsonString, 'utf8')
  }

  // --------------------------------------------------------------------------

  async generateIndexDotMdxFiles (): Promise<void> {
    for (const [collectionName, collection] of this.workspace.viewModel) {
      // console.log(collectionName)
      await collection.generateIndexDotMdxFile()
    }
    // TODO: parallelize
  }

  // --------------------------------------------------------------------------

  async generatePages (): Promise<void> {
    console.log('Generating Docusaurus pages (object -> url)...')

    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath

    for (const [compoundId, compound] of this.workspace.compoundsById) {
      const compoundDef = compound.compoundDef
      if (compound instanceof Page && compoundDef.id === 'indexpage') {
        // This is the @mainpage. We diverge from Doxygen and generate
        // the API main page differently, with the list of topics and
        // this page detailed description. Therefore it is not generated
        // as a regular page and must be skipped at this stage.
        continue
      }

      this.workspace.currentCompoundDef = compoundDef

      const permalink: string = compound.relativePermalink as string
      assert(permalink !== undefined)

      console.log(`${compoundDef.kind as string}: ${compoundDef.compoundName.replaceAll(/[ ]*/g, '') as string}`, '->', `${outputFolderPath}/${permalink}...`)

      const docusaurusId: string = compound.docusaurusId
      assert(docusaurusId !== undefined)

      const fileName = `${docusaurusId}.mdx`
      // console.log('fileName:', fileName)
      const filePath = `${outputFolderPath}/${fileName}`

      const frontMatter: FrontMatter = {
        // title: `${dataObject.pageTitle ?? compoundDef.compoundName}`,
        slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'reference', `${compoundDef.kind as string}`]
      }

      const bodyLines = compound.renderToMdxLines(frontMatter)

      await this.workspace.writeFile({
        filePath,
        frontMatter,
        bodyLines,
        title: compound.pageTitle
      })

      this.workspace.currentCompoundDef = undefined
    }
  }

  async generateRedirects (): Promise<void> {
    const redirectsOutputFolderPath = this.workspace.pluginOptions.redirectsOutputFolderPath
    if (redirectsOutputFolderPath === undefined) {
      return
    }

    console.log(`Removing existing folder static/${redirectsOutputFolderPath}...`)
    await fs.rm(`static/${redirectsOutputFolderPath}`, { recursive: true, force: true })

    const baseUrl: string = this.workspace.siteConfig.baseUrl

    console.log('Writing redirect files...')
    const compoundIds: string[] = Array.from(this.workspace.compoundsById.keys()).sort()
    for (const compoundId of compoundIds) {
      const compound = this.workspace.compoundsById.get(compoundId)
      assert(compound !== undefined)

      const filePath = `static/${redirectsOutputFolderPath}/${compoundId}.html`
      // TODO: What if not below `docs`?
      const permalink = `${baseUrl}${this.workspace.pluginOptions.outputFolderPath}/${compound.relativePermalink}/`

      await this.generateRedirectFile({
        filePath,
        permalink
      })

      if (compound.compoundDef.kind === 'file') {
        const filePath = `static/${redirectsOutputFolderPath}/${compoundId}_source.html`
        await this.generateRedirectFile({
          filePath,
          permalink
        })
      } else if (compound.compoundDef.kind === 'class' || compound.compoundDef.kind === 'struct') {
        const filePath = `static/${redirectsOutputFolderPath}/${compoundId}-members.html`
        await this.generateRedirectFile({
          filePath,
          permalink
        })
      }
    }

    const indexFilesMap: Map<string, string> = new Map()
    indexFilesMap.set('classes.html', 'classes')
    indexFilesMap.set('files.html', 'files')
    indexFilesMap.set('index.html', '')
    indexFilesMap.set('namespaces.html', 'namespaces')
    indexFilesMap.set('pages.html', 'pages')
    indexFilesMap.set('topics.html', 'groups')

    // Not redirectd:
    // annotated
    // doxygen_crawl
    // functions, _[a-z~], _func, _type, _vars
    // hierarchy
    // namespacemembers, _enum, _func, type, _vars

    for (const [from, to] of indexFilesMap) {
      const baseUrl: string = this.workspace.siteConfig.baseUrl

      const filePath = `static/${redirectsOutputFolderPath}/${from}`
      const permalink = `${baseUrl}${this.workspace.pluginOptions.outputFolderPath}/${to}/`

      await this.generateRedirectFile({
        filePath,
        permalink
      })
    }
  }

  // If `trailingSlash` is true, Docusaurus redirects do not generate .html files,
  // therefore we have to do it manually.
  async generateRedirectFile ({
    filePath,
    permalink
  }: {
    filePath: string
    permalink: string
  }): Promise<void> {
    // console.log(filePath)

    const lines: string[] = []

    lines.push('<!DOCTYPE html>')
    lines.push('<html>')
    lines.push('  <head>')
    lines.push('    <meta charset="UTF-8">')
    lines.push(`    <meta http-equiv="refresh" content="0; url=${permalink}">`)
    lines.push(`    <link rel="canonical" href="${permalink}" />`)
    lines.push('  </head>')
    lines.push('  <script>')
    lines.push(`    window.location.href = '${permalink}' + window.location.search + window.location.hash;`)
    lines.push('  </script>')
    lines.push('</html>')
    lines.push('')

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(lines.join('\n'))

    await fileHandle.close()
  }
}

// ----------------------------------------------------------------------------
