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

import { XmlOption } from './doxyfile-xsd-types.js'
import { XmlCompoundElement } from './index-xsd-types.js'
import { XmlCompoundDefElement } from './compound-xsd-types.js'

// ----------------------------------------------------------------------------

// Types mimicking the .xsd definitions.

// Top structure to hold all xml raw data.
export interface XmlRawData {
  version: string
  doxygenindex: XmlCompoundElement[] // from index.xml
  doxygen: XmlCompoundDefElement[] // from `${'@_refid'}.xml`
  doxyfile: XmlOption[] // from Doxyfile.xml
}

// ----------------------------------------------------------------------------
