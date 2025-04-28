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
import path from 'node:path'

import { FrontMatter } from '../types.js'
import { PageGeneratorBase } from './base.js'
import { Class } from '../view-model/classes-vm.js'

import { escapeHtml } from '../utils.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDefDataModel, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    frontMatter.toc_max_heading_level = 3

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    result += '\n'
    result += '## Fully Qualified Name\n'

    const classs = this.context.classes.membersById.get(compoundDef.id)
    assert(classs !== undefined)

    let classFullName = classs.fullyQualifiedName
    if (classs.templateParameters.length > 0) {
      classFullName += classs.templateParameters
    } else {
      classFullName += this.context.renderTemplateParameterNamesMdx(compoundDef)
    }

    result += '\n'
    result += `<CodeBlock>${classFullName}</CodeBlock>\n`

    result += this.context.renderIncludesIndexMdx(compoundDef)

    const object = this.context.classes.membersById.get(compoundDef.id)
    assert(object !== undefined)

    const kind = compoundDef.kind
    if (kind === 'class') {
      if (compoundDef.baseCompoundRefs !== undefined) {
        result += '\n'
        if (compoundDef.baseCompoundRefs.length > 1) {
          result += '## Base classes\n'
        } else {
          result += '## Base class\n'
        }
        result += '\n'
        result += '<MembersList>\n'

        for (const baseCompoundRef of compoundDef.baseCompoundRefs) {
          // console.log(util.inspect(baseCompoundRef, { compact: false, depth: 999 }))

          if (baseCompoundRef.refid !== undefined) {
            const compoundDef = this.context.compoundDefsById.get(baseCompoundRef.refid)
            assert(compoundDef !== undefined)

            result += this.context.renderClassIndexMdx(compoundDef)
          } else {
            const itemRight = escapeHtml(baseCompoundRef.text)
            result += '\n'
            result += `<MembersListItem itemLeft="${kind}" itemRight={<>${itemRight}</>}>\n`
            result += '</MembersListItem>\n'
          }
        }

        result += '\n'
        result += '</MembersList>\n'
      } else if ('baseClassIds' in object && object.baseClassIds.length > 0) {
        result += '\n'
        if (object.baseClassIds.length > 1) {
          result += '## Base classes\n'
        } else {
          result += '## Base class\n'
        }

        result += '\n'
        result += '<MembersList>\n'
        for (const baseClassId of object.baseClassIds) {
          const baseCompoundDef = this.context.compoundDefsById.get(baseClassId)
          assert(baseCompoundDef !== undefined)
          // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))

          result += this.context.renderClassIndexMdx(baseCompoundDef)
        }

        result += '\n'
        result += '</MembersList>\n'
      }

      if (compoundDef.derivedCompoundRefs !== undefined) {
        result += '\n'
        result += '## Derived Classes\n'

        result += '\n'
        result += '<MembersList>\n'

        for (const derivedCompoundRef of compoundDef.derivedCompoundRefs) {
          // console.log(util.inspect(derivedCompoundRef, { compact: false, depth: 999 }))

          if (derivedCompoundRef.refid !== undefined) {
            const compoundDef = this.context.compoundDefsById.get(derivedCompoundRef.refid)
            assert(compoundDef !== undefined)

            result += this.context.renderClassIndexMdx(compoundDef)
          } else {
            const itemRight = escapeHtml(derivedCompoundRef.text)
            result += '\n'
            result += `<MembersListItem itemLeft="${kind}" itemRight={<>${itemRight}</>}>\n`
            result += '</MembersListItem>\n'
          }
        }

        result += '\n'
        result += '</MembersList>\n'
      } else if ('derivedClassIds' in object && object.childrenIds.length > 0) {
        result += '\n'
        result += '## Derived Classes\n'

        result += '\n'
        result += '<MembersList>\n'
        for (const derivedClassId of object.childrenIds) {
          const derivedCompoundDef = this.context.compoundDefsById.get(derivedClassId)
          assert(derivedCompoundDef !== undefined)
          // console.log(util.inspect(derivedCompoundDef, { compact: false, depth: 999 }))

          result += this.context.renderClassIndexMdx(derivedCompoundDef)
        }

        result += '\n'
        result += '</MembersList>\n'
      }
    }

    result += this.context.renderInnerIndicesMdx({
      compoundDef,
      suffixes: []
    })

    result += this.context.renderSectionDefIndicesMdx(compoundDef)

    result += '\n'
    result += '## Description {#details}\n'

    if (compoundDef.templateParamList?.params !== undefined) {
      result += '\n'
      result += `The ${kind} template declaration is:\n`

      result += '\n'
      result += `<CodeBlock>template ${this.context.renderTemplateParametersMdx({ compoundDef, withDefaults: true })}\n`
      result += `${kind} ${classFullName};</CodeBlock>\n`
    }

    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription).trim()

    if (detailedDescription.length > 0) {
      result += '\n'
      result += detailedDescription
      result += '\n'
    }

    result += this.context.renderLocationMdx(compoundDef.location)

    result += this.context.renderSectionDefsMdx(compoundDef)

    return result
  }

  // --------------------------------------------------------------------------

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += 'The classes, structs, union and interfaces used by this project are:\n'

    result += '\n'
    result += '<TreeTable>\n'

    for (const classId of this.context.classes.topLevelClassIds) {
      result += this.renderIndexClassRecursively(classId, 1)
    }

    result += '\n'
    result += '</TreeTable>\n'

    return result
  }

  private renderIndexClassRecursively (classId: string, depth: number): string {
    const classs: Class | undefined = this.context.classes.membersById.get(classId)
    assert(classs !== undefined)

    // console.log(util.inspect(classs, { compact: false, depth: 999 }))

    let result: string = ''

    const compoundDef = classs.compoundDef

    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C',
      struct: 'S'
    }

    let iconLetter: string | undefined = iconLetters[compoundDef.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', compoundDef.kind, 'not supported yet in', this.constructor.name, '(using ?)')
      iconLetter = '?'
    }

    const label = escapeHtml(classs.unqualifiedName)

    result += '\n'
    result += `<TreeTableRow itemIconLetter="${iconLetter}" itemLabel="${label}" itemLink="${permalink}" depth = "${depth}" >\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')

    result += '\n'
    result += '</TreeTableRow>\n'

    if (classs.childrenIds.length > 0) {
      for (const childClassId of classs.childrenIds) {
        result += this.renderIndexClassRecursively(childClassId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
