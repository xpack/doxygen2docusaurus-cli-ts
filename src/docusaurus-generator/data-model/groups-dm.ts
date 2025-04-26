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

import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { DataModelBase } from './base-dm.js'

// ----------------------------------------------------------------------------

export class Groups {
  membersById: Map<string, Group>
  topLevelGroupIds: string[] = []

  constructor (compoundDefs: CompoundDef[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'group') {
        this.membersById.set(compoundDef.id, new Group(compoundDef))
      }
    }

    // Recreate groups hierarchies.
    for (const [groupId, group] of this.membersById) {
      for (const childGroupId of group.childrenIds) {
        const childGroup = this.membersById.get(childGroupId)
        assert(childGroup !== undefined)
        // console.log('groupId', childGroupId, 'has parent', groupId)
        childGroup.parentId = groupId
      }
    }

    for (const [groupId, group] of this.membersById) {
      if (group.parentId === undefined || group.parentId.length === 0) {
        // console.log('topGroupId:', groupId)
        this.topLevelGroupIds.push(groupId)
      }
    }
  }
}

export class Group extends DataModelBase {
  constructor (compoundDef: CompoundDef) {
    super(compoundDef)

    // console.log('Group.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerGroups)) {
      for (const ref of compoundDef.innerGroups) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // The group title must be short.
    this.sidebarLabel = this.compoundDef.title ?? '?'

    const curedName = this.compoundDef.compoundName.replaceAll(/[^a-zA-Z0-9-]/g, '-') as string
    this.relativePermalink = `groups/${curedName}`

    this.docusaurusId = `groups/${curedName.replaceAll('/', '-') as string}`

    this.summaryName = this.sidebarLabel

    // console.log('1', this.compoundDef.compoundName, this.compoundDef.title)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('4', this.summaryName)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
