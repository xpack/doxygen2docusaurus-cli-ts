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

import assert from 'assert'
import * as util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractDocSect1Type, AbstractDocSect2Type, AbstractDocSect3Type, AbstractDocSect4Type, AbstractDocSect5Type, AbstractDocSect6Type } from '../../doxygen-xml-parsers/descriptiontype-parser.js'

// ----------------------------------------------------------------------------

export class DocS1TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect1Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `# ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h1>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h1>\n'
    }

    return result
  }
}

export class DocS2TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect2Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `## ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h2>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h2>\n'
    }

    return result
  }
}

export class DocS3TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect3Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `### ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h3>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h3>\n'
    }

    return result
  }
}

export class DocS4TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect4Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `#### ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h4>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h4>\n'
    }

    return result
  }
}

export class DocS5TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect5Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `##### ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h5>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h5>\n'
    }

    return result
  }
}

export class DocS6TypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSect6Type): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const title = this.context.renderElementMdx(element.title).trim()
    if (title.length > 0) {
      result += '\n'
      result += `###### ${title}`
      if (element.id !== undefined && element.id.length > 0) {
        result += `{${title}}`
      }
      result += '\n'

      result += this.context.renderElementsMdx(element.children)
    } else {
      result += '\n'
      result += '<h6>\n'

      if (element.id !== undefined && element.id.length > 0) {
        result += `  <a id="${title}"/>\n`
      }
      result += this.context.renderElementsMdx(element.children)

      result += '\n'
      result += '</h6>\n'
    }

    return result
  }
}

// ----------------------------------------------------------------------------
