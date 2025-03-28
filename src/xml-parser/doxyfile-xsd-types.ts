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

import { XmlProlog, XmlTopElementAttributes } from './common-types.js'

// ----------------------------------------------------------------------------
// doxyfile.xsd

export type XmlDoxygenFileParsed = [XmlProlog, XmlDoxygenFile]

export interface XmlDoxygenFile extends XmlTopElementAttributes {
  doxyfile: XmlOption[]
}

export interface XmlOption {
  value: XmlOptionValueType[]
  '@_id': string
  '@_default': 'yes' | 'no'
  '@_type': XmlOptionValueType
}

export type XmlOptionValueType = 'int' | 'bool' | 'string' | 'stringlist'

// ----------------------------------------------------------------------------
