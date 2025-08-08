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

import { CompoundBase } from './compound-base-vm.js'
import type { CompoundDefDataModel } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import { CollectionBase } from './collection-base.js'
import type {
  NavbarItem,
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
  SidebarItem,
  FrontMatter,
} from '../types.js'
import type { Workspace } from '../workspace.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import type { ProgramListingDataModel } from '../../doxygen/data-model/compounds/descriptiontype-dm.js'
import { FileTreeEntry } from './tree-entries-vm.js'
import type { TreeEntryBase } from './tree-entries-vm.js'
import { Class } from './classes-vm.js'
import { Namespace } from './namespaces-vm.js'

// ----------------------------------------------------------------------------

/**
 * Manages the collection of file and folder documentation compounds.
 *
 * @remarks
 * Handles the organisation and generation of file-based documentation,
 * including folder hierarchies, file listings, sidebar generation, and
 * index file creation. Provides a structured view of the source code
 * organisation with proper navigation support.
 *
 * @public
 */
export class FilesAndFolders extends CollectionBase {
  // compoundsById: Map<string, File | Folder>

  /**
   * Map of folder compounds indexed by identifier.
   *
   * @remarks
   * Stores all folder instances for efficient lookup and hierarchy
   * construction, separate from the main compounds collection.
   */
  compoundFoldersById: Map<string, Folder>

  /**
   * Map of file compounds indexed by identifier.
   *
   * @remarks
   * Stores all file instances for efficient lookup and organisation,
   * separate from the main compounds collection.
   */
  compoundFilesById: Map<string, File>

  /**
   * Array of top-level folders without parent folders.
   *
   * @remarks
   * Contains folders that are at the root level of the documentation
   * hierarchy, used for organising hierarchical displays.
   */
  topLevelFolders: Folder[] = []

  /**
   * Array of top-level files without parent folders.
   *
   * @remarks
   * Contains files that are at the root level of the documentation
   * hierarchy, not contained within any documented folder.
   */
  topLevelFiles: File[] = []

  // folders: Folders

  // --------------------------------------------------------------------------

  /**
   * Creates a new files and folders collection.
   *
   * @remarks
   * Initialises the collection with separate maps for folders and files
   * to enable efficient organisation and hierarchy construction.
   *
   * @param workspace - The workspace instance
   */
  constructor(workspace: Workspace) {
    super(workspace)

    // this.compoundsById = new Map()
    this.compoundFoldersById = new Map()
    this.compoundFilesById = new Map()
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a file or folder compound to the collection.
   *
   * @remarks
   * Creates either a File or Folder instance based on the compound kind,
   * registers it in the appropriate collections, and returns the created
   * instance for further processing.
   *
   * @param compoundDef - The compound definition for the file or folder
   * @returns The created File or Folder instance
   * @throws Error if compound kind is not 'file' or 'dir'
   */
  override addChild(compoundDef: CompoundDefDataModel): CompoundBase {
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
      throw new Error(
        `kind ${compoundDef.kind} not implemented in ${this.constructor.name}`
      )
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Creates hierarchical relationships between file and folder compounds.
   *
   * @remarks
   * Establishes parent-child relationships for folders and files,
   * builds the complete file hierarchy, and generates relative paths
   * and permalinks for all compounds. Registers files in the workspace
   * for global lookup and identifies top-level entities.
   */
  override createCompoundsHierarchies(): void {
    // Recreate files and folders hierarchies.
    // console.log(this.compoundsById.size)
    for (const [, folder] of this.compoundFoldersById) {
      for (const childFolderId of folder.childrenFolderIds) {
        const childFolder = this.compoundFoldersById.get(childFolderId)
        assert(childFolder !== undefined)
        if (this.workspace.options.debug) {
          console.log(
            'childFolderId',
            childFolderId,
            childFolder.compoundName,
            'has parent',
            folder.parent?.id ?? '(no parent id)',
            folder.compoundName
          )
        }
        childFolder.parent = folder
        folder.children.push(childFolder)
      }
      for (const childFileId of folder.childrenFileIds) {
        const childFile = this.compoundFilesById.get(childFileId)
        if (childFile !== undefined) {
          if (this.workspace.options.debug) {
            console.log(
              'childFileId',
              childFileId,
              childFile.compoundName,
              'has parent',
              folder.parent?.id ?? '(no parent id)',
              folder.compoundName
            )
          }
          childFile.parent = folder
          folder.children.push(childFile)
        } else {
          console.warn(childFileId, 'not a child of', folder.id)
        }
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      this.workspace.viewModel.compoundsById.set(fileId, file)
    }

    for (const [folderId, folder] of this.compoundFoldersById) {
      if (folder.parent === undefined) {
        if (this.workspace.options.debug) {
          console.log('topFolderId:', folderId)
        }
        this.topLevelFolders.push(folder)
      }
    }

    for (const [fileId, file] of this.compoundFilesById) {
      if (file.parent === undefined) {
        if (this.workspace.options.debug) {
          console.log('topFileId:', fileId)
        }
        this.topLevelFiles.push(file)
      }

      const { locationFilePath } = file
      assert(locationFilePath !== undefined)
      this.workspace.filesByPath.set(locationFilePath, file)
      if (this.workspace.options.debug) {
        // console.log('filesByPath.set', path, file)
        console.log('filesByPath.set', locationFilePath)
      }
    }

    for (const [, folder] of this.compoundFoldersById) {
      let parentPath = ''
      if (folder.parent !== undefined) {
        if (folder.parent instanceof Folder) {
          parentPath = `${this.getRelativePathRecursively(folder.parent)}/`
        }
      }

      // console.log(folder.compoundName)
      folder.relativePath = `${parentPath}${folder.compoundName}`

      const sanitizedPath: string = sanitizeHierarchicalPath(
        folder.relativePath
      )
      folder.relativePermalink = `folders/${sanitizedPath}`

      folder.sidebarId = `folders/${flattenPath(sanitizedPath)}`

      // console.log('0', folder.id)
      // console.log('1', folder.compoundName)
      // console.log('2', folder.relativePermalink)
      // console.log('3', folder.docusaurusId)
      // console.log('4', folder.sidebarLabel)
      // console.log('5', folder.indexName)
      // console.log()
    }

    // Cannot be done in each object, since it needs the hierarchy.
    for (const [, file] of this.compoundFilesById) {
      let parentPath = ''
      if (file.parent !== undefined) {
        if (file.parent instanceof Folder) {
          parentPath = `${this.getRelativePathRecursively(file.parent)}/`
        }
      }

      // console.log(file.compoundName)
      file.relativePath = `${parentPath}${file.compoundName}`

      const sanitizedPath: string = sanitizeHierarchicalPath(file.relativePath)
      file.relativePermalink = `files/${sanitizedPath}`

      file.sidebarId = `files/${flattenPath(sanitizedPath)}`

      // console.log('0', file.id)
      // console.log('1', file.compoundName)
      // console.log('2', file.relativePermalink)
      // console.log('3', file.docusaurusId)
      // console.log('4', file.sidebarLabel)
      // console.log('5', file.indexName)
      // console.log()
    }
  }

  /**
   * Recursively builds the relative path for a folder from root.
   *
   * @remarks
   * Traverses the folder hierarchy upwards to construct the complete
   * relative path by concatenating parent folder names. Used for
   * generating proper folder permalinks and navigation structures.
   *
   * @param folder - The folder to build the path for
   * @returns The complete relative path from root to the folder
   */
  private getRelativePathRecursively(folder: Folder): string {
    let parentPath = ''
    if (folder.parent !== undefined) {
      if (folder.parent instanceof Folder) {
        parentPath = `${this.getRelativePathRecursively(folder.parent)}/`
      }
    }
    return `${parentPath}${folder.compoundName}`
  }

  // --------------------------------------------------------------------------

  override addSidebarItems(sidebarCategory: SidebarCategory): void {
    const indicesSet = this.workspace.indicesMaps.get('files')
    if (indicesSet === undefined) {
      return
    }

    // Add folders & files to the sidebar.
    // Top level folders & files are added below a Files category
    const filesCategory: SidebarCategoryItem = {
      type: 'category',
      label: 'Files',
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}indices/files/index`,
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Hierarchy',
          collapsed: true,
          items: [],
        },
      ],
    }

    for (const folder of this.topLevelFolders) {
      const item = this.createFolderSidebarItemRecursively(folder)
      if (item !== undefined) {
        ;(filesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    for (const file of this.topLevelFiles) {
      const item = this.createFileSidebarItem(file)
      if (item !== undefined) {
        ;(filesCategory.items[0] as SidebarCategoryItem).items.push(item)
      }
    }

    if (indicesSet.has('all')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'All',
        id: `${this.workspace.sidebarBaseId}indices/files/all`,
      })
    }

    if (indicesSet.has('classes')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Classes',
        id: `${this.workspace.sidebarBaseId}indices/files/classes`,
      })
    }

    if (indicesSet.has('namespaces')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Namespaces',
        id: `${this.workspace.sidebarBaseId}indices/files/namespaces`,
      })
    }

    if (indicesSet.has('functions')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Functions',
        id: `${this.workspace.sidebarBaseId}indices/files/functions`,
      })
    }

    if (indicesSet.has('variables')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Variables',
        id: `${this.workspace.sidebarBaseId}indices/files/variables`,
      })
    }

    if (indicesSet.has('typedefs')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Typedefs',
        id: `${this.workspace.sidebarBaseId}indices/files/typedefs`,
      })
    }

    if (indicesSet.has('enums')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Enums',
        id: `${this.workspace.sidebarBaseId}indices/files/enums`,
      })
    }

    if (indicesSet.has('enumvalues')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Enum Values',
        id: `${this.workspace.sidebarBaseId}indices/files/enumvalues`,
      })
    }

    if (indicesSet.has('defines')) {
      filesCategory.items.push({
        type: 'doc',
        label: 'Macro Definitions',
        id: `${this.workspace.sidebarBaseId}indices/files/defines`,
      })
    }

    sidebarCategory.items.push(filesCategory)
  }

  /**
   * Creates sidebar items for folder hierarchies recursively.
   *
   * @remarks
   * Generates hierarchical sidebar structures for folder trees,
   * creating category items with nested children for subfolders
   * and files. Processes folders first, then files within each
   * folder level.
   *
   * @param folder - The folder to create sidebar items for
   * @returns The sidebar category item or undefined if folder lacks data
   */
  private createFolderSidebarItemRecursively(
    folder: Folder
  ): SidebarItem | undefined {
    if (folder.sidebarLabel === undefined || folder.sidebarId == undefined) {
      return undefined
    }

    const categoryItem: SidebarCategoryItem = {
      type: 'category',
      label: folder.sidebarLabel,
      link: {
        type: 'doc',
        id: `${this.workspace.sidebarBaseId}${folder.sidebarId}`,
      },
      className: 'doxyEllipsis',
      collapsed: true,
      items: [],
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

  /**
   * Creates a sidebar document item for a file.
   *
   * @remarks
   * Generates a simple document sidebar item for individual files
   * with appropriate CSS classes and navigation links. Used for
   * leaf nodes in the file hierarchy sidebar.
   *
   * @param file - The file to create a sidebar item for
   * @returns The sidebar document item or undefined if file lacks data
   */
  private createFileSidebarItem(file: File): SidebarItem | undefined {
    if (file.sidebarLabel === undefined || file.sidebarId === undefined) {
      return undefined
    }

    const docItem: SidebarDocItem = {
      type: 'doc',
      label: file.sidebarLabel,
      className: 'doxyEllipsis',
      id: `${this.workspace.sidebarBaseId}${file.sidebarId}`,
    }
    return docItem
  }

  // --------------------------------------------------------------------------

  override createNavbarItems(): NavbarItem[] {
    const navbarItem: NavbarItem = {
      label: 'Files',
      to: `${this.workspace.menuBaseUrl}files/`,
    }
    return [navbarItem]
  }

  // --------------------------------------------------------------------------

  override async generateIndexDotMdFile(): Promise<void> {
    if (this.topLevelFolders.length === 0 && this.topLevelFiles.length === 0) {
      return
    }

    const filePath = `${this.workspace.outputFolderPath}indices/files/index.md`
    const permalink = 'files'

    const frontMatter: FrontMatter = {
      title: 'Files & Folders',
      slug: `${this.workspace.slugBaseUrl}${permalink}`,
      // description: '...', // TODO
      custom_edit_url: null,
      keywords: ['doxygen', 'files', 'folders', 'reference'],
    }

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

    const lines: string[] = []

    lines.push('The files & folders that contributed content to this site are:')

    lines.push(...this.workspace.renderTreeTableToHtmlLines({ contentLines }))

    if (this.workspace.options.verbose) {
      console.log(`Writing files index file ${filePath}...`)
    }

    await this.workspace.writeOutputMdFile({
      filePath,
      frontMatter,
      bodyLines: lines,
    })
  }

  /**
   * Generates hierarchical index content for folders recursively.
   *
   * @remarks
   * Creates HTML tree table rows for folder hierarchies with proper
   * indentation and folder icons. Processes subfolders first, then
   * files within each folder level to maintain organised structure.
   *
   * @param folder - The folder to generate index content for
   * @param depth - The current depth level in the hierarchy (0-based)
   * @returns Array of HTML strings representing the tree table rows
   */
  private generateIndexMdFileRecursively(
    folder: Folder,
    depth: number
  ): string[] {
    // console.log(util.inspect(folder, { compact: false, depth: 999 }))

    const lines: string[] = []

    const label = this.workspace.renderString(folder.compoundName, 'html')

    const permalink = this.workspace.getPagePermalink(folder.id)
    if (permalink === undefined || permalink.length === 0) {
      // console.log(namespace)
      return []
    }

    let description = ''
    if (
      folder.briefDescriptionHtmlString !== undefined &&
      folder.briefDescriptionHtmlString.length > 0
    ) {
      description = folder.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(
      ...this.workspace.renderTreeTableRowToHtmlLines({
        itemIconClass: 'doxyIconFolder',
        itemLabel: label,
        itemLink: permalink,
        depth,
        description,
      })
    )

    if (folder.children.length > 0) {
      for (const childFileOrFolder of folder.children) {
        if (childFileOrFolder instanceof Folder) {
          lines.push(
            ...this.generateIndexMdFileRecursively(childFileOrFolder, depth + 1)
          )
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

  /**
   * Generates index content for individual files.
   *
   * @remarks
   * Creates HTML tree table rows for file entries with appropriate
   * file icons, labels, and descriptions. Generates consistent
   * formatting for file documentation links within hierarchical
   * index structures.
   *
   * @param file - The file to generate index content for
   * @param depth - The current depth level in the hierarchy (0-based)
   * @returns Array of HTML strings representing the file table row
   */
  private generateFileIndexMd(file: File, depth: number): string[] {
    // console.log(util.inspect(file, { compact: false, depth: 999 }))
    const lines: string[] = []

    const label = this.workspace.renderString(file.compoundName, 'html')

    const permalink = this.workspace.getPagePermalink(file.id, true)
    if (permalink === undefined || permalink.length === 0) {
      return []
    }

    let description = ''
    if (
      file.briefDescriptionHtmlString !== undefined &&
      file.briefDescriptionHtmlString.length > 0
    ) {
      description = file.briefDescriptionHtmlString.replace(/[.]$/, '')
    }

    lines.push('')
    lines.push(
      ...this.workspace.renderTreeTableRowToHtmlLines({
        itemIconClass: 'doxyIconFile',
        itemLabel: label,
        itemLink: permalink,
        depth,
        description,
      })
    )

    return lines
  }

  override isVisibleInSidebar(): boolean {
    for (const [, compound] of this.collectionCompoundsById) {
      if (compound instanceof File && compound.hasAnyContent()) {
        return true
      } else if (compound instanceof Folder && compound.children.length > 0) {
        return true
      }
    }
    console.log('none')
    return false
  }

  override async generatePerInitialsIndexMdFiles(): Promise<void> {
    if (this.topLevelFiles.length === 0) {
      return
    }

    const allUnorderedEntriesMap = new Map<string, TreeEntryBase>()

    for (const [, compound] of this.collectionCompoundsById) {
      if (!(compound instanceof File)) {
        continue
      }

      if (compound.innerCompounds !== undefined) {
        // console.log(
        //   compound.indexName,
        //   Array.from(compound.innerCompounds.keys())
        // )
        const classCompoundDef = compound.innerCompounds.get('innerClasses')
        if (classCompoundDef?.innerClasses !== undefined) {
          for (const innerClass of classCompoundDef.innerClasses) {
            // console.log(innerClass.refid)
            const compoundClass = this.workspace.viewModel.compoundsById.get(
              innerClass.refid
            )
            if (compoundClass instanceof Class) {
              const classEntry = new FileTreeEntry(compoundClass, compound)
              allUnorderedEntriesMap.set(classEntry.id, classEntry)
            }
          }
        }
        const namespaceCompoundDef =
          compound.innerCompounds.get('innerNamespaces')
        if (namespaceCompoundDef?.innerNamespaces !== undefined) {
          for (const innerNamespace of namespaceCompoundDef.innerNamespaces) {
            // console.log(innerNamespace.refid)
            const compoundNamespace =
              this.workspace.viewModel.compoundsById.get(innerNamespace.refid)
            if (compoundNamespace instanceof Namespace) {
              const namespaceEntry = new FileTreeEntry(
                compoundNamespace,
                compound
              )
              allUnorderedEntriesMap.set(namespaceEntry.id, namespaceEntry)
            }
          }
        }
      }

      for (const section of compound.sections) {
        for (const member of section.definitionMembers) {
          const memberEntry = new FileTreeEntry(member, compound)
          allUnorderedEntriesMap.set(memberEntry.id, memberEntry)
          if (member.enumValues !== undefined) {
            for (const enumValue of member.enumValues) {
              const enumValueEntry = new FileTreeEntry(enumValue, compound)
              allUnorderedEntriesMap.set(enumValueEntry.id, enumValueEntry)
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'all',
      title: 'Files Definitions Index',
      description: 'The definitions part of the files are:',
      map: allUnorderedEntriesMap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filter: (kind) => true,
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'classes',
      title: 'Files Classes Index',
      description: 'The classes, structs, unions defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) =>
        kind === 'class' || kind === 'struct' || kind === 'union',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'namespaces',
      title: 'Files Namespaces Index',
      description: 'The namespaces defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'namespace',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'functions',
      title: 'Files Functions Index',
      description: 'The functions defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'function',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'variables',
      title: 'Files Variables Index',
      description: 'The variables defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'variable',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'typedefs',
      title: 'Files Type Definitions Index',
      description: 'The typedefs defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'typedef',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'enums',
      title: 'Files Enums Index',
      description: 'The enums defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enum',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'enumvalues',
      title: 'Files Enum Values Index',
      description: 'The enum values defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'enumvalue',
    })

    await this.generateIndexFile({
      group: 'files',
      fileKind: 'defines',
      title: 'Files Macro Definitions Index',
      description: 'The macros defined in the project are:',
      map: allUnorderedEntriesMap,
      filter: (kind) => kind === 'define',
    })
  }
}

// ----------------------------------------------------------------------------

/**
 * Represents a folder compound for directory documentation.
 *
 * @remarks
 * Manages folder-specific functionality including child file and folder
 * tracking, hierarchy construction, and documentation generation. Provides
 * structured organisation for file system hierarchies within the
 * documentation.
 *
 * @public
 */
export class Folder extends CompoundBase {
  /** Array of child file identifiers contained in this folder. */
  childrenFileIds: string[] = []

  /** Array of child folder identifiers contained in this folder. */
  childrenFolderIds: string[] = []

  /** Relative path from root to this folder. */
  relativePath = ''

  // --------------------------------------------------------------------------

  /**
   * Creates a new Folder instance from compound definition data.
   *
   * @remarks
   * Initialises folder metadata including child file and folder
   * references, display labels, and page titles. Sets up the
   * folder structure for hierarchy construction and documentation
   * generation.
   *
   * @param collection - The parent FilesAndFolders collection
   * @param compoundDef - The Doxygen compound definition for the folder
   */
  constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('folder:', util.inspect(compoundDef))
    // console.log('folder:', compoundDef.compoundName)

    if (Array.isArray(compoundDef.innerDirs)) {
      for (const ref of compoundDef.innerDirs) {
        // console.log(
        //   'component', compoundDef.id, 'has child folder', ref.refid
        // )
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

    const { compoundName } = compoundDef
    this.sidebarLabel = compoundName
    this.indexName = compoundName
    this.treeEntryName = compoundName

    this.pageTitle = `\`${this.sidebarLabel}\` Folder`

    this.createSections()
  }

  /**
   * Determines if the folder has any children worth displaying.
   *
   * @remarks
   * Recursively checks for files or non-empty subfolders to determine
   * if the folder should be included in documentation. Empty folders
   * without content are typically excluded from navigation.
   *
   * @returns True if the folder contains files or non-empty subfolders
   */
  hasChildren(): boolean {
    for (const child of this.children) {
      if (child instanceof File) {
        return true
      } else if (child instanceof Folder && child.hasChildren()) {
        return true
      }
    }

    return false
  }

  override hasAnyContent(): boolean {
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

  /**
   * Renders the complete folder documentation to markdown lines.
   *
   * @remarks
   * Generates the full documentation page including brief descriptions,
   * inner directory and file indices, member sections, and detailed
   * descriptions. Creates structured folder documentation with proper
   * navigation and content organisation.
   *
   * @param frontMatter - The frontmatter configuration for the page
   * @returns Array of markdown strings representing the complete documentation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@dir ${this.collection.workspace.renderString(
      this.relativePath,
      'html'
    )}`

    // The Description header is always shown.
    const morePermalink = '#details'

    lines.push(
      this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        todo: descriptionTodo,
        morePermalink,
      })
    )

    lines.push(
      ...this.renderInnerIndicesToLines({
        suffixes: ['Dirs', 'Files'],
      })
    )

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        todo: descriptionTodo,
        showHeader: true,
        showBrief: !this.hasSect1InDescription,
      })
    )

    lines.push(...this.renderSectionsToLines())

    return lines
  }

  /**
   * Performs late initialisation for folders with content validation.
   *
   * @remarks
   * Validates folder content and conditionally disables sidebar generation for
   * empty folders. This ensures that folders without meaningful documentation
   * do not appear in the generated sidebar navigation.
   *
   * @public
   */
  override initializeLate(): void {
    super.initializeLate()

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.options.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.sidebarId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
  }
}

// ----------------------------------------------------------------------------

/**
 * Represents a file compound for source code documentation.
 *
 * @remarks
 * Manages file-specific functionality including program listings,
 * line number tracking, and source code documentation generation.
 * Provides structured representation of source files within the
 * documentation hierarchy.
 *
 * @public
 */
export class File extends CompoundBase {
  /** Relative path from root to this file. */
  relativePath = ''

  /** Set of line numbers available in the program listing. */
  listingLineNumbers = new Set<number>()

  /** Program listing data for source code display. */
  programListing: ProgramListingDataModel | undefined

  /**
   * Creates a new File instance from compound definition data.
   *
   * @remarks
   * Initialises file metadata including display labels, page titles,
   * and member sections. Sets up the file structure for documentation
   * generation and source code listing display.
   *
   * @param collection - The parent FilesAndFolders collection
   * @param compoundDef - The Doxygen compound definition for the file
   */
  constructor(collection: FilesAndFolders, compoundDef: CompoundDefDataModel) {
    super(collection, compoundDef)

    // console.log('file:', compoundDef.compoundName)

    // The compoundName is the actual file name, without path.
    const { compoundName } = compoundDef
    assert(compoundName.length > 0)
    this.sidebarLabel = compoundName
    this.indexName = compoundName
    this.treeEntryName = compoundName

    this.pageTitle = `\`${this.sidebarLabel}\` File`

    this.createSections()
  }

  /**
   * Performs late initialisation for files with program listing setup.
   *
   * @remarks
   * Processes the program listing for source code rendering and tracks valid
   * line numbers for link validation. Also validates file content and
   * conditionally disables sidebar generation for empty files.
   *
   * @public
   */
  override initializeLate(): void {
    super.initializeLate()

    const compoundDef = this._private._compoundDef
    assert(compoundDef !== undefined)

    const { programListing } = compoundDef
    this.programListing = programListing

    if (this.collection.workspace.options.renderProgramListing) {
      // Keep track of line number, since not all lines referred exist and
      // this might result in broken links.
      if (this.programListing?.codelines !== undefined) {
        for (const codeline of this.programListing.codelines) {
          if (codeline.lineno !== undefined) {
            this.listingLineNumbers.add(codeline.lineno.valueOf())
          }
        }
      }
    }

    // console.log(this)
    if (!this.hasAnyContent()) {
      if (this.collection.workspace.options.debug) {
        console.log(this.kind, this.compoundName, 'has no content, not shown')
      }

      this.sidebarId = undefined
      this.sidebarLabel = undefined
      this.relativePermalink = undefined
    }
  }

  /**
   * Determines if the file has any documentable content.
   *
   * @remarks
   * Checks for children elements, inner compounds, and include relationships
   * to determine content availability. This method helps filter empty files
   * from the generated documentation.
   *
   * @returns True if the file contains documentable content, false otherwise.
   *
   * @public
   */
  override hasAnyContent(): boolean {
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

    // if (this.collection.workspace.options.renderProgramListing) {
    //   if (this.programListing !== undefined) {
    //     return true
    //   }
    // }

    return super.hasAnyContent()
  }

  // --------------------------------------------------------------------------

  /**
   * Renders the file documentation to Markdown lines.
   *
   * @remarks
   * Generates comprehensive file documentation including brief description,
   * includes index, inner compound indices, section indices, detailed
   * description, and optionally the program listing. The output follows
   * Docusaurus conventions for file documentation pages.
   *
   * @param frontMatter - The front matter configuration for the page
   * @returns Array of Markdown lines representing the file documentation
   *
   * @public
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override renderToLines(frontMatter: FrontMatter): string[] {
    const lines: string[] = []

    const descriptionTodo = `@file ${this.collection.workspace.renderString(
      this.relativePath,
      'html'
    )}`

    // The Description header is always shown.
    const morePermalink = '#details'

    lines.push(
      this.renderBriefDescriptionToHtmlString({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        todo: descriptionTodo,
        morePermalink,
      })
    )

    lines.push(...this.renderIncludesIndexToLines())

    lines.push(
      ...this.renderInnerIndicesToLines({
        suffixes: ['Namespaces', 'Classes'],
      })
    )

    lines.push(...this.renderSectionIndicesToLines())

    lines.push(
      ...this.renderDetailedDescriptionToHtmlLines({
        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
        todo: descriptionTodo,
        showHeader: true,
        showBrief: !this.hasSect1InDescription,
      })
    )

    lines.push(...this.renderSectionsToLines())

    if (
      this.programListing !== undefined &&
      this.collection.workspace.options.renderProgramListing
    ) {
      lines.push('')
      lines.push('## File Listing')

      lines.push('')
      lines.push('The file content with the documentation metadata removed is:')

      lines.push(
        ...this.collection.workspace.renderElementToLines(
          this.programListing,
          'html'
        )
      )
    }

    return lines
  }
}

// ----------------------------------------------------------------------------
