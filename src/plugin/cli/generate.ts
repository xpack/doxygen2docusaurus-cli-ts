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

import { DataModel } from '../../doxygen-xml-parser/index.js'
import { generateDocusaurusMdx, parseDoxygen } from '../main.js'
import { PluginOptions } from '../options.js'

// ----------------------------------------------------------------------------

export async function generateDoxygen (context: any, options: PluginOptions): Promise<number> {
  // console.log('generateDoxygen()')
  // console.log(`context: ${util.inspect(context)}`)
  // console.log(`options: ${util.inspect(options)}`)

  const dataModel: DataModel = await parseDoxygen({ options })

  const exitCode = await generateDocusaurusMdx({ dataModel, options })

  return exitCode
}

// ----------------------------------------------------------------------------
