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

export class Namespaces {
  membersById: Map<string, Namespace>
  topLevelNamespaceIds: string[] = []

  constructor (compoundDefs: CompoundDefType[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'namespace') {
        this.membersById.set(compoundDef.id, new Namespace(compoundDef))
      }
    }

    // Recreate namespaces hierarchies.
    for (const [id, namespace] of this.membersById) {
      for (const namespaceId of namespace.childrenNamespaceIds) {
        const namespace = this.membersById.get(namespaceId)
        assert(namespace !== undefined)
        // console.log('folderId', folderId,'has parent', id)
        namespace.parentNamespaceId = id
      }
    }

    // Create the top level namespace list.
    for (const [id, namespace] of this.membersById) {
      if (namespace.parentNamespaceId.length === 0) {
        this.topLevelNamespaceIds.push(id)
      }
    }

    // Compute the local namespace name, without parents.
    for (const id of this.topLevelNamespaceIds) {
      const namespace = this.membersById.get(id)
      assert(namespace !== undefined)
      this.xRecursively(namespace)
    }
  }

  xRecursively (namespace: Namespace): void {
    if (namespace.parentNamespaceId.length === 0) {
      namespace.unparentedName = namespace.compoundDef.compoundName
    } else {
      // Remove the parent name from the current name
      const parentNamespace = this.membersById.get(namespace.parentNamespaceId)
      assert(parentNamespace !== undefined)
      const parentName = parentNamespace.compoundDef.compoundName
      const name = namespace.compoundDef.compoundName
      assert(name.startsWith(parentName + '::'))
      namespace.unparentedName = name.substring(parentName.length + 2)
    }
    for (const childId of namespace.childrenNamespaceIds) {
      const childNamespace = this.membersById.get(childId)
      assert(childNamespace !== undefined)
      this.xRecursively(childNamespace)
    }
  }
}

export class Namespace {
  compoundDef: CompoundDefType
  parentNamespaceId: string = ''
  childrenNamespaceIds: string[] = []
  // childrenClassesIds: string[] = []
  // permalink: string = ''
  unparentedName: string = ''

  constructor (compoundDef: CompoundDefType) {
    console.log('Namespace.constructor', util.inspect(compoundDef))
    this.compoundDef = compoundDef

    if (Array.isArray(compoundDef.innerNamespaces)) {
      for (const ref of compoundDef.innerNamespaces) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenNamespaceIds.push(ref.refid)
      }
    }
  }
}

// ----------------------------------------------------------------------------
