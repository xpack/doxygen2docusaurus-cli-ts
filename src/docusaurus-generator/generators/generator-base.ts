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

import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { ElementGeneratorBase } from '../element-generators/element-generator-base.js'
import { DescriptionTypeGenerator } from '../element-generators/descriptiontype.js'
import { DocusaurusGenerator } from '../index.js'
import { FrontMatter } from '../types.js'

// ----------------------------------------------------------------------------

export abstract class KindGeneratorBase {
  generator: DocusaurusGenerator
  elementGenerators: Map<string, ElementGeneratorBase>

  constructor (generator: DocusaurusGenerator) {
    this.generator = generator
    this.elementGenerators = new Map()

    this.elementGenerators.set('AbstractDescriptionType', new DescriptionTypeGenerator(generator))
  }

  abstract renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string

  renderElementMdx (element: Object | undefined): string {
    if (element === undefined) {
      return ''
    }

    const renderer: ElementGeneratorBase | undefined = this.getRenderer(element)
    if (renderer === undefined) {
      return ''
    }

    // TODO: Implement the method logic
    return renderer.renderMdx(element)
  }

  getRenderer (element: Object): ElementGeneratorBase | undefined {
    for (let elementClass = element.constructor; elementClass.name !== ''; elementClass = Object.getPrototypeOf(elementClass)) {
      // console.log(elementClass.name)
      if (this.elementGenerators.has(elementClass.name)) {
        return this.elementGenerators.get(elementClass.name)
      }
    }

    console.error('no element generator for', element.constructor.name)
    return undefined
  }
}

// ----------------------------------------------------------------------------
