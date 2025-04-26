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
import { Class } from '../data-model/classes-dm.js'
import path from 'node:path'
import { SectionDef } from '../../doxygen-xml-parser/sectiondeftype.js'
import { MemberDef } from '../../doxygen-xml-parser/memberdeftype.js'
import { Location } from '../../doxygen-xml-parser/locationtype.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    const kind = compoundDef.kind
    const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    frontMatter.title = `The ${compoundDef.compoundName.replace(/.*::/, '')}`
    frontMatter.title += ` ${kindCapitalised}`
    if (compoundDef.templateParamList !== undefined) {
      frontMatter.title += ' Template'
    }
    frontMatter.title += ' Reference'
    frontMatter.toc_max_heading_level = 3

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    result += '\n'
    result += '## Fully Qualified Name\n'

    result += '\n'
    result += `<CodeBlock>${compoundDef.compoundName}${this.context.renderTemplateParameterNamesMdx(compoundDef)}</CodeBlock>\n`

    result += this.context.renderIncludesIndexMdx(compoundDef)

    const object = this.context.classes.membersById.get(compoundDef.id)
    assert(object !== undefined)

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

            result += this.context.renderClassSummaryMdx(compoundDef)
          } else {
            const itemRight = this.context.escapeHtml(baseCompoundRef.text)
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

          result += this.context.renderClassSummaryMdx(baseCompoundDef)
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

            result += this.context.renderClassSummaryMdx(compoundDef)
          } else {
            const itemRight = this.context.escapeHtml(derivedCompoundRef.text)
            result += '\n'
            result += `<MembersListItem itemLeft="class" itemRight={<>${itemRight}</>}>\n`
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

          result += this.context.renderClassSummaryMdx(derivedCompoundDef)
        }

        result += '\n'
        result += '</MembersList>\n'
      }

      if (compoundDef.sectionDefs !== undefined) {
        for (const sectionDef of compoundDef.sectionDefs) {
          result += this.renderSectionDefSummaryMdx({
            sectionDef,
            compoundDef
          })
        }
      }
    }

    result += '\n'
    result += '## Description {#details}\n'

    if (compoundDef.templateParamList?.params !== undefined) {
      result += '\n'
      result += `The ${kind} template declaration is:\n`

      result += '\n'
      result += `<CodeBlock>template ${this.context.renderTemplateParametersMdx({ compoundDef, withDefaults: true })}\n`
      result += `${kind} ${compoundDef.compoundName}${this.context.renderTemplateParameterNamesMdx(compoundDef)};</CodeBlock>\n`
    }

    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription)

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
      result += `<Link to="${permalink}/#${lineAttribute}">${location.line?.toString()}</Link>`
      result += ' of file '
      result += `<Link to="${permalink}">${path.basename(location.file) as string}</Link>`
      result += '.\n'
    }

    return result
  }

  // --------------------------------------------------------------------------

  // <xsd:simpleType name="DoxSectionKind">
  //   <xsd:restriction base="xsd:string">
  //     <xsd:enumeration value="user-defined" />
  //     <xsd:enumeration value="public-type" />
  //     <xsd:enumeration value="public-func" />
  //     <xsd:enumeration value="public-attrib" />
  //     <xsd:enumeration value="public-slot" />
  //     <xsd:enumeration value="signal" />
  //     <xsd:enumeration value="dcop-func" />
  //     <xsd:enumeration value="property" />
  //     <xsd:enumeration value="event" />
  //     <xsd:enumeration value="public-static-func" />
  //     <xsd:enumeration value="public-static-attrib" />
  //     <xsd:enumeration value="protected-type" />
  //     <xsd:enumeration value="protected-func" />
  //     <xsd:enumeration value="protected-attrib" />
  //     <xsd:enumeration value="protected-slot" />
  //     <xsd:enumeration value="protected-static-func" />
  //     <xsd:enumeration value="protected-static-attrib" />
  //     <xsd:enumeration value="package-type" />
  //     <xsd:enumeration value="package-func" />
  //     <xsd:enumeration value="package-attrib" />
  //     <xsd:enumeration value="package-static-func" />
  //     <xsd:enumeration value="package-static-attrib" />
  //     <xsd:enumeration value="private-type" />
  //     <xsd:enumeration value="private-func" />
  //     <xsd:enumeration value="private-attrib" />
  //     <xsd:enumeration value="private-slot" />
  //     <xsd:enumeration value="private-static-func" />
  //     <xsd:enumeration value="private-static-attrib" />
  //     <xsd:enumeration value="friend" />
  //     <xsd:enumeration value="related" />
  //     <xsd:enumeration value="define" />
  //     <xsd:enumeration value="prototype" />
  //     <xsd:enumeration value="typedef" />
  //     <xsd:enumeration value="enum" />
  //     <xsd:enumeration value="func" />
  //     <xsd:enumeration value="var" />
  //   </xsd:restriction>
  // </xsd:simpleType>

  private getHeaderByKind (sectionDef: SectionDef): string {
    const headersByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Member Typedefs',
      'public-func': 'Member Functions',
      'public-attrib': 'Member Attributes',
      // 'public-slot': 'Member ?',
      'public-static-func': 'Static Functions',
      'public-static-attrib': 'Static Attributes',

      // 'signal': '',
      // 'dcop-func': '',
      // 'property': '',
      // 'event': '',

      'package-type': 'Package Member Typedefs',
      'package-func': 'Package Member Functions',
      'package-attrib': 'Package Member Attributes',
      'package-static-func': 'Package Static Functions',
      'package-static-attrib': 'Package Static Attributes',

      'protected-type': 'Protected Member Typedefs',
      'protected-func': 'Protected Member Functions',
      'protected-attrib': 'Protected Member Attributes',
      // 'protected-slot': 'Protected ?',
      'protected-static-func': 'Protected Static Functions',
      'protected-static-attrib': 'Protected Static Attributes',

      'private-type': 'Private Member Typedefs',
      'private-func': 'Private Member Functions',
      'private-attrib': 'Private Member Attributes',
      // 'private-slot': 'Private ?',
      'private-static-func': 'Private Static Functions',
      'private-static-attrib': 'Private Static Attributes'

      // 'friend': '',
      // 'related': '',
      // 'define': '',
      // 'prototype': '',
      // 'typedef': '',
      // 'enum': '',
      // 'func': '',
      // 'var': ''

    }

    const header = headersByKind[sectionDef.kind]
    if (header === undefined) {
      console.error(sectionDef, { compact: false, depth: 999 })
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name)
      return ''
    }

    return header.trim()
  }

  // --------------------------------------------------------------------------

  private renderSectionDefSummaryMdx ({
    sectionDef,
    compoundDef
  }: {
    sectionDef: SectionDef
    compoundDef: CompoundDef
  }): string {
    let result = ''

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs === undefined) {
      return ''
    }

    result += '\n'
    result += `<h2>${this.context.escapeHtml(header)}</h2>\n`

    result += '\n'
    result += '<MembersList>\n'

    const memberDefs = sectionDef.memberDefs

    for (const memberDef of memberDefs) {
      result += this.renderMethodDefSummaryMdx({ memberDef, sectionDef, compoundDef })
    }

    result += '\n'
    result += '</MembersList>\n'

    return result
  }

  private renderMethodDefSummaryMdx ({
    memberDef,
    sectionDef,
    compoundDef
  }: {
    memberDef: MemberDef
    sectionDef: SectionDef
    compoundDef: CompoundDef
  }): string {
    let result = ''

    const morePermalink = this.context.getPermalinkAnchor(memberDef.id)
    assert(morePermalink !== undefined && morePermalink.length > 1)

    const name = this.context.escapeHtml(memberDef.name)
    let itemLeft = ''
    let itemRight = `<Link to="#${morePermalink}">${name}</Link>`

    switch (memberDef.kind) {
      case 'typedef':
        itemLeft = 'using'
        if (memberDef.type !== undefined) {
          itemRight += ' = '
          itemRight += this.context.renderElementMdx(memberDef.type).trim()
        }
        break

      case 'function':
        itemLeft = this.context.renderElementMdx(memberDef.type).trim()
        if (memberDef.argsstring !== undefined) {
          itemRight += ' '
          itemRight += this.context.escapeHtml(memberDef.argsstring)
        }
        break

      case 'variable':
        itemLeft = this.context.renderElementMdx(memberDef.type).trim()
        break

      default:
        console.error('member kind', memberDef.kind, 'not implemented yet in', this.constructor.name)
    }

    result += '\n'
    if (itemLeft.length > 0) {
      if (itemLeft.includes('<') || itemLeft.includes('&')) {
        result += `<MembersListItem itemLeft={<>${itemLeft}</>} itemRight={<>${itemRight}</>}>\n`
      } else {
        result += `<MembersListItem itemLeft="${itemLeft}" itemRight={<>${itemRight}</>}>\n`
      }
    } else {
      result += `<MembersListItem itemLeft="&nbsp;" itemRight={<>${itemRight}</>}>\n`
    }

    const briefDescription: string = this.context.renderElementMdx(memberDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ` <Link to="#${morePermalink}">`
      result += 'More...'
      result += '</Link>\n'
    }

    result += '</MembersListItem>\n'

    return result
  }

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

    const header = this.getHeaderByKind(sectionDef)
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
    result += `## ${this.context.escapeHtml(header)}\n`

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
    result += `### ${this.context.escapeHtml(name)} {#${id}}\n`

    const templateParameters = this.context.collectTemplateParameters({ compoundDef })
    assert(memberDef.definition !== undefined)
    let prototype = this.context.escapeHtml(memberDef.definition)
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
    const label = classs.unqualifiedName

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

    result += '\n'
    result += `<TreeTableRow itemIconLetter = "${iconLetter}" itemLabel = "${label}" itemLink = "${permalink}" depth = "${depth}" >\n`

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
