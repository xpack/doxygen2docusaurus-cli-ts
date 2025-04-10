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
import { Group } from '../data-model/groups.js'

// ----------------------------------------------------------------------------

export class GroupGenerator extends KindGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    assert(compoundDef.title !== undefined)
    frontMatter.title = `The ${compoundDef.title} Reference`

    let bodyText: string = ''

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

    if (compoundDef.innerClasses !== undefined && compoundDef.innerClasses.length > 0) {
      bodyText += '## Classes\n'
      bodyText += '\n'
      bodyText += '<table class="memberdecls">\n'
      for (const innerClass of compoundDef.innerClasses) {
        console.log(util.inspect(innerClass), { compact: false, depth: 999 })
        const compoundDefClass = this.generator.compoundDefsById.get(innerClass.refid)
        assert(compoundDefClass !== undefined)
        console.log(util.inspect(compoundDefClass), { compact: false, depth: 999 })

        bodyText += '<tr class="memitem:">\n'
        bodyText += '<td class="memItemLeft" align="right" valign="top">class</td>\n'
        bodyText += '<td class="memItemRight" valign="bottom">'
        // bodyText += `${this.generator.renderElementMdx(innerClass).trim()}`
        const permalink = this.generator.getPermalink(compoundDefClass.id)
        bodyText += `<Link to="${permalink}">`
        bodyText += compoundDefClass.compoundName
        if (compoundDefClass.templateParamList?.params !== undefined) {
          const paramNames: string[] = []
          for (const param of compoundDefClass.templateParamList.params) {
            assert(param.type !== undefined)
            assert(param.type.children.length === 1)
            assert(typeof param.type.children[0] === 'string')
            if (param.declname !== undefined) {
              paramNames.push(param.declname)
            } else {
              paramNames.push(param.type.children[0].replace('class ', ''))
            }
            console.log(param, { compact: false, depth: 999 })
          }
          if (paramNames.length > 0) {
            bodyText += `&lt; ${paramNames.join(', ')} &gt;`
          }
        }
        bodyText += '</Link>'
        bodyText += '</td>\n'
        bodyText += '</tr>\n'
        bodyText += '<tr class="memdesc:">\n'
        bodyText += '<td class="mdescLeft">&nbsp;</td>\n'
        bodyText += '<td class="mdescRight">'

        const innerBriefDescription: string = this.generator.renderElementMdx(compoundDefClass.briefDescription)
        bodyText += innerBriefDescription
        const innerPermalink = this.generator.getPermalink(innerClass.refid)
        bodyText += ` <Link to="${innerPermalink}#details">`
        bodyText += 'More...'
        bodyText += '</Link>'

        bodyText += '</td>\n'
        bodyText += '</tr>\n'
        bodyText += '<tr class="separator:">\n'
        bodyText += '<td class="memSeparator" colspan="2">&nbsp;</td>\n'
        bodyText += '</tr>\n'
      }
      bodyText += '</table>\n'
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

    return bodyText
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let bodyText: string = ''

    bodyText += 'The topics with brief descriptions are:\n'
    bodyText += '\n'

    bodyText += '<table>\n'
    for (const groupId of this.generator.groups.topLevelGroupIds) {
      bodyText += this.renderGroupRecursively(groupId, 0)
    }
    bodyText += '</table>\n'

    return bodyText
  }

  renderGroupRecursively (groupId: string, depth: number): string {
    const group: Group | undefined = this.generator.groups.membersById.get(groupId)
    assert(group !== undefined)

    let bodyText: string = ''

    const permalink = this.generator.getPermalink(group.compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    bodyText += '<tr>\n'
    bodyText += '<td>'
    for (let i = 0; i < depth; ++i) {
      bodyText += '&nbsp;&nbsp;&nbsp;&nbsp;'
    }
    bodyText += `<Link to="${permalink}">`
    bodyText += group.compoundDef.title?.trim()
    bodyText += '</Link>'
    bodyText += '</td>\n'

    bodyText += '<td>'
    const briefDescription: string = this.generator.renderElementMdx(group.compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      bodyText += briefDescription.replace(/[.]$/, '')
    }
    bodyText += '</td>\n'
    bodyText += '</tr>\n'

    if (group.childrenGroupsIds.length > 0) {
      for (const childGroupId of group.childrenGroupsIds) {
        bodyText += this.renderGroupRecursively(childGroupId, depth + 1)
      }
    }

    return bodyText
  }
}

// ----------------------------------------------------------------------------
