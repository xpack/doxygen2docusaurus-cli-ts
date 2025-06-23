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

import { CompoundBase } from './compound-base-vm.js'

// ----------------------------------------------------------------------------

export class DescriptionAnchor {
  compound: CompoundBase
  id: string

  constructor (compound: CompoundBase, id: string) {
    this.compound = compound
    this.id = id
  }
}

// ----------------------------------------------------------------------------

export class DescriptionTocList {
  compound: CompoundBase
  tocItems: DescriptionTocItem[] = []

  constructor (compound: CompoundBase) {
    this.compound = compound
  }
}

export class DescriptionTocItem {
  id: string
  tocList: DescriptionTocList

  constructor (id: string, tocList: DescriptionTocList) {
    this.id = id
    this.tocList = tocList
  }
}

// ----------------------------------------------------------------------------
