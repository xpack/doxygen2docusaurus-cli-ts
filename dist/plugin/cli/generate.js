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
import { generateDocusaurusMd, parseDoxygen } from '../main.js';
import { getInstanceDefaultOptions } from '../options.js';
import { pluginName } from '../docusaurus.js';
// ----------------------------------------------------------------------------
export async function generateDoxygen(context, pluginOptions, cliOptions) {
    // console.log('generateDoxygen()')
    // console.log('context:', util.inspect(context))
    // console.log('pluginOptions:', util.inspect(pluginOptions))
    // For multi-instance plugins, this is not accurate,
    let options = pluginOptions;
    if (cliOptions?.id !== undefined) {
        let found = false;
        for (const plugin of context.siteConfig.plugins) {
            if (Array.isArray(plugin)) {
                if (plugin[0] === pluginName) {
                    const configPluginOptions = plugin[1];
                    if (configPluginOptions.id === cliOptions.id) {
                        options = {
                            ...getInstanceDefaultOptions(cliOptions.id),
                            ...configPluginOptions
                        };
                        found = true;
                        break;
                    }
                }
            }
        }
        if (!found) {
            console.error(`'--id ${cliOptions.id}' not found in docusaurus.config.ts`);
            return -1;
        }
    }
    const dataModel = await parseDoxygen({ options });
    const exitCode = await generateDocusaurusMd({
        dataModel,
        options,
        siteConfig: context.siteConfig
    });
    return exitCode;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=generate.js.map