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

import * as util from 'node:util'
import assert from 'node:assert'

import { MemberDefDataModel } from '../../data-model/compounds/memberdeftype-dm.js'
import { MemberDataModel } from '../../data-model/compounds/membertype-dm.js'
import { SectionDefDataModel } from '../../data-model/compounds/sectiondeftype-dm.js'
import { CompoundBase } from './compound-base-vm.js'
import { escapeMdx, getPermalinkAnchor } from '../utils.js'

// ----------------------------------------------------------------------------

export class Section {
  compound: CompoundBase
  kind: string
  headerName: string
  members: Array<Member | MemberRef> = []
  definitionMembers: Member[] = []

  constructor (compound: CompoundBase, sectionDef: SectionDefDataModel) {
    this.compound = compound
    this.kind = sectionDef.kind

    this.headerName = this.getHeaderNameByKind(sectionDef)
    assert(this.headerName.length > 0)

    const members: Array<Member | MemberRef> = []

    if (sectionDef.memberDefs !== undefined) {
      for (const memberDefDataModel of sectionDef.memberDefs) {
        const member = new Member(this, memberDefDataModel)
        members.push(member)
        this.definitionMembers.push(member)
        // Do not add it to the global map since additional checks are needed
        // therefore the procedure is done in the global generator.
      }
    }

    if (sectionDef.members !== undefined) {
      for (const memberRef of sectionDef.members) {
        members.push(new MemberRef(this, memberRef))
      }
    }

    this.members = members.sort((a, b) => a.name.localeCompare(b.name))
  }

  hasDefinitionMembers (): boolean {
    return this.definitionMembers.length > 0
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

  getHeaderNameByKind (sectionDef: SectionDefDataModel): string {
    const headerNamesByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Public Member Typedefs',
      'public-func': 'Public Member Functions',
      'public-attrib': 'Public Member Attributes',
      // 'public-slot': 'Member ?',
      'public-static-func': 'Public Static Functions',
      'public-static-attrib': 'Public Static Attributes',

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
      'private-static-attrib': 'Private Static Attributes',

      // 'friend': '',
      // 'related': '',
      // 'define': '',
      // 'prototype': '',

      typedef: 'Typedefs',
      enum: 'Enumerations',
      func: 'Functions',
      var: 'Variables',

      // Extra, not present in Doxygen.
      'public-constructor': 'Public Constructors',
      'public-destructor': 'Public Destructor',
      'protected-constructor': 'Protected Constructors',
      'protected-destructor': 'Protected Destructor',
      'private-constructor': 'Private Constructors',
      'private-destructor': 'Private Destructor'
    }

    // ------------------------------------------------------------------------

    const header = headerNamesByKind[sectionDef.kind]
    if (header === undefined) {
      console.error(sectionDef, { compact: false, depth: 999 })
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name, 'getHeaderByKind')
      return ''
    }

    return header.trim()
  }

  // --------------------------------------------------------------------------

  renderIndexToMdxLines (): string[] {
    const lines: string[] = []

    // console.log(sectionDef)
    if (this.members.length > 0) {
      lines.push('')
      lines.push(`## ${escapeMdx(this.headerName)} Index`)

      lines.push('')
      lines.push('<MembersIndex>')

      for (const member of this.members) {
        if (member instanceof Member) {
          lines.push(...member.renderIndexToMdxLines())
        } else if (member instanceof MemberRef) {
          const referredMember = this.compound.collection.workspace.membersById.get(member.refid)
          assert(referredMember !== undefined)
          lines.push(...referredMember.renderIndexToMdxLines())
        }
      }

      lines.push('')
      lines.push('</MembersIndex>')
    }
    return lines
  }

  // --------------------------------------------------------------------------

  renderToMdxLines (): string[] {
    const lines: string[] = []

    if (this.definitionMembers.length === 0) {
      return lines
    }

    // TODO: filter out members defined in other compounds.

    lines.push('')
    lines.push('<SectionDefinition>')

    lines.push('')
    lines.push(`## ${escapeMdx(this.headerName)}`)

    for (const member of this.definitionMembers) {
      lines.push(...member.renderToMdxLines())
    }

    lines.push('')
    lines.push('</SectionDefinition>')

    return lines
  }
}

// ----------------------------------------------------------------------------

class MemberBase {
  section: Section
  name: string

  constructor (section: Section, name: string) {
    this.section = section
    this.name = name
  }
}

export class Member extends MemberBase {
  memberDef: MemberDefDataModel

  constructor (section: Section, memberDef: MemberDefDataModel) {
    super(section, memberDef.name)
    this.memberDef = memberDef
  }

  // --------------------------------------------------------------------------

  renderIndexToMdxLines (): string[] {
    // console.log(util.inspect(memberDef, { compact: false, depth: 999 }))
    const lines: string[] = []

    const compoundDef = this.section.compound.compoundDef

    const workspace = this.section.compound.collection.workspace

    const permalink = workspace.getPermalink({ refid: this.memberDef.id, kindref: 'member' })
    assert(permalink !== undefined && permalink.length > 1)

    const name = escapeMdx(this.memberDef.name)

    let itemType = ''
    let itemName = `<Link to="${permalink}">${name}</Link>`

    const templateParamList = this.memberDef.templateparamlist ?? compoundDef.templateParamList
    // const templateParameters = this.renderTemplateParametersMdx({ templateParamList, withDefaults: true })

    switch (this.memberDef.kind) {
      case 'typedef':
        itemType = 'using'
        if (this.memberDef.type !== undefined) {
          itemName += ' = '
          itemName += workspace.renderElementToMdxText(this.memberDef.type).trim()
        }
        break

      case 'function':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // https://github.com/doxygen/doxygen/discussions/11568
          // TODO: improve.

          const type = workspace.renderElementToMdxText(this.memberDef.type).trim()

          let trailingType = false
          if ((this.section.compound.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
              (type.includes('&lt;') && type.includes('&gt;'))
            )
          )) {
            trailingType = true
          }

          if (this.memberDef.constexpr?.valueOf() && !type.includes('constexpr')) {
            itemType += 'constexpr '
          }

          if (this.memberDef.argsstring !== undefined) {
            itemName += ' '
            itemName += escapeMdx(this.memberDef.argsstring)
          }

          if (trailingType) {
            if (!itemType.includes('auto')) {
              itemType += 'auto '
            }
            // WARNING: Doxygen shows this, but the resulting line is too long.
            itemName += escapeMdx(' -> ')
            itemName += type
          } else {
            itemType += type
          }

          if (this.memberDef.initializer !== undefined) {
            itemName += ' '
            itemName += workspace.renderElementToMdxText(this.memberDef.initializer)
          }
        }
        break

      case 'variable':
        itemType += workspace.renderElementToMdxText(this.memberDef.type).trim()
        if (this.memberDef.initializer !== undefined) {
          itemName += ' '
          itemName += workspace.renderElementToMdxText(this.memberDef.initializer)
        }
        break

      case 'enum':
        itemType = 'enum'
        if (this.memberDef.strong?.valueOf()) {
          itemType += ' class'
        }
        break

      default:
        console.error('member kind', this.memberDef.kind, 'not implemented yet in', this.constructor.name, 'renderMethodDefIndexMdx')
    }

    lines.push('')
    lines.push('<MembersIndexItem')

    if (itemType.length > 0) {
      if (itemType.includes('<') || itemType.includes('&')) {
        lines.push(`  type={<>${itemType}</>}`)
      } else {
        lines.push(`  type="${itemType}"`)
      }
    } else {
      lines.push('  type="&nbsp;"')
    }
    if (itemName.includes('<') || itemName.includes('&')) {
      lines.push(`  name={<>${itemName}</>}>`)
    } else {
      lines.push(`  name="${itemName}">`)
    }

    const briefDescriptionMdxText: string = workspace.renderElementToMdxText(this.memberDef.briefDescription)
    if (briefDescriptionMdxText.length > 0) {
      lines.push(this.section.compound.renderBriefDescriptionToMdxText({
        briefDescriptionMdxText,
        morePermalink: `${permalink}` // No #details, it is already an anchor.
      }))
    }

    lines.push('</MembersIndexItem>')

    return lines
  }

  // --------------------------------------------------------------------------

  renderToMdxLines (): string[] {
    const lines: string[] = []

    const isFunction: boolean = this.section.kind.endsWith('func') || this.section.kind.endsWith('constructor') || this.section.kind.endsWith('destructor')

    const memberDef = this.memberDef

    const labels: string[] = []
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
    if (memberDef.noexcept?.valueOf()) {
      labels.push('noexcept')
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
    // WARNING: there is no explicit attribute for 'default'.
    if (memberDef.argsstring?.endsWith('=default')) {
      labels.push('default')
    }
    if (memberDef.strong?.valueOf()) {
      labels.push('strong')
    }

    // WARNING: could not find how to generate 'inherited'.

    // Validation checks.
    // const passed via the prototype.
    if (memberDef.mutable?.valueOf()) {
      console.error(util.inspect(memberDef, { compact: false, depth: 999 }))
      console.error(memberDef.constructor.name, 'mutable not yet rendered in', this.constructor.name)
    }

    const workspace = this.section.compound.collection.workspace

    const templateParamList = memberDef.templateparamlist ?? this.section.compound.compoundDef.templateParamList
    const templateParameters = this.section.compound.renderTemplateParametersToMdxText({ templateParamList, withDefaults: true })

    const id = getPermalinkAnchor(memberDef.id)
    const name = memberDef.name + (isFunction ? '()' : '')

    lines.push('')
    lines.push(`### ${escapeMdx(name)} {#${id}}`)

    // console.log(memberDef.kind)
    switch (memberDef.kind) {
      case 'function':
      case 'typedef':
      case 'variable':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          assert(memberDef.definition !== undefined)
          let prototype = escapeMdx(memberDef.definition)
          if (memberDef.kind === 'function') {
            prototype += ' ('

            if (memberDef.params !== undefined) {
              const params: string[] = []
              for (const param of memberDef.params) {
                params.push(workspace.renderElementToMdxText(param))
              }
              prototype += params.join(', ')
            }

            prototype += ')'
          }

          if (memberDef.initializer !== undefined) {
            prototype += ` ${workspace.renderElementToMdxText(memberDef.initializer)}`
          }

          if (memberDef.constt?.valueOf()) {
            prototype += ' const'
          }

          lines.push('')
          lines.push('<MemberDefinition')
          if (templateParameters.length > 0) {
            const template = escapeMdx(`template ${templateParameters}`)
            lines.push(`  template={<>${template}</>}`)
          }
          lines.push(`  prototype={<>${prototype}</>}${labels.length === 0 ? '>' : ''}`)
          if (labels.length > 0) {
            lines.push(`  labels = {["${labels.join('", "')}"]}>`)
          }

          const memberBriefDefinition = workspace.renderElementToMdxText(memberDef.briefDescription)
          if (memberBriefDefinition.length > 0) {
            lines.push(memberBriefDefinition)
          }

          lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
            detailedDescription: memberDef.detailedDescription,
            showHeader: false
          }))

          lines.push(this.section.compound.renderLocationToMdxText(memberDef.location))

          lines.push('</MemberDefinition>')
        }

        break

      case 'enum':
        {
          let prototype = 'enum '
          if (memberDef.strong?.valueOf()) {
            prototype += 'class '
          }
          prototype += escapeMdx(memberDef.qualifiedName ?? '?')

          lines.push('')
          lines.push('<MemberDefinition')
          lines.push(`  prototype={<>${prototype}</>}${labels.length === 0 ? '>' : ''}`)
          if (labels.length > 0) {
            lines.push(` labels = {["${labels.join('", "')}"]}>`)
          }

          const memberBriefDefinition = workspace.renderElementToMdxText(memberDef.briefDescription)
          if (memberBriefDefinition.length > 0) {
            lines.push(memberBriefDefinition)
          }

          lines.push(...this.renderEnumToMdxLines(memberDef))

          lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
            detailedDescription: memberDef.detailedDescription,
            showHeader: false
          }))

          lines.push(this.section.compound.renderLocationToMdxText(memberDef.location))

          lines.push('</MemberDefinition>')
        }

        break

      default:
        lines.push('')
        console.warn('memberDef', memberDef.kind, memberDef.name, 'not implemented yet in', this.constructor.name, 'renderMemberDefMdx')
    }

    return lines
  }

  // --------------------------------------------------------------------------

  renderEnumToMdxLines (memberDef: MemberDefDataModel): string[] {
    const lines: string[] = []

    const workspace = this.section.compound.collection.workspace

    lines.push('')
    lines.push('<EnumerationList title="Enumeration values">')

    if (memberDef.enumvalues !== undefined) {
      for (const enumValue of memberDef.enumvalues) {
        let briefDescription: string = workspace.renderElementToMdxText(enumValue.briefDescription).replace(/[.]$/, '')
        const permalink = workspace.getPermalink({ refid: enumValue.id, kindref: 'member' })
        const value = workspace.renderElementToMdxText(enumValue.initializer)
        if (value.length > 0) {
          briefDescription += ` (${value})`
        }

        lines.push('')
        lines.push(`<Link id="${permalink}" />`)
        lines.push(`<EnumerationListItem name="${enumValue.name.trim()}">`)
        lines.push(`${briefDescription}`)
        lines.push('</EnumerationListItem>')
      }
    }
    lines.push('')
    lines.push('</EnumerationList>')

    return lines
  }
}

export class MemberRef extends MemberBase {
  // memberRef: MemberDataModel
  refid: string

  constructor (section: Section, memberRef: MemberDataModel) {
    super(section, memberRef.name)
    // this.memberRef = memberRef

    this.refid = memberRef.refid
  }
}

// ----------------------------------------------------------------------------
