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
import { escapeHtml, escapeMarkdown, getPermalinkAnchor } from '../utils.js'
import { Class } from './classes-vm.js'
import { ParaDataModel } from '../../data-model/compounds/descriptiontype-dm.js'

// ----------------------------------------------------------------------------

export const sectionHeaders: Record<string, [string, number]> = {
  typedef: ['Typedefs', 100], // DoxMemberKind too
  'public-type': ['Public Member Typedefs', 110],
  'protected-type': ['Protected Member Typedefs', 120],
  'private-type': ['Private Member Typedefs', 130],
  'package-type': ['Package Member Typedefs', 140],

  enum: ['Enumerations', 150], // DoxMemberKind too

  friend: ['Friends', 160], // DoxMemberKind too

  interface: ['Interfaces', 170], // DoxMemberKind only

  // Extra, not present in Doxygen.
  constructorr: ['Constructors', 200],
  'public-constructorr': ['Public Constructors', 200],
  'protected-constructorr': ['Protected Constructors', 210],
  'private-constructorr': ['Private Constructors', 220],

  // Extra, not present in Doxygen.
  'public-destructor': ['Public Destructor', 230],
  'protected-destructor': ['Protected Destructor', 240],
  'private-destructor': ['Private Destructor', 250],

  // Extra, not present in Doxygen.
  operator: ['Operators', 300],
  'public-operator': ['Public Operators', 310],
  'protected-operator': ['Protected Operators', 320],
  'private-operator': ['Private Operators', 330],
  'package-operator': ['Package Operators', 340],

  func: ['Functions', 350],
  function: ['Functions', 350], // DoxMemberKind only

  'public-func': ['Public Member Functions', 360],
  'protected-func': ['Protected Member Functions', 370],
  'private-func': ['Private Member Functions', 380],
  'package-func': ['Package Member Functions', 390],

  var: ['Variables', 400],
  variable: ['Variables', 400], // DoxMemberKind only

  'public-attrib': ['Public Member Attributes', 410],
  'protected-attrib': ['Protected Member Attributes', 420],
  'private-attrib': ['Private Member Attributes', 430],
  'package-attrib': ['Package Member Attributes', 440],

  'public-static-operator': ['Public Operators', 450],
  'protected-static-operator': ['Protected Operators', 460],
  'private-static-operator': ['Private Operators', 470],
  'package-static-operator': ['Package Operators', 480],

  'public-static-func': ['Public Static Functions', 500],
  'protected-static-func': ['Protected Static Functions', 510],
  'private-static-func': ['Private Static Functions', 520],
  'package-static-func': ['Package Static Functions', 530],

  'public-static-attrib': ['Public Static Attributes', 600],
  'protected-static-attrib': ['Protected Static Attributes', 610],
  'private-static-attrib': ['Private Static Attributes', 620],
  'package-static-attrib': ['Package Static Attributes', 630],

  slot: ['Slots', 700], // DoxMemberKind only
  'public-slot': ['Public Slots', 700],
  'protected-slot': ['Protected Slot', 710],
  'private-slot': ['Private Slot', 720],

  related: ['Related', 800],
  define: ['Defines', 810], // DoxMemberKind too
  prototype: ['Prototypes', 820], // DoxMemberKind too

  signal: ['Signals', 830], // DoxMemberKind too
  // 'dcop-func': ['DCOP Functions', 840],
  dcop: ['DCOP Functions', 840], // DoxMemberKind only
  property: ['Properties', 850], // DoxMemberKind too
  event: ['Events', 860], // DoxMemberKind too
  service: ['Services', 870], // DoxMemberKind only

  'user-defined': ['Definitions', 1000]
}

// ----------------------------------------------------------------------------

export class Section {
  compound: CompoundBase
  kind: string
  headerName: string
  descriptionLines: string[] | undefined

  // Both references and definitions.
  indexMembers: Array<MemberRef | Member> = []

  // Only definitions.
  definitionMembers: Member[] = []

  _private: {
    // Available only during the initializeLate().
    _sectionDef?: SectionDefDataModel
  } = {}

  constructor (compound: CompoundBase, sectionDef: SectionDefDataModel) {
    // console.log(compound.kind, compound.compoundName, sectionDef.kind)
    this._private._sectionDef = sectionDef

    this.compound = compound
    this.kind = sectionDef.kind

    this.headerName = this.getHeaderNameByKind(sectionDef)
    assert(this.headerName !== undefined && this.headerName.length > 0)

    const members: Array<Member | MemberRef> = []

    if (sectionDef.memberDefs !== undefined) {
      for (const memberDefDataModel of sectionDef.memberDefs) {
        const member = new Member(this, memberDefDataModel)
        members.push(member)
        // Do not add it to the global map since additional checks are needed
        // therefore the procedure is done in the global generator.
      }
    }

    if (sectionDef.members !== undefined) {
      for (const memberRef of sectionDef.members) {
        members.push(new MemberRef(this, memberRef))
      }
    }

    this.indexMembers = members.sort((a, b) => a.name.localeCompare(b.name))

    // The array is already sorted.
    for (const member of this.indexMembers) {
      if (member instanceof Member) {
        this.definitionMembers.push(member)
      }
    }
  }

  initializeLate (): void {
    const workspace = this.compound.collection.workspace
    assert(this._private._sectionDef !== undefined)
    const sectionDef = this._private._sectionDef
    if (sectionDef.description !== undefined) {
      this.descriptionLines = workspace.renderElementToLines(sectionDef.description, 'html')
      // console.log(this.indexMembers, this.descriptionMdxText)
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

      console.warn('sectionDef of kind user-defined')

      return 'User Defined'
    }

    if (sectionDef.header !== undefined) {
      console.warn('header', sectionDef.header, 'ignored in sectionDef of kind', sectionDef.kind)
    }

    // ------------------------------------------------------------------------

    const header = sectionHeaders[sectionDef.kind]
    if (header === undefined) {
      console.error(util.inspect(sectionDef, { compact: false, depth: 999 }))
      console.error(sectionDef.constructor.name, 'kind', sectionDef.kind, 'not yet rendered in', this.constructor.name, 'getHeaderNameByKind')
      return ''
    }

    return header[0].trim()
  }

  getSectionOrderByKind (): number {
    if (this.kind === 'user-defined') {
      return 1000 // At the end.
    }

    const header = sectionHeaders[this.kind]
    assert(header !== undefined)
    return header[1]
  }

  // --------------------------------------------------------------------------

  renderIndexToMdxLines (): string[] {
    const lines: string[] = []

    // console.log(sectionDef)
    if (this.indexMembers.length > 0) {
      lines.push('')
      lines.push(`## ${this.headerName} Index`)

      lines.push('')
      lines.push('<table class="doxyMembersIndex">')

      for (const member of this.indexMembers) {
        if (member instanceof Member) {
          lines.push(...member.renderIndexToMdxLines())
        } else if (member instanceof MemberRef) {
          const referredMember = this.compound.collection.workspace.membersById.get(member.refid)
          assert(referredMember !== undefined)
          lines.push(...referredMember.renderIndexToMdxLines())
        }
      }

      lines.push('')
      lines.push('</table>')
    }
    return lines
  }

  // --------------------------------------------------------------------------

  renderToLines (): string[] {
    const lines: string[] = []

    if (!this.hasDefinitionMembers()) {
      return lines
    }

    // TODO: filter out members defined in other compounds.

    lines.push('')
    lines.push('<div class="doxySectionDef">')

    lines.push('')
    lines.push(`## ${this.headerName}`)

    if (this.descriptionLines !== undefined) {
      lines.push('')
      lines.push(...this.compound.renderDetailedDescriptionToLines({
        detailedDescriptionLines: this.descriptionLines,
        showHeader: false
      }))
    }

    for (const member of this.definitionMembers) {
      lines.push(...member.renderToLines())
    }

    lines.push('')
    lines.push('</div>')

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

  briefDescriptionString: string | undefined
  detailedDescriptionLines: string[] | undefined

  argsstring: string | undefined
  qualifiedName: string | undefined
  definition: string | undefined

  typeMdxText: string | undefined
  initializerMdxText: string | undefined
  locationLines: string[] | undefined
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
      // console.log(memberDef.briefDescription)
      if (memberDef.briefDescription.children.length > 1) {
        assert(memberDef.briefDescription.children[1] instanceof ParaDataModel)
        this.briefDescriptionString = workspace.renderElementsArrayToString(memberDef.briefDescription.children[1].children, 'html').trim()
      } else {
        this.briefDescriptionString = workspace.renderElementToString(memberDef.briefDescription, 'html').trim()
      }
    }

    if (memberDef.detailedDescription !== undefined) {
      this.detailedDescriptionLines = workspace.renderElementToLines(memberDef.detailedDescription, 'html')
    }

    this.argsstring = memberDef.argsstring

    if (memberDef.type !== undefined) {
      this.typeMdxText = workspace.renderElementToString(memberDef.type, 'html').trim()
    }

    if (memberDef.initializer !== undefined) {
      this.initializerMdxText = workspace.renderElementToString(memberDef.initializer, 'html')
    }

    if (memberDef.location !== undefined) {
      this.locationLines = this.section.compound.renderLocationToMdxText(memberDef.location)
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
    if (memberDef.mutable?.valueOf()) {
      labels.push('mutable')
    }

    // WARNING: could not find how to generate 'inherited'.

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
        parameters.push(workspace.renderElementToString(param, 'html'))
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

    const name = escapeHtml(this.name)

    let itemTemplate = ''
    let itemType = ''
    let itemName = `<a href="${permalink}">${name}</a>`

    if (this.templateParametersMdxText !== undefined && this.templateParametersMdxText.length > 0) {
      if (this.templateParametersMdxText.length < 64) {
        itemTemplate = escapeHtml(`template ${this.templateParametersMdxText}`)
      } else {
        itemTemplate = escapeHtml('template < ... >')
      }
    }
    switch (this.kind) {
      case 'typedef':
        if (this.definition?.startsWith('typedef')) {
          itemType = 'typedef'
          itemName = `${this.typeMdxText} ${itemName}${this.argsstring}`
        } else if (this.definition?.startsWith('using')) {
          itemType = 'using'
          if (this.typeMdxText !== undefined) {
            itemName += ' = '
            itemName += this.typeMdxText
          }
        } else {
          console.error('Unsupported typedef in member', this.definition)
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
            itemName += escapeHtml(this.argsstring)
          }

          if (this.isTrailingType) {
            if (!itemType.includes('auto')) {
              itemType += 'auto '
            }
            // WARNING: Doxygen shows this, but the resulting line is too long.
            itemName += escapeHtml(' -> ')
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
        if (this.definition?.startsWith('struct ')) {
          itemType = escapeHtml('struct { ... }')
        } else if (this.definition?.startsWith('class ')) {
          itemType = escapeHtml('class { ... }')
        }
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
        itemName += `<a href="${permalink}">...</a>`
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

    if (itemName.length === 0) {
      console.log(this)
      console.warn('empty name in', this.id)
    }

    const childrenLines: string[] = []
    const briefDescriptionString = this.briefDescriptionString
    if (briefDescriptionString !== undefined && briefDescriptionString.length > 0) {
      childrenLines.push(this.section.compound.renderBriefDescriptionToString({
        briefDescriptionString,
        morePermalink: `${permalink}` // No #details, it is already an anchor.
      }))
    }

    lines.push(...workspace.renderMembersIndexItemToLines({
      template: itemTemplate,
      type: itemType,
      name: itemName,
      childrenLines
    }))

    return lines
  }

  // --------------------------------------------------------------------------

  renderToLines (): string[] {
    const lines: string[] = []

    const isFunction: boolean = this.section.kind.startsWith('func') || this.section.kind.endsWith('func') || this.section.kind.endsWith('constructorr') || this.section.kind.endsWith('destructor') || this.section.kind.endsWith('operator')

    const id = getPermalinkAnchor(this.id)
    const name = this.name + (isFunction ? '()' : '')

    lines.push('')
    if (this.kind !== 'enum') {
      lines.push(`### ${name} {#${id}}`)
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
          let prototype = escapeHtml(this.definition)
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

          let template

          if (this.templateParametersMdxText !== undefined && this.templateParametersMdxText.length > 0) {
            template = escapeHtml(`template ${this.templateParametersMdxText}`)
          }

          const childrenLines: string[] = []
          if (this.detailedDescriptionLines !== undefined) {
            childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
              briefDescriptionString: this.briefDescriptionString,
              detailedDescriptionLines: this.detailedDescriptionLines,
              showHeader: false,
              showBrief: true
            }))
          }

          if (this.locationLines !== undefined) {
            childrenLines.push(...this.locationLines)
          }

          lines.push(...this.renderMemberDefinitionToLines({
            template,
            prototype,
            labels: this.labels,
            childrenLines
          }))
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

          const childrenLines: string[] = []
          if (this.briefDescriptionString !== undefined && this.briefDescriptionString.length > 0) {
            childrenLines.push(this.section.compound.renderBriefDescriptionToString({
              briefDescriptionString: this.briefDescriptionString
            }))
          }

          assert(this.enumMdxLines !== undefined)
          childrenLines.push(...this.enumMdxLines)

          if (this.detailedDescriptionLines !== undefined) {
            childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
              detailedDescriptionLines: this.detailedDescriptionLines,
              showHeader: false
            }))
          }

          if (this.locationLines !== undefined) {
            childrenLines.push(...this.locationLines)
          }

          lines.push(...this.renderMemberDefinitionToLines({
            prototype,
            labels: this.labels,
            childrenLines
          }))
        }
        break

      case 'friend':
        {
          // console.log(this)
          const prototype = `friend ${this.typeMdxText} ${this.parameters}`

          lines.push('')

          const childrenLines: string[] = []
          if (this.detailedDescriptionLines !== undefined) {
            childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
              briefDescriptionString: this.briefDescriptionString,
              detailedDescriptionLines: this.detailedDescriptionLines,
              showHeader: false,
              showBrief: true
            }))
          }

          if (this.locationLines !== undefined) {
            childrenLines.push(...this.locationLines)
          }

          lines.push(...this.renderMemberDefinitionToLines({
            prototype,
            labels: this.labels,
            childrenLines
          }))
        }
        break

      case 'define':
        {
          // console.log(this)
          let prototype = `#define ${name}`
          if (this.initializerMdxText !== undefined) {
            prototype += '&nbsp;&nbsp;&nbsp;'
            prototype += this.initializerMdxText
          }

          lines.push('')

          const childrenLines: string[] = []
          childrenLines.push(...this.section.compound.renderDetailedDescriptionToLines({
            briefDescriptionString: this.briefDescriptionString,
            detailedDescriptionLines: this.detailedDescriptionLines,
            showHeader: false,
            showBrief: true
          }))

          if (this.locationLines !== undefined) {
            childrenLines.push(...this.locationLines)
          }

          lines.push(...this.renderMemberDefinitionToLines({
            prototype,
            labels: this.labels,
            childrenLines
          }))
        }
        break

      default:
        lines.push('')
        console.warn('memberDef', this.kind, this.name, 'not implemented yet in', this.constructor.name, 'renderToLines')
    }

    return lines
  }

  private renderMemberDefinitionToLines ({
    template,
    prototype,
    labels,
    childrenLines
  }: {
    template?: string | undefined
    prototype: string
    labels: string[]
    childrenLines: string[]
  }): string[] {
    const lines: string[] = []

    lines.push('<div class="doxyMemberItem">')
    lines.push('<div class="doxyMemberProto">')
    if (template !== undefined && template.length > 0) {
      lines.push(`<div class="doxyMemberTemplate">${template}</div>`)
    }
    lines.push('<table class="doxyMemberLabels">')
    lines.push('<tr class="doxyMemberLabels">')
    lines.push('<td class="doxyMemberLabelsLeft">')
    lines.push('<table class="doxyMemberName">')
    lines.push('<tr>')
    lines.push(`<td class="doxyMemberName">${prototype}</td>`)
    lines.push('</tr>')
    lines.push('</table>')
    lines.push('</td>')
    if (labels.length > 0) {
      lines.push('<td class="doxyMemberLabelsRight">')
      lines.push('<span class="doxyMemberLabels">')
      for (const label of labels) {
        lines.push(`<span class="doxyMemberLabel ${label}">${label}</span>`)
      }
      lines.push('</span>')
      lines.push('</td>')
    }
    lines.push('</tr>')
    lines.push('</table>')
    lines.push('</div>')
    lines.push('<div class="doxyMemberDoc">')
    lines.push(...childrenLines)
    lines.push('</div>')
    lines.push('</div>')

    return lines
  }
  // --------------------------------------------------------------------------

  renderEnumToMdxLines (memberDef: MemberDefDataModel): string[] {
    const lines: string[] = []

    const workspace = this.section.compound.collection.workspace

    lines.push('')
    lines.push('<dl class="doxyEnumList">')
    lines.push('<dt class="doxyEnumTableTitle">Enumeration values</dt>')
    lines.push('<dd>')
    lines.push('<table class="doxyEnumTable">')

    if (memberDef.enumvalues !== undefined) {
      for (const enumValue of memberDef.enumvalues) {
        let enumBriefDescription: string = workspace.renderElementToString(enumValue.briefDescription, 'html').replace(/[.]$/, '')
        const anchor = getPermalinkAnchor(enumValue.id)
        const value = workspace.renderElementToString(enumValue.initializer, 'html')
        if (value.length > 0) {
          enumBriefDescription += ` (${value})`
        }

        lines.push('')
        // lines.push(`<a id="${anchor}"></a>`)
        lines.push('<tr class="doxyEnumItem">')
        lines.push(`<td class="doxyEnumItemName">${enumValue.name.trim()}<a id="${anchor}"></a></td>`)
        lines.push(`<td class="doxyEnumItemDescription">${enumBriefDescription}</td>`)
        lines.push('</tr>')
      }
    }
    lines.push('')
    lines.push('</table>')
    lines.push('</dd>')
    lines.push('</dl>')

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
