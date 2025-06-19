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
import { FrontMatter } from './types.js'
import { folderExists } from './utils.js'

export class DocusaurusGenerator {
  workspace: Workspace

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
    this.workspace = new Workspace({
      dataModel,
      pluginOptions,
      siteConfig,
      pluginActions
    })
  }

  // --------------------------------------------------------------------------

  async generate (): Promise<void> {
    console.log()

    await this.prepareOutputFolder()
    // No longer used with CommonMarkdown output.
    // await this.generateConfigurationFile()

    await this.generateSidebarFile()
    await this.generateMenuDropdownFile()

    console.log()
    await this.generatePages()

    console.log()
    await this.generateIndexDotMdxFiles()
    await this.generatePerInitialsIndexMdxFiles()

    if (this.workspace.pluginOptions.verbose) {
      console.log(this.workspace.writtenMdxFilesCounter, 'mdx files written')
    }

    await this.generateRedirectFiles()

    await this.copyFiles()
  }

  // --------------------------------------------------------------------------

  // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  async prepareOutputFolder (): Promise<void> {
    const outputFolderPath = this.workspace.outputFolderPath
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

  async generateConfigurationFile (): Promise<void> {
    const jsonFileName = 'docusaurus-plugin-doxygen-config.json'
    const jsonFilePath = `${jsonFileName}`

    const configurationData = {
      doxygenVersion: this.workspace.dataModel.doxygenindex?.version
    }

    const jsonString = JSON.stringify(configurationData, null, 2)

    console.log(`Writing configuration file ${jsonFilePath}...`)

    await fs.mkdir(path.dirname(jsonFilePath), { recursive: true })
    await fs.writeFile(jsonFilePath, jsonString, 'utf8')
  }

  // --------------------------------------------------------------------------

  async generateSidebarFile (): Promise<void> {
    const sidebarCategory: SidebarCategory = {
      type: 'category',
      label: this.workspace.pluginOptions.sidebarCategoryLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}index`
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
      to: `${this.workspace.menuBaseUrl}`,
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

  async generatePerInitialsIndexMdxFiles (): Promise<void> {
    for (const [collectionName, collection] of this.workspace.viewModel) {
      // console.log(collectionName)
      await collection.generatePerInitialsIndexMdxFiles()
    }
    // TODO: parallelize
  }

  // --------------------------------------------------------------------------

  async generatePages (): Promise<void> {
    if (this.workspace.pluginOptions.verbose) {
      console.log('Writing Docusaurus .md pages (object -> url)...')
    } else {
      console.log('Writing Docusaurus .md pages...')
    }

    for (const [compoundId, compound] of this.workspace.compoundsById) {
      // if (compound instanceof Page && compound.id === 'indexpage') {
      //   // This is the @mainpage. We diverge from Doxygen and generate
      //   // the API main page differently, with the list of topics and
      //   // this page detailed description. Therefore it is not generated
      //   // as a regular page and must be skipped at this stage.
      //   continue
      // }

      this.workspace.currentCompound = compound

      const permalink: string = compound.relativePermalink as string
      const docusaurusId = compound.docusaurusId
      if (permalink === undefined || docusaurusId === undefined) {
        if (this.workspace.pluginOptions.verbose) {
          console.warn('Skip', compound.id, 'no permalink')
        }
        continue
      }
      // assert(permalink !== undefined)

      if (this.workspace.pluginOptions.verbose) {
        console.log(`${compound.kind as string}: ${compound.compoundName.replaceAll(/[ ]*/g, '') as string}`, '->', `${this.workspace.absoluteBaseUrl}${permalink}...`)
      }

      const fileName = `${docusaurusId}.md`
      // console.log('fileName:', fileName)
      const filePath = `${this.workspace.outputFolderPath}${fileName}`
      const slug = `${this.workspace.slugBaseUrl}${permalink}`

      const frontMatter: FrontMatter = {
        // title: `${dataObject.pageTitle ?? compound.compoundName}`,
        slug,
        // description: '...', // TODO
        custom_edit_url: null,
        keywords: ['doxygen', 'reference', `${compound.kind as string}`]
      }

      const bodyLines = compound.renderToLines(frontMatter)
      const pagePermalink = `${this.workspace.pageBaseUrl}${compound.relativePermalink}`

      await this.workspace.writeMdxFile({
        filePath,
        frontMatter,
        bodyLines,
        title: compound.pageTitle,
        pagePermalink
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

    console.log('Writing redirect files...')
    const compoundIds: string[] = Array.from(this.workspace.compoundsById.keys()).sort()
    for (const compoundId of compoundIds) {
      const compound = this.workspace.compoundsById.get(compoundId)
      assert(compound !== undefined)

      const filePath = `static/${redirectsOutputFolderPath}/${compoundId}.html`

      if (compound.relativePermalink === undefined) {
        continue
      }

      const permalink = `${this.workspace.absoluteBaseUrl}${compound.relativePermalink}/`

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
      const filePath = `static/${redirectsOutputFolderPath}/${from as string}`
      const permalink = `${this.workspace.absoluteBaseUrl}${to as string}/`

      await this.generateRedirectFile({
        filePath,
        permalink
      })
    }

    if (this.workspace.pluginOptions.verbose) {
      console.log(this.workspace.writtenHtmlFilesCounter, 'html files written')
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

    this.workspace.writtenHtmlFilesCounter += 1
  }

  async copyFiles (): Promise<void> {
    const destImgFolderPath = path.join('static', 'img', 'docusaurus-plugin-doxygen')
    await fs.mkdir(destImgFolderPath, { recursive: true })

    let fromFilePath = path.join(this.workspace.projectPath, 'template', 'img', 'document-svgrepo-com.svg')
    let toFilePath = path.join(destImgFolderPath, 'document-svgrepo-com.svg')
    console.log('Writing image file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)

    fromFilePath = path.join(this.workspace.projectPath, 'template', 'img', 'folder-svgrepo-com.svg')
    toFilePath = path.join(destImgFolderPath, 'folder-svgrepo-com.svg')
    console.log('Writing image file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)

    fromFilePath = path.join(this.workspace.projectPath, 'template', 'css', 'custom.css')
    toFilePath = this.workspace.pluginOptions.customCssFilePath
    if (!await folderExists(path.dirname(toFilePath))) {
      await fs.mkdir(path.dirname(toFilePath), { recursive: true })
    }
    console.log('Writing css file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)
  }
}

// ----------------------------------------------------------------------------
