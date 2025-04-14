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
import { Class } from '../data-model/classes.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx(compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName}`
    frontMatter.title += this.renderTemplateParams(compoundDef)
    frontMatter.title += ' Class'
    if (compoundDef.templateParamList !== undefined) {
      frontMatter.title += ' Template'
    }
    frontMatter.title += ' Reference'

    let result: string = ''

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ' <a href="#details">More...</a>\n'
      result += '\n'
    }

    if (compoundDef.includes !== undefined) {
      for (const include of compoundDef.includes) {
        result += `${this.context.renderElementMdx(include)}\n`
        result += '\n'
      }
    }

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += `${this.context.renderElementMdx(sectionDef)}\n`
        result += '\n'
      }
    }

    result += '## Description {#details}\n'
    result += '\n'

    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0 && detailedDescription !== '<hr/>') {
      result += detailedDescription
      result += '\n'
    }

    return result
  }

  renderTemplateParams(compoundDef: CompoundDef): string {
    let result = ''

    if (compoundDef.templateParamList?.params !== undefined) {
      const paramNames: string[] = []
      for (const param of compoundDef.templateParamList.params) {
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
        result += `< ${paramNames.join(', ')} >`
      }
    }
    return result
  }

  renderIndexMdx(): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let result: string = ''

    result += 'The classes, structs, union and interfaces with brief descriptions are:\n'
    result += '\n'

    result += '<TreeTable>\n'

    for (const classId of this.context.classes.topLevelClassIds) {
      result += this.renderClassRecursively(classId, 1)
    }

    result += '</TreeTable>\n'

    return result
  }

  renderClassRecursively(classId: string, depth: number): string {
    const _class: Class | undefined = this.context.classes.membersById.get(classId)
    assert(_class !== undefined)

    // console.log(util.inspect(_class), { compact: false, depth: 999 })

    let result: string = ''

    const compoundDef = _class.compoundDef
    const label = compoundDef.compoundName.replace(/^.*::/, '')

    const permalink = this.context.getPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C'
    }

    const iconLetter: string = iconLetters[compoundDef.kind] || '?'

    result += `<TreeTableRow itemIcon="${iconLetter}" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')
    result += '\n'

    result += '</TreeTableRow>\n'

    if (_class.childrenClassIds.length > 0) {
      for (const childClassId of _class.childrenClassIds) {
        result += this.renderClassRecursively(childClassId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
