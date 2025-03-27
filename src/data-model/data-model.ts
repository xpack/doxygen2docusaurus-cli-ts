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
import { Class, Classes } from './class.js'
import { Files, File } from './files.js'
import { Folder, Folders } from './folders.js'
import { Group, Groups } from './groups.js'
import { Namespace, Namespaces } from './namespace.js'

export class DataModel {
  groups = new Groups()
  namespaces = new Namespaces()
  folders = new Folders()
  files = new Files(this.folders)
  classes = new Classes()

  constructor (rawData: XmlRawData) {
    console.log('Processing components...')
    for (const item of rawData.doxygen) {
      if (item[':@']['@_kind'] === 'group') {
        this.groups.add(item[':@']['@_id'], new Group(item))
      } else if (item[':@']['@_kind'] === 'namespace') {
        this.namespaces.add(item[':@']['@_id'], new Namespace(item))
      } else if (item[':@']['@_kind'] === 'dir') {
        this.folders.add(item[':@']['@_id'], new Folder(item))
      } else if (item[':@']['@_kind'] === 'file') {
        this.files.add(item[':@']['@_id'], new File(item))
      } else if (item[':@']['@_kind'] === 'class') {
        this.classes.add(item[':@']['@_id'], new Class(item))
      } else {
        console.log(`compounddef kind '${item[':@']['@_kind']}' not yet implemented`)
      }
    }

    this.groups.createHierarchies()
    this.namespaces.createHierarchies()
    this.folders.createHierarchies()
    this.files.createHierarchies()
    this.classes.createHierarchies()

    console.log('Permalinks...')
    this.groups.computePermalinks()
    this.namespaces.computePermalinks()
    this.folders.computePermalinks()
    this.files.computePermalinks()
    this.classes.computePermalinks()
  }
}

// ----------------------------------------------------------------------------
