import * as fs from 'node:fs'
import * as util from 'node:util'

import { defaultOptions } from '../options/defaults.js'

export default async function pluginDocusaurus (
  context: any,
  options: any
): Promise<any> {
  console.log('@xpack/docusaurus-plugin-doxygen')
  // console.log(`context: ${util.inspect(context)}`)
  // The plugin configuration options.
  // console.log(`options: ${util.inspect(options)}`)

  // await generateTypedoc(context, options);

  return {
    name: '@xpack/docusaurus-plugin-doxygen',
    // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
    async loadContent () {
      console.log('plugin-doxygen: loadContent()')
    },
    async contentLoaded ({ content, actions }) {
      console.log('plugin-doxygen: contentLoaded()')
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
        }).then((exitCode) => { process.exitCode = exitCode })
        .catch(() => {})
    }
  }
}

async function generateDoxygen (context: any, options: any): Promise<number> {
  console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log(`options: ${util.inspect(options)}`)

  // Merge with the defaults.
  const actualOptions = {
    ...defaultOptions,
    ...options
  }
  console.log(`actualOptions:${util.inspect(actualOptions)}`)

  // Create output folder if it doesn't exist.
  if (!fs.existsSync(actualOptions.outputFolderPath)) {
    fs.mkdirSync(actualOptions.outputFolderPath, { recursive: true })
  }

  console.log('more generateDoxygen() to come...')

  return 0
}
