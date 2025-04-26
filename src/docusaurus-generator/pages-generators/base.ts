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

import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { DocusaurusGenerator } from '../index.js'
import { FrontMatter } from '../types.js'

// ----------------------------------------------------------------------------

export abstract class PageGeneratorBase {
  context: DocusaurusGenerator

  constructor (generator: DocusaurusGenerator) {
    this.context = generator
  }

  abstract renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string

  abstract renderIndexMdx (): string
}

// ----------------------------------------------------------------------------
