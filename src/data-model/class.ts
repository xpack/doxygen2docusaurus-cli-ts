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
import type { XmlCompoundDefElement, XmlInnerGroupElement, XmlIncludesElement, XmlTemplateParamListElement, XmlParamElement, XmlTypeElement, XmlDefvalElement, XmlRefElement } from '../xml-parser/compound-xsd-types.js'
import { Compound, Includes } from './compound.js'
import { XmlText } from '../xml-parser/common-types.js'

// ----------------------------------------------------------------------------

export class Classes {
  membersById: Map<string, Class>

  constructor () {
    this.membersById = new Map()
  }

  add (id: string, compound: Class): void {
    this.membersById.set(id, compound)
  }

  get (id: string): Class {
    const value = this.membersById.get(id)
    if (value !== undefined) {
      return value
    }
    throw new Error(`Classes.get(${id}) not found`)
  }

  createHierarchies (): void {
    // console.log('Classes.createHierarchies()...')

    for (const item of this.membersById.values()) {
      for (const childId of item.childrenDerivedIds) {
        const childItem = this.get(childId)
        assert(childItem.parentId.length === 0)
        childItem.parentId = item.id
      }
    }

    // for (const item of this.membersById.values()) {
    //   if (item.parentId.length === 0) {
    //     console.log(item.id, item.name)
    //   }
    // }
  }

  computePermalinks (): void {
    // console.log('Classes.computePermalinks()...')
    for (const item of this.membersById.values()) {
      const name: string = item.name.replaceAll('::', '/')
      item.permalink = `classes/${name}`
      console.log('-', item.permalink)
    }
  }
}

export class Reference {
  name: string
  refid: string
  kindref: string

  constructor ({
    name,
    refid,
    kindref
  }: {
    name: string
    refid: string
    kindref: string
  }) {
    this.name = name
    this.refid = refid
    this.kindref = kindref
  }
}

export class TemplateParam {
  type: string
  defval: Reference | undefined = undefined

  constructor (type: string) {
    this.type = type
  }
}

export class Class extends Compound {
  parentId: string = ''
  childrenDerivedIds: string[] = []
  permalink: string = ''
  includes: Includes[] = []
  templateParams: TemplateParam[] = []

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const item of xmlCompoundDef.compounddef) {
      if (Object.hasOwn(item, 'derivedcompoundref') === true) {
        this.childrenDerivedIds.push((item as XmlInnerGroupElement)[':@']['@_refid'])
      } else if (Object.hasOwn(item, 'includes') === true) {
        // console.log(util.inspect(item))
        this.includes.push(this.parseIncludes(item as XmlIncludesElement))
      } else if (Object.hasOwn(item, 'templateparamlist') === true) {
        // console.log(util.inspect(item))
        for (const itemParam of (item as XmlTemplateParamListElement).templateparamlist) {
          this.templateParams.push(this.parseTemplateParam(itemParam))
        }
      } else if (Object.hasOwn(item, 'location') === true) {
        // Ignored, not used for now.
      } else if (Object.hasOwn(item, 'collaborationgraph') === true) {
        // Ignored, not used for now.
      } else if (Object.hasOwn(item, 'inheritancegraph') === true) {
        // Ignored, not used for now.
      } else if (!this.wasItemProcessedByParent(item)) {
        console.error('class element:', Object.keys(item), 'not implemented yet')
      }
    }
  }

  parseTemplateParam (element: XmlParamElement): TemplateParam {
    // console.log(util.inspect(element))

    let templateParam

    for (const paramElement of element.param) {
      // console.log(util.inspect(paramElement))
      if (Object.hasOwn(paramElement, 'type') === true) {
        const typeElements = (paramElement as XmlTypeElement).type
        assert(typeElements.length === 1)
        assert(typeElements[0])
        if (Object.hasOwn(typeElements[0], '#text') === true) {
          assert(templateParam === undefined)
          templateParam = new TemplateParam((typeElements[0] as XmlText)['#text'])
        }
      } else if (Object.hasOwn(paramElement, 'defval') === true) {
        const defvalElements = (paramElement as XmlDefvalElement).defval
        // console.log(util.inspect(defvalElements))
        assert(defvalElements.length === 1)
        assert(defvalElements[0])
        if (Object.hasOwn(defvalElements[0], 'ref') === true) {
          const refval = (defvalElements[0]) as XmlRefElement
          const refElements = refval.ref
          // console.log(util.inspect(refElements))
          assert(refElements.length === 1)
          assert(refElements[0])
          assert(Object.hasOwn(refElements[0], '#text') === true)
          assert(Object.hasOwn(refval, ':@') === true)
          assert(templateParam)
          templateParam.defval = new Reference({
            name: refElements[0]['#text'],
            refid: refval[':@']['@_refid'],
            kindref: refval[':@']['@_kindref']
          })
        }
      } else {
        console.log(util.inspect(paramElement))
        console.error('param', Object.keys(paramElement), 'not implemented yet')
      }
    }

    assert(templateParam)
    return templateParam
  }
}

// ----------------------------------------------------------------------------
