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

import { CompoundDefType } from '../../doxygen-xml-parser/compounddef.js'

// ----------------------------------------------------------------------------

export class Groups {
  membersById: Map<string, Group>
  topLevelGroupIds: string[] = []

  constructor (compoundDefs: CompoundDefType[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'group') {
        this.membersById.set(compoundDef.id, new Group(compoundDef))
      }
    }

    // Recreate groups hierarchies.
    for (const [id, group] of this.membersById) {
      for (const groupId of group.childrenGroupsIds) {
        const group = this.membersById.get(groupId)
        assert(group !== undefined)
        // console.log('folderId', folderId,'has parent', id)
        group.parentGroupId = id
      }
    }

    for (const [id, group] of this.membersById) {
      if (group.parentGroupId.length === 0) {
        this.topLevelGroupIds.push(id)
      }
    }
  }
}

export class Group {
  compoundDef: CompoundDefType
  parentGroupId: string = ''
  childrenGroupsIds: string[] = []
  // permalink: string = ''

  constructor (compoundDef: CompoundDefType) {
    // console.log('Group.constructor', util.inspect(compoundDef))
    this.compoundDef = compoundDef

    if (Array.isArray(compoundDef.innerGroups)) {
      for (const ref of compoundDef.innerGroups) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenGroupsIds.push(ref.refid)
      }
    }
  }
}

// ----------------------------------------------------------------------------
