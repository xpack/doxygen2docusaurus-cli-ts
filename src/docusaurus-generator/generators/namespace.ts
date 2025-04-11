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
import * as util from 'node:util'

import { FrontMatter } from '../types.js'
import { KindGeneratorBase } from './generator-base.js'
import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { Namespace } from '../data-model/namespace.js'

// ----------------------------------------------------------------------------

export class NamespaceGenerator extends KindGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName} Namespace Reference`
    const bodyText: string = ''

    /*
    assert(compoundDef.title !== undefined)
    frontMatter.title = compoundDef.title + ' Reference'

    const briefDescription: string = this.generator.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      bodyText += briefDescription
      bodyText += ' <a href="#details">More...</a>\n'
      bodyText += '\n'
    }

    if (compoundDef.innerGroups !== undefined && compoundDef.innerGroups.length > 0) {
      bodyText += '## Topics\n'
      bodyText += '\n'
      for (const innerGroup of compoundDef.innerGroups) {
        bodyText += `- ${this.generator.renderElementMdx(innerGroup)}\n`
      }
      bodyText += '\n'
    }

    bodyText += '## Description {#details}\n'
    bodyText += '\n'

    // Deviate from Doxygen and do not repeat the brief in the detailed section.
    // if (briefDescription.length > 0) {
    //   bodyText += briefDescription
    //   bodyText += '\n'
    // }

    const detailedDescription: string = this.generator.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0) {
      bodyText += detailedDescription
      bodyText += '\n'
    } else {
      bodyText += `TODO: add <code>@details</code> to <code>@defgroup ${compoundDef.compoundName}</code>`
      bodyText += '\n'
    }
*/
    return bodyText
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let bodyText: string = ''

    bodyText += 'The namespaces with brief descriptions are:\n'
    bodyText += '\n'

    bodyText += '<table>\n'
    for (const groupId of this.generator.namespaces.topLevelNamespaceIds) {
      bodyText += this.renderNamespaceRecursively(groupId, 0)
    }
    bodyText += '</table>\n'

    return bodyText
  }

  renderNamespaceRecursively (namespaceId: string, depth: number): string {
    const namespace: Namespace | undefined = this.generator.namespaces.membersById.get(namespaceId)
    assert(namespace !== undefined)

    // console.log(util.inspect(namespace), { compact: false, depth: 999 })

    let bodyText: string = ''

    const permalink = this.generator.getPermalink(namespace.compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    bodyText += '<tr>\n'
    bodyText += '<td>'
    for (let i = 0; i < depth; ++i) {
      bodyText += '&nbsp;&nbsp;&nbsp;&nbsp;'
    }
    bodyText += `<Link to="${permalink}">`
    bodyText += namespace.unparentedName.trim()
    bodyText += '</Link>'
    bodyText += '</td>\n'

    bodyText += '<td>'
    const briefDescription: string = this.generator.renderElementMdx(namespace.compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      bodyText += briefDescription.replace(/[.]$/, '')
    }
    bodyText += '</td>\n'
    bodyText += '</tr>\n'

    if (namespace.childrenNamespaceIds.length > 0) {
      for (const childNamespaceId of namespace.childrenNamespaceIds) {
        bodyText += this.renderNamespaceRecursively(childNamespaceId, depth + 1)
      }
    }

    return bodyText
  }
}

// ----------------------------------------------------------------------------
