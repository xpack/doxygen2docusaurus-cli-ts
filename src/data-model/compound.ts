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

import assert from 'assert'
// import * as util from 'node:util'

import type { XmlCompoundDef, XmlCompoundName } from '../xml-parser/types.js'

// ----------------------------------------------------------------------------

export class Compound {
  id: string
  kind: string
  name: string = ''
  commonElements = ['compoundname', 'briefdescription', 'detaileddescription']

  constructor (xmlCompoundDef: XmlCompoundDef) {
    // console.log(util.inspect(xmlCompoundDef))

    this.id = xmlCompoundDef[':@']['@_id']
    this.kind = xmlCompoundDef[':@']['@_kind']
    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'compoundname') === true) {
        this.name = (item as XmlCompoundName).compoundname[0]['#text']
        break
      }
    }
    assert(this.name)

    this.detailedDescription = '' // xmlCompoundDef.detaileddescription
  }
}

// ----------------------------------------------------------------------------
