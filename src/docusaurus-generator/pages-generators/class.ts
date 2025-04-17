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
import { RefText } from '../../doxygen-xml-parser/reftexttype.js'
import { Param } from '../../doxygen-xml-parser/paramtype.js'
import { DefVal } from '../../doxygen-xml-parser/linkedtexttype.js'

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

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    if (briefDescription.length > 0) {
      result += briefDescription
      result += ' <a href="#details">More...</a>\n'
      result += '\n'
    }

    if (compoundDef.includes !== undefined) {
      for (const include of compoundDef.includes) {
        result += this.context.renderElementMdx(include)
        result += '\n'
        result += '\n'
      }
    }

    result += '## Fully Qualified Name\n'
    result += '\n'
    result += `<code>${compoundDef.compoundName}${this.renderTemplateParamsMdx(compoundDef)}</code>\n`
    result += '\n'

    result += '\n'
    result += 'TODO: add sections summaries\n'
    result += '\n'

    // if (compoundDef.sectionDefs !== undefined) {
    //   for (const sectionDef of compoundDef.sectionDefs) {
    //     result += `${this.context.renderElementMdx(sectionDef)}\n`
    //     result += '\n'
    //   }
    // }

    result += '## Description {#details}\n'
    result += '\n'

    if (compoundDef.templateParamList?.params !== undefined) {
      const templateParameters: string[] = this.collectTemplateParameters({ compoundDef, withDefaults: true })
      const templateParameterNames: string[] = this.collectTemplateParameterNames(compoundDef)

      // console.log('templateParameters', templateParameters.join(', '))

      result += `<CodeBlock>template &lt;${templateParameters.join(', ')}&gt;\n`
      result += `class ${compoundDef.compoundName}&lt; ${templateParameterNames.join(', ')} &gt;</CodeBlock>\n`
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

  /**
   * Return an array of types, like `class T`, or `class U = T`, or `N T::* MP`
   * @param compoundDef
   * @returns
   */
  private collectTemplateParameters ({
    compoundDef,
    withDefaults = false
  }: {
    compoundDef: CompoundDef
    withDefaults?: boolean
  }): string[] {
    if (compoundDef.templateParamList?.params === undefined) {
      return []
    }

    const templateParameters: string[] = []

    for (const param of compoundDef.templateParamList.params) {
      // console.log(util.inspect(param), { compact: false, depth: 999 })
      assert(param.type !== undefined)
      assert(param.type.children.length === 1)
      assert(typeof param.type.children[0] === 'string')

      let paramString = ''

      if (typeof param.type.children[0] === 'string') {
        paramString += param.type.children[0]
      } else if (param.type.children[0] as object instanceof RefText) {
        paramString += (param.type.children[0] as RefText).text
      }
      if (param.declname !== undefined) {
        paramString += ` ${param.declname}`
      }

      if (withDefaults) {
        if (param.defval !== undefined) {
          const defval: DefVal = param.defval
          assert(defval.children.length === 1)
          if (typeof defval.children[0] === 'string') {
            paramString += ` = ${defval.children[0]}`
          } else if (defval.children[0] as object instanceof RefText) {
            paramString += ` = ${(defval.children[0] as RefText).text}`
          }
        }
      }

      templateParameters.push(paramString)
    }

    return templateParameters
  }

  private collectTemplateParameterNames (compoundDef: CompoundDef): string[] {
    if (compoundDef.templateParamList?.params === undefined) {
      return []
    }

    const templateParameterNames: string[] = []

    for (const param of compoundDef.templateParamList.params) {
      // console.log(util.inspect(param), { compact: false, depth: 999 })
      assert(param.type !== undefined)
      assert(param.type.children.length === 1)
      assert(typeof param.type.children[0] === 'string')
      let paramName = ''
      let paramString = ''

      // declname or defname?
      if (param.declname !== undefined) {
        paramString = param.declname
      } else if (typeof param.type.children[0] === 'string') {
        // Extract the parameter name, passed as `class T`.
        paramString = param.type.children[0]
      } else if (param.type.children[0] as object instanceof RefText) {
        paramString = (param.type.children[0] as RefText).text
      }
      paramName = paramString.replace(/class /, '')
      templateParameterNames.push(paramName)
    }
    return templateParameterNames
  }

  private renderTemplateParamsMdx (compoundDef: CompoundDef): string {
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
        result += `&lt; ${paramNames.join(', ')} &gt;`
      }
    }
    return result
  }

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

    const templateParameters = this.collectTemplateParameters({ compoundDef })
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
    result += '<MemberDefinition>\n'
    result += '<MemberDefinitionPrototype'
    if (templateParameters.length > 0) {
      result += ` template="template <${templateParameters.join(', ')}>"`
    }
    if (labels.length > 0) {
      result += ` labels={["${labels.join('","')}"]}`
    }
    result += '>\n'

    // .replace(/["]/g, '&quot;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')
    result += prototype
    result += '\n'
    result += '</MemberDefinitionPrototype>\n'

    result += '<MemberDefinitionDocumentation>\n'
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
    result += '</MemberDefinitionDocumentation>\n'
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
      result += this.renderClassRecursively(classId, 1)
    }

    result += '</TreeTable>\n'

    return result
  }

  renderClassRecursively (classId: string, depth: number): string {
    const _class: Class | undefined = this.context.classes.membersById.get(classId)
    assert(_class !== undefined)

    // console.log(util.inspect(_class), { compact: false, depth: 999 })

    let result: string = ''

    const compoundDef = _class.compoundDef
    const label = compoundDef.compoundName.replace(/^.*::/, '')

    const permalink = this.context.getCompoundPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C'
    }

    let iconLetter: string | undefined = iconLetters[compoundDef.kind]
    if (iconLetter === undefined) {
      console.error('Icon kind', compoundDef.kind, 'not supported yet in', this.constructor.name)
      iconLetter = '?'
    }

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
