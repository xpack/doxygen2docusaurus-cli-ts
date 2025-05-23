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
import { MenuDropdown, SidebarCategory } from '../plugin/types.js'
import { Page } from './view-model/pages-vm.js'
import { FrontMatter } from './types.js'

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
    this.workspace = new Workspace({
      dataModel,
      pluginOptions,
      siteConfig
    })
  }

  // --------------------------------------------------------------------------

  async generate (): Promise<void> {
    console.log()

    await this.prepareOutputFolder()
    await this.generateSidebarFile()
    await this.generateMenuDropdownFile()
    console.log()
    await this.generatePages()
    console.log()
    await this.generateIndexDotMdxFiles()
    await this.generateRedirectFiles()
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

  // --------------------------------------------------------------------------

  async generateSidebarFile (): Promise<void> {
    const outputBaseUrl = this.workspace.pluginOptions.outputBaseUrl.replace(/^[/]/, '').replace(/[/]$/, '')
    const sidebarCategory: SidebarCategory = {
      type: 'category',
      label: this.workspace.pluginOptions.sidebarCategoryLabel,
      link: {
        type: 'doc',
        id: `${outputBaseUrl}/index`
      },
      collapsed: false,
      items: []
    }

    // This is the order of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection = this.workspace.viewModel.get(collectionName)
      if (collection?.hasCompounds()) {
        sidebarCategory.items.push(...collection.createSidebarItems())
      }
    }

    // console.log('sidebar:', util.inspect(sidebar, { compact: false, depth: 999 }))
    const jsonString = JSON.stringify(sidebarCategory, null, 2)

    const pluginOptions = this.workspace.pluginOptions
    const relativeFilePath = pluginOptions.sidebarCategoryFilePath
    const absoluteFilePath = path.resolve(relativeFilePath)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true })

    console.log(`Writing sidebar file ${relativeFilePath}...`)
    await fs.writeFile(absoluteFilePath, jsonString, 'utf8')
  }

  // --------------------------------------------------------------------------

  async generateMenuDropdownFile (): Promise<void> {
    const pluginOptions = this.workspace.pluginOptions
    if (pluginOptions.menuDropdownFilePath?.trim().length === 0) {
      return
    }

    const menuDropdown: MenuDropdown = {
      type: 'dropdown',
      label: pluginOptions.menuDropdownLabel,
      to: `/${this.workspace.pluginOptions.outputFolderPath}/`,
      position: 'left',
      items: []
    }

    // This is the order of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection = this.workspace.viewModel.get(collectionName)
      if (collection?.hasCompounds()) {
        menuDropdown.items.push(...collection.createMenuItems())
      }
    }

    // console.log('sidebarItems:', util.inspect(sidebarItems, { compact: false, depth: 999 }))
    const jsonString = JSON.stringify(menuDropdown, null, 2)

    assert(pluginOptions.menuDropdownFilePath)
    const relativeFilePath = pluginOptions.menuDropdownFilePath
    const absoluteFilePath = path.resolve(relativeFilePath)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true })

    console.log(`Writing menu dropdown file ${relativeFilePath}...`)
    await fs.writeFile(absoluteFilePath, jsonString, 'utf8')
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
      if (compound instanceof Page && compound.id === 'indexpage') {
        // This is the @mainpage. We diverge from Doxygen and generate
        // the API main page differently, with the list of topics and
        // this page detailed description. Therefore it is not generated
        // as a regular page and must be skipped at this stage.
        continue
      }

      this.workspace.currentCompound = compound

      const permalink: string = compound.relativePermalink as string
      assert(permalink !== undefined)

      console.log(`${compound.kind as string}: ${compound.compoundName.replaceAll(/[ ]*/g, '') as string}`, '->', `${outputFolderPath}/${permalink}...`)

      const docusaurusId: string = compound.docusaurusId
      assert(docusaurusId !== undefined)

      const fileName = `${docusaurusId}.mdx`
      // console.log('fileName:', fileName)
      const filePath = `${outputFolderPath}/${fileName}`
      const slug = `/${this.workspace.permalinkBaseUrl}${permalink}`

      const frontMatter: FrontMatter = {
        // title: `${dataObject.pageTitle ?? compound.compoundName}`,
        slug,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'reference', `${compound.kind as string}`]
      }

      const bodyLines = compound.renderToMdxLines(frontMatter)

      await this.workspace.writeFile({
        filePath,
        frontMatter,
        bodyLines,
        title: compound.pageTitle
      })

      this.workspace.currentCompound = undefined
    }
  }

  // --------------------------------------------------------------------------

  async generateRedirectFiles (): Promise<void> {
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

      if (compound.kind === 'file') {
        const filePath = `static/${redirectsOutputFolderPath}/${compoundId}_source.html`
        await this.generateRedirectFile({
          filePath,
          permalink
        })
      } else if (compound.kind === 'class' || compound.kind === 'struct') {
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
  private async generateRedirectFile ({
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
