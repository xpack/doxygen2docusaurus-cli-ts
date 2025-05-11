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

import { CompoundBase } from './compound-base-vm.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import { MenuItem, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { Workspace } from '../workspace.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { FrontMatter } from '../types.js'

// ----------------------------------------------------------------------------

export class FilesAndFolders extends CollectionBase {
  // compoundsById: Map<string, File | Folder>
  compoundFoldersById: Map<string, Folder>
  compoundFilesById: Map<string, File>

  topLevelFolders: Folder[] = []
  topLevelFiles: File[] = []

  filesByPath: Map<String, File>

  // folders: Folders

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    super(workspace)

    // this.compoundsById = new Map()
    this.compoundFoldersById = new Map()
    this.compoundFilesById = new Map()

    this.filesByPath = new Map()
  }

  // --------------------------------------------------------------------------

  override addChild (compoundDef: CompoundDefDataModel): CompoundBase {
    if (compoundDef.kind === 'file') {
      const file = new File(this, compoundDef)
      // this.compoundsById.set(compoundDef.id, file)
      this.compoundFilesById.set(compoundDef.id, file)
      return file
    } else if (compoundDef.kind === 'dir') {
      const folder = new Folder(this, compoundDef)
      // this.compoundsById.set(compoundDef.id, folder)
      this.compoundFoldersById.set(compoundDef.id, folder)
      return folder
    } else {
      throw new Error(`kind ${compoundDef.kind} not implemented in ${this.constructor.name}`)
    }
  }

  // --------------------------------------------------------------------------

  override createHierarchies (): void {
    // Recreate files and folders hierarchies.
    // console.log(this.compoundsById.size)
    for (const [folderId, folder] of this.compoundFoldersById) {
      for (const childFolderId of folder.childrenFolderIds) {
        const childFolder = this.compoundFoldersById.get(childFolderId)
        assert(childFolder !== undefined)
        // console.log('childFolderId', childFolderId, 'has parent', folderId)
        childFolder.parent = folder
        folder.children.push(childFolder)
      }
      for (const childFileId of folder.childrenFileIds) {
        const childFile = this.compoundFilesById.get(childFileId)
        assert(childFile !== undefined)
        // console.log('childFileId', childFileId, 'has parent', folderId)
        childFile.parent = folder
        folder.children.push(childFile)
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      this.workspace.compoundsById.set(fileId, file)
    }

    for (const [folderId, folder] of this.compoundFoldersById) {
      if (folder.parent === undefined) {
        // console.log('topFolderId:', folderId)
        this.topLevelFolders.push(folder)
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      if (file.parent === undefined) {
        // console.log('topFileId:', fileId)
        this.topLevelFiles.push(file)
      }

      const path = file.compoundDef.location?.file
      assert(path !== undefined)
      this.filesByPath.set(path, file)
      // console.log(path, file)
    }

    for (const [folderId, folder] of this.compoundFoldersById) {
      let parentPath = ''
      if (folder.parent !== undefined) {
        parentPath = `${this.getRelativePathRecursively(folder.parent as Folder)}/`
      }

      folder.relativePath = `${parentPath}${folder.compoundDef.compoundName as string}`

      const sanitizedPath: string = sanitizeHierarchicalPath(folder.relativePath)
      folder.relativePermalink = `folders/${sanitizedPath}`

      folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`

      // console.log('1', file.compoundDef.compoundName)
      // console.log('2', file.relativePermalink)
      // console.log('3', file.docusaurusId)
      // console.log('4', file.sidebarLabel)
      // console.log('5', file.indexName)
      // console.log()
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [fileId, file] of this.compoundFilesById) {
      let parentPath = ''
      if (file.parent !== undefined) {
        parentPath = `${this.getRelativePathRecursively(file.parent as Folder)}/`
      }

      file.relativePath = `${parentPath}${file.compoundDef.compoundName as string}`

      const sanitizedPath: string = sanitizeHierarchicalPath(file.relativePath)
      file.relativePermalink = `files/${sanitizedPath}`

      file.docusaurusId = `files/${flattenPath(sanitizedPath)}`

      // console.log('1', file.compoundDef.compoundName)
      // console.log('2', file.relativePermalink)
      // console.log('3', file.docusaurusId)
      // console.log('4', file.sidebarLabel)
      // console.log('5', file.indexName)
      // console.log()
    }
  }

  private getRelativePathRecursively (folder: Folder): string {
    let parentPath = ''
    if (folder.parent !== undefined) {
      parentPath = `${this.getRelativePathRecursively(folder.parent as Folder)}/`
    }
    return `${parentPath}${folder.compoundDef.compoundName}`
  }

  // --------------------------------------------------------------------------

  override createSidebarItems (): SidebarItem[] {
    // Add folders & files to the sidebar.
    // Top level folders & files are added below a Files category
    const filesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Files',
      link: {
        type: 'doc',
        id: `${this.workspace.permalinkBaseUrl}files/index`
      },
      collapsed: true,
      items: []
    }

    for (const folder of this.topLevelFolders) {
      filesCategory.items.push(this.createFolderSidebarItemRecursively(folder))
    }

    for (const file of this.topLevelFiles) {
      filesCategory.items.push(this.createFileSidebarItem(file))
    }

    return [filesCategory]
  }

  private createFolderSidebarItemRecursively (folder: Folder): SidebarItem {
    const categoryItem: SidebarCategoryItem = {
      type: 'category',
      label: folder.sidebarLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.permalinkBaseUrl}${folder.docusaurusId}`
      },
      collapsed: true,
      items: []
    }

    for (const fileOrFolder of folder.children) {
      if (fileOrFolder instanceof Folder) {
        categoryItem.items.push(this.createFolderSidebarItemRecursively(fileOrFolder))
      }
    }

    for (const fileOrFolder of folder.children) {
      if (fileOrFolder instanceof File) {
        categoryItem.items.push(this.createFileSidebarItem(fileOrFolder))
      }
    }

    return categoryItem
  }

  private createFileSidebarItem (file: File): SidebarItem {
    const docItem: SidebarDocItem = {
      type: 'doc',
      label: file.sidebarLabel,
      id: `${this.workspace.permalinkBaseUrl}${file.docusaurusId}`
    }
    return docItem
  }

  // --------------------------------------------------------------------------

  override createMenuItems (): MenuItem[] {
    const menuItem: MenuItem = {
      label: 'Files',
      to: `/${this.workspace.pluginOptions.outputFolderPath}/files/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath

    const filePath = `${outputFolderPath}/files/index.mdx`
    const permalink = 'files'

    const frontMatter: FrontMatter = {
      title: 'The Files & Folders Reference',
      slug: `/${this.workspace.permalinkBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'files', 'folders', 'reference']
    }

    const lines: string[] = []

    lines.push('The files & folders that contributed content to this site are:')

    lines.push('')
    lines.push('<TreeTable>')

    for (const folder of this.topLevelFolders) {
      lines.push(...this.generateFolderIndexMdxRecursively(folder, 1))
    }

    for (const file of this.topLevelFiles) {
      lines.push(...this.generateFileIndexMdx(file, 1))
    }

    lines.push('')
    lines.push('</TreeTable>')

    console.log(`Writing files index file ${filePath}...`)
    await this.workspace.writeFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateFolderIndexMdxRecursively (folder: Folder, depth: number): string[] {
    // console.log(util.inspect(folder, { compact: false, depth: 999 }))

    const lines: string[] = []

    const compoundDef = folder.compoundDef
    const label = escapeMdx(folder.compoundDef.compoundName)

    const permalink = this.workspace.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push('  itemIconClass="doxyIconFolder"')
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth="${depth}">`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    if (folder.children.length > 0) {
      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof Folder) {
          lines.push(...this.generateFolderIndexMdxRecursively(childFileOrFolder, depth + 1))
        }
      }

      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof File) {
          lines.push(...this.generateFileIndexMdx(childFileOrFolder, depth + 1))
        }
      }
    }

    return lines
  }

  private generateFileIndexMdx (file: File, depth: number): string[] {
    // console.log(util.inspect(file, { compact: false, depth: 999 }))
    const lines: string[] = []

    const compoundDef = file.compoundDef
    const label = escapeMdx(file.compoundDef.compoundName)

    const permalink = this.workspace.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    lines.push('')
    lines.push('<TreeTableRow')
    lines.push('  itemIconClass="doxyIconFile"')
    lines.push(`  itemLabel="${label}"`)
    lines.push(`  itemLink="${permalink}"`)
    lines.push(`  depth="${depth}">`)

    const briefDescription: string = this.workspace.renderElementToMdxText(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      lines.push(briefDescription.replace(/[.]$/, ''))
    }

    lines.push('</TreeTableRow>')

    return lines
  }
}

// ----------------------------------------------------------------------------

export class Folder extends CompoundBase {
  // childrenIds & children - not used

  childrenFileIds: string[] = []
  childrenFiles: File[] = []

  childrenFolderIds: string[] = []
  childrenFolders: Folder[] = []

  relativePath: string = ''

  // --------------------------------------------------------------------------

  constructor (collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('Folder.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerDirs)) {
      for (const ref of compoundDef.innerDirs) {
        // console.log('component', compoundDef.id, 'has child folder', ref.refid)
        this.childrenIds.push(ref.refid)
        this.childrenFolderIds.push(ref.refid)
      }
    }

    if (Array.isArray(compoundDef.innerFiles)) {
      for (const ref of compoundDef.innerFiles) {
        // console.log('component', compoundDef.id, 'has child file', ref.refid)
        this.childrenIds.push(ref.refid)
        this.childrenFileIds.push(ref.refid)
      }
    }

    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` Folder Reference`
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef
    const descriptionTodo = `@dir ${this.relativePath}`

    lines.push(this.renderBriefDescriptionToMdxText({
      todo: descriptionTodo,
      morePermalink: '#details'
    }))

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Dirs', 'Files']
    }))

    lines.push(...this.renderSectionDefIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    }))

    lines.push(...this.renderSectionDefsToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------

export class File extends CompoundBase {
  relativePath: string = ''

  constructor (collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // The compoundName is the actual file name.
    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`
  }

  // --------------------------------------------------------------------------

  override renderToMdxLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const compoundDef = this.compoundDef

    const descriptionTodo = `@file ${this.relativePath}`

    lines.push(this.renderBriefDescriptionToMdxText({
      todo: descriptionTodo,
      morePermalink: '#details'
    }))

    lines.push(...this.renderIncludesIndexMdx())

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionDefIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    }))

    lines.push(...this.renderSectionDefsToMdxLines())

    if (compoundDef.programListing !== undefined) {
      lines.push('')
      lines.push('## File Listing')

      lines.push('')
      lines.push('The file content with the documentation metadata removed is:')

      lines.push(...this.collection.workspace.renderElementToMdxLines(compoundDef.programListing))
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
