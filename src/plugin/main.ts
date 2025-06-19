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

import assert from 'node:assert'
import * as util from 'node:util'

import { DoxygenXmlParser } from '../data-model/doxygen-xml-parser.js'
import { DataModel } from '../data-model/types.js'
import { PluginOptions } from './options.js'
import { DocusaurusGenerator } from '../docusaurus-generator/generator.js'

// ----------------------------------------------------------------------------

export async function parseDoxygen ({
  options
}: {
  options: PluginOptions
}): Promise<DataModel> {
  // console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log('options:', util.inspect(options))

  if (options.verbose) {
    console.log()
    console.log('pluginOptions:', util.inspect(options))
  }

  assert(options.doxygenXmlInputFolderPath.length > 0, 'doxygenXmlInputFolderPath is required')

  assert(options.docsFolderPath.length > 0, 'docsFolderPath is required')
  assert(options.apiFolderPath.length > 0, 'apiFolderPath is required')

  assert(options.docsBaseUrl.length > 0, 'docsBaseUrl is required')
  assert(options.apiBaseUrl.length > 0, 'apiBaseUrl is required')

  assert(options.sidebarCategoryFilePath.length > 0, 'sidebarCategoryFilePath is required')
  assert(options.menuDropdownFilePath.length > 0, 'menuDropdownFilePath is required')

  console.log()
  const xml = new DoxygenXmlParser({
    verbose: options.verbose
  })

  const dataModel: DataModel = await xml.parse({ folderPath: options.doxygenXmlInputFolderPath })
  // console.log('doxygenData:', util.inspect(doxygenData))

  return dataModel
}

export async function generateDocusaurusMd ({
  dataModel,
  options,
  siteConfig,
  pluginActions = undefined
}: {
  dataModel: DataModel
  options: PluginOptions
  siteConfig: any
  pluginActions?: any
}): Promise<number> {
  const docs = new DocusaurusGenerator({
    dataModel,
    pluginOptions: options,
    siteConfig,
    pluginActions
  })
  await docs.generate()

  return 0
}

// ----------------------------------------------------------------------------
