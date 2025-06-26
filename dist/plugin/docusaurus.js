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
import { generateDoxygen } from './cli/generate.js';
import { getInstanceDefaultOptions } from './options.js';
import { generateDocusaurusMd, parseDoxygen } from './main.js';
// ----------------------------------------------------------------------------
// The Docusaurus plugin entry point.
export const pluginName = '@xpack/docusaurus-plugin-doxygen';
export default async function pluginDocusaurus(context, options // The user options in docusaurus.config.ts
) {
    // console.log(util.inspect(context, { compact: false, depth: 999 }))
    // Already merged with the defaults in validateOptions.
    const actualOptions = options;
    if (actualOptions.verbose) {
        if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
            console.log(`${pluginName}: initialising instance '${actualOptions.id}'...`);
        }
        else {
            console.log(`${pluginName}: initialising...`);
        }
        // console.log('options:', options)
    }
    // It is not possible to run the actions here, since this is executed even
    // for CLI commands, when it is not necessary.
    return {
        name: pluginName,
        // Called for `start` and `build`, not CLI.
        // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
        async loadContent() {
            if (actualOptions.runOnStart) {
                const dataModel = await parseDoxygen({ options: actualOptions });
                await generateDocusaurusMd({
                    dataModel,
                    options: actualOptions,
                    siteConfig: context.siteConfig
                });
                if (actualOptions.verbose) {
                    console.log();
                    if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
                        console.log(`${pluginName}: instance '${actualOptions.id}' generation of docs completed.`);
                    }
                    else {
                        console.log(`${pluginName}: generation of docs completed.`);
                    }
                }
                return { dataModel };
            }
            return undefined;
        },
        // No need for contentLoaded().
        // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
        extendCli(cli) {
            extendCliGenerateDoxygen(cli, context, options);
        }
    };
}
function formatDuration(n) {
    if (n < 1000) {
        return `${n} ms`;
    }
    else if (n < 100000) {
        return `${(n / 1000).toFixed(1)} sec`;
    }
    else {
        return `${(n / 60000).toFixed(1)} min`;
    }
}
// The options are for the first instance. For multi-instance must be computed based on the id.
export function extendCliGenerateDoxygen(cli, context, options) {
    let startTime;
    cli
        .command('generate-doxygen')
        .option('--id <string>', 'Specify the plugin instance')
        .description('[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.')
        .action(async (cliOptions) => {
        startTime = Date.now();
        const commandLine = cliOptions.parent.args.join(' ');
        console.log();
        console.log(`Running '${commandLine}'...`);
        // console.log('context:', context)
        // console.log('options:', options)
        // console.log('cliOptions:', cliOptions)
        const exitCode = await generateDoxygen(context, options, cliOptions);
        console.log();
        const durationString = formatDuration(Date.now() - startTime);
        console.log(`Running '${commandLine}' has completed successfully in ${durationString}.`);
        return exitCode;
    });
}
// Called before calling `pluginDocusaurus()` for each instance.
// The returned object is passed as the options of that instance.
export function validateOptions({ validate, options: userOptions }) {
    // console.log(`validateOptions()`)
    // console.log('userOptions:', userOptions)
    // console.log('defaultOptions:', defaultOptions)
    // Currently only add defaults.
    // TODO: validate.
    return {
        ...getInstanceDefaultOptions(userOptions.id),
        ...userOptions
    };
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=docusaurus.js.map