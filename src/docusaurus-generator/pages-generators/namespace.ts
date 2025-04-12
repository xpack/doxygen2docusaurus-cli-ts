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
import { PageGeneratorBase } from './generator-base.js'
import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { Namespace } from '../data-model/namespace.js'

// ----------------------------------------------------------------------------

export class NamespaceGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName} Namespace Reference`

    let bodyText: string = ''

    const briefDescription: string = this.generator.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      bodyText += briefDescription
      bodyText += ' <a href="#details">More...</a>\n'
      bodyText += '\n'
    }

    if (compoundDef.innerNamespaces !== undefined && compoundDef.innerNamespaces.length > 0) {
      bodyText += '## Namespaces\n'
      bodyText += '\n'

      bodyText += '<MembersList>\n'
      for (const innerNamespace of compoundDef.innerNamespaces) {
        const namespace = this.generator.namespaces.membersById.get(innerNamespace.refid)
        const permalink = this.generator.getPermalink(innerNamespace.refid)
        bodyText += `<MembersListItem itemKind="namespace" itemText="${namespace?.unparentedName}" itemLink="${permalink}">\n`

        const compoundDef = this.generator.compoundDefsById.get(innerNamespace.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.generator.renderElementMdx(compoundDef.briefDescription)
        bodyText += briefDescription
        bodyText += '\n'

        bodyText += '</MembersListItem>\n'
      }
      bodyText += '</MembersList>\n'
      bodyText += '\n'
    }

    if (compoundDef.innerClasses !== undefined && compoundDef.innerClasses.length > 0) {
      bodyText += '## Classes\n'
      bodyText += '\n'
      bodyText += '<MembersList>\n'
      for (const innerClass of compoundDef.innerClasses) {
        // console.log(util.inspect(innerClass), { compact: false, depth: 999 })
        const compoundDefClass = this.generator.compoundDefsById.get(innerClass.refid)
        assert(compoundDefClass !== undefined)
        // console.log(util.inspect(compoundDefClass), { compact: false, depth: 999 })

        const permalink = this.generator.getPermalink(compoundDefClass.id)

        let itemText = ''
        itemText += compoundDefClass.compoundName

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
            itemText += `&lt; ${paramNames.join(', ')} &gt;`
          }
        }

        bodyText += `<MembersListItem itemKind="class" itemText="${itemText}" itemLink="${permalink}">\n`

        const innerBriefDescription: string = this.generator.renderElementMdx(compoundDefClass.briefDescription)
        bodyText += innerBriefDescription
        const innerPermalink = this.generator.getPermalink(innerClass.refid)
        bodyText += ` <Link to="${innerPermalink}#details">`
        bodyText += 'More...'
        bodyText += '</Link>\n'

        bodyText += '</MembersListItem>\n'
      }
      bodyText += '</MembersList>\n'
      bodyText += '\n'
    }

    bodyText += '## Description {#details}\n'
    bodyText += '\n'

    // Deviate from Doxygen and do not repeat the brief in the detailed section.

    console.log(util.inspect(compoundDef.detailedDescription), { compact: false, depth: 999 })
    const detailedDescription: string = this.generator.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0 && detailedDescription !== '<hr/>') {
      bodyText += detailedDescription
      bodyText += '\n'
    } else {
      bodyText += `TODO: add <code>@details</code> to <code>@namespace ${compoundDef.compoundName}</code>`
      bodyText += '\n'
    }

    return bodyText
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let bodyText: string = ''

    bodyText += 'The namespaces with brief descriptions are:\n'
    bodyText += '\n'

    bodyText += '<TreeTable>\n'

    for (const groupId of this.generator.namespaces.topLevelNamespaceIds) {
      bodyText += this.renderNamespaceRecursively(groupId, 1)
    }

    bodyText += '</TreeTable>\n'

    return bodyText
  }

  renderNamespaceRecursively (namespaceId: string, depth: number): string {
    const namespace: Namespace | undefined = this.generator.namespaces.membersById.get(namespaceId)
    assert(namespace !== undefined)

    // console.log(util.inspect(namespace), { compact: false, depth: 999 })

    let bodyText: string = ''

    const compoundDef = namespace.compoundDef
    const label = namespace.unparentedName
    const permalink = this.generator.getPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    bodyText += `<TreeTableRow itemText="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.generator.renderElementMdx(compoundDef.briefDescription)
    bodyText += briefDescription.replace(/[.]$/, '')
    bodyText += '\n'

    bodyText += '</TreeTableRow>\n'

    if (namespace.childrenNamespaceIds.length > 0) {
      for (const childNamespaceId of namespace.childrenNamespaceIds) {
        bodyText += this.renderNamespaceRecursively(childNamespaceId, depth + 1)
      }
    }

    return bodyText
  }
}

// ----------------------------------------------------------------------------
