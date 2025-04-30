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
import { Group } from '../view-model/groups-vm.js'
import { escapeMdx } from '../utils.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class GroupGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDefDataModel, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    const descriptionTodo = `@defgroup ${compoundDef.compoundName}`

    result += this.context.renderBriefDescriptionMdx({
      briefDescription: compoundDef.briefDescription,
      todo: descriptionTodo,
      morePermalink: '#details'
    })

    result += this.context.renderInnerIndicesMdx({
      compoundDef,
      suffixes: ['Groups', 'Classes']
    })

    result += this.context.renderSectionDefIndicesMdx(compoundDef)

    result += this.context.renderDetailedDescriptionMdx({
      detailedDescription: compoundDef.detailedDescription,
      todo: descriptionTodo
    })

    result += this.context.renderSectionDefsMdx(compoundDef)

    return result
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    const projectBrief = this.context.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')

    result += `${projectBrief} topics with brief descriptions are:\n`

    result += '\n'
    result += '<TreeTable>\n'

    for (const groupId of this.context.groups.topLevelGroupIds) {
      result += this.renderIndexGroupRecursively(groupId, 1)
    }

    result += '\n'
    result += '</TreeTable>\n'

    if (this.context.pages.mainPage !== undefined) {
      const detailedDescription: string = this.context.renderElementMdx(this.context.pages.mainPage.compoundDef.detailedDescription).trim()

      result += '\n'
      result += '## Description {#details}\n'

      result += '\n'
      result += detailedDescription
      result += '\n'
    }

    result += '\n'
    result += 'For comparison, Doxygen pages, styled with the [doxygen-awesome-css](https://jothepro.github.io/doxygen-awesome-css/) plugin, continue to be available via the '
    result += '<Link to="pathname:///doxygen/topics.html">/doxygen/*</Link> URLs.'

    return result
  }

  private renderIndexGroupRecursively (groupId: string, depth: number): string {
    const group: Group | undefined = this.context.groups.membersById.get(groupId)
    assert(group !== undefined)
    assert(depth <= 6)

    let result: string = ''

    const compoundDef = group.compoundDef
    const label = escapeMdx(compoundDef.title?.trim() ?? '?')

    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += '\n'
    result += `<TreeTableRow itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')

    result += '\n'
    result += '</TreeTableRow>\n'

    if (group.childrenIds.length > 0) {
      for (const childGroupId of group.childrenIds) {
        result += this.renderIndexGroupRecursively(childGroupId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
