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

import { XmlCompoundDefElement } from '../xml-parser/compound-xsd-types.js'
import { xml, XmlRawData } from '../xml-parser/parse.js'
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
    for (const element of rawData.doxygen) {
      // console.log(util.inspect(element))
      if (xml.hasInnerText(element)) {
        // Ignore top texts.
      } else if (xml.hasAttributes(element)) {
        const kind = xml.getAttributeStringValue(element, '@_kind')
        const id = xml.getAttributeStringValue(element, '@_id')
        const compoundDefElement = element as XmlCompoundDefElement
        if (kind === 'group') {
          this.groups.add(id, new Group(compoundDefElement))
        } else if (kind === 'namespace') {
          this.namespaces.add(id, new Namespace(compoundDefElement))
        } else if (kind === 'dir') {
          this.folders.add(id, new Folder(compoundDefElement))
        } else if (kind === 'file') {
          this.files.add(id, new File(compoundDefElement))
        } else if (kind === 'class') {
          this.classes.add(id, new Class(compoundDefElement))
        } else {
          console.error(`compounddef kind: ${kind} not yet implemented`)
        }
      } else {
        console.error(util.inspect(element))
        console.error('doxygen element:', Object.keys(element), 'not processed')
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
