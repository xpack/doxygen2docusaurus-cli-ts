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
import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { Group } from '../data-model/groups-dm.js'

// ----------------------------------------------------------------------------

export class GroupGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    assert(compoundDef.title !== undefined)
    frontMatter.title = `The ${compoundDef.title} Reference`

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    if (compoundDef.innerGroups !== undefined && compoundDef.innerGroups.length > 0) {
      result += '\n'
      result += '## Topics\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerGroup of compoundDef.innerGroups) {
        const permalink = this.context.getPagePermalink(innerGroup.refid)

        const itemRight = `<Link to="${permalink}">${innerGroup.text}</Link>`

        result += '\n'
        result += `<MembersListItem itemLeft="&nbsp;" itemRight={${itemRight}}>\n`

        const compoundDef = this.context.compoundDefsById.get(innerGroup.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
        result += briefDescription

        result += '\n'
        result += '</MembersListItem>\n'
      }
      result += '\n'
      result += '</MembersList>\n'
    }

    if (compoundDef.innerClasses !== undefined && compoundDef.innerClasses.length > 0) {
      result += '\n'
      result += '## Classes\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerClass of compoundDef.innerClasses) {
        // console.log(util.inspect(innerClass, { compact: false, depth: 999 }))
        const compoundDefClass = this.context.compoundDefsById.get(innerClass.refid)
        assert(compoundDefClass !== undefined)
        // console.log(util.inspect(compoundDefClass, { compact: false, depth: 999 }))

        const permalink = this.context.getPagePermalink(compoundDefClass.id)

        let className = ''
        className += compoundDefClass.compoundName
        if (compoundDefClass.templateParamList?.params !== undefined) {
          className += this.context.renderTemplateParameterNamesMdx(compoundDefClass)
        }

        const itemRight = `<Link to="${permalink}">${className}</Link>`

        result += '\n'
        result += `<MembersListItem itemLeft="class" itemRight={${itemRight}}>\n`

        const innerBriefDescription: string = this.context.renderElementMdx(compoundDefClass.briefDescription)
        if (innerBriefDescription.length > 0) {
          result += innerBriefDescription

          const innerPermalink = this.context.getPagePermalink(innerClass.refid)
          assert(innerPermalink !== undefined && innerPermalink.length > 1)
          result += ` <Link to="${innerPermalink}#details">`
          result += 'More...'
          result += '</Link>\n'
        }

        result += '</MembersListItem>\n'
      }
      result += '\n'
      result += '</MembersList>\n'
    }

    result += this.context.renderDetailedDescriptionMdx({
      compoundDef,
      todo: `@defgroup ${compoundDef.compoundName}`
    })

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
    const label = compoundDef.title?.trim()
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
