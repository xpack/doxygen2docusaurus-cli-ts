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
import { generateDocusaurusMdx, parseDoxygen } from './main.js'

// ----------------------------------------------------------------------------
// The Docusaurus plugin entry point.

export const pluginName = '@xpack/docusaurus-plugin-doxygen'

export default async function pluginDocusaurus (
  context: any,
  options: any
): Promise<any> {
  if (options.id !== undefined && options.id !== 'default') {
    console.log(`${pluginName}: instance '${options.id as string}' starting...`)
  } else {
    console.log(`${pluginName}: starting...`)
  }
  // Normally this should run in loadContent(), but these run in
  // parallel and the content should be available when
  // `@docusaurus/plugin-content-docs` starts, thus the
  // processing is don on the initialising hook.
  const dataModel: DataModel = await parseDoxygen({ options })
  await generateDocusaurusMdx({
    dataModel,
    options,
    siteConfig: context.siteConfig
  })

  console.log()
  if (options.id !== undefined && options.id !== 'default') {
    console.log(`${pluginName}: instance '${options.id as string}' done.`)
  } else {
    console.log(`${pluginName}: done.`)
  }

  return {
    name: pluginName,

    // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
    // Fetch from data sources. The return value is the content it needs.
    // It is called for each plugin instance (in parallel).
    async loadContent () {
      // if (options.id !== undefined && options.id !== 'default') {
      //   console.log(`${pluginName.replaceAll(/^.*[/]/g, '')}: loading instance '${options.id as string}' content...`)
      // } else {
      //   console.log(`${pluginName.replaceAll(/^.*[/]/g, '')}: loading content...`)
      // }

      // const dataModel: DataModel = await parseDoxygen({ options })
      // await generateDocusaurusMdx({
      //   dataModel,
      //   options,
      //   siteConfig: context.siteConfig
      // })

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
          return await generateDoxygen(context, options, cliOptions)
        })
    }
  }
}

// ----------------------------------------------------------------------------
