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

import util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractDescriptionType, AbstractDocParaType, AbstractDocURLLink } from '../../doxygen-xml-parser/descriptiontype.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDescriptionType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    if (element.title !== undefined && element.title.length > 0) {
      console.log('title ignored in', element.constructor.name)
    }

    let result = ''
    for (const child of element.children) {
      result += this.generator.renderElementMdx(child)
    }

    console.log(result)
    return result
  }
}

// ----------------------------------------------------------------------------

export class DocParaType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocParaType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''
    for (const child of element.children) {
      result += this.generator.renderElementMdx(child)
    }
    return result
  }
}

// ----------------------------------------------------------------------------

export class DocURLLink extends ElementGeneratorBase {
  renderMdx (element: AbstractDocURLLink): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''
    result += `<a href="${element.url}">`
    for (const child of element.children) {
      result += this.generator.renderElementMdx(child)
    }
    result += '</a>'
    return result
  }
}

// ----------------------------------------------------------------------------
