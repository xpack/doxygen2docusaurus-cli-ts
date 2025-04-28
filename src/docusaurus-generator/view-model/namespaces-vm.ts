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

export class Namespaces {
  membersById: Map<string, Namespace>
  topLevelNamespaceIds: string[] = []

  constructor (compoundDefs: CompoundDefDataModel[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'namespace') {
        this.membersById.set(compoundDef.id, new Namespace(compoundDef))
      }
    }

    // Recreate namespaces hierarchies.
    for (const [namespaceId, namespace] of this.membersById) {
      for (const childNamespaceId of namespace.childrenIds) {
        const childNamespace = this.membersById.get(childNamespaceId)
        assert(childNamespace !== undefined)
        // console.log('namespaceId', childNamespaceId,'has parent', namespaceId)
        childNamespace.parentId = namespaceId
      }
    }

    // Create the top level namespace list.
    for (const [namespaceId, namespace] of this.membersById) {
      if (namespace.parentId === undefined || namespace.parentId.length === 0) {
        this.topLevelNamespaceIds.push(namespaceId)
      }
    }

    // // Compute the local namespace name, without parents.
    // for (const namespaceId of this.topLevelNamespaceIds) {
    //   const namespace = this.membersById.get(namespaceId)
    //   assert(namespace !== undefined)
    //   this.makeNameLocalRecursively(namespace)
    // }
  }

  // makeNameLocalRecursively (namespace: Namespace): void {
  //   if (namespace.parentId === undefined || namespace.parentId.length === 0) {
  //     namespace.unparentedName = namespace.compoundDef.compoundName.trim()
  //   } else {
  //     // Remove the parent name from the current name
  //     const parentNamespace = this.membersById.get(namespace.parentId)
  //     assert(parentNamespace !== undefined)
  //     const parentName = parentNamespace.compoundDef.compoundName
  //     const name = namespace.compoundDef.compoundName
  //     assert(name.startsWith(parentName + '::'))
  //     namespace.unparentedName = name.substring(parentName.length + 2).trim()
  //   }
  //   for (const childNamespaceId of namespace.childrenIds) {
  //     const childNamespace = this.membersById.get(childNamespaceId)
  //     assert(childNamespace !== undefined)
  //     this.makeNameLocalRecursively(childNamespace)
  //   }
  // }
}

export class Namespace extends CompoundBase {
  // unparentedName?: string | undefined

  constructor (compoundDef: CompoundDefDataModel) {
    super(compoundDef)

    // console.log('Namespace.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.innerNamespaces)) {
      for (const ref of compoundDef.innerNamespaces) {
        // console.log('component', compoundDef.id, 'has child', ref.refid)
        this.childrenIds.push(ref.refid)
      }
    }

    // The compoundName is the fully qualified namespace name.
    // Keep only the last name.
    this.sidebarLabel = this.compoundDef.compoundName.replace(/.*::/, '')

    this.indexName = this.sidebarLabel

    this.pageTitle = `The ${this.sidebarLabel} Namespace Reference`

    const sanitizedPath: string = sanitizeHierarchicalPath(this.compoundDef.compoundName.replaceAll('::', '/'))
    this.relativePermalink = `namespaces/${sanitizedPath}`

    this.docusaurusId = `namespaces/${flattenPath(sanitizedPath)}`

    // console.log('1', this.compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('4', this.indexName)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
