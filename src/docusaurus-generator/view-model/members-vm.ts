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
import { escapeMdx } from '../utils.js'

// ----------------------------------------------------------------------------

export class Section {
  compound: CompoundBase
  kind: string
  headerName: string
  members: Array<Member | MemberRef> = []

  constructor (compound: CompoundBase, sectionDef: SectionDefDataModel) {
    this.compound = compound
    this.kind = sectionDef.kind

    this.headerName = compound.getHeaderNameByKind(sectionDef)
    assert(this.headerName.length > 0)

    if (sectionDef.memberDefs !== undefined) {
      for (const memberDefDataModel of sectionDef.memberDefs) {
        const member = new Member(this, memberDefDataModel)
        this.members.push(member)
        // Do not add it to the global map since additional checks are needed
        // and the procedure is done in the global generator.
      }
    }

    if (sectionDef.members !== undefined) {
      for (const memberRef of sectionDef.members) {
        this.members.push(new MemberRef(this, memberRef))
      }
    }
  }

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
