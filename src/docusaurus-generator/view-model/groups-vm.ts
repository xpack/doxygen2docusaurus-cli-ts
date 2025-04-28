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

import { CompoundBase } from './compound-base-vm.js'
import { flattenPath, sanitizeHierarchicalPath } from '../utils.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'

// ----------------------------------------------------------------------------

export class Groups {
  membersById: Map<string, Group>
  topLevelGroupIds: string[] = []

  constructor (compoundDefs: CompoundDefDataModel[]) {
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

export class Group extends CompoundBase {
  constructor (compoundDef: CompoundDefDataModel) {
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

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel} Reference`

    const sanitizedPath = sanitizeHierarchicalPath(this.compoundDef.compoundName)
    this.relativePermalink = `groups/${sanitizedPath}`

    this.docusaurusId = `groups/${flattenPath(sanitizedPath)}`

    // console.log('1', this.compoundDef.compoundName, this.compoundDef.title)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('4', this.indexName)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
