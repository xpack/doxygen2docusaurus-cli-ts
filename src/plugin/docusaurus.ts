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

import { DataModel } from '../data-model/types.js'
import { generateDoxygen } from './cli/generate.js'
import { defaultOptions, PluginOptions } from './options.js'
import { generateDocusaurusMdx, parseDoxygen } from './main.js'

// ----------------------------------------------------------------------------
// The Docusaurus plugin entry point.

export const pluginName: string = '@xpack/docusaurus-plugin-doxygen'

export default async function pluginDocusaurus (
  context: any,
  options: PluginOptions // The options in docusaurus.config.ts
): Promise<any> {
  // console.log(util.inspect(context, { compact: false, depth: 999 }))
  // console.log('in options', options)

  // Merge with the defaults.
  const actualOptions: PluginOptions = {
    ...defaultOptions,
    ...options
  }

  if (actualOptions.verbose) {
    console.log()
    if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
      console.log(`${pluginName}: instance '${actualOptions.id}' starting...`)
    } else {
      console.log(`${pluginName}: starting...`)
    }
    // console.log()
    // console.log('pluginOptions:', actualOptions)
  }

  return {
    name: pluginName,

    // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
    // Fetch from data sources. The return value is the content it needs.
    // It is called for each plugin instance (in parallel).
    async loadContent () {
      if (actualOptions.verbose) {
        console.log()
        if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
          console.log(`${pluginName}: instance '${actualOptions.id}' loading content...`)
        } else {
          console.log(`${pluginName}: loading content...`)
        }
      }

      let dataModel: DataModel = {
        compoundDefs: []
      }

      if (actualOptions.runOnStart) {
        dataModel = await parseDoxygen({ options: actualOptions })
        await generateDocusaurusMdx({
          dataModel,
          options: actualOptions,
          siteConfig: context.siteConfig
        })

        if (actualOptions.verbose) {
          console.log()
          if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
            console.log(`${pluginName}: instance '${actualOptions.id}' done.`)
          } else {
            console.log(`${pluginName}: done.`)
          }
        }
      }

      return dataModel
    },

    // The return value of `loadContent()` will be passed to
    // `contentLoaded()` as `content`.
    async contentLoaded ({
      content,
      actions
    }: {
      content: DataModel
      actions: any
    }) {
      // console.log('docusaurus-plugin-doxygen: contentLoaded()')
    },

    // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
    extendCli (cli: any) {
      cli
        .command('generate-doxygen')
        .option('--id <string>', 'Specify the plugin instance')
        .description(
          '[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.'
        )
        .action(async (cliOptions: any) => {
          console.log()
          console.log('Running docusaurus generate-doxygen...')
          const exitCode = await generateDoxygen(context, actualOptions, cliOptions)
          console.log()
          console.log('Running docusaurus generate-doxygen done.')
          return exitCode
        })
    }
  }
}

// ----------------------------------------------------------------------------
