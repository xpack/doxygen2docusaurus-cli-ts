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

import { XmlRawData } from '../xml-parser/types.js'
import { Group, Groups } from './groups.js'

export class DataModel {
  groups = new Groups()

  constructor(rawData: XmlRawData) {
    for (const item of rawData.doxygen) {
      if (item[':@']['@_kind'] === 'group') {
        this.groups.add(item[':@']['@_id'], new Group(item))
      }
    }

    this.groups.createHierarchies()
    this.groups.computePermalinks()
  }
}

// ----------------------------------------------------------------------------
