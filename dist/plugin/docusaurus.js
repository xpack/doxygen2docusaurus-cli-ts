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
import { defaultOptions } from './options.js';
import { generateDocusaurusMdx, parseDoxygen } from './main.js';
// ----------------------------------------------------------------------------
// The Docusaurus plugin entry point.
export const pluginName = '@xpack/docusaurus-plugin-doxygen';
export default async function pluginDocusaurus(context, options // The user options in docusaurus.config.ts
) {
    // Already merged with the defaults in validateOptions.
    const actualOptions = options;
    if (actualOptions.verbose) {
        console.log();
        if (actualOptions.id !== undefined && actualOptions.id !== 'default') {
            console.log(`${pluginName}: instance '${actualOptions.id}' starting...`);
        }
        else {
            console.log(`${pluginName}: starting...`);
        }
    }
    if (actualOptions.runOnStart) {
        const dataModel = await parseDoxygen({ options: actualOptions });
        await generateDocusaurusMdx({
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
    }
    return {
        name: pluginName,
        // https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis
        // No need for loadContent() and contentLoaded().
        // https://docusaurus.io/docs/api/plugin-methods/extend-infrastructure#extendCli
        extendCli(cli) {
            cli
                .command('generate-doxygen')
                .option('--id <string>', 'Specify the plugin instance')
                .description('[@xpack/docusaurus-plugin-doxygen] Generate Doxygen docs independently of the Docusaurus build process.')
                .action(async (cliOptions) => {
                console.log();
                console.log('Running \'docusaurus generate-doxygen\'...');
                const exitCode = await generateDoxygen(context, actualOptions, cliOptions);
                console.log();
                console.log('Running \'docusaurus generate-doxygen\' has completed successfully.');
                return exitCode;
            });
        }
    };
}
export function validateOptions({ validate, options: userOptions }) {
    // Currently only add defaults.
    // TODO: validate.
    return {
        ...defaultOptions,
        ...userOptions
    };
}
// ----------------------------------------------------------------------------
