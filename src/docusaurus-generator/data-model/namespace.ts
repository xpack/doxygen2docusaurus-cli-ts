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

// ----------------------------------------------------------------------------

export class Namespaces {
  membersById: Map<string, Namespace>
  topLevelNamespaceIds: string[] = []

  constructor (compoundDefs: CompoundDef[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'namespace') {
        this.membersById.set(compoundDef.id, new Namespace(compoundDef))
      }
    }

    // Recreate namespaces hierarchies.
    for (const [namespaceId, namespace] of this.membersById) {
      for (const childNamespaceId of namespace.childrenNamespaceIds) {
        const childNamespace = this.membersById.get(childNamespaceId)
        assert(childNamespace !== undefined)
        // console.log('folderId', folderId,'has parent', id)
        childNamespace.parentNamespaceId = namespaceId
      }
    }

    // Create the top level namespace list.
    for (const [namespaceId, namespace] of this.membersById) {
      if (namespace.parentNamespaceId.length === 0) {
        this.topLevelNamespaceIds.push(namespaceId)
      }
    }

    // Compute the local namespace name, without parents.
    for (const namespaceId of this.topLevelNamespaceIds) {
      const namespace = this.membersById.get(namespaceId)
      assert(namespace !== undefined)
      this.makeNameLocalRecursively(namespace)
    }
  }

  makeNameLocalRecursively (namespace: Namespace): void {
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
    for (const childNamespaceId of namespace.childrenNamespaceIds) {
      const childNamespace = this.membersById.get(childNamespaceId)
      assert(childNamespace !== undefined)
      this.makeNameLocalRecursively(childNamespace)
    }
  }
}

export class Namespace {
  compoundDef: CompoundDef
  parentNamespaceId: string = ''
  childrenNamespaceIds: string[] = []
  unparentedName: string = ''

  constructor (compoundDef: CompoundDef) {
    // console.log('Namespace.constructor', util.inspect(compoundDef))
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
