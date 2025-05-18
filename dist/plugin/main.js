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
import * as util from 'node:util';
import { DoxygenXmlParser } from '../data-model/doxygen-xml-parser.js';
import { defaultOptions } from './options.js';
import { DocusaurusGenerator } from '../docusaurus-generator/generator.js';
// ----------------------------------------------------------------------------
export async function parseDoxygen({ options }) {
    // console.log('generateDoxygen()')
    // console.log(`context: ${util.inspect(context)}`)
    // console.log('options:', util.inspect(options))
    // Merge with the defaults.
    const actualOptions = {
        ...defaultOptions,
        ...options
    };
    console.log();
    console.log('pluginOptions:', util.inspect(actualOptions));
    assert(options?.doxygenXmlInputFolderPath !== undefined && options?.doxygenXmlInputFolderPath?.length > 0, 'doxygenXmlInputFolderPath is required');
    assert(options.outputFolderPath !== undefined && options.outputFolderPath.length > 0, 'outputFolderPath is required');
    console.log();
    const xml = new DoxygenXmlParser();
    const dataModel = await xml.parse({ folderPath: options.doxygenXmlInputFolderPath });
    // console.log('doxygenData:', util.inspect(doxygenData))
    return dataModel;
}
export async function generateDocusaurusMdx({ dataModel, options, siteConfig }) {
    // Merge with the defaults.
    const actualOptions = {
        ...defaultOptions,
        ...options
    };
    // console.log('generateDocusaurusMdx()')
    const docs = new DocusaurusGenerator({
        dataModel,
        pluginOptions: actualOptions,
        siteConfig
    });
    await docs.generate();
    return 0;
}
// ----------------------------------------------------------------------------
