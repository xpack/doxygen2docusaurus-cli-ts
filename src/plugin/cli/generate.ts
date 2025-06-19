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

import { DataModel } from '../../data-model/types.js'
import { generateDocusaurusMd, parseDoxygen } from '../main.js'
import { PluginOptions } from '../options.js'
import { pluginName } from '../docusaurus.js'

// ----------------------------------------------------------------------------

export async function generateDoxygen (context: any, pluginOptions: PluginOptions, cliOptions: any): Promise<number> {
  // console.log('generateDoxygen()')
  // console.log('context:', util.inspect(context))
  // console.log('pluginOptions:', util.inspect(pluginOptions))

  let options = pluginOptions

  if (cliOptions?.id !== undefined) {
    let found = false
    for (const plugin of context.siteConfig.plugins) {
      if (Array.isArray(plugin)) {
        if (plugin[0] === pluginName) {
          const configPluginOptions = plugin[1]
          if (configPluginOptions.id === cliOptions?.id) {
            options = configPluginOptions
            found = true
            break
          }
        }
      }
    }
    if (!found) {
      console.error(`'--id ${cliOptions.id as string}' not found in docusaurus.config.ts`)
      return -1
    }
  }

  const dataModel: DataModel = await parseDoxygen({ options })

  const exitCode = await generateDocusaurusMd({
    dataModel,
    options,
    siteConfig: context.siteConfig
  })

  return exitCode
}

// ----------------------------------------------------------------------------
