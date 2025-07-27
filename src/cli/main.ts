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
import * as path from 'node:path'
import * as util from 'node:util'

// https://www.npmjs.com/package/commander
import { CliOptions } from '../docusaurus/options.js'
import { formatDuration } from '../docusaurus/utils.js'
import type { DataModel } from '../doxygen/data-model/types.js'
import { DoxygenXmlParser } from '../doxygen/doxygen-xml-parser.js'
import { DocusaurusGenerator } from '../docusaurus/generator.js'

// ----------------------------------------------------------------------------

/**
 * Main entry point for the doxygen2docusaurus CLI tool.
 *
 * @param argv - Command line arguments array
 * @returns Promise that resolves to the exit code (0 for success, 1 for error)
 *
 * @public
 */
export async function main(argv: string[]): Promise<number> {
  const startTime = Date.now()

  let commandLine: string = path.basename(argv[1] ?? 'doxygen2docusaurus')
  if (argv.length > 2) {
    commandLine += ` ${argv.slice(2).join(' ')}`
  }

  console.log(`Running '${commandLine}'...`)

  const options = new CliOptions(argv)
  await options.parse()

  let exitCode = 0

  console.log()

  try {
    const dataModel: DataModel = await parseDoxygen({ options })

    exitCode = await generateDocusaurusMd({
      dataModel,
      options,
    })
  } catch (err) {
    console.error(err)
    exitCode = 1
  }

  const durationString = formatDuration(Date.now() - startTime)

  if (exitCode === 0) {
    console.log()
    console.log(
      `Running '${commandLine}' has completed successfully ` +
        `in ${durationString}.`
    )
  }

  return exitCode
}

/**
 * Parses Doxygen XML files and creates a data model.
 *
 * @public
 * @param options - Configuration options for parsing
 * @returns Promise that resolves to the parsed data model
 */
export async function parseDoxygen({
  options,
}: {
  options: CliOptions
}): Promise<DataModel> {
  // console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log('options:', util.inspect(options))

  if (options.verbose) {
    console.log()
    console.log('pluginOptions:', util.inspect(options))
  }

  assert(
    options.doxygenXmlInputFolderPath.length > 0,
    'doxygenXmlInputFolderPath is required'
  )

  assert(options.docsFolderPath.length > 0, 'docsFolderPath is required')
  assert(options.apiFolderPath.length > 0, 'apiFolderPath is required')

  assert(options.docsBaseUrl.length > 0, 'docsBaseUrl is required')
  // assert(options.apiBaseUrl.length > 0, 'apiBaseUrl is required')

  assert(
    options.sidebarCategoryFilePath.length > 0,
    'sidebarCategoryFilePath is required'
  )
  assert(
    options.menuDropdownFilePath.length > 0,
    'menuDropdownFilePath is required'
  )

  console.log()
  const xmlParser = new DoxygenXmlParser({
    options,
  })

  const dataModel: DataModel = await xmlParser.parse()
  // console.log('doxygenData:', util.inspect(doxygenData))

  return dataModel
}

/**
 * Generates Docusaurus markdown files from the parsed data model.
 *
 * @public
 * @param dataModel - The parsed Doxygen data model
 * @param options - Configuration options for generation
 * @returns Promise that resolves to the exit code (0 for success)
 */
export async function generateDocusaurusMd({
  dataModel,
  options,
}: {
  dataModel: DataModel
  options: CliOptions
}): Promise<number> {
  const docusaurus = new DocusaurusGenerator({
    dataModel,
    options,
  })
  await docusaurus.generate()

  return 0
}

// ----------------------------------------------------------------------------
