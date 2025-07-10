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
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
// https://www.npmjs.com/package/commander
import { Command } from 'commander';
import { getInstanceDefaultOptions, defaultOptions, } from '../docusaurus/options.js';
import { formatDuration } from '../docusaurus/utils.js';
import { DoxygenXmlParser } from '../doxygen/doxygen-xml-parser.js';
import { DocusaurusGenerator } from '../docusaurus/generator.js';
export async function main(argv) {
    const program = new Command();
    program.option('--id <name>', 'id, for multi-configurations');
    program.parse(argv);
    const programOptions = program.opts();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const id = programOptions.id;
    let configurationOptions = undefined;
    try {
        // Try to get the configuration from package.json/config/doxygen2docusaurus.
        const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pkgJson = JSON.parse(pkgJsonRaw);
        const multiConfigurations = pkgJson.config?.doxygen2docusaurus ?? pkgJson.doxygen2docusaurus;
        configurationOptions = selectMultiConfiguration(multiConfigurations, id);
    }
    catch (err) {
        // try to get the configuration from doxygen2docusaurus.json.
        const userPackageJsonPath = path.resolve(process.cwd(), 'doxygen2docusaurus.json');
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const multiConfigurations = JSON.parse(pkgJsonRaw);
        configurationOptions = selectMultiConfiguration(multiConfigurations, id);
    }
    // console.log(configurationOptions)
    let options = defaultOptions;
    if (configurationOptions !== undefined) {
        options = {
            ...getInstanceDefaultOptions(configurationOptions.id),
            ...configurationOptions,
        };
    }
    const startTime = Date.now();
    const commandLine = `${path.basename(argv[1] ?? 'doxygen2docusaurus')} ` +
        argv.slice(2).join(' ');
    console.log(`Running '${commandLine}'...`);
    let exitCode = 0;
    try {
        const dataModel = await parseDoxygen({ options });
        exitCode = await generateDocusaurusMd({
            dataModel,
            options,
        });
    }
    catch (err) {
        console.error(err);
        exitCode = 1;
    }
    const durationString = formatDuration(Date.now() - startTime);
    if (exitCode === 0) {
        console.log();
        console.log(`Running '${commandLine}' has completed successfully ` +
            `in ${durationString}.`);
    }
    return exitCode;
}
function selectMultiConfiguration(multiConfigurations, id) {
    let configurationOptions = undefined;
    if (id !== undefined) {
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        configurationOptions =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            multiConfigurations[id];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (configurationOptions !== undefined) {
            configurationOptions.id = id;
        }
    }
    else {
        configurationOptions = multiConfigurations;
    }
    return configurationOptions;
}
export async function parseDoxygen({ options, }) {
    // console.log('generateDoxygen()')
    // console.log(`context: ${util.inspect(context)}`)
    // console.log('options:', util.inspect(options))
    if (options.verbose) {
        console.log();
        console.log('pluginOptions:', util.inspect(options));
    }
    assert(options.doxygenXmlInputFolderPath.length > 0, 'doxygenXmlInputFolderPath is required');
    assert(options.docsFolderPath.length > 0, 'docsFolderPath is required');
    assert(options.apiFolderPath.length > 0, 'apiFolderPath is required');
    assert(options.docsBaseUrl.length > 0, 'docsBaseUrl is required');
    // assert(options.apiBaseUrl.length > 0, 'apiBaseUrl is required')
    assert(options.sidebarCategoryFilePath.length > 0, 'sidebarCategoryFilePath is required');
    assert(options.menuDropdownFilePath.length > 0, 'menuDropdownFilePath is required');
    console.log();
    const xmlParser = new DoxygenXmlParser({
        options,
    });
    const dataModel = await xmlParser.parse({
        folderPath: options.doxygenXmlInputFolderPath,
    });
    // console.log('doxygenData:', util.inspect(doxygenData))
    return dataModel;
}
export async function generateDocusaurusMd({ dataModel, options, }) {
    const docusaurus = new DocusaurusGenerator({
        dataModel,
        options,
    });
    await docusaurus.generate();
    return 0;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=main.js.map