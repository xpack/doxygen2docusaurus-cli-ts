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
import { Namespace } from '../data-model/namespaces.js'

// ----------------------------------------------------------------------------

export class NamespaceGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName} Namespace Reference`

    let result: string = ''

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ' <a href="#details">More...</a>\n'
      result += '\n'
    }

    if (compoundDef.innerNamespaces !== undefined && compoundDef.innerNamespaces.length > 0) {
      result += '## Namespaces\n'
      result += '\n'

      result += '<MembersList>\n'
      for (const innerNamespace of compoundDef.innerNamespaces) {
        const namespace = this.context.namespaces.membersById.get(innerNamespace.refid)
        const permalink = this.context.getCompoundPermalink(innerNamespace.refid)
        result += `<MembersListItem itemKind="namespace" itemLabel="${namespace?.unparentedName}" itemLink="${permalink}">\n`

        const compoundDef = this.context.compoundDefsById.get(innerNamespace.refid)
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

        const permalink = this.context.getCompoundPermalink(compoundDefClass.id)

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

        const innerPermalink = this.context.getCompoundPermalink(innerClass.refid)
        assert(innerPermalink !== undefined && innerPermalink.length > 1)
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

    // console.log(util.inspect(compoundDef.detailedDescription), { compact: false, depth: 999 })
    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0 && detailedDescription !== '<hr/>') {
      result += detailedDescription
      result += '\n'
    } else {
      result += `TODO: add <code>@details</code> to <code>@namespace ${compoundDef.compoundName}</code>`
      result += '\n'
    }

    return result
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let result: string = ''

    result += 'The namespaces with brief descriptions are:\n'
    result += '\n'

    result += '<TreeTable>\n'

    for (const groupId of this.context.namespaces.topLevelNamespaceIds) {
      result += this.renderNamespaceRecursively(groupId, 1)
    }

    result += '</TreeTable>\n'

    return result
  }

  renderNamespaceRecursively (namespaceId: string, depth: number): string {
    const namespace: Namespace | undefined = this.context.namespaces.membersById.get(namespaceId)
    assert(namespace !== undefined)

    // console.log(util.inspect(namespace), { compact: false, depth: 999 })

    let result: string = ''

    const compoundDef = namespace.compoundDef
    const label = namespace.unparentedName
    const permalink = this.context.getCompoundPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += `<TreeTableRow itemIcon="N" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')
    result += '\n'

    result += '</TreeTableRow>\n'

    if (namespace.childrenNamespaceIds.length > 0) {
      for (const childNamespaceId of namespace.childrenNamespaceIds) {
        result += this.renderNamespaceRecursively(childNamespaceId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
