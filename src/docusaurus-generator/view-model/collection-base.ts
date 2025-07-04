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

import * as fs from 'node:fs/promises'
import assert from 'node:assert'

import { Workspace } from '../workspace.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { MenuItem, SidebarCategory } from '../../plugin/types.js'
import { CompoundBase } from './compound-base-vm.js'
import { IndexEntryBase } from './indices-vm.js'
import { FrontMatter } from '../types.js'

export abstract class CollectionBase {
  workspace: Workspace

  collectionCompoundsById: Map<string, CompoundBase>

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    this.workspace = workspace

    this.collectionCompoundsById = new Map()
  }

  // --------------------------------------------------------------------------

  abstract addChild (compoundDef: CompoundDefDataModel): CompoundBase
  abstract createCompoundsHierarchies (): void
  // It must return an array since groups can have multiple top pages.
  abstract createSidebarItems (sidebarCategory: SidebarCategory): void
  abstract createMenuItems (): MenuItem[]
  abstract generateIndexDotMdFile (): Promise<void>

  async generatePerInitialsIndexMdFiles (): Promise<void> {
    // Nothing at this level. Override it where needed.
  }

  hasCompounds (): boolean {
    return this.collectionCompoundsById.size > 0
  }

  // --------------------------------------------------------------------------

  orderPerInitials (entriesMap: Map<string, IndexEntryBase>): Map<string, IndexEntryBase[]> {
    const entriesPerInitialsMap: Map<string, IndexEntryBase[]> = new Map()

    for (const [id, entry] of entriesMap) {
      const initial: string = entry.name.charAt(0).toLowerCase()
      if (initial.length > 0) {
        let mapArray = entriesPerInitialsMap.get(initial)
        if (mapArray === undefined) {
          mapArray = []
          entriesPerInitialsMap.set(initial, mapArray)
        }
        mapArray.push(entry)
      }
    }

    const orderedMap: Map<string, IndexEntryBase[]> = new Map()
    const orderedInitials = Array.from(entriesPerInitialsMap.keys()).sort()
    for (const initial of orderedInitials) {
      const unorderedArray = entriesPerInitialsMap.get(initial)
      assert(unorderedArray !== undefined)
      const orderedArray = unorderedArray.sort((a, b) => {
        let nameComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' })
        if (nameComparison !== 0) {
          return nameComparison
        }
        nameComparison = a.longName.localeCompare(b.longName, undefined, { sensitivity: 'accent' })
        return nameComparison
      })
      orderedMap.set(initial, orderedArray)
    }

    return orderedMap
  }

  outputEntries (entriesPerInitialsMap: Map<string, IndexEntryBase[]>): string[] {
    const lines: string[] = []

    let totalCount = 0
    for (const initial of entriesPerInitialsMap.keys()) {
      lines.push('')
      lines.push(`## - ${(initial as string).toUpperCase()} -`)
      lines.push('')
      lines.push('<ul>')
      const mapArray = entriesPerInitialsMap.get(initial)
      assert(mapArray !== undefined)
      for (const entry of mapArray) {
        const linkName: string = entry.linkName ?? '???'

        const name = entry.name

        let text: string = ''

        text += `<li><b>${name}</b>: `
        if (entry.linkKind.length > 0) {
          text += entry.linkKind
          text += ' '
        }

        if (entry.permalink !== undefined && entry.permalink.length > 0) {
          text += `<a href="${entry.permalink}">${linkName}</a>`
        } else {
          text += linkName
        }
        text += '</li>'
        lines.push(text)
      }
      lines.push('</ul>')

      if (mapArray.length > 1) {
        lines.push(`<p>${mapArray.length} entries</p>`)
      }
      totalCount += mapArray.length
    }

    lines.push('<br/>')
    lines.push(`<p>Total: ${totalCount} entries.</p>`)

    return lines
  }

  async generateIndexFile ({
    group,
    fileKind,
    title,
    description,
    map,
    filter
  }: {
    group: string
    fileKind: string
    title: string
    description: string
    map: Map<string, IndexEntryBase>
    filter: (kind: string) => boolean
  }): Promise<void> {
    const outputFolderPath = this.workspace.outputFolderPath

    const filePath = `${outputFolderPath}indices/${group}/${fileKind}.md`
    const permalink = `indices/${group}/${fileKind}`

    const frontMatter: FrontMatter = {
      title,
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', group, 'index']
    }

    const lines: string[] = []

    lines.push(description)

    const filteredMap: Map<string, IndexEntryBase> = new Map()
    for (const [id, entry] of map) {
      if (filter(entry.kind)) {
        filteredMap.set(id, entry)
      }
    }
    const orderedEntries = this.orderPerInitials(filteredMap)

    lines.push(...this.outputEntries(orderedEntries))

    if (this.workspace.pluginOptions.verbose) {
      console.log(`Writing ${group} index file ${filePath}...`)
    }

    await this.workspace.writeMdFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }
}

// ----------------------------------------------------------------------------
