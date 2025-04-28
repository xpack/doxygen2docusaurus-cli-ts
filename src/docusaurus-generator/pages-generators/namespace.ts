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
import { PageGeneratorBase } from './base.js'
import { Namespace } from '../view-model/namespaces-vm.js'
import { escapeHtml } from '../utils.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class NamespaceGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDefDataModel, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    result += this.context.renderInnerIndicesMdx({
      compoundDef,
      suffixes: ['Namespaces', 'Classes']
    })

    result += this.context.renderSectionDefIndicesMdx(compoundDef)

    result += this.context.renderDetailedDescriptionMdx({
      compoundDef,
      todo: `@namespace ${compoundDef.compoundName}`
    })

    result += this.context.renderSectionDefsMdx(compoundDef)

    return result
  }

  // --------------------------------------------------------------------------

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += 'The namespaces used by this project are:\n'

    result += '\n'
    result += '<TreeTable>\n'

    for (const groupId of this.context.namespaces.topLevelNamespaceIds) {
      result += this.renderIndexNamespaceRecursively(groupId, 1)
    }

    result += '\n'
    result += '</TreeTable>\n'

    return result
  }

  private renderIndexNamespaceRecursively (namespaceId: string, depth: number): string {
    const namespace: Namespace | undefined = this.context.namespaces.membersById.get(namespaceId)
    assert(namespace !== undefined)

    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    let result: string = ''

    const compoundDef = namespace.compoundDef
    const label = escapeHtml(namespace.indexName)

    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += '\n'
    result += `<TreeTableRow itemIconLetter="N" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')

    result += '\n'
    result += '</TreeTableRow>\n'

    if (namespace.childrenIds.length > 0) {
      for (const childNamespaceId of namespace.childrenIds) {
        result += this.renderIndexNamespaceRecursively(childNamespaceId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
