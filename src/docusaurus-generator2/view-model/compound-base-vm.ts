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

import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { FrontMatter } from '../../docusaurus-generator/types.js'

// ----------------------------------------------------------------------------

export abstract class CompoundBase {
  // Reference to the data model object.
  compoundDef: CompoundDefDataModel

  // Not used for classes, see Class.baseClasses.
  parent?: CompoundBase

  // Set in 2 steps, first the Ids and then, when all objects are in, the references.
  // Folder objects use separate arrays for files and folders children.
  childrenIds: string[] = []
  children: CompoundBase[] = []

  /** Relative path to the output folder, starts with plural kind. */
  docusaurusId: string = ''

  /** Short name, to fit the limited space in the sidebar. */
  sidebarLabel: string = ''

  /** The part below outputFolderPath, no leading slash. */
  relativePermalink: string | undefined

  /** The name shown in the index section. */
  indexName: string = ''

  /** The name shown in the page title. */
  pageTitle: string = ''

  constructor (compoundDef: CompoundDefDataModel) {
    this.compoundDef = compoundDef
  }

  // --------------------------------------------------------------------------

  abstract renderToMdxLines (frontMatter: FrontMatter): string[]
}

// ----------------------------------------------------------------------------
