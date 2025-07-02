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
import { MenuItem, SidebarCategory, SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { Workspace } from '../workspace.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { FrontMatter } from '../types.js'
import { ProgramListingDataModel } from '../../data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

export class FilesAndFolders extends CollectionBase {
  // compoundsById: Map<string, File | Folder>

  compoundFoldersById: Map<string, Folder>

  compoundFilesById: Map<string, File>

  topLevelFolders: Folder[] = []
  topLevelFiles: File[] = []

  // folders: Folders

  // --------------------------------------------------------------------------

  constructor (workspace: Workspace) {
    super(workspace)

    // this.compoundsById = new Map()
    this.compoundFoldersById = new Map()
    this.compoundFilesById = new Map()
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
      this.workspace.filesByPath.set(path, file)
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

  override createSidebarItems (sidebarCategory: SidebarCategory): void {
    // Add folders & files to the sidebar.
    // Top level folders & files are added below a Files category
    const filesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Files',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}index/files/index`
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

    sidebarCategory.items.push(filesCategory)
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

  override async generateIndexDotMdFile (): Promise<void> {
    if (this.topLevelFolders.length === 0 && this.topLevelFiles.length === 0) {
      return
    }

    const filePath = `${this.workspace.outputFolderPath}index/files/index.md`
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

    const contentLines: string[] = []
    for (const folder of this.topLevelFolders) {
      contentLines.push(...this.generateIndexMdFileRecursively(folder, 0))
    }

    for (const file of this.topLevelFiles) {
      contentLines.push(...this.generateFileIndexMd(file, 0))
    }

    if (contentLines.length === 0) {
      return
    }

    lines.push(...contentLines)

    lines.push('')
    lines.push('</table>')

    console.log(`Writing files index file ${filePath}...`)
    await this.workspace.writeMdFile({
      filePath,
      frontMatter,
      bodyLines: lines
    })
  }

  private generateIndexMdFileRecursively (folder: Folder, depth: number): string[] {
    // console.log(util.inspect(folder, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = this.workspace.renderString(folder.compoundName, 'html')

    const permalink = this.workspace.getPagePermalink(folder.id)
    if (permalink === undefined || permalink.length === 0) {
      // console.log(namespace)
      return []
    }

    let description: string = ''
    if (folder.briefDescriptionMarkdownString !== undefined && folder.briefDescriptionMarkdownString.length > 0) {
      description = folder.briefDescriptionMarkdownString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
      itemIconClass: 'doxyIconFolder',
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    if (folder.children.length > 0) {
      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof Folder) {
          lines.push(...this.generateIndexMdFileRecursively(childFileOrFolder, depth + 1))
        }
      }

      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof File) {
          lines.push(...this.generateFileIndexMd(childFileOrFolder, depth + 1))
        }
      }
    }

    return lines
  }

  private generateFileIndexMd (file: File, depth: number): string[] {
    // console.log(util.inspect(file, { compact: false, depth: 999 }))
    const lines: string[] = []

    const label = this.workspace.renderString(file.compoundName, 'html')

    const permalink = this.workspace.getPagePermalink(file.id, true)
    if (permalink === undefined || permalink.length === 0) {
      return []
    }

    let description: string = ''
    if (file.briefDescriptionMarkdownString !== undefined && file.briefDescriptionMarkdownString.length > 0) {
      description = file.briefDescriptionMarkdownString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(...this.workspace.renderTreeTableRowToHtmlLines({
      itemIconClass: 'doxyIconFile',
      itemLabel: label,
      itemLink: permalink,
      depth,
      description
    }))

    return lines
  }

  override hasCompounds (): boolean {
    for (const [compoundId, compound] of this.collectionCompoundsById) {
      if ((compound as File).children.length > 0) {
        return true
      }
    }
    return false
  }
}

// ----------------------------------------------------------------------------

export class Folder extends CompoundBase {
  childrenFileIds: string[] = []

  childrenFolderIds: string[] = []

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

    this.sidebarLabel = compoundDef.compoundName ?? '???'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` Folder Reference`

    this.createSections()
  }

  hasChildren (): boolean {
    for (const child of this.children) {
      if (child instanceof File) {
        return true
      } else if (child instanceof Folder && child.hasChildren()) {
        return true
      }
    }

    return false
  }

  override hasAnyContent (): boolean {
    // console.log('checking', this.compoundName)
    if (this.hasChildren()) {
      // console.log('has content children', this)
      return true
    }

    // if (!super.hasAnyContent()) {
    //   console.log('has no content', this)
    // }
    return super.hasAnyContent()
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@dir ${this.collection.workspace.renderString(this.relativePath, 'html')}`

    const morePermalink = this.renderDetailedDescriptionToLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToString({
      briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push(...this.renderInnerIndicesToLines({
      suffixes: ['Dirs', 'Files']
    }))

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(...this.renderDetailedDescriptionToLines({
      briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
      detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToLines())

    return lines
  }

  override initializeLate (): void {
    super.initializeLate()

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.pluginOptions.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.docusaurusId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
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

    if (this.collection.workspace.pluginOptions.renderProgramListing) {
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

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.pluginOptions.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.docusaurusId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
  }

  override hasAnyContent (): boolean {
    // console.log('checking', this.compoundName)
    if (this.childrenIds.length > 0) {
      // console.log('has content childrenIds', this)
      return true
    }
    if (this.children.length > 0) {
      // console.log('has content children.length', this)
      return true
    }
    if (this.innerCompounds !== undefined) {
      // console.log('has content innerCompounds', this)
      return true
    }
    if (this.includes !== undefined) {
      // console.log('has content includes', this)
      return true
    }

    // if (!super.hasAnyContent()) {
    //   console.log('has no content', this)
    // }
    return super.hasAnyContent()
  }

  // --------------------------------------------------------------------------

  override renderToLines (frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@file ${this.collection.workspace.renderString(this.relativePath, 'html')}`

    const morePermalink = this.renderDetailedDescriptionToLines !== undefined ? '#details' : undefined
    lines.push(this.renderBriefDescriptionToString({
      briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
      todo: descriptionTodo,
      morePermalink
    }))

    lines.push(...this.renderIncludesIndexToLines())

    lines.push(...this.renderInnerIndicesToLines({
      suffixes: ['Namespaces', 'Classes']
    }))

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(...this.renderDetailedDescriptionToLines({
      briefDescriptionMarkdownString: this.briefDescriptionMarkdownString,
      detailedDescriptionMarkdownLines: this.detailedDescriptionMarkdownLines,
      todo: descriptionTodo,
      showHeader: true,
      showBrief: !this.hasSect1InDescription
    }))

    lines.push(...this.renderSectionsToLines())

    if (this.programListing !== undefined && this.collection.workspace.pluginOptions.renderProgramListing) {
      lines.push('')
      lines.push('## File Listing')

      lines.push('')
      lines.push('The file content with the documentation metadata removed is:')

      lines.push(...this.collection.workspace.renderElementToLines(this.programListing, 'html'))
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
