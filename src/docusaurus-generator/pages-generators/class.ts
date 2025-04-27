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
import { Class } from '../data-model/classes-dm.js'
import path from 'node:path'
import { SectionDef } from '../../doxygen-xml-parsers/sectiondeftype-parser.js'
import { MemberDef } from '../../doxygen-xml-parsers/memberdeftype-parser.js'
import { Location } from '../../doxygen-xml-parsers/locationtype-parser.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
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

    // if (compoundDef.sectionDefs !== undefined) {
    //   console.log('Class', compoundDef.compoundName)
    //   for (const sectionDef of compoundDef.sectionDefs) {
    //     console.log('  SectionDef', sectionDef.kind)
    //     assert(sectionDef.memberDefs !== undefined)
    //     for (const memberDef of sectionDef.memberDefs) {
    //       console.log('    MemberDef', memberDef.kind, memberDef.prot, memberDef.name)
    //       // console.log('    MemberDef+', memberDef.definition)
    //     }
    //   }
    // }

    result += this.renderLocationMdx(compoundDef.location)

    const className = compoundDef.compoundName.replace(/.*::/, '')

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += this.renderSectionDefMdx({
          sectionDef,
          className,
          compoundDef
        })
      }
    }

    return result
  }

  // --------------------------------------------------------------------------

  private renderLocationMdx (location: Location | undefined): string {
    let result: string = ''

    if (location !== undefined) {
      // console.log(location.file)
      const file = this.context.files.membersByPath.get(location.file)
      assert(file !== undefined)
      const permalink = this.context.getPagePermalink(file.compoundDef.id)

      result += '\n'
      result += 'Definition at line '
      const lineAttribute = `l${location.line?.toString().padStart(5, '0')}`
      result += `<Link to="${permalink}/#${lineAttribute}">${escapeHtml(location.line?.toString() ?? '?')}</Link>`
      result += ' of file '
      result += `<Link to="${permalink}">${escapeHtml(path.basename(location.file) as string)}</Link>`
      result += '.\n'
    }

    return result
  }

  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------

  private renderSectionDefMdx ({
    sectionDef,
    compoundDef,
    className
  }: {
    sectionDef: SectionDef
    compoundDef: CompoundDef
    className: string
  }): string {
    let result = ''

    const header = this.context.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs === undefined) {
      return ''
    }

    result += '\n'
    result += '<SectionDefinition>\n'

    const sectionLabels: string[] = []

    let memberDefs = sectionDef.memberDefs
    if (sectionDef.kind === 'public-func') {
      const constructors: MemberDef[] = []
      let destructor: MemberDef | undefined
      const methods = []
      for (const memberDef of sectionDef.memberDefs) {
        // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
        if (memberDef.name === className) {
          constructors.push(memberDef)
        } else if (memberDef.name.replace('~', '') === className) {
          assert(destructor === undefined)
          destructor = memberDef
        } else {
          methods.push(memberDef)
        }
      }

      if (constructors.length > 0) {
        result += '\n'
        result += '## Constructors\n'

        for (const constructor of constructors) {
          result += this.renderMethodDefMdx({ memberDef: constructor, compoundDef, sectionLabels, isFunction: true })
        }
      }

      if (destructor !== undefined) {
        result += '\n'
        result += '## Destructor\n'

        result += this.renderMethodDefMdx({ memberDef: destructor, compoundDef, sectionLabels, isFunction: true })
      }

      memberDefs = methods
    }

    result += '\n'
    result += `## ${escapeHtml(header)}\n`

    const isFunction: boolean = sectionDef.kind === 'public-func'

    for (const memberDef of memberDefs) {
      result += this.renderMethodDefMdx({ memberDef, compoundDef, sectionLabels, isFunction })
    }

    result += '\n'
    result += '</SectionDefinition>\n'

    return result
  }

  private renderMethodDefMdx ({
    memberDef,
    compoundDef,
    sectionLabels,
    isFunction
  }: {
    memberDef: MemberDef
    compoundDef: CompoundDef
    sectionLabels: string[]
    isFunction: boolean
  }): string {
    let result = ''

    const labels: string[] = [...sectionLabels]
    if (memberDef.inline?.valueOf()) {
      labels.push('inline')
    }
    if (memberDef.explicit?.valueOf()) {
      labels.push('explicit')
    }
    if (memberDef.nodiscard?.valueOf()) {
      labels.push('nodiscard')
    }
    if (memberDef.constexpr?.valueOf()) {
      labels.push('constexpr')
    }
    if (memberDef.prot === 'protected') {
      labels.push('protected')
    }
    if (memberDef.staticc?.valueOf()) {
      labels.push('static')
    }
    if (memberDef.virt !== undefined && memberDef.virt === 'virtual') {
      labels.push('virtual')
    }
    // WARNING: there is no explicit attribute for 'delete'.
    if (memberDef.argsstring?.endsWith('=delete')) {
      labels.push('delete')
    }

    // WARNING: could not find how to generate 'inherited'.

    // Validation checks.
    // const passed via the prototype.
    if (memberDef.mutable?.valueOf()) {
      console.error(util.inspect(memberDef, { compact: false, depth: 999 }))
      console.error(memberDef.constructor.name, 'mutable not yet rendered in', this.constructor.name)
    }

    const id = memberDef.id.replace(/.*_1/, '')
    const name = memberDef.name + (isFunction ? '()' : '')

    result += '\n'
    result += `### ${escapeHtml(name)} {#${id}}\n`

    const templateParameters = this.context.collectTemplateParameters({ compoundDef })
    assert(memberDef.definition !== undefined)
    let prototype = escapeHtml(memberDef.definition)
    if (memberDef.kind === 'function') {
      prototype += ' ('

      if (memberDef.params !== undefined) {
        const params: string[] = []
        for (const param of memberDef.params) {
          params.push(this.context.renderElementMdx(param))
        }
        prototype += params.join(', ')
      }

      prototype += ')'
    }
    if (memberDef.constt?.valueOf()) {
      prototype += ' const'
    }

    result += '\n'
    result += '<MemberDefinition'
    if (templateParameters.length > 0) {
      const template = `template &lt;${templateParameters.join(', ')}&gt;`
      result += `\n  template={<>${template}</>}`
    }
    result += `\n  prototype={<>${prototype}</>}`
    if (labels.length > 0) {
      result += `\n labels = {["${labels.join('", "')}"]}`
    }
    result += '>\n'
    const briefDescription: string = this.context.renderElementMdx(memberDef.briefDescription).trim()
    if (briefDescription.length > 0) {
      result += briefDescription
      result += '\n'
    }

    const detailedDescription: string = this.context.renderElementMdx(memberDef.detailedDescription).trim()
    if (detailedDescription.length > 0) {
      result += '\n'
      result += detailedDescription
      result += '\n'
    }

    result += this.renderLocationMdx(memberDef.location)

    result += '</MemberDefinition>\n'

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
