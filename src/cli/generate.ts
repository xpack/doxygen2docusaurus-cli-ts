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

import * as fs from 'node:fs'
import * as util from 'node:util'

import { defaultOptions } from '../options/defaults.js'
import { parseXmlAll } from '../xml-parser/parse.js'
import type { XmlRawData } from '../xml-parser/types.js'
import { DataModel } from '../data-model/data-model.js'

export async function generateDoxygen (context: any, options: any): Promise<number> {
  // console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log(`options: ${util.inspect(options)}`)

  // Merge with the defaults.
  const actualOptions = {
    ...defaultOptions,
    ...options
  }
  console.log('options:', util.inspect(actualOptions))

  // Create output folder if it doesn't exist.
  if (!fs.existsSync(actualOptions.outputFolderPath)) {
    fs.mkdirSync(actualOptions.outputFolderPath, { recursive: true })
  }

  const xmlRawData: XmlRawData = await parseXmlAll({ folderPath: actualOptions.doxygenXmlInputFolderPath })
  // console.log('xmlRawData: ', util.inspect(xmlRawData))

  const dataModel = new DataModel(xmlRawData)
  // console.log(util.inspect(dataModel))

  console.log('more generateDoxygen() to come...')

  return 0
}

// ----------------------------------------------------------------------------
