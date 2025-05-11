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

    console.log(this.kind, this.headerName)

    if (sectionDef.members !== undefined) {
      for (const memberRef of sectionDef.members) {
        this.members.push(new MemberRef(this, memberRef))
      }
    }

    if (sectionDef.memberDefs !== undefined) {
      for (const memberDef of sectionDef.memberDefs) {
        this.members.push(new Member(this, memberDef))
      }
    }
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

    console.log('Member', this.name)
  }
}

export class MemberRef extends MemberBase {
  memberRef: MemberDataModel

  constructor (section: Section, memberRef: MemberDataModel) {
    super(section, memberRef.name)
    this.memberRef = memberRef

    console.log('MemberRef', this.name)
  }
}

// ----------------------------------------------------------------------------
