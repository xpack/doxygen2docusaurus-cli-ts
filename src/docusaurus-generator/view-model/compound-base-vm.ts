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

// ----------------------------------------------------------------------------

export abstract class CompoundBase {
  compoundDef: CompoundDefDataModel

  parentId?: string | undefined
  childrenIds: string[] = []

  /** Relative path to the output folder, starts with plural kind. */
  docusaurusId: string = ''

  /** Short name, to fit the limited space. */
  sidebarLabel: string = ''

  /** The part below outputFolderPath, no slash. */
  relativePermalink: string | undefined

  /** The name to be shown in the index section. */
  indexName: string = ''

  /** The name shown in the page title. */
  pageTitle: string = ''

  constructor (compoundDef: CompoundDefDataModel) {
    this.compoundDef = compoundDef
  }
}

// ----------------------------------------------------------------------------
