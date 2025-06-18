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
import { ProgramListingDataModel } from '../../data-model/compounds/descriptiontype-dm.js'

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
      this.collectionCompoundsById.set(file.id, file)
      this.compoundFilesById.set(file.id, file)
      return file
    } else if (compoundDef.kind === 'dir') {
      const folder = new Folder(this, compoundDef)
      this.collectionCompoundsById.set(folder.id, folder)
      this.compoundFoldersById.set(folder.id, folder)
      return folder
    } else {
      throw new Error(`kind ${compoundDef.kind} not implemented in ${this.constructor.name}`)
    }
  }

  // --------------------------------------------------------------------------

  override createCompoundsHierarchies (): void {
    // Recreate files and folders hierarchies.
    // console.log(this.compoundsById.size)
    for (const [folderId, folder] of this.compoundFoldersById) {
      for (const childFolderId of folder.childrenFolderIds) {
        const childFolder = this.compoundFoldersById.get(childFolderId)
        assert(childFolder !== undefined)
        if (this.workspace.pluginOptions.debug) {
          console.log('childFolderId', childFolderId, childFolder.compoundName, 'has parent', folderId, folder.compoundName)
        }
        childFolder.parent = folder
        folder.children.push(childFolder)
      }
      for (const childFileId of folder.childrenFileIds) {
        const childFile = this.compoundFilesById.get(childFileId)
        if (childFile !== undefined) {
          if (this.workspace.pluginOptions.debug) {
            console.log('childFileId', childFileId, childFile.compoundName, 'has parent', folderId, folder.compoundName)
          }
          childFile.parent = folder
          folder.children.push(childFile)
        } else {
          console.warn(childFileId, 'not a child of', folder.id)
        }
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      this.workspace.compoundsById.set(fileId, file)
    }

    for (const [folderId, folder] of this.compoundFoldersById) {
      if (folder.parent === undefined) {
        if (this.workspace.pluginOptions.debug) {
          console.log('topFolderId:', folderId)
        }
        this.topLevelFolders.push(folder)
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      if (file.parent === undefined) {
        // console.log('topFileId:', fileId)
        this.topLevelFiles.push(file)
      }

      const path = file.locationFilePath
      assert(path !== undefined)
      this.filesByPath.set(path, file)
      if (this.workspace.pluginOptions.debug) {
        // console.log('filesByPath.set', path, file)
        console.log('filesByPath.set', path)
      }
    }

    for (const [folderId, folder] of this.compoundFoldersById) {
      let parentPath = ''
      if (folder.parent !== undefined) {
        parentPath = `${this.getRelativePathRecursively(folder.parent as Folder)}/`
      }

      // console.log(folder.compoundName)
      folder.relativePath = `${parentPath}${folder.compoundName as string}`

      const sanitizedPath: string = sanitizeHierarchicalPath(folder.relativePath)
      folder.relativePermalink = `folders/${sanitizedPath}`

      folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`

      // console.log('0', folder.id)
      // console.log('1', folder.compoundName)
      // console.log('2', folder.relativePermalink)
      // console.log('3', folder.docusaurusId)
      // console.log('4', folder.sidebarLabel)
      // console.log('5', folder.indexName)
      // console.log()
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [fileId, file] of this.compoundFilesById) {
      let parentPath = ''
      if (file.parent !== undefined) {
        parentPath = `${this.getRelativePathRecursively(file.parent as Folder)}/`
      }

      // console.log(file.compoundName)
      file.relativePath = `${parentPath}${file.compoundName as string}`

      const sanitizedPath: string = sanitizeHierarchicalPath(file.relativePath)
      file.relativePermalink = `files/${sanitizedPath}`

      file.docusaurusId = `files/${flattenPath(sanitizedPath)}`

      // console.log('0', file.id)
      // console.log('1', file.compoundName)
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
    return `${parentPath}${folder.compoundName}`
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
        id: `${this.workspace.sidebarBaseId}files/index`
      },
      collapsed: true,
      items: []
    }

    for (const folder of this.topLevelFolders) {
      const item = this.createFolderSidebarItemRecursively(folder)
      if (item !== undefined) {
        filesCategory.items.push(item)
      }
    }

    for (const file of this.topLevelFiles) {
      const item = this.createFileSidebarItem(file)
      if (item !== undefined) {
        filesCategory.items.push(item)
      }
    }

    return [filesCategory]
  }

  private createFolderSidebarItemRecursively (folder: Folder): SidebarItem | undefined {
    if (folder.sidebarLabel === undefined) {
      return undefined
    }

    const categoryItem: SidebarCategoryItem = {
      type: 'category',
      label: folder.sidebarLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}${folder.docusaurusId}`
      },
      collapsed: true,
      items: []
    }

    for (const fileOrFolder of folder.children) {
      if (fileOrFolder instanceof Folder) {
        const item = this.createFolderSidebarItemRecursively(fileOrFolder)
        if (item !== undefined) {
          categoryItem.items.push(item)
        }
      }
    }

    for (const fileOrFolder of folder.children) {
      if (fileOrFolder instanceof File) {
        const item = this.createFileSidebarItem(fileOrFolder)
        if (item !== undefined) {
          categoryItem.items.push(item)
        }
      }
    }

    return categoryItem
  }

  private createFileSidebarItem (file: File): SidebarItem | undefined {
    if (file.sidebarLabel === undefined) {
      return undefined
    }

    const docItem: SidebarDocItem = {
      type: 'doc',
      label: file.sidebarLabel,
      id: `${this.workspace.sidebarBaseId}${file.docusaurusId}`
    }
    return docItem
  }

  // --------------------------------------------------------------------------

  override createMenuItems (): MenuItem[] {
    const menuItem: MenuItem = {
      label: 'Files',
      to: `${this.workspace.menuBaseUrl}files/`
    }
    return [menuItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdxFile (): Promise<void> {
    if (this.topLevelFolders.length === 0 && this.topLevelFiles.length === 0) {
      return
    }

    const filePath = `${this.workspace.outputFolderPath}files/index.md`
    const permalink = 'files'

    const frontMatter: FrontMatter = {
      title: 'The Files & Folders Reference',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'files', 'folders', 'reference']
    }

    const lines: string[] = []

    lines.push('The files & folders that contributed content to this site are:')

    lines.push('')
    lines.push('<table class="doxyTreeTable">')

    for (const folder of this.topLevelFolders) {
      lines.push(...this.generateIndexMdxFileRecursively(folder, 0))
    }

    for (const file of this.topLevelFiles) {
      lines.push(...this.generateFileIndexMdx(file, 1))
    }

    lines.push('')
    lines.push('</table>')

    console.log(`Writing files index file ${filePath}...`)
    await this.workspace.writeMdxFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdxFileRecursively (folder: Folder, depth: number): string[] {
    // console.log(util.inspect(folder, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = escapeMdx(folder.compoundName)

    const permalink = this.workspace.getPagePermalink(folder.id)
    assert(permalink !== undefined && permalink.length > 1)

    let description: string = ''
    if (folder.briefDescriptionMdxText !== undefined && folder.briefDescriptionMdxText.length > 0) {
      description = folder.briefDescriptionMdxText.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToLines({
      itemIconClass: 'doxyIconFolder',
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    if (folder.children.length > 0) {
      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof Folder) {
          lines.push(...this.generateIndexMdxFileRecursively(childFileOrFolder, depth + 1))
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

    const label = escapeMdx(file.compoundName)

    const permalink = this.workspace.getPagePermalink(file.id)
    assert(permalink !== undefined && permalink.length > 1)

    let description: string = ''
    if (file.briefDescriptionMdxText !== undefined && file.briefDescriptionMdxText.length > 0) {
      description = file.briefDescriptionMdxText.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToLines({
      itemIconClass: 'doxyIconFile',
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

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

    // console.log('folder:', util.inspect(compoundDef))
    // console.log('folder:', compoundDef.compoundName)

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

    this.sidebarLabel = compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` Folder Reference`

    this.createSections()
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@dir ${escapeMdx(this.relativePath)}`

    const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToMdxText({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Dirs', 'Files']
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      detailedDescriptionMdxText: this.detailedDescriptionMdxText,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToMdxLines())

    return lines
  }
}

// ----------------------------------------------------------------------------

export class File extends CompoundBase {
  relativePath: string = ''
  listingLineNumbers: Set<Number> = new Set()

  // Shortcut, use data model objects.
  programListing: ProgramListingDataModel | undefined

  constructor (collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('file:', compoundDef.compoundName)

    // The compoundName is the actual file name, without path.
    assert(compoundDef.compoundName !== undefined)
    this.sidebarLabel = compoundDef.compoundName

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`

    this.createSections()
  }

  override initializeLate (): void {
    super.initializeLate()

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    this.programListing = compoundDef.programListing

    // Keep track of line number, since not all lines referred exist and
    // this might result in broken links.
    if (this.programListing?.codelines !== undefined) {
      for (const codeline of this.programListing?.codelines) {
        if (codeline.lineno !== undefined) {
          this.listingLineNumbers.add(codeline.lineno)
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@file ${escapeMdx(this.relativePath)}`

    const morePermalink = this.renderDetailedDescriptionToMdxLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToMdxText({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push(...this.renderIncludesIndexToMdxLines())

    lines.push(...this.renderInnerIndicesToMdxLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToMdxLines())

    lines.push(...this.renderDetailedDescriptionToMdxLines({
      briefDescriptionMdxText: this.briefDescriptionMdxText,
      detailedDescriptionMdxText: this.detailedDescriptionMdxText,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToMdxLines())

    if (this.programListing !== undefined) {
      lines.push('')
      lines.push('## File Listing')

      lines.push('')
      lines.push('The file content with the documentation metadata removed is:')

      lines.push(...this.collection.workspace.renderElementToLines(this.programListing, 'mdx'))
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
