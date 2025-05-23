import pluginContentDocs from '@docusaurus/plugin-content-docs';
import { validateOptions as pluginContentDocsValidateOptions } from '@docusaurus/plugin-content-docs';

import pluginDoxygen from '@xpack/docusaurus-plugin-doxygen'
import { validateOptions as pluginDoxygenValidateOptions, generateDoxygen } from '@xpack/docusaurus-plugin-doxygen'

export default async function pluginContentDocsWithDoxygen(context, options) {

  const doxygenPluginOptions = options.doxygenPluginOptions ?? {}

  delete options.doxygenPluginOptions

  // Instantiate the original docs plugin
  const pluginContentDocsInstance = await pluginContentDocs(context, options);

  const pluginDoxygenInstance = await pluginDoxygen(context, doxygenPluginOptions);

  return {
    // Get all properties from the Docusaurus Docs plugin.
    ...pluginContentDocsInstance,

    // Extend the lifecycle method.
    async loadContent() {
      // Custom logic before, load Doxygen pages; ignore data
      const dataModel = await pluginDoxygenInstance.loadContent?.();
      // Currently the data model is ignored, it is not passed down
      // to contentLoaded().

      const content = await pluginContentDocsInstance.loadContent?.();
      // console.log(content)

      return content;
    },

    // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
    extendCli(cli) {
      cli
        .command('generate-doxygen')
        .option('--id <string>', 'Specify the plugin instance')
        .description(
          '[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.'
        )
        .action(async (cliOptions) => {
          console.log()
          console.log('Running docusaurus generate-doxygen...')
          const exitCode = await generateDoxygen(context, actualOptions, cliOptions)
          console.log()
          console.log('Running docusaurus generate-doxygen has completed successfully.')
          return exitCode
        })
    }

  };
}

export function validateOptions({ validate, options }) {
  const doxygenPluginOptions = options.doxygenPluginOptions ?? {}
  delete options.doxygenPluginOptions
  const actualDocsPluginOptions = pluginContentDocsValidateOptions({ validate, options })
  const actualDoxygenPluginOptions = pluginDoxygenValidateOptions({validate, options: doxygenPluginOptions})
  return {
    ...actualDocsPluginOptions,
    doxygenPluginOptions: actualDoxygenPluginOptions
  }
}
