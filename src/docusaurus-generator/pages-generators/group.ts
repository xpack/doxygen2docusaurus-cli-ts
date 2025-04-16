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
import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { Group } from '../data-model/groups.js'

// ----------------------------------------------------------------------------

export class GroupGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    assert(compoundDef.title !== undefined)
    frontMatter.title = `The ${compoundDef.title} Reference`

    let result: string = ''

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ' <a href="#details">More...</a>\n'
      result += '\n'
    }

    if (compoundDef.innerGroups !== undefined && compoundDef.innerGroups.length > 0) {
      result += '## Topics\n'
      result += '\n'

      result += '<MembersList>\n'
      for (const innerGroup of compoundDef.innerGroups) {
        const permalink = this.context.getPermalink(innerGroup.refid)
        result += `<MembersListItem itemKind="" itemLabel="${innerGroup.text}" itemLink="${permalink}">\n`

        const compoundDef = this.context.compoundDefsById.get(innerGroup.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
        result += briefDescription
        result += '\n'

        result += '</MembersListItem>\n'
      }
      result += '</MembersList>\n'
      result += '\n'
    }

    if (compoundDef.innerClasses !== undefined && compoundDef.innerClasses.length > 0) {
      result += '## Classes\n'
      result += '\n'
      result += '<MembersList>\n'
      for (const innerClass of compoundDef.innerClasses) {
        // console.log(util.inspect(innerClass), { compact: false, depth: 999 })
        const compoundDefClass = this.context.compoundDefsById.get(innerClass.refid)
        assert(compoundDefClass !== undefined)
        // console.log(util.inspect(compoundDefClass), { compact: false, depth: 999 })

        const permalink = this.context.getPermalink(compoundDefClass.id)

        let label = ''
        label += compoundDefClass.compoundName

        if (compoundDefClass.templateParamList?.params !== undefined) {
          const paramNames: string[] = []
          for (const param of compoundDefClass.templateParamList.params) {
            assert(param.type !== undefined)
            assert(param.type.children.length === 1)
            assert(typeof param.type.children[0] === 'string')
            if (param.declname !== undefined) {
              paramNames.push(param.declname)
            } else {
              // Extract the parameter name, passed as `class T`.
              paramNames.push(param.type.children[0].replace('class ', ''))
            }
            // console.log(param, { compact: false, depth: 999 })
          }
          if (paramNames.length > 0) {
            label += `&lt;${paramNames.join(', ')}&gt;`
          }
        }

        result += `<MembersListItem itemKind="class" itemLabel="${label}" itemLink="${permalink}">\n`

        const innerBriefDescription: string = this.context.renderElementMdx(compoundDefClass.briefDescription)
        result += innerBriefDescription
        const innerPermalink = this.context.getPermalink(innerClass.refid)
        result += ` <Link to="${innerPermalink}#details">`
        result += 'More...'
        result += '</Link>\n'

        result += '</MembersListItem>\n'
      }
      result += '</MembersList>\n'
      result += '\n'
    }

    result += '## Description {#details}\n'
    result += '\n'

    // Deviate from Doxygen and do not repeat the brief in the detailed section.

    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0 && detailedDescription !== '<hr/>') {
      result += detailedDescription
      result += '\n'
    } else {
      result += `TODO: add <code>@details</code> to <code>@defgroup ${compoundDef.compoundName}</code>`
      result += '\n'
    }

    return result
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let result: string = ''

    const projectBrief = this.context.doxygenOptions.getOptionCdataValue('PROJECT_BRIEF')

    result += `${projectBrief} topics with brief descriptions are:\n`
    result += '\n'

    result += '<TreeTable>\n'

    for (const groupId of this.context.groups.topLevelGroupIds) {
      result += this.renderGroupRecursively(groupId, 1)
    }

    result += '</TreeTable>\n'

    if (this.context.pages.mainPage !== undefined) {
      const detailedDescription: string = this.context.renderElementMdx(this.context.pages.mainPage.compoundDef.detailedDescription)

      result += '## Description\n'
      result += '\n'

      result += detailedDescription
      context += detailedDescription
    }

    return result
  }

  renderGroupRecursively (groupId: string, depth: number): string {
    const group: Group | undefined = this.context.groups.membersById.get(groupId)
    assert(group !== undefined)
    assert(depth <= 6)

    let result: string = ''

    const compoundDef = group.compoundDef
    const label = compoundDef.title?.trim()
    const permalink = this.context.getPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += `<TreeTableRow itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')
    result += '\n'

    result += '</TreeTableRow>\n'

    if (group.childrenGroupsIds.length > 0) {
      for (const childGroupId of group.childrenGroupsIds) {
        result += this.renderGroupRecursively(childGroupId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
