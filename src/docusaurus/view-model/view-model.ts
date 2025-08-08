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

import assert from 'node:assert'

import { AbstractCompoundDefType } from '../../doxygen/data-model/compounds/compounddef-dm.js'
import {
  TocItemDataModel,
  TocListDataModel,
} from '../../doxygen/data-model/compounds/tableofcontentstype-dm.js'
import { AbstractDataModelBase } from '../../doxygen/data-model/types.js'
import { Workspace } from '../workspace.js'
import { Classes } from './classes-vm.js'
import { CollectionBase } from './collection-base.js'
import { CompoundBase } from './compound-base-vm.js'
import {
  DescriptionAnchor,
  DescriptionTocItem,
  DescriptionTocList,
} from './description-anchors.js'
import { FilesAndFolders } from './files-and-folders-vm.js'
import { Groups } from './groups-vm.js'
import { Member } from './members-vm.js'
import { Namespaces } from './namespaces-vm.js'
import { Pages } from './pages-vm.js'
import {
  AbstractDocAnchorType,
  AbstractDocSectType,
} from '../../doxygen/data-model/compounds/descriptiontype-dm.js'
import { stripPermalinkHexAnchor } from '../utils.js'
import { CliOptions } from '../cli-options.js'

// ----------------------------------------------------------------------------

/**
 * View model that organises data for documentation generation.
 *
 * @remarks
 * The ViewModel class transforms the raw Doxygen data model into structured
 * collections suitable for generating Docusaurus documentation, including
 * classes, files, namespaces, and other compound types. It coordinates the
 * entire view model creation process, from object instantiation through
 * hierarchy establishment to cross-reference resolution.
 *
 * @public
 */
export class ViewModel {
  /** Configuration options controlling the view model behaviour. */
  options: CliOptions

  /** Reference to the parent workspace containing the data model. */
  workspace: Workspace

  /** Map of collection names to their corresponding collection objects. */
  // The key is one of the above collection names.
  // groups, classes, namespaces, files, pages.
  collections: Map<string, CollectionBase>

  /** Map of compound identifiers to their view model objects. */
  // View model objects.
  compoundsById = new Map<string, CompoundBase>()

  /** Map of member identifiers to their view model objects. */
  membersById = new Map<string, Member>()

  /** Array of description table of contents lists for navigation. */
  descriptionTocLists: DescriptionTocList[] = []

  /** Map of TOC item identifiers to their corresponding objects. */
  descriptionTocItemsById = new Map<string, DescriptionTocItem>()

  /** Map of description anchor identifiers to their objects. */
  descriptionAnchorsById = new Map<string, DescriptionAnchor>()

  /**
   * Constructs a new ViewModel instance.
   *
   * @remarks
   * Initialises the view model with a reference to the parent workspace
   * and sets up the collection mapping structure. This constructor prepares
   * the foundation for transforming raw Doxygen data into organised
   * documentation structures suitable for Docusaurus generation.
   *
   * @param workspace - The parent workspace containing the data model.
   */
  constructor(workspace: Workspace) {
    this.workspace = workspace
    this.options = workspace.options

    this.collections = new Map()
  }

  /**
   * Creates and populates all view model collections and objects.
   *
   * @remarks
   * Orchestrates the complete view model creation process including
   * collection instantiation, object creation, and hierarchy establishment.
   * This method coordinates all phases of view model construction to ensure
   * proper dependencies and cross-references are established between
   * documentation elements.
   */
  create() {
    this.collections.set('groups', new Groups(this.workspace))
    this.collections.set('namespaces', new Namespaces(this.workspace))
    this.collections.set('classes', new Classes(this.workspace))
    this.collections.set('files', new FilesAndFolders(this.workspace))
    this.collections.set('pages', new Pages(this.workspace))

    this.createVieModelObjects()
    this.createCompoundsHierarchies()

    this.createMembersMap()

    this.initializeCompoundsLate()
    this.initializeMemberLate()

    this.validatePermalinks()

    this.cleanups()
  }

  // --------------------------------------------------------------------------

  /**
   * Creates view model objects from the parsed Doxygen compound definitions.
   *
   * @remarks
   * Iterates through all compound definitions from the data model and creates
   * corresponding view model objects, organising them into appropriate
   * collections and establishing identifier mappings. This method also
   * processes detailed descriptions to extract navigation elements and
   * cross-reference anchors for comprehensive documentation structure.
   */
  createVieModelObjects(): void {
    console.log('Creating view model objects...')
    for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
      let compound: CompoundBase | undefined = undefined
      const { kind } = compoundDefDataModel

      const collectionName: string | undefined =
        this.workspace.collectionNamesByKind[kind]
      const collection = this.collections.get(collectionName)
      if (collection !== undefined) {
        // Create the compound object and add it to the parent collection.
        // console.log(
        //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
        // )
        compound = collection.addChild(compoundDefDataModel)
        // Also add it to the global compounds map.
        this.compoundsById.set(compound.id, compound)
        // console.log('compoundsById.set', compound.kind, compound.id)
      }

      if (compound !== undefined) {
        if (
          compoundDefDataModel instanceof AbstractCompoundDefType &&
          compoundDefDataModel.detailedDescription !== undefined
        ) {
          this.findDescriptionIdsRecursively(
            compound,
            compoundDefDataModel.detailedDescription
          )
        }
      } else {
        // console.error(
        //   util.inspect(compoundDefDataModel, { compact: false, depth: 999 })
        // )
        console.error(
          'compoundDefDataModel',
          compoundDefDataModel.kind,
          'not implemented yet in',
          this.constructor.name,
          'createVieModelObjects'
        )
      }
    }
    if (this.options.verbose) {
      console.log(this.compoundsById.size, 'compound definitions')
    }
    // console.log(this.descriptionTocLists)
  }

  /**
   * Recursively finds and processes description identifiers within elements.
   *
   * @remarks
   * Traverses the element hierarchy to locate table of contents items,
   * document sections, and anchors, creating appropriate view model
   * structures for navigation and cross-referencing. This recursive processing
   * ensures comprehensive extraction of all navigational elements from
   * complex documentation structures.
   *
   * @param compound - The compound containing the description elements.
   * @param element - The data model element to process recursively.
   */
  findDescriptionIdsRecursively(
    compound: CompoundBase,
    element: AbstractDataModelBase
  ): void {
    // console.log(compound.id, typeof element)
    if (element.children === undefined) {
      return
    }

    for (const childDataModel of element.children) {
      if (childDataModel instanceof TocListDataModel) {
        const tocList = new DescriptionTocList(compound)
        // console.log(elementChild)
        assert(childDataModel.tocItems !== undefined)
        for (const tocItemDataModel of childDataModel.tocItems) {
          if (tocItemDataModel instanceof TocItemDataModel) {
            const tocItem = new DescriptionTocItem(tocItemDataModel.id, tocList)
            tocList.tocItems.push(tocItem)
            this.descriptionTocItemsById.set(tocItem.id, tocItem)
          }
        }
        this.descriptionTocLists.push(tocList)
      } else if (childDataModel instanceof AbstractDocSectType) {
        if (childDataModel.id !== undefined) {
          const anchor = new DescriptionAnchor(compound, childDataModel.id)
          this.descriptionAnchorsById.set(anchor.id, anchor)
        }
        this.findDescriptionIdsRecursively(compound, childDataModel)
      } else if (childDataModel instanceof AbstractDocAnchorType) {
        // console.log(childDataModel)
        if (childDataModel.id.length > 0) {
          const section = new DescriptionAnchor(compound, childDataModel.id)
          this.descriptionAnchorsById.set(section.id, section)
        }
      } else if (childDataModel instanceof AbstractDataModelBase) {
        // if (childDataModel instanceof AbstractDocEntryType) {
        //   console.log(childDataModel)
        // }
        this.findDescriptionIdsRecursively(compound, childDataModel)
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Establishes hierarchical relationships between compound objects.
   *
   * @remarks
   * Delegates to each collection to create parent-child relationships
   * and other hierarchical structures within the compound objects. This
   * phase is essential for building proper navigation trees and inheritance
   * relationships that reflect the original code structure.
   */
  createCompoundsHierarchies(): void {
    console.log('Creating compounds hierarchies...')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.collections) {
      // console.log('createHierarchies:', collectionName)
      collection.createCompoundsHierarchies()
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Performs late initialisation of compound objects.
   *
   * @remarks
   * Executes initialisation tasks that require all objects to be created
   * first, allowing for proper cross-reference resolution and relationship
   * establishment between compounds. This phase ensures that complex
   * inter-compound dependencies are properly resolved after the initial
   * object creation phase.
   */
  // Required since references can be resolved only after all objects are in.
  initializeCompoundsLate(): void {
    console.log('Performing compounds late initializations...')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [collectionName, collection] of this.collections) {
      // console.log('createHierarchies:', collectionName)
      for (const [, compound] of collection.collectionCompoundsById) {
        if (this.options.debug) {
          console.log(compound.kind, compound.compoundName)
        }
        compound.initializeLate()
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Creates a comprehensive map of all member definitions.
   *
   * @remarks
   * Iterates through all compounds and their sections to build a complete
   * mapping of member identifiers to their objects, enabling efficient
   * member lookup and cross-referencing. This method handles member
   * deduplication and ensures that members are properly associated with
   * their containing compounds.
   */
  createMembersMap(): void {
    console.log('Creating member definitions map...')
    for (const [, compound] of this.compoundsById) {
      // console.log(compound.kind, compound.compoundName, compound.id)
      for (const section of compound.sections) {
        // console.log('  ', sectionDef.kind)
        for (const member of section.indexMembers) {
          if (member instanceof Member) {
            const memberCompoundId = stripPermalinkHexAnchor(member.id)
            if (memberCompoundId !== compound.id) {
              // Skip member definitions from different compounds.
              // Hopefully they are defined properly there.
              // console.log(
              //   'member from another compound', compoundId, 'skipped'
              // )
            } else {
              // console.log('    ', memberDef.kind, memberDef.id)

              if (this.membersById.has(member.id)) {
                if (this.options.verbose) {
                  console.warn(
                    'member already in map',
                    member.id,
                    'in',
                    this.membersById.get(member.id)?.name
                  )
                }
              } else {
                this.membersById.set(member.id, member)
              }
            }
          }
        }
      }
    }
    if (this.options.verbose) {
      console.log(this.membersById.size, 'member definitions')
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Performs late initialisation of member objects.
   *
   * @remarks
   * Executes member initialisation tasks that depend on all objects being
   * created, ensuring proper cross-references and relationships are
   * established between members and their containing compounds. This phase
   * completes the member setup process after all structural relationships
   * have been established.
   */
  // Required since references can be resolved only after all objects are in.
  initializeMemberLate(): void {
    console.log('Performing members late initializations...')
    for (const [, compound] of this.compoundsById) {
      if (this.options.debug) {
        console.log(compound.kind, compound.compoundName, compound.id)
      }
      for (const section of compound.sections) {
        section.initializeLate()

        if (this.options.debug) {
          console.log('  ', section.kind)
        }
        for (const member of section.indexMembers) {
          if (member instanceof Member) {
            if (this.options.debug) {
              console.log('    ', member.kind, member.id)
            }
            member.initializeLate()
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Validates and resolves permalink uniqueness across all compounds.
   *
   * @remarks
   * Ensures that all generated permalinks are unique by detecting conflicts
   * and automatically appending suffixes to duplicate permalinks, maintaining
   * proper navigation and linking functionality. This validation process is
   * crucial for preventing URL conflicts in the generated documentation site.
   */
  /**
   * @brief Validate the uniqueness of permalinks.
   */
  validatePermalinks(): void {
    console.log('Validating permalinks...')

    const pagePermalinksById = new Map<string, string>()
    const compoundsByPermalink = new Map<string, Map<string, CompoundBase>>()

    for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
      // console.log(
      //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
      // )
      const { id } = compoundDefDataModel
      if (pagePermalinksById.has(id)) {
        console.warn('Duplicate id', id)
      }

      const compound: CompoundBase | undefined = this.compoundsById.get(id)
      if (compound === undefined) {
        console.error(
          'compoundDefDataModel',
          id,
          'not yet processed in',
          this.constructor.name,
          'validatePermalinks'
        )
        continue
      }

      const permalink = compound.relativePermalink
      if (permalink !== undefined) {
        // console.log('permalink:', permalink)
        let compoundsMap = compoundsByPermalink.get(permalink)
        if (compoundsMap === undefined) {
          compoundsMap = new Map()
          compoundsByPermalink.set(permalink, compoundsMap)
        }
        pagePermalinksById.set(id, permalink)
        if (!compoundsMap.has(compound.id)) {
          compoundsMap.set(compound.id, compound)
        }
      }
    }

    for (const [permalink, compoundsMap] of compoundsByPermalink) {
      if (compoundsMap.size > 1) {
        if (this.options.verbose) {
          console.warn(
            'Permalink',
            permalink,
            'has',
            compoundsMap.size,
            'occurrences:'
          )
        }
        let count = 1
        for (const [, compound] of compoundsMap) {
          const suffix = `-${count.toString()}`
          count += 1
          assert(compound.relativePermalink !== undefined)
          compound.relativePermalink += suffix
          assert(compound.sidebarId !== undefined)
          compound.sidebarId += suffix

          if (this.options.verbose) {
            console.warn('-', compound.relativePermalink, compound.id)
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Performs cleanup operations on view model objects.
   *
   * @remarks
   * Removes references to the original compound definition data models
   * to free memory and prevent potential circular references after
   * the view model creation is complete. This cleanup phase optimises
   * memory usage by removing unnecessary data model references that
   * are no longer needed for documentation generation.
   */
  cleanups(): void {
    for (const [, compound] of this.compoundsById) {
      compound._private._compoundDef = undefined
    }
  }
}

// ----------------------------------------------------------------------------
