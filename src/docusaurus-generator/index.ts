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

import * as fs from 'fs/promises'
import assert from 'assert'
import path from 'path'
import util from 'node:util'

import { CompoundDefType } from '../doxygen-xml-parser/compounddef.js'
import { DoxygenData } from '../doxygen-xml-parser/index.js'
import { PluginOptions } from '../plugin/options.js'
import { Folders } from './data-model/folders.js'
import { Files } from './data-model/files.js'
import { DoxygenFileOptions } from './data-model/options.js'
import { Groups } from './data-model/groups.js'
import { Sidebar } from './create-sidebar.js'
import { SidebarItem } from '../plugin/types.js'
import { Namespaces } from './data-model/namespace.js'
import { Classes } from './data-model/classes.js'

// ----------------------------------------------------------------------------

// https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
interface FrontMatter {
  keywords: string[]
  [key: string]: string | string[] | null | boolean
}

export class DocusaurusGenerator {
  // The data parsed from the Doxygen XML files.
  doxygenData: DoxygenData
  // From the project docusaurus.config.ts or defaults.
  pluginOptions: PluginOptions

  doxygenOptions: DoxygenFileOptions
  // A map of compound definitions, indexed by their id.
  compoundDefsById: Map<string, CompoundDefType> = new Map()
  // Permalinks are relative to the Docusaurus baseUrl folder.
  permalinksById: Map<string, string> = new Map()
  docusaurusIdsById: Map<string, string> = new Map()

  groups: Groups
  namespaces: Namespaces
  folders: Folders
  files: Files
  classes: Classes

  // kind: DoxCompoundKind
  permalinkPrefixesByKind: { [key: string]: string } = {
    class: 'classes',
    struct: 'structs',
    union: 'unions',
    interface: 'interfaces',
    protocol: 'protocols',
    category: 'categories',
    exception: 'exceptions',
    service: 'services',
    singleton: 'singletons',
    module: 'modules',
    type: 'types',
    file: 'files',
    namespace: 'namespaces',
    group: 'groups',
    page: 'pages',
    example: 'examples',
    dir: 'folders',
    concept: 'concepts'
  }

  // --------------------------------------------------------------------------

  constructor ({
    doxygenData,
    pluginOptions
  }: {
    doxygenData: DoxygenData
    pluginOptions: PluginOptions
  }) {
    // console.log('DocusaurusGenerator.constructor()')
    this.doxygenData = doxygenData
    this.pluginOptions = pluginOptions

    this.groups = new Groups(this.doxygenData.compoundDefs)
    this.namespaces = new Namespaces(this.doxygenData.compoundDefs)
    this.folders = new Folders(this.doxygenData.compoundDefs)
    this.files = new Files(this.doxygenData.compoundDefs, this.folders)
    this.classes = new Classes(this.doxygenData.compoundDefs)

    this.doxygenOptions = new DoxygenFileOptions(this.doxygenData.doxyfile.options)
  }

  async generate (): Promise<void> {
    this.createCompoundDefsMap()

    this.createPermalinksMap()

    await this.writeSidebar()

    await this.prepareOutputFolder()
    await this.generatePages()
  }

  // --------------------------------------------------------------------------

  createCompoundDefsMap (): void {
    // console.log('DocusaurusGenerator.createCompoundDefsMap()')

    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.id)
      this.compoundDefsById.set(compoundDef.id, compoundDef)
    }
  }

  createPermalinksMap (): void {
    // console.log('DocusaurusGenerator.createPermalinksMap()')

    assert(this.pluginOptions.outputFolderPath)
    // const outputFolderPath = this.options.outputFolderPath

    for (const compoundDef of this.doxygenData.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName)

      const kind = compoundDef.kind
      const prefix = this.permalinkPrefixesByKind[kind]
      assert(prefix !== undefined)

      const id = compoundDef.id

      let name: string = ''
      if (kind === 'dir') {
        name = this.folders.getPathRecursive(id)
      } else if (kind === 'file') {
        const file = this.files.membersById.get(id)
        assert(file !== undefined)
        if (file.parentFolderId.length > 0) {
          name = this.folders.getPathRecursive(file.parentFolderId) + '/'
        }
        name += compoundDef.compoundName
      } else if (kind === 'class' || kind === 'namespace') {
        name = compoundDef.compoundName.replaceAll('::', '/')
      } else {
        name = compoundDef.compoundName
      }
      name = name.replaceAll(/[^a-zA-Z0-9/-]/g, '-')
      // const permalink = `/${outputFolderPath}/${prefix}/${name}`
      const permalink = `/${prefix}/${name}`
      // console.log('permalink:', permalink)

      this.permalinksById.set(compoundDef.id, permalink)

      const docusaurusId = `/${prefix}/${name.replaceAll('/', '-') as string}`
      this.docusaurusIdsById.set(compoundDef.id, docusaurusId)
    }
  }

  async writeSidebar (): Promise<void> {
    const sidebar = new Sidebar(this)

    const sidebarItems: SidebarItem[] = sidebar.createItems()
    console.log('sidebarItems:', util.inspect(sidebarItems, { compact: false, depth: 10 }))
  }

  // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
  async prepareOutputFolder (): Promise<void> {
    assert(this.pluginOptions.outputFolderPath)
    const outputFolderPath = this.pluginOptions.outputFolderPath
    try {
      await fs.access(outputFolderPath)
      // Remove the folder if it exist.
      console.log(`Removing existing folder ${outputFolderPath}...`)
      await fs.rm(outputFolderPath, { recursive: true, force: true })
    } catch (err) {
      // The folder does not exist, nothing to do.
    }
    // Create the folder as empty.
    await fs.mkdir(outputFolderPath, { recursive: true })
  }

  // https://nodejs.org/en/learn/manipulating-files/working-with-file-descriptors-in-nodejs
  async generatePages (): Promise<void> {
    // console.log('DocusaurusGenerator.generatePages()')
    console.log('Generating Docusaurus pages...')

    for (const compoundDef of this.doxygenData.compoundDefs) {
      const permalink = this.permalinksById.get(compoundDef.id)
      assert(permalink !== undefined)
      assert(this.pluginOptions.outputFolderPath)
      const outputFolderPath = this.pluginOptions.outputFolderPath
      console.log(compoundDef.compoundName, '->', `${outputFolderPath}${permalink}`)

      const docusaurusId = this.docusaurusIdsById.get(compoundDef.id)
      assert(docusaurusId !== undefined)

      const fileName = `${docusaurusId}.mdx`
      // console.log('fileName:', fileName)

      const filePath = `${outputFolderPath}${fileName}`

      const frontMatter: FrontMatter = {
        title: `${compoundDef.compoundName}`,
        slug: `${outputFolderPath.replace(/^docs/, '')}${permalink}`,
        description: '...',
        custom_edit_url: null,
        keywords: ['doxygen', 'reference', `${compoundDef.kind}`]
      }

      await this.writeFile({
        filePath,
        bodyText: `TODO ${compoundDef.compoundName}\n`,
        frontMatter
      })
    }

    {
      // Home page for the API reference. Usually the same content as the first top group.
      const projectBrief = this.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')
      const frontMatter: FrontMatter = {
        title: `${projectBrief} API Reference`,
        slug: '/api',
        description: '...',
        custom_edit_url: null,
        keywords: ['doxygen', 'reference']
      }

      await this.writeFile({
        filePath: 'docs/api/index.mdx',
        bodyText: 'TODO Reference\n',
        frontMatter
      })
    }

    {
      const frontMatter: FrontMatter = {
        title: 'Reference',
        slug: '/api/namespaces',
        description: '...',
        custom_edit_url: null,
        keywords: ['doxygen', 'namespaces']
      }

      await this.writeFile({
        filePath: 'docs/api/namespaces/index.mdx',
        bodyText: 'TODO Namespaces\n',
        frontMatter
      })
    }

    {
      const frontMatter: FrontMatter = {
        title: 'Reference',
        slug: '/api/classes',
        description: '...',
        custom_edit_url: null,
        keywords: ['doxygen', 'classes']
      }

      await this.writeFile({
        filePath: 'docs/api/classes/index.mdx',
        bodyText: 'TODO Classes\n',
        frontMatter
      })
    }

    {
      const frontMatter: FrontMatter = {
        title: 'Reference',
        slug: '/api/folders',
        description: '...',
        custom_edit_url: null,
        keywords: ['doxygen', 'folders']
      }

      await this.writeFile({
        filePath: 'docs/api/folders/index.mdx',
        bodyText: 'TODO Folders\n',
        frontMatter
      })
    }
  }

  async writeFile ({
    filePath,
    bodyText,
    frontMatter
  }: {
    filePath: string
    bodyText: string
    frontMatter: FrontMatter
  }): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    const fileHandle = await fs.open(filePath, 'ax')

    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    let frontMatterText = ''
    frontMatterText += '---\n'
    frontMatterText += '\n'
    frontMatterText += '# DO NOT EDIT!\n'
    frontMatterText += '# Automatically generated via docusaurus-plugin-doxygen by Doxygen.\n'
    frontMatterText += '\n'
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterText += `${key}:\n`
        for (const arrayValue of frontMatter[key] as string[]) {
          frontMatterText += `  - ${arrayValue}\n`
        }
      } else if (typeof value === 'boolean') {
        frontMatterText += `${key}: ${value ? 'true' : 'false'}\n`
      } else {
        frontMatterText += `${key}: ${value}\n`
      }
    }
    frontMatterText += '\n'
    frontMatterText += `date: ${this.formatDate(new Date())}\n`
    frontMatterText += '\n'
    frontMatterText += '---\n'
    frontMatterText += '\n'

    await fileHandle.write(frontMatterText)
    await fileHandle.write(bodyText)

    await fileHandle.close()
  }

  formatDate (date: Date): string {
    // Custom format: YYYY-MM-DD HH:mm:ss
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0000`
  }
}

// ----------------------------------------------------------------------------
