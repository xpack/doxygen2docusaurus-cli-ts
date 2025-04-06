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

import { defaultOptions, PluginOptions } from '../options.js'
import { DoxygenData, DoxygenXmlParser } from '../../doxygen-xml-parser/index.js'
import { DocusaurusGenerator } from '../../docusaurus-generator/index.js'
import assert from 'node:assert'

export async function generateDoxygen (context: any, options: PluginOptions): Promise<number> {
  // console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log(`options: ${util.inspect(options)}`)

  // Merge with the defaults.
  const actualOptions = {
    ...defaultOptions,
    ...options
  }
  console.log('options:', util.inspect(actualOptions))

  assert(actualOptions?.doxygenXmlInputFolderPath !== undefined && actualOptions?.doxygenXmlInputFolderPath?.length > 0, 'doxygenXmlInputFolderPath is required')

  assert(actualOptions.outputFolderPath !== undefined && actualOptions.outputFolderPath.length > 0, 'outputFolderPath is required')

  const xml = new DoxygenXmlParser()
  const doxygenData: DoxygenData = await xml.parse({ folderPath: actualOptions.doxygenXmlInputFolderPath })
  // console.log('doxygenData:', util.inspect(doxygenData))
  const docs = new DocusaurusGenerator({ doxygenData, pluginOptions: actualOptions })
  await docs.generate()

  console.log(`${actualOptions.outputFolderPath} done.`)

  return 0
}

// ----------------------------------------------------------------------------
