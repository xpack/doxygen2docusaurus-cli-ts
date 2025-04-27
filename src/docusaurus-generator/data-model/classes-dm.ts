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

import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { DataModelBase } from './base-dm.js'
import { flattenPath, sanitizeHierarchicalPath, sanitizeName } from '../utils.js'

// ----------------------------------------------------------------------------

export class Classes {
  membersById: Map<string, Class>
  topLevelClassIds: string[] = []

  constructor (compoundDefs: CompoundDef[]) {
    this.membersById = new Map()

    for (const compoundDef of compoundDefs) {
      if (compoundDef.kind === 'class' || compoundDef.kind === 'struct') {
        this.membersById.set(compoundDef.id, new Class(compoundDef))
      }
    }

    // Recreate classes hierarchies.
    for (const [classId, classs] of this.membersById) {
      for (const baseClassId of classs.baseClassIds) {
        const baseClass = this.membersById.get(baseClassId)
        assert(baseClass !== undefined)
        // console.log('baseClassId', baseClassId, 'has child', classId)
        baseClass.childrenIds.push(classId)
      }
    }

    for (const [classId, classs] of this.membersById) {
      if (classs.baseClassIds.length === 0) {
        this.topLevelClassIds.push(classId)
      }
    }
  }
}

export class Class extends DataModelBase {
  baseClassIds: string[] = []
  fullyQualifiedName: string = '?'
  unqualifiedName: string = '?'
  templateParameters: string = ''

  constructor (compoundDef: CompoundDef) {
    super(compoundDef)

    // console.log('Class.constructor', util.inspect(compoundDef))

    if (Array.isArray(compoundDef.baseCompoundRefs)) {
      for (const ref of compoundDef.baseCompoundRefs) {
        // console.log('component', compoundDef.id, 'has base', ref.refid)
        if (ref.refid !== undefined) {
          this.baseClassIds.push(ref.refid)
        }
      }
    }

    // Remove the template parameters.
    this.fullyQualifiedName = compoundDef.compoundName.replace(/<.*>/, '')
    // Remove the namespaces(s).
    this.unqualifiedName = this.fullyQualifiedName.replace(/.*::/, '')

    const index = compoundDef.compoundName.indexOf('<')
    if (index >= 0) {
      this.templateParameters = compoundDef.compoundName.substring(index)
    }

    this.sidebarLabel = this.unqualifiedName

    this.indexName = this.unqualifiedName + (this.templateParameters ?? '')

    const kind = compoundDef.kind
    const kindCapitalised = kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase()

    this.pageTitle = `The ${this.unqualifiedName} ${kindCapitalised}`
    if (compoundDef.templateParamList !== undefined) {
      this.pageTitle += ' Template'
    }
    this.pageTitle += ' Reference'

    const pluralKind = (kind === 'class' ? 'classes' : 'structs')

    // Turn the namespace into a hierarchical path. Keep the dot.
    let sanitizedPath: string = sanitizeHierarchicalPath(this.fullyQualifiedName.replaceAll(/::/g, '/'))
    if (this.templateParameters?.length > 0) {
      sanitizedPath += sanitizeName(this.templateParameters)
    }
    this.relativePermalink = `${pluralKind}/${sanitizedPath}`

    // Replace slash with dash.
    this.docusaurusId = `${pluralKind}/${flattenPath(sanitizedPath)}`

    // console.log('1', compoundDef.compoundName)
    // console.log('2', this.relativePermalink)
    // console.log('3', this.docusaurusId)
    // console.log('4', this.sidebarLabel)
    // console.log('5', this.indexName)
    // console.log('6', this.templateParameters)
    // console.log()
  }
}

// ----------------------------------------------------------------------------
