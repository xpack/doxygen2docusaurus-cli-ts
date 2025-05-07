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
import { SidebarCategoryItem, SidebarDocItem, SidebarItem } from '../../plugin/types.js'
import { Workspace } from '../workspace.js'
import { escapeMdx, flattenPath, sanitizeHierarchicalPath } from '../../docusaurus-generator/utils.js'
import { FrontMatter } from '../../docusaurus-generator/types.js'

// ----------------------------------------------------------------------------

export class FilesAndFolders extends CollectionBase {
  // compoundsById: Map<string, File | Folder>
  compoundFoldersById: Map<string, Folder>
  compoundFilesById: Map<string, File>

  topLevelFolders: Folder[] = []
  topLevelFiles: File[] = []

  filesAndFoldersByPath: Map<String, File | Folder>

  // folders: Folders

  constructor (workspace: Workspace) {
    super(workspace)

    // this.compoundsById = new Map()
    this.compoundFoldersById = new Map()
    this.compoundFilesById = new Map()

    this.filesAndFoldersByPath = new Map()
  }

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
      this.workspace.dataObjectsById.set(fileId, file)
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
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [fileId, file] of this.compoundFilesById) {
      let parentPath = ''
      if (file.parent !== undefined) {
        parentPath = `${this.getRelativePathRecursively(file.parent as Folder)}/`
      }

      const sanitizedPath: string = sanitizeHierarchicalPath(`${parentPath}${file.compoundDef.compoundName as string}`)
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

  getRelativePathRecursively (folder: Folder): string {
    let parentPath = ''
    if (folder.parent !== undefined) {
      parentPath = `${this.getRelativePathRecursively(folder.parent as Folder)}/`
    }
    const sanitizedPath: string = sanitizeHierarchicalPath(`${parentPath}${folder.compoundDef.compoundName}`)
    folder.relativePermalink = `folders/${sanitizedPath}`

    folder.docusaurusId = `folders/${flattenPath(sanitizedPath)}`

    return sanitizedPath
  }

  override createSidebarItems (): SidebarItem[] {
    // Add folders & files to the sidebar.
    // Top level folders & files are added below a Files category
    const filesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Files',
      link: {
        type: 'doc',
        id: `${this.workspace.permalinkBaseUrl}folders/index`
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

  override async generateIndexDotMdxFile (): Promise<void> {
    const outputFolderPath = this.workspace.pluginOptions.outputFolderPath

    const filePath = `${outputFolderPath}/folders/index.mdx`
    const permalink = 'folders'

    const frontMatter: FrontMatter = {
      title: 'The Folders & Files Reference',
      slug: `${outputFolderPath.replace(/^docs/, '')}/${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'folders', 'reference']
    }

    const lines: string[] = []

    lines.push('The folders & files that contributed content to this site are:')

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

    console.log(`Writing folders index file ${filePath}...`)
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
    lines.push(`<TreeTableRow itemIconClass="doxyIconFolder" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">`)

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
    lines.push(`<TreeTableRow itemIconClass="doxyIconFile" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">`)

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
  collection: FilesAndFolders

  // childrenIds & children - not used

  childrenFileIds: string[] = []
  childrenFiles: File[] = []

  childrenFolderIds: string[] = []
  childrenFolders: Folder[] = []

  constructor (collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(compoundDef)

    this.collection = collection

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
}

// ----------------------------------------------------------------------------

export class File extends CompoundBase {
  collection: FilesAndFolders

  constructor (collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(compoundDef)

    this.collection = collection

    // The compoundName is the actual file name.
    this.sidebarLabel = this.compoundDef.compoundName ?? '?'

    this.indexName = this.sidebarLabel

    this.pageTitle = `The \`${this.sidebarLabel}\` File Reference`

    // console.log('File.constructor', util.inspect(compoundDef))
  }
}

// ----------------------------------------------------------------------------
