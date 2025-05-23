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
import type { LoadContext } from '@docusaurus/types'

// ----------------------------------------------------------------------------
// The Docusaurus plugin entry point.

export const pluginName: string = '@xpack/docusaurus-plugin-doxygen'

export default async function pluginDocusaurus (
  context: LoadContext,
  options: PluginOptions // The user options in docusaurus.config.ts
): Promise<any> {
  // console.log(util.inspect(context, { compact: false, depth: 999 }))

  // Already merged with the defaults in validateOptions.
  const actualOptions = options

  if (actualOptions.verbose) {
    console.log()
    if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
      console.log(`${pluginName}: instance '${actualOptions.id}' starting...`)
    } else {
      console.log(`${pluginName}: starting...`)
    }
  }

  // It is not possible to run the actions here, since this is executed even
  // for CLI commands, when it is not necessary.

  return {
    name: pluginName,

    // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
    async loadContent () {
      if (actualOptions.runOnStart) {
        const dataModel: DataModel = await parseDoxygen({ options: actualOptions })

        await generateDocusaurusMdx({
          dataModel,
          options: actualOptions,
          siteConfig: context.siteConfig
        })

        if (actualOptions.verbose) {
          console.log()
          if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
            console.log(`${pluginName}: instance '${actualOptions.id}' generation of docs completed.`)
          } else {
            console.log(`${pluginName}: generation of docs completed.`)
          }
        }
        return { dataModel }
      }
      return undefined
    },

    // No need for contentLoaded().

    // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
    extendCli (cli: any) {
      extendCliGenerateDoxygen(cli, context, options)
    }
  }
}

export function extendCliGenerateDoxygen (cli: any, context: LoadContext, options: PluginOptions): void {
  cli
    .command('generate-doxygen')
    .option('--id <string>', 'Specify the plugin instance')
    .description(
      '[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.'
    )
    .action(async (cliOptions: any) => {
      console.log()
      console.log('Running \'docusaurus generate-doxygen\'...')
      const exitCode = await generateDoxygen(context, options, cliOptions)
      console.log()
      console.log('Running \'docusaurus generate-doxygen\' has completed successfully.')
      return exitCode
    })
}

export function validateOptions ({
  validate,
  options: userOptions
}: {
  validate: any
  options: PluginOptions
}): PluginOptions {
  // Currently only add defaults.
  // TODO: validate.
  return {
    ...defaultOptions,
    ...userOptions
  }
}

// ----------------------------------------------------------------------------
