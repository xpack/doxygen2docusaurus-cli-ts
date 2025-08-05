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

// import * as util from 'node:util'
import assert from 'node:assert'
import path from 'node:path'
import * as fs from 'node:fs/promises'

import { Workspace } from './workspace.js'
import { CliOptions, maxParallelPromises } from './cli-options.js'
import type { MenuDropdown, SidebarCategory, FrontMatter } from './types.js'
import { folderExists } from './utils.js'
import { Page } from './view-model/pages-vm.js'
import type { Pages } from './view-model/pages-vm.js'
import type { Groups } from './view-model/groups-vm.js'
import type { CompoundBase } from './view-model/compound-base-vm.js'
// import type { File } from '../view-model/files-and-folders-vm.js'

// ----------------------------------------------------------------------------

export class DocusaurusGenerator {
  workspace: Workspace

  options: CliOptions

  // --------------------------------------------------------------------------

  constructor(workspace: Workspace) {
    this.workspace = workspace

    this.options = workspace.options
  }

  // --------------------------------------------------------------------------

  async run(): Promise<number> {
    console.log()

    await this.prepareOutputFolder()
    // No longer used with CommonMarkdown output.
    // await this.generateConfigurationFile()

    console.log()
    if (this.options.verbose) {
      console.log('Writing Docusaurus .md pages (object -> url)...')
    } else {
      console.log('Writing Docusaurus .md pages...')
    }
    await this.generatePages()

    if (this.options.verbose) {
      console.log()
    }
    await this.generateTopIndexDotMdFile()
    await this.generateCollectionsIndexDotMdFiles()
    await this.generatePerInitialsIndexMdFiles()
    console.log(this.workspace.writtenMdFilesCounter, '.md files written')

    console.log()
    await this.generateSidebarFile()
    await this.generateMenuFile()

    // await this.generateManualRedirectFiles()
    await this.generateCompatibilityRedirectFiles()

    await this.copyFiles()
    await this.copyImageFiles()

    return 0
  }

  // --------------------------------------------------------------------------

  // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  async prepareOutputFolder(): Promise<void> {
    const { outputFolderPath } = this.workspace
    try {
      await fs.access(outputFolderPath)
      // Remove the folder if it exist.
      console.log(`Removing existing folder ${outputFolderPath}...`)
      await fs.rm(outputFolderPath, { recursive: true, force: true })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // The folder does not exist, nothing to remove.
    }
    // Create the folder as empty.
    await fs.mkdir(outputFolderPath, { recursive: true })
  }

  // --------------------------------------------------------------------------

  async generateSidebarFile(): Promise<void> {
    const sidebarCategory: SidebarCategory = {
      type: 'category',
      label: this.options.sidebarCategoryLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}index`,
      },
      collapsed: false,
      items: [],
    }

    const pages = this.workspace.viewModel.collections.get('pages') as Pages
    pages.createTopPagesSidebarItems(sidebarCategory)

    // The order in sidebarCollectionNames also gives the the order
    // of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection =
        this.workspace.viewModel.collections.get(collectionName)
      if (collection?.isVisibleInSidebar() === true) {
        collection.addSidebarItems(sidebarCategory)
      }
    }

    // console.log(
    //   'sidebar:', util.inspect(sidebar, { compact: false, depth: 999 })
    // )
    const jsonString = JSON.stringify(sidebarCategory, null, 2)

    const { sidebarCategoryFilePath } = this.options
    const relativeFilePath = sidebarCategoryFilePath
    const absoluteFilePath = path.resolve(relativeFilePath)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true })

    console.log(`Writing sidebar file ${relativeFilePath}...`)
    await fs.writeFile(absoluteFilePath, jsonString, 'utf8')
  }

  // --------------------------------------------------------------------------

  async generateMenuFile(): Promise<void> {
    const {
      navbarDropdownFilePath: menuDropdownFilePath,
      navbarDropdownLabel: label,
    } = this.options
    if (menuDropdownFilePath.trim().length === 0) {
      return
    }

    let navbarEntry: MenuDropdown = {
      type: 'dropdown',
      label,
      to: this.workspace.menuBaseUrl,
      position: 'left',
      items: [],
    }

    let hasItems = false
    // This is the order of items in the sidebar.
    for (const collectionName of this.workspace.sidebarCollectionNames) {
      // console.log(collectionName)
      const collection =
        this.workspace.viewModel.collections.get(collectionName)
      if (collection?.isVisibleInSidebar() === true) {
        assert(navbarEntry.items !== undefined)
        const items = collection.createMenuItems()
        if (items.length > 0) {
          navbarEntry.items.push(...collection.createMenuItems())
          hasItems = true
        }
      }
    }

    if (!hasItems) {
      navbarEntry = {
        label,
        to: this.workspace.menuBaseUrl,
        position: 'left',
      }
    }

    // console.log(
    //   'sidebarItems:',
    //   util.inspect(sidebarItems, { compact: false, depth: 999 })
    // )
    const jsonString = JSON.stringify(navbarEntry, null, 2)

    assert(menuDropdownFilePath.trim().length > 0)
    const relativeFilePath = menuDropdownFilePath
    const absoluteFilePath = path.resolve(relativeFilePath)

    // Superfluous if done after prepareOutputFolder()
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true })

    console.log(`Writing menu file ${relativeFilePath}...`)
    await fs.writeFile(absoluteFilePath, jsonString, 'utf8')
  }

  // --------------------------------------------------------------------------

  async generateCollectionsIndexDotMdFiles(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.workspace.viewModel
      .collections) {
      // console.log(collectionName)
      await collection.generateIndexDotMdFile()
    }
    // TODO: parallelize
  }

  // --------------------------------------------------------------------------

  async generateTopIndexDotMdFile(): Promise<void> {
    const { outputFolderPath } = this.workspace
    const filePath = `${outputFolderPath}index.md`

    const projectBrief =
      this.workspace.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
    const title =
      this.options.mainPageTitle.length > 0
        ? this.options.mainPageTitle
        : `${projectBrief} API Reference`
    const permalink = '' // The root of the API sub-site.

    // This is the top index.md file (@mainpage)
    const frontMatter: FrontMatter = {
      title,
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'reference'],
    }

    const lines: string[] = []

    const groups = this.workspace.viewModel.collections.get('groups') as Groups

    const topicsLines = groups.generateTopicsTable()
    lines.push(...topicsLines)

    const { mainPage } = this.workspace

    if (mainPage !== undefined) {
      if (topicsLines.length > 0) {
        lines.push('')
        lines.push('## Description')
      }

      const { detailedDescriptionHtmlLines, briefDescriptionHtmlString } =
        mainPage

      if (
        detailedDescriptionHtmlLines !== undefined &&
        detailedDescriptionHtmlLines.length > 0
      ) {
        lines.push('')
        lines.push(
          ...mainPage.renderDetailedDescriptionToHtmlLines({
            briefDescriptionHtmlString,
            detailedDescriptionHtmlLines,
            showHeader: false,
            showBrief: false,
          })
        )
      }
    }

    if (this.options.originalPagesNote.length > 0) {
      lines.push('')
      lines.push(':::note')
      lines.push(this.options.originalPagesNote)
      lines.push(':::')
    }

    if (this.options.verbose) {
      console.log(`Writing top index file ${filePath}...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })
  }

  // --------------------------------------------------------------------------

  async generatePerInitialsIndexMdFiles(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.workspace.viewModel
      .collections) {
      // console.log(collectionName)
      await collection.generatePerInitialsIndexMdFiles()
    }
    // TODO: parallelize
  }

  // --------------------------------------------------------------------------

  async generatePages(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const [, compound] of this.workspace.viewModel.compoundsById) {
      if (compound instanceof Page) {
        if (compound.id === 'indexpage') {
          // This is the @mainpage. We diverge from Doxygen and generate
          // the API main page differently, with the list of topics and
          // this page detailed description. Therefore it is not generated
          // as a regular page and must be skipped at this stage.
          continue
        }
      }

      const permalink: string | undefined = compound.relativePermalink
      const { sidebarId } = compound
      if (permalink === undefined || sidebarId === undefined) {
        if (this.options.verbose) {
          console.warn('Skip', compound.id, 'no permalink')
        }
        continue
      }
      // assert(permalink !== undefined)

      if (this.options.verbose) {
        console.log(
          `${compound.kind}: ${compound.compoundName.replaceAll(/[ ]*/g, '')}`,
          '->',
          `${this.workspace.absoluteBaseUrl}${permalink}...`
        )
      }

      if (this.options.debug) {
        await this.generatePage(compound)
      } else {
        if (promises.length > maxParallelPromises) {
          await Promise.all(promises)
          promises.length = 0
        }
        promises.push(this.generatePage(compound))
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises)
    }
  }

  async generatePage(compound: CompoundBase): Promise<void> {
    const { sidebarId } = compound
    assert(sidebarId !== undefined)
    const fileName = `${sidebarId}.md`
    // console.log('fileName:', fileName)
    const filePath = `${this.workspace.outputFolderPath}${fileName}`
    const permalink: string | undefined = compound.relativePermalink
    assert(permalink !== undefined)
    const slug = `${this.workspace.slugBaseUrl}${permalink}`

    const frontMatter: FrontMatter = {
      // title: `${dataObject.pageTitle ?? compound.compoundName}`,
      slug,
      // description: '...', // TODO
      custom_edit_url: null,
      toc_max_heading_level: 4,
      keywords: ['doxygen', 'reference', compound.kind],
    }

    const bodyLines = compound.renderToLines(frontMatter)
    assert(compound.relativePermalink !== undefined)
    const pagePermalink =
      this.workspace.pageBaseUrl + compound.relativePermalink

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines,
      title: compound.pageTitle,
      pagePermalink,
    })
  }
  // --------------------------------------------------------------------------

  async generateCompatibilityRedirectFiles(): Promise<void> {
    const redirectsOutputFolderPath =
      this.options.compatibilityRedirectsOutputFolderPath
    if (redirectsOutputFolderPath === undefined) {
      return
    }

    console.log(
      `Removing existing folder static/${redirectsOutputFolderPath}...`
    )
    await fs.rm(`static/${redirectsOutputFolderPath}`, {
      recursive: true,
      force: true,
    })

    console.log('Writing redirect files...')
    const compoundIds: string[] = Array.from(
      this.workspace.viewModel.compoundsById.keys()
    ).sort()
    for (const compoundId of compoundIds) {
      const compound = this.workspace.viewModel.compoundsById.get(compoundId)
      assert(compound !== undefined)

      const filePathBase = `static/${redirectsOutputFolderPath}/${compoundId}`
      const filePath = `${filePathBase}.html`

      if (compound.relativePermalink === undefined) {
        continue
      }

      const { absoluteBaseUrl } = this.workspace
      const permalink = `${absoluteBaseUrl}${compound.relativePermalink}/`

      await this.generateRedirectFile({
        filePath,
        permalink,
      })

      if (compound.kind === 'file') {
        const filePath = `${filePathBase}_source.html`
        await this.generateRedirectFile({
          filePath,
          permalink,
        })
      } else if (compound.kind === 'class' || compound.kind === 'struct') {
        const filePath = `${filePathBase}-members.html`
        await this.generateRedirectFile({
          filePath,
          permalink,
        })
      }
    }

    const indexFilesMap = new Map<string, string>()
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
      const filePath = path.join('static', redirectsOutputFolderPath, from)
      const permalink = `${this.workspace.absoluteBaseUrl}${to}/`

      await this.generateRedirectFile({
        filePath,
        permalink,
      })
    }

    if (this.options.verbose) {
      console.log(this.workspace.writtenHtmlFilesCounter, 'html files written')
    }
  }

  // async generateManualRedirectFiles(): Promise<void> {
  //   if (this.workspace.pluginOptions.redirects === undefined) {
  //     return
  //   }

  //   const redirectsOutputFolderPath = path.join('static')

  //   for (const entry of this.workspace.pluginOptions.redirects) {
  //     const fromArray = Array.isArray(entry.from) ? entry.from : [entry.from]
  //     for (const from of fromArray) {
  //       const filePath = path.join(redirectsOutputFolderPath, from)
  //       const permalink = `${this.workspace.siteConfig.baseUrl}${entry.to}/`

  //       await this.generateRedirectFile({
  //         filePath,
  //         permalink
  //       })
  //     }
  //   }
  // }

  // --------------------------------------------------------------------------

  // If `trailingSlash` is true, Docusaurus redirects do not generate
  // .html files, therefore we have to do it manually.
  private async generateRedirectFile({
    filePath,
    permalink,
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
    lines.push(
      `    window.location.href = '${permalink}'` +
        ' + window.location.search + window.location.hash;'
    )
    lines.push('  </script>')
    lines.push('</html>')
    lines.push('')

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'w')

    await fileHandle.write(lines.join('\n'))

    await fileHandle.close()

    this.workspace.writtenHtmlFilesCounter += 1
  }

  // --------------------------------------------------------------------------

  async copyFiles(): Promise<void> {
    const destImgFolderPath = path.join('static', 'img', 'doxygen2docusaurus')
    await fs.mkdir(destImgFolderPath, { recursive: true })

    let fromFilePath = path.join(
      this.workspace.projectPath,
      'template',
      'img',
      'document-svgrepo-com.svg'
    )
    let toFilePath = path.join(destImgFolderPath, 'document-svgrepo-com.svg')
    console.log('Copying image file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)

    fromFilePath = path.join(
      this.workspace.projectPath,
      'template',
      'img',
      'folder-svgrepo-com.svg'
    )
    toFilePath = path.join(destImgFolderPath, 'folder-svgrepo-com.svg')
    console.log('Copying image file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)

    fromFilePath = path.join(
      this.workspace.projectPath,
      'template',
      'css',
      'custom.css'
    )

    toFilePath = this.options.customCssFilePath
    if (!(await folderExists(path.dirname(toFilePath)))) {
      await fs.mkdir(path.dirname(toFilePath), { recursive: true })
    }
    console.log('Copying css file', toFilePath)
    await fs.copyFile(fromFilePath, toFilePath)
  }

  // --------------------------------------------------------------------------

  async copyImageFiles(): Promise<void> {
    if (this.workspace.dataModel.xml.images.length > 0) {
      return
    }

    if (!this.options.verbose) {
      if (this.workspace.dataModel.xml.images.length > 0) {
        console.log(
          'Copying',
          this.workspace.dataModel.xml.images.length,
          'image files...'
        )
      }
    }

    const destImgFolderPath = path.join(
      'static',
      ...this.options.imagesFolderPath.split('/')
    )
    await fs.mkdir(destImgFolderPath, { recursive: true })

    const images = new Set<string>()
    for (const image of this.workspace.dataModel.xml.images) {
      if (image.name !== undefined && image.name.length > 0) {
        images.add(image.name)
      }
    }

    const uniqueNames = Array.from(images).sort()

    let fromFilePath = ''
    let toFilePath = ''

    for (const name of uniqueNames) {
      fromFilePath = path.join(this.options.doxygenXmlInputFolderPath, name)
      toFilePath = path.join(destImgFolderPath, name)
      if (this.options.verbose) {
        console.log('Copying image file', toFilePath)
      }
      await fs.copyFile(fromFilePath, toFilePath)
    }
  }
}

// ----------------------------------------------------------------------------
