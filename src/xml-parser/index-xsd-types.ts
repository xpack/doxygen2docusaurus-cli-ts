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

import { XmlProlog, XmlTopElementAttributes, XmlCompoundAttributes } from './common-types.js'

// ----------------------------------------------------------------------------
// index.xsd

export type XmlDoxygenIndexParsed = [XmlProlog, XmlDoxygenIndexElement]

export interface XmlDoxygenIndexElement extends XmlTopElementAttributes {
  doxygenindex: XmlCompoundElement[]
}

export type XmlCompoundChildren = XmlNameElement | XmlMemberElement
export interface XmlCompoundElement extends XmlCompoundAttributes {
  compound: XmlCompoundChildren[]
}

export interface XmlNameElement {
  name: {
    '#text': string
  }
}

export interface XmlMemberElement extends XmlCompoundAttributes {
  member: XmlNameElement[]
}

// ----------------------------------------------------------------------------
