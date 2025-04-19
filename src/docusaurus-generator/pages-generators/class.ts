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
import path from 'node:path'
import { SectionDef } from '../../doxygen-xml-parser/sectiondeftype.js'
import { MemberDef } from '../../doxygen-xml-parser/memberdeftype.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName.replace(/.*::/, '')}`
    frontMatter.title += ' Class'
    if (compoundDef.templateParamList !== undefined) {
      frontMatter.title += ' Template'
    }
    frontMatter.title += ' Reference'
    frontMatter.toc_max_heading_level = 3

    let result: string = ''

    result += this.context.renderBriefDescription(compoundDef)

    result += '## Fully Qualified Name\n'
    result += '\n'
    result += `<p class="doxyQualifiedName"><code>${compoundDef.compoundName}${this.context.renderTemplateParameterNamesMdx(compoundDef)}</code></p>\n`
    result += '\n'

    result += this.context.renderIncludesIndex(compoundDef)

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += this.renderSectionDefSummaryMdx({
          sectionDef,
          compoundDef
        })
        result += '\n'
      }
    }

    result += '## Description {#details}\n'
    result += '\n'

    if (compoundDef.templateParamList?.params !== undefined) {
      result += 'The class template declaration is:\n'
      result += '\n'

      result += `<CodeBlock>template ${this.context.renderTemplateParametersMdx({ compoundDef, withDefaults: true })}\n`
      result += `class ${compoundDef.compoundName}${this.context.renderTemplateParameterNamesMdx(compoundDef)};</CodeBlock>\n`
      result += '\n'
    }

    const detailedDescription: string = this.context.renderElementMdx(compoundDef.detailedDescription)
    if (detailedDescription.length > 0 && detailedDescription !== '<hr/>') {
      result += detailedDescription
      result += '\n'
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

    if (compoundDef.location !== undefined) {
      result += 'Definition at line '
      result += compoundDef.location.line?.toString() // TODO: add link
      result += ' of file '
      result += path.basename(compoundDef.location.file) as string
      result += '.\n'
      result += '\n'
    }

    const className = compoundDef.compoundName.replace(/.*::/, '')

    if (compoundDef.sectionDefs !== undefined) {
      for (const sectionDef of compoundDef.sectionDefs) {
        result += this.renderSectionDefMdx({
          sectionDef,
          className,
          compoundDef
        })
        result += '\n'
      }
    }

    return result
  }

  // --------------------------------------------------------------------------

  private getHeaderByKind (sectionDef: SectionDef): string {
    const headersByKind: Record<string, string> = {
      'public-type': 'Member Typedefs',
      'public-attrib': 'Member Attributes',
      'protected-attrib': 'Protected Member Attributes',
      'public-func': 'Member Functions',
      'protected-func': 'Protected Member Functions'
    }

    const header = headersByKind[sectionDef.kind]
    if (header === undefined) {
      console.error(sectionDef, { compact: false, depth: 999 })
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name)
      return ''
    }

    return header
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

    result += `<h2>${header}</h2>\n`
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
          itemRight += memberDef.argsstring
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
      result += `<MembersListItem itemLeft={<>${itemLeft}</>} itemRight={<>${itemRight}</>}>\n`
    } else {
      result += `<MembersListItem itemLeft="&nbsp;" itemRight={<>${itemRight}</>}>\n`
    }

    const briefDescription: string = this.context.renderElementMdx(memberDef.briefDescription)
    result += briefDescription
    result += ` <Link to="#${morePermalink}">`
    result += 'More...'
    result += '</Link>\n'

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

    const header = this.getHeaderByKind(sectionDef)
    if (header.length === 0) {
      return ''
    }

    if (sectionDef.memberDefs === undefined) {
      return ''
    }

    result += '<div class="doxySectionDef">\n'
    result += '\n'

    const sectionLabels: string[] = []

    let memberDefs = sectionDef.memberDefs
    if (sectionDef.kind === 'public-func') {
      const constructors: MemberDef[] = []
      let destructor: MemberDef | undefined
      const methods = []
      for (const memberDef of sectionDef.memberDefs) {
        // console.log(memberDef, { compact: false, depth: 999 })
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
        result += '## Constructors\n'
        result += '\n'

        for (const constructor of constructors) {
          result += this.renderMethodDefMdx({ memberDef: constructor, compoundDef, sectionLabels, isFunction: true })
        }
      }

      if (destructor !== undefined) {
        result += '## Destructor\n'
        result += '\n'
        result += this.renderMethodDefMdx({ memberDef: destructor, compoundDef, sectionLabels, isFunction: true })
      }

      memberDefs = methods
    }

    result += `## ${header}\n`
    result += '\n'

    const isFunction: boolean = sectionDef.kind === 'public-func'

    for (const memberDef of memberDefs) {
      result += this.renderMethodDefMdx({ memberDef, compoundDef, sectionLabels, isFunction })
    }

    result += '</div>\n'

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
    if (memberDef.constexpr?.valueOf()) {
      labels.push('constexpr')
    }
    if (memberDef.prot === 'protected') {
      labels.push('protected')
    }
    // WARNING: could not find how to generate 'inherited'.

    // Validation checks.
    if (memberDef._static?.valueOf()) {
      console.error(memberDef.constructor.name, 'static not yet rendered in', this.constructor.name)
    }
    // const passed via the prototype.
    if (memberDef.mutable?.valueOf()) {
      console.error(memberDef.constructor.name, 'mutable not yet rendered in', this.constructor.name)
    }

    if (memberDef.virt !== undefined && memberDef.virt !== 'non-virtual') {
      console.error(memberDef.constructor.name, 'virt not yet rendered in', this.constructor.name)
    }

    const id = memberDef.id.replace(/.*_1/, '')
    const name = memberDef.name + (isFunction ? '()' : '')
    result += `### ${name} {#${id}}\n`
    result += '\n'

    const templateParameters = this.context.collectTemplateParameters({ compoundDef })
    assert(memberDef.definition !== undefined)
    let prototype = memberDef.definition.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')
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
    if (memberDef._const?.valueOf()) {
      prototype += ' const'
    }
    result += '<MemberDefinition\n'
    if (templateParameters.length > 0) {
      const template = `template &lt;${templateParameters.join(', ')}&gt;`
      result += `  template={<>${template}</>}\n`
    }
    result += `  prototype={<>${prototype}</>}\n`
    if (labels.length > 0) {
      result += ` labels = {["${labels.join('", "')}"]}\n`
    }
    result += '>\n'
    const briefDescription: string = this.context.renderElementMdx(memberDef.briefDescription).trim()
    if (briefDescription.length > 0) {
      result += briefDescription
      result += '\n'
      result += '\n'
    }

    const detailedDescription: string = this.context.renderElementMdx(memberDef.detailedDescription).trim()
    if (detailedDescription.length > 0) {
      result += detailedDescription
      result += '\n'
      result += '\n'
    }

    if (memberDef.location !== undefined) {
      result += 'Definition at line '
      result += memberDef.location.line?.toString() // TODO: add link
      result += ' of file '
      result += path.basename(memberDef.location.file) as string
      result += '.\n'
    }
    result += '</MemberDefinition>\n'
    result += '\n'

    return result
  }

  // --------------------------------------------------------------------------

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let result: string = ''

    result += 'The classes, structs, union and interfaces with brief descriptions are:\n'
    result += '\n'

    result += '<TreeTable>\n'

    for (const classId of this.context.classes.topLevelClassIds) {
      result += this.renderIndexClassRecursively(classId, 1)
    }

    result += '</TreeTable>\n'

    return result
  }

  private renderIndexClassRecursively (classId: string, depth: number): string {
    const _class: Class | undefined = this.context.classes.membersById.get(classId)
    assert(_class !== undefined)

    // console.log(util.inspect(_class), { compact: false, depth: 999 })

    let result: string = ''

    const compoundDef = _class.compoundDef
    const label = compoundDef.compoundName.replace(/^.*::/, '')

    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C'
    }

    let iconLetter: string | undefined = iconLetters[compoundDef.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', compoundDef.kind, 'not supported yet in', this.constructor.name)
      iconLetter = '?'
    }

    result += `<TreeTableRow itemIcon = "${iconLetter}" itemLabel = "${label}" itemLink = "${permalink}" depth = "${depth}" >\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')
    result += '\n'

    result += '</TreeTableRow>\n'

    if (_class.childrenClassIds.length > 0) {
      for (const childClassId of _class.childrenClassIds) {
        result += this.renderIndexClassRecursively(childClassId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
