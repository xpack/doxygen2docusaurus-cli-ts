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
import { escapeHtml, escapeMdx, getPermalinkAnchor } from '../utils.js'
import { Class } from './classes-vm.js'

// ----------------------------------------------------------------------------

export class Section {
  compound: CompoundBase
  kind: string
  headerName: string
  descriptionMdxText: string | undefined
  members: Array<Member | MemberRef> = []
  definitionMembers: Member[] = []

  _private: {
    // Available only during the initializeLate().
    _sectionDef?: SectionDefDataModel
  } = {}

  constructor (compound: CompoundBase, sectionDef: SectionDefDataModel) {
    this._private._sectionDef = sectionDef

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

  initializeLate (): void {
    const workspace = this.compound.collection.workspace
    assert(this._private._sectionDef !== undefined)
    const sectionDef = this._private._sectionDef
    if (sectionDef.description !== undefined) {
      this.descriptionMdxText = workspace.renderElementToMdxText(sectionDef.description)
    }
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
    // User defined sections have their own header.
    if (sectionDef.kind === 'user-defined') {
      if (sectionDef.header !== undefined) {
        return sectionDef.header.trim()
      }

      // if (sectionDef.header === undefined) {
      //   // console.warn(util.inspect(sectionDef, { compact: false, depth: 999 }))
      //   console.warn('header missing in sectionDef of kind', sectionDef.kind)
      //   return 'User Defined'
      // } else {
      //   return sectionDef.header.trim()
      // }
      if (sectionDef.memberDefs === undefined) {
        // console.log(sectionDef)
        console.warn('sectionDef of kind user-defined has no members, cannot compute title')
        return 'User Defined'
      }
      console.log('---')
      for (const m of sectionDef.memberDefs) {
        console.log(m.kind)
      }
      return 'User Defined'
    }

    if (sectionDef.header !== undefined) {
      console.warn('header', sectionDef.header, 'ignored in sectionDef of kind', sectionDef.kind)
    }

    const headerNamesByKind: Record<string, string> = {
      // 'user-defined': '?',
      'public-type': 'Public Member Typedefs',
      'public-func': 'Public Member Functions',
      'public-attrib': 'Public Member Attributes',
      'public-slot': 'Member Slots',
      'public-static-func': 'Public Static Functions',
      'public-static-attrib': 'Public Static Attributes',

      signal: 'Signals',
      // 'dcop-func': 'DCOP Functions',
      property: 'Properties',
      event: 'Events',

      'package-type': 'Package Member Typedefs',
      'package-func': 'Package Member Functions',
      'package-attrib': 'Package Member Attributes',
      'package-static-func': 'Package Static Functions',
      'package-static-attrib': 'Package Static Attributes',

      'protected-type': 'Protected Member Typedefs',
      'protected-func': 'Protected Member Functions',
      'protected-attrib': 'Protected Member Attributes',
      'protected-slot': 'Protected Slot',
      'protected-static-func': 'Protected Static Functions',
      'protected-static-attrib': 'Protected Static Attributes',

      'private-type': 'Private Member Typedefs',
      'private-func': 'Private Member Functions',
      'private-attrib': 'Private Member Attributes',
      'private-slot': 'Private Slot',
      'private-static-func': 'Private Static Functions',
      'private-static-attrib': 'Private Static Attributes',

      friend: 'Friends',
      // 'related': 'Related',
      define: 'Defines',
      prototype: 'Prototypes',

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
      console.error(util.inspect(sectionDef, { compact: false, depth: 999 }))
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

    if (this.descriptionMdxText !== undefined) {
      lines.push('')
      lines.push(...this.compound.renderDetailedDescriptionToMdxLines({
        detailedDescriptionMdxText: this.descriptionMdxText,
        showHeader: false
      }))
    }

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

  initializeLate (): void {
  }
}

export class Member extends MemberBase {
  id: string
  kind: string

  briefDescriptionMdxText: string | undefined
  detailedDescriptionMdxText: string | undefined

  argsstring: string | undefined
  qualifiedName: string | undefined
  definition: string | undefined

  typeMdxText: string | undefined
  initializerMdxText: string | undefined
  locationMdxText: string | undefined
  templateParametersMdxText: string | undefined
  enumMdxLines: string[] | undefined
  parameters: string | undefined

  labels: string[] = []
  isTrailingType = false
  isConstexpr = false
  isStrong = false
  isConst = false

  _private: {
    // Available only during the initializeLate().
    _memberDef?: MemberDefDataModel
  } = {}

  constructor (section: Section, memberDef: MemberDefDataModel) {
    super(section, memberDef.name)
    this._private._memberDef = memberDef

    this.id = memberDef.id
    this.kind = memberDef.kind
  }

  override initializeLate (): void {
    super.initializeLate()

    const memberDef = this._private._memberDef
    assert(memberDef !== undefined)

    const workspace = this.section.compound.collection.workspace

    if (memberDef.briefDescription !== undefined) {
      this.briefDescriptionMdxText = workspace.renderElementToMdxText(memberDef.briefDescription)
    }

    if (memberDef.detailedDescription !== undefined) {
      this.detailedDescriptionMdxText = workspace.renderElementToMdxText(memberDef.detailedDescription)
    }

    this.argsstring = memberDef.argsstring

    if (memberDef.type !== undefined) {
      this.typeMdxText = workspace.renderElementToMdxText(memberDef.type).trim()
    }

    if (memberDef.initializer !== undefined) {
      this.initializerMdxText = workspace.renderElementToMdxText(memberDef.initializer)
    }

    if (memberDef.location !== undefined) {
      this.locationMdxText = this.section.compound.renderLocationToMdxText(memberDef.location)
    }

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
    this.labels = labels

    const type = this.typeMdxText ?? ''
    const templateParamList = memberDef.templateparamlist ?? (this.section.compound as Class).templateParamList

    if ((this.section.compound.isTemplate(templateParamList) &&
      (type.includes('decltype(') ||
        (type.includes('&lt;') && type.includes('&gt;'))
      )
    )) {
      this.isTrailingType = true
    }

    this.templateParametersMdxText = this.section.compound.renderTemplateParametersToMdxText({ templateParamList, withDefaults: true })

    if (memberDef.params !== undefined) {
      const parameters: string[] = []
      for (const param of memberDef.params) {
        parameters.push(workspace.renderElementToMdxText(param))
      }
      this.parameters = parameters.join(', ')
    }

    if (this.kind === 'enum') {
      this.enumMdxLines = this.renderEnumToMdxLines(memberDef)
    }

    if (memberDef.qualifiedName !== undefined) {
      this.qualifiedName = memberDef.qualifiedName
    }

    if (memberDef.definition !== undefined) {
      this.definition = memberDef.definition
    }

    if (memberDef.constexpr?.valueOf() && !type.includes('constexpr')) {
      this.isConstexpr = true
    }

    this.isStrong = memberDef.strong?.valueOf() ?? false
    this.isConst = memberDef.constt?.valueOf() ?? false

    // Clear the reference, it is no longer needed.
    this._private._memberDef = undefined
  }

  // --------------------------------------------------------------------------

  renderIndexToMdxLines (): string[] {
    // console.log(util.inspect(this, { compact: false, depth: 999 }))
    const lines: string[] = []

    const workspace = this.section.compound.collection.workspace

    const permalink = workspace.getPermalink({ refid: this.id, kindref: 'member' })
    assert(permalink !== undefined && permalink.length > 1)

    const name = escapeMdx(this.name)

    let itemType = ''
    let itemName = `<Link to="${permalink}">${name}</Link>`

    switch (this.kind) {
      case 'typedef':
        itemType = 'using'
        if (this.typeMdxText !== undefined) {
          itemName += ' = '
          itemName += this.typeMdxText
        }
        break

      case 'function':
        {
          // WARNING: the rule to decide which type is trailing is not in the XMLs.
          // https://github.com/doxygen/doxygen/discussions/11568
          // TODO: improve.

          const type = this.typeMdxText ?? ''

          if (this.isConstexpr) {
            itemType += 'constexpr '
          }

          if (this.argsstring !== undefined) {
            itemName += ' '
            itemName += escapeMdx(this.argsstring)
          }

          if (this.isTrailingType) {
            if (!itemType.includes('auto')) {
              itemType += 'auto '
            }
            // WARNING: Doxygen shows this, but the resulting line is too long.
            itemName += escapeMdx(' -> ')
            itemName += type
          } else {
            itemType += type
          }

          if (this.initializerMdxText !== undefined) {
            itemName += ' '
            itemName += this.initializerMdxText
          }
        }
        break

      case 'variable':
        itemType += this.typeMdxText
        if (this.initializerMdxText !== undefined) {
          itemName += ' '
          itemName += this.initializerMdxText
        }
        break

      case 'enum':
        // console.log(this)
        itemType = ''
        if (this.name.length === 0) {
          itemType += 'anonymous '
        }
        itemType += 'enum'
        if (this.isStrong) {
          itemType += ' class'
        }

        itemName = ''
        if (this.typeMdxText !== undefined) {
          itemName += `: ${this.typeMdxText} `
        }
        itemName += escapeHtml('{ ')
        itemName += `<Link to="${permalink}">...</Link>`
        itemName += escapeHtml(' }')

        break

      case 'friend':
        // console.log(this)
        itemType = this.typeMdxText ?? 'class'

        break

      case 'define':
        // console.log(this)
        itemType = '#define'
        if (this.initializerMdxText !== undefined) {
          itemName += '&nbsp;&nbsp;&nbsp;'
          itemName += this.initializerMdxText
        }

        break

      default:
        console.error('member kind', this.kind, 'not implemented yet in', this.constructor.name, 'renderIndexToMdxLines')
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

    if (itemName.length === 0) {
      console.log(this)
      console.warn('empty name in', this.id)
    }
    if (itemName.includes('<') || itemName.includes('&')) {
      lines.push(`  name={<>${itemName}</>}>`)
    } else {
      lines.push(`  name="${itemName}">`)
    }

    const briefDescriptionMdxText = this.briefDescriptionMdxText
    if (briefDescriptionMdxText !== undefined && briefDescriptionMdxText.length > 0) {
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

    const id = getPermalinkAnchor(this.id)
    const name = this.name + (isFunction ? '()' : '')

    lines.push('')
    if (this.kind !== 'enum') {
      lines.push(`### ${escapeMdx(name)} {#${id}}`)
    }

    // console.log(memberDef.kind)
    switch (this.kind) {
      case 'function':
      case 'typedef':
      case 'variable':
        {
          // WARNING: the rule to decide which type is trailing is not in XMLs.
          // TODO: improve.
          assert(this.definition !== undefined)
          let prototype = escapeMdx(this.definition)
          if (this.kind === 'function') {
            prototype += ' ('

            if (this.parameters !== undefined) {
              prototype += this.parameters
            }

            prototype += ')'
          }

          if (this.initializerMdxText !== undefined) {
            prototype += ` ${this.initializerMdxText}`
          }

          if (this.isConst) {
            prototype += ' const'
          }

          lines.push('')
          lines.push('<MemberDefinition')
          if (this.templateParametersMdxText !== undefined && this.templateParametersMdxText.length > 0) {
            const template = escapeMdx(`template ${this.templateParametersMdxText}`)
            lines.push(`  template={<>${template}</>}`)
          }
          lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`)
          if (this.labels.length > 0) {
            lines.push(`  labels = {["${this.labels.join('", "')}"]}>`)
          }

          if (this.detailedDescriptionMdxText !== undefined) {
            lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
              briefDescriptionMdxText: this.briefDescriptionMdxText,
              detailedDescriptionMdxText: this.detailedDescriptionMdxText,
              showHeader: false,
              showBrief: true
            }))
          }

          if (this.locationMdxText !== undefined) {
            lines.push(this.locationMdxText)
          }

          lines.push('</MemberDefinition>')
        }
        break

      case 'enum':
        {
          let prototype = ''
          if (this.name.length === 0) {
            prototype += 'anonymous '
          }
          prototype += 'enum '
          if (this.isStrong) {
            prototype += 'class '
          }
          lines.push(`### ${prototype} {#${id}}`)

          if (this.name.length > 0 && this.qualifiedName !== undefined) {
            prototype += `${escapeHtml(this.qualifiedName)} `
          } else if (this.name.length > 0) {
            prototype += `${escapeHtml(this.name)} `
          }
          if (this.typeMdxText !== undefined && this.typeMdxText.length > 0) {
            prototype += `: ${this.typeMdxText}`
          }

          lines.push('')
          lines.push('<MemberDefinition')
          lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`)
          if (this.labels.length > 0) {
            lines.push(` labels = {["${this.labels.join('", "')}"]}>`)
          }

          if (this.briefDescriptionMdxText !== undefined && this.briefDescriptionMdxText.length > 0) {
            lines.push(this.section.compound.renderBriefDescriptionToMdxText({
              briefDescriptionMdxText: this.briefDescriptionMdxText
            }))
          }

          assert(this.enumMdxLines !== undefined)
          lines.push(...this.enumMdxLines)

          if (this.detailedDescriptionMdxText !== undefined) {
            lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
              detailedDescriptionMdxText: this.detailedDescriptionMdxText,
              showHeader: false
            }))
          }

          if (this.locationMdxText !== undefined) {
            lines.push(this.locationMdxText)
          }

          lines.push('</MemberDefinition>')
        }
        break

      case 'friend':
        {
          // console.log(this)
          const prototype = `friend ${this.typeMdxText} ${this.parameters}`
          lines.push('')
          lines.push('<MemberDefinition')

          lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`)

          if (this.labels.length > 0) {
            lines.push(`  labels = {["${this.labels.join('", "')}"]}>`)
          }

          if (this.detailedDescriptionMdxText !== undefined) {
            lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
              briefDescriptionMdxText: this.briefDescriptionMdxText,
              detailedDescriptionMdxText: this.detailedDescriptionMdxText,
              showHeader: false,
              showBrief: true
            }))
          }

          if (this.locationMdxText !== undefined) {
            lines.push(this.locationMdxText)
          }

          lines.push('</MemberDefinition>')
        }
        break

      case 'define':
        {
          // console.log(this)
          let prototype = `#define ${escapeMdx(name)}`
          if (this.initializerMdxText !== undefined) {
            prototype += '&nbsp;&nbsp;&nbsp;'
            prototype += this.initializerMdxText
          }

          lines.push('')
          lines.push('<MemberDefinition')

          lines.push(`  prototype={<>${prototype}</>}${this.labels.length === 0 ? '>' : ''}`)

          if (this.labels.length > 0) {
            lines.push(`  labels = {["${this.labels.join('", "')}"]}>`)
          }

          lines.push(...this.section.compound.renderDetailedDescriptionToMdxLines({
            briefDescriptionMdxText: this.briefDescriptionMdxText,
            detailedDescriptionMdxText: this.detailedDescriptionMdxText,
            showHeader: false,
            showBrief: true
          }))

          if (this.locationMdxText !== undefined) {
            lines.push(this.locationMdxText)
          }

          lines.push('</MemberDefinition>')
        }
        break

      default:
        lines.push('')
        console.warn('memberDef', this.kind, this.name, 'not implemented yet in', this.constructor.name, 'renderToMdxLines')
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
        let enumBriefDescription: string = workspace.renderElementToMdxText(enumValue.briefDescription).replace(/[.]$/, '')
        const anchor = getPermalinkAnchor(enumValue.id)
        const value = workspace.renderElementToMdxText(enumValue.initializer)
        if (value.length > 0) {
          enumBriefDescription += ` (${value})`
        }

        lines.push('')
        lines.push(`<Link id="${anchor}" />`)
        lines.push(`<EnumerationListItem name="${enumValue.name.trim()}">`)
        lines.push(`${enumBriefDescription}`)
        lines.push('</EnumerationListItem>')
      }
    }
    lines.push('')
    lines.push('</EnumerationList>')

    return lines
  }
}

// ----------------------------------------------------------------------------

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
