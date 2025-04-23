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

import { DoxygenData } from '../doxygen-xml-parser/index.js'
import { generateDoxygen } from './cli/generate.js'
import { generateDocusaurusMdx, parseDoxygen } from './main.js'

export default async function pluginDocusaurus (
  context: any,
  options: any
): Promise<any> {
  console.log('@xpack/docusaurus-plugin-doxygen: initialising...')
  // console.log(`context: ${util.inspect(context)}`)
  // The plugin configuration options.
  // console.log(`options: ${util.inspect(options)}`)

  // await generateTypedoc(context, options);

  return {
    name: '@xpack/docusaurus-plugin-doxygen',

    // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
    // Fetch from data sources. The return value is the content it needs.
    async loadContent () {
      console.log('docusaurus-plugin-doxygen: loading content...')
      // console.log(options)

      const doxygenData: DoxygenData = await parseDoxygen({ options })
      await generateDocusaurusMdx({ doxygenData, options })

      return doxygenData
    },

    // The return value of `loadContent()` will be passed to
    // `contentLoaded()` as `content`.
    async contentLoaded ({
      content,
      actions
    }: {
      content: DoxygenData
      actions: any
    }) {
      // console.log('docusaurus-plugin-doxygen: contentLoaded()')
    },

    // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
    extendCli (cli: any) {
      cli
        .command('generate-doxygen')
        .description(
          '[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.'
        )
        .action(async () => {
          return await generateDoxygen(context, options)
        })
    }
  }
}

// ----------------------------------------------------------------------------
