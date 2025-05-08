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
import { SidebarItem } from '../plugin/types.js'
import { CompoundBase } from './view-model/compound-base-vm.js'
import { Page } from './view-model/pages-vm.js'
import { FrontMatter } from '../docusaurus-generator/types.js'
import { stripPermalinkAnchor } from '../docusaurus-generator/utils.js'

export class DocusaurusGenerator2 {
  workspace: Workspace

  // --------------------------------------------------------------------------

  constructor ({
    dataModel,
    pluginOptions
  }: {
    dataModel: DataModel
    pluginOptions: PluginOptions
  }) {
    console.log('DocusaurusGenerator2.constructor()')
    this.workspace = new Workspace({ dataModel, pluginOptions })
  }

  // --------------------------------------------------------------------------

  async generate (): Promise<void> {
    // console.log('DocusaurusGenerator2.generate()')

    this.createHierarchies()
    this.createMemberDefsMap()
    this.validatePermalinks()

    await this.prepareOutputFolder()
    await this.generateSidebar()
    await this.generatePages()
    await this.generateIndexDotMdxFiles()
  }

  // --------------------------------------------------------------------------

  createHierarchies (): void {
    console.log('Creating objects hierarchies...')

    for (const [collectionName, collection] of this.workspace.viewModel) {
      // console.log('createHierarchies:', collectionName)
      collection.createHierarchies()
    }
  }

  // --------------------------------------------------------------------------

  createMemberDefsMap (): void {
    for (const compoundDef of this.workspace.dataModel.compoundDefs) {
      // console.log(compoundDef.kind, compoundDef.compoundName, compoundDef.id)
      if (compoundDef.sectionDefs !== undefined) {
        for (const sectionDef of compoundDef.sectionDefs) {
          if (sectionDef.memberDefs !== undefined) {
            // console.log('  ', sectionDef.kind)
            for (const memberDef of sectionDef.memberDefs) {
              const compoundId = stripPermalinkAnchor(memberDef.id)
              if (compoundId !== compoundDef.id) {
                // Skip member definitions from different compounds.
                // Hopefully they are defined properly there.
                // console.log('member from another compound', compoundId, 'skipped')
              } else {
                // console.log('    ', memberDef.kind, memberDef.id)
                if (this.workspace.memberDefsById.has(memberDef.id)) {
                  console.warn('member already in map', memberDef.id, 'in', this.workspace.memberDefsById.get(memberDef.id)?.name)
                } else {
                  this.workspace.memberDefsById.set(memberDef.id, memberDef)
                }
              }
            }
          }
        }
      }
    }
    console.log(this.workspace.memberDefsById.size, 'member definitions')
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
        slug: `/${this.workspace.permalinkBaseUrl}/${permalink}`,
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
}

// ----------------------------------------------------------------------------
