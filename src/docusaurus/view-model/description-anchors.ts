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

import type { CompoundBase } from './compound-base-vm.js'

// ----------------------------------------------------------------------------

/**
 * Represents an anchor within a description section for cross-referencing.
 *
 * @remarks
 * Used to create navigable links within documentation pages, allowing
 * users to jump to specific sections or content areas within compound
 * descriptions.
 *
 * @public
 */
export class DescriptionAnchor {
  compound: CompoundBase
  id: string

  /**
   * Creates a new description anchor instance.
   *
   * @remarks
   * Associates an anchor identifier with a specific compound to enable
   * targeted navigation within the documentation structure.
   *
   * @param compound - The compound that contains this anchor
   * @param id - Unique identifier for the anchor
   */
  constructor(compound: CompoundBase, id: string) {
    this.compound = compound
    this.id = id
  }
}

// ----------------------------------------------------------------------------

/**
 * Manages a table of contents list for a compound's description.
 *
 * @remarks
 * Organises the hierarchical structure of content within a compound
 * description, providing navigation aids for users browsing complex
 * documentation sections.
 *
 * @public
 */
export class DescriptionTocList {
  compound: CompoundBase
  tocItems: DescriptionTocItem[] = []

  /**
   * Creates a new description table of contents list.
   *
   * @remarks
   * Initialises an empty collection of TOC items for the specified
   * compound, ready to be populated with navigational entries.
   *
   * @param compound - The compound that owns this table of contents
   */
  constructor(compound: CompoundBase) {
    this.compound = compound
  }
}

/**
 * Represents an individual item within a description table of contents.
 *
 * @remarks
 * Each TOC item corresponds to a specific section or anchor within the
 * compound description, providing structured navigation capabilities.
 *
 * @public
 */
export class DescriptionTocItem {
  id: string
  tocList: DescriptionTocList

  /**
   * Creates a new table of contents item.
   *
   * @remarks
   * Links a specific identifier to its parent TOC list, establishing
   * the hierarchical relationship between content sections.
   *
   * @param id - Unique identifier for this TOC item
   * @param tocList - The parent table of contents list
   */
  constructor(id: string, tocList: DescriptionTocList) {
    this.id = id
    this.tocList = tocList
  }
}

// ----------------------------------------------------------------------------
