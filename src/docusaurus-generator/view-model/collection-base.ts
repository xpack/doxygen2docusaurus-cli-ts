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
import { MenuItem, SidebarItem } from '../../plugin/types.js'
import { CompoundBase } from './compound-base-vm.js'

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
  abstract createSidebarItems (): SidebarItem[]
  abstract createMenuItems (): MenuItem[]
  abstract generateIndexDotMdFile (): Promise<void>

  async generatePerInitialsIndexMdFiles (): Promise<void> {
    // Nothing at this level. Override it where needed.
  }

  hasCompounds (): boolean {
    return this.collectionCompoundsById.size > 0
  }
}

// ----------------------------------------------------------------------------
