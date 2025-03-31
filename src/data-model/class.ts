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
import type { XmlCompoundDefElement, XmlIncludesElement, XmlTemplateParamListElement, XmlParamElement, XmlTypeElement, XmlDefvalElement, XmlRefElement, XmlDeclNameElement, XmlDefNameElement, XmlBaseCompoundRefElement, XmlDerivedCompoundRefElement, XmlCompoundRefTypeElements, XmlListOfAllMembersElement, XmlMemberElement, XmlScopeElement, XmlNameElement, XmlSectionDefElement, XmlDescriptionElement, XmlHeaderElement, XmlMemberDefElement, XmlLocationElement, XmlBriefDescriptionElement, XmlDetailedDescriptionElement, XmlInbodyDescriptionElement } from '../xml-parser/compound-xsd-types.js'
import { Compound, Includes } from './compound.js'
import { XmlText } from '../xml-parser/common-types.js'
import { xml } from '../xml-parser/parse.js'

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

    for (const member of this.membersById.values()) {
      for (const derived of member.derivedCompounds) {
        if (derived.refid !== undefined && derived.refid?.length > 0) {
          const child = this.get(derived.refid)
          assert(child.parentId.length === 0)
          child.parentId = member.id
        }
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

// ----------------------------------------------------------------------------

// XmlCompoundRefTypeElements & XmlCompoundRefTypeAttributes
export class CompoundReference {
  name: string
  refid?: string | undefined
  prot: string
  virt: string

  constructor ({
    name,
    prot,
    virt
  }: {
    name: string
    prot: string
    virt: string
  }) {
    this.name = name
    this.prot = prot
    this.virt = virt
  }
}

// ----------------------------------------------------------------------------

// XmlRefElement
export class Reference {
  name: string
  refid: string
  kindref: string
  external?: string | undefined
  // tooltip?: string | undefined

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

// ----------------------------------------------------------------------------

export class TemplateParam {
  type: string
  defval: Reference | undefined
  declname: string | undefined
  defname: string | undefined

  constructor (type: string) {
    this.type = type
  }
}

// ----------------------------------------------------------------------------

export class Member {
  scope: string // namespace
  name: string
  refid: string | undefined
  prot: string | undefined
  virt: string | undefined
  ambiguityscope: string | undefined

  constructor ({
    scope,
    name
  }: {
    scope: string
    name: string
  }) {
    this.scope = scope
    this.name = name
  }
}

// ----------------------------------------------------------------------------

export class SectionDef {
  kind: string
  header: string | undefined
  description: string | undefined
  memberDefs: MemberDef[] = []
  members: Member[] = []

  constructor ({ kind }: { kind: string }) {
    this.kind = kind
  }
}

// ----------------------------------------------------------------------------

export class MemberDef {
  name: string
  location: Location
  kind: string
  id: string
  prot: string
  _static: boolean
  briefDescription: string | undefined
  detailedDescription: string | undefined
  inbodyDescription: string | undefined

  _const: boolean = false
  _constexpr: boolean = false
  _explicit: boolean = false
  _inline: boolean = false
  _mutable: boolean = false
  virt: string | undefined
  // many more...

  constructor ({
    name,
    location,
    kind,
    id,
    prot,
    _static
  }: {
    name: string
    location: any
    kind: string
    id: string
    prot: string
    _static: boolean
  }) {
    this.name = name
    this.location = location
    this.kind = kind
    this.id = id
    this.prot = prot
    this._static = _static
  }
}

export class Location {
  file: string
  line: number

  column: number | undefined
  declfile: string | undefined
  declline: number | undefined
  declcolumn: number | undefined
  bodyfile: string | undefined
  bodystart: number | undefined
  bodyend: number | undefined

  constructor ({
    file,
    line
  }: {
    file: string
    line: number
  }) {
    this.file = file
    this.line = line
  }
}

// ----------------------------------------------------------------------------

export class Class extends Compound {
  parentId: string = ''
  baseCompound: CompoundReference = new CompoundReference({ name: '', prot: '', virt: '' })
  derivedCompounds: CompoundReference[] = []
  permalink: string = ''
  includes: Includes[] = []
  templateParams: TemplateParam[] = []
  members: Member[] = []
  sections: SectionDef[] = []

  constructor (xmlCompoundDef: XmlCompoundDefElement) {
    super(xmlCompoundDef)

    for (const element of xmlCompoundDef.compounddef) {
      if (xml.hasInnerElement(element, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(element, 'basecompoundref')) {
        this.baseCompound = this.parseCompoundRef(element as XmlBaseCompoundRefElement)
      } else if (xml.hasInnerElement(element, 'derivedcompoundref')) {
        this.derivedCompounds.push(this.parseCompoundRef(element as XmlDerivedCompoundRefElement))
      } else if (xml.hasInnerElement(element, 'includes')) {
        // console.log(util.inspect(item))
        this.includes.push(this.parseIncludes(element as XmlIncludesElement))
      } else if (xml.hasInnerElement(element, 'templateparamlist')) {
        // console.log(util.inspect(item))
        for (const itemParam of (element as XmlTemplateParamListElement).templateparamlist) {
          if (xml.hasInnerElement(itemParam, '#text')) {
            // Ignore texts
          } else {
            this.templateParams.push(this.parseTemplateParam(itemParam))
          }
        }
      } else if (xml.hasInnerElement(element, 'listofallmembers')) {
        const listOfAllMembersInnerElements = (element as XmlListOfAllMembersElement).listofallmembers
        // console.log(util.inspect(listOfAllMembersInnerElements))
        for (const memberInnerElement of listOfAllMembersInnerElements) {
          if (xml.hasInnerElement(memberInnerElement, '#text')) {
            // Ignore texts.
          } else if (xml.hasInnerElement(memberInnerElement, 'member')) {
            // console.log(util.inspect(memberElement))
            this.members.push(this.parseMember(memberInnerElement as XmlMemberElement))
          } else {
            console.error(util.inspect(memberInnerElement))
            console.error('listofallmembers element:', Object.keys(memberInnerElement), 'not implemented yet')
          }
        }
      } else if (xml.hasInnerElement(element, 'sectiondef')) {
        this.sections.push(this.parseSectionDef(element as XmlSectionDefElement))
      } else if (xml.hasInnerElement(element, 'location')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'collaborationgraph')) {
        // Ignored, not used for now.
      } else if (xml.hasInnerElement(element, 'inheritancegraph')) {
        // Ignored, not used for now.
      } else if (!this.wasItemProcessedByParent(element)) {
        console.error('class element:', Object.keys(element), 'not implemented yet')
      }
    }
  }

  parseTemplateParam (element: XmlParamElement): TemplateParam {
    // console.log(util.inspect(element))

    let templateParam

    for (const paramElement of element.param) {
      // console.log(util.inspect(paramElement))
      if (xml.hasInnerElement(paramElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(paramElement, 'type')) {
        const typeElements = (paramElement as XmlTypeElement).type
        assert(typeElements.length === 1)
        assert(typeElements[0])
        if (xml.hasInnerElement(typeElements[0], '#text')) {
          assert(templateParam === undefined)
          templateParam = new TemplateParam((typeElements[0] as XmlText)['#text'])
        }
      } else if (xml.hasInnerElement(paramElement, 'defval')) {
        const defvalElements = (paramElement as XmlDefvalElement).defval
        // console.log(util.inspect(defvalElements))
        assert(defvalElements.length === 1)
        assert(defvalElements[0])
        if (xml.hasInnerElement(defvalElements[0], 'ref')) {
          assert(templateParam)
          templateParam.defval = this.parseRef((defvalElements[0]) as XmlRefElement)
        }
      } else if (xml.hasInnerElement(paramElement, 'declname')) {
        const declnameElements = (paramElement as XmlDeclNameElement).declname
        // console.log(util.inspect(defvalElements))
        assert(declnameElements.length === 1)
        assert(declnameElements[0])
        assert(templateParam)
        templateParam.declname = declnameElements[0]['#text']
      } else if (xml.hasInnerElement(paramElement, 'defname')) {
        const defnameElements = (paramElement as XmlDefNameElement).defname
        // console.log(util.inspect(defvalElements))
        assert(defnameElements.length === 1)
        assert(defnameElements[0])
        assert(templateParam)
        templateParam.declname = xml.getInnerText(defnameElements[0])
      } else {
        console.error(util.inspect(paramElement))
        console.error('param element:', Object.keys(paramElement), 'not implemented yet')
      }
    }

    assert(templateParam)
    return templateParam
  }

  parseRef (element: XmlRefElement): Reference {
    const refElements = element.ref
    // console.log(util.inspect(refElements))
    assert(refElements.length === 1)
    assert(refElements[0])
    assert(xml.hasInnerElement(refElements[0], '#text'))
    assert(xml.hasAttributes(element))
    const reference = new Reference({
      name: xml.getInnerText(refElements[0]),
      refid: xml.getAttributeStringValue(element, '@_refid'),
      kindref: xml.getAttributeStringValue(element, '@_kindref')
    })
    if (xml.hasAttribute(element, '@_external')) {
      reference.external = xml.getAttributeStringValue(element, '@_external')
    }
    return reference
  }

  // XmlCompoundRefTypeElements & XmlCompoundRefTypeAttributes
  parseCompoundRef (element: XmlBaseCompoundRefElement | XmlDerivedCompoundRefElement): CompoundReference {
    let refElements: XmlCompoundRefTypeElements[]
    if (xml.hasInnerElement(element, 'basecompoundref')) {
      refElements = (element as XmlBaseCompoundRefElement).basecompoundref
    } else if (xml.hasInnerElement(element, 'derivedcompoundref')) {
      refElements = (element as XmlDerivedCompoundRefElement).derivedcompoundref
    } else {
      console.error('parseCompoundRef element', Object.keys(element), ' not implemented')
      assert(false)
    }
    assert(refElements)
    // console.log(util.inspect(refElements))
    assert(refElements.length === 1)
    assert(refElements[0])
    assert(xml.hasInnerElement(refElements[0], '#text'))
    assert(xml.hasAttributes(element))

    let prot = ''
    let virt = ''
    let refid = ''
    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_prot') {
        prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_refid') {
        refid = xml.getAttributeStringValue(element, '@_refid')
      } else {
        console.error(util.inspect(element))
        console.error('compoundref attribute:', attributeName, 'not implemented yet')
      }
    }

    assert(prot)
    assert(virt)

    const reference = new CompoundReference({
      name: refElements[0]['#text'],
      virt,
      prot
    })
    if (refid.length > 0) {
      reference.refid = refid
    }

    // console.log(reference)
    return reference
  }

  parseMember (element: XmlMemberElement): Member {
    let scope
    let name

    // console.log(util.inspect(element))
    for (const innerElement of element.member) {
      if (xml.hasInnerElement(innerElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'scope')) {
        const scopeInnerElements = (innerElement as XmlScopeElement).scope
        assert(scopeInnerElements.length === 1)
        assert(xml.hasInnerElement(scopeInnerElements[0], '#text'))
        scope = scopeInnerElements[0]['#text']
      } else if (xml.hasInnerElement(innerElement, 'name')) {
        const nameInnerElements = (innerElement as XmlNameElement).name
        assert(nameInnerElements.length === 1)
        assert(xml.hasInnerElement(nameInnerElements[0], '#text'))
        name = xml.getInnerText(nameInnerElements[0])
      } else {
        console.error(util.inspect(innerElement))
        console.error('member element:', Object.keys(innerElement), 'not implemented yet')
      }
    }

    assert(scope)
    assert(name)
    const member = new Member({ scope, name })

    assert(xml.hasAttributes(element))
    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_refid') {
        member.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_prot') {
        member.prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_virt') {
        member.virt = xml.getAttributeStringValue(element, '@_virt')
      } else if (attributeName === '@_ambiguityscope') {
        member.ambiguityscope = xml.getAttributeStringValue(element, '@_ambiguityscope')
      } else {
        console.error(util.inspect(element))
        console.error('member attribute:', attributeName, 'not implemented yet')
      }
    }

    // console.log(member)
    return member
  }

  parseSectionDef (element: XmlSectionDefElement): SectionDef {
    // console.log(util.inspect(element))

    let header = ''
    let description = ''
    const memberDefs: MemberDef[] = []

    for (const innerElement of element.sectiondef) {
      if (xml.hasInnerElement(innerElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'header')) {
        const headerInnerElements = (innerElement as XmlHeaderElement).header
        assert(headerInnerElements.length === 1)
        assert(xml.hasInnerElement(headerInnerElements[0], '#text'))
        header = headerInnerElements[0]['#text']
      } else if (xml.hasInnerElement(innerElement, 'description')) {
        const descriptionInnerElements = (innerElement as XmlDescriptionElement).description
        description = this.generateDescription(descriptionInnerElements)
        // console.log(util.inspect(description))
      } else if (xml.hasInnerElement(innerElement, 'memberdef')) {
        memberDefs.push(this.parseMemberDef(innerElement as XmlMemberDefElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error('sectiondef element:', Object.keys(innerElement), 'not implemented yet')
      }
    }

    let kind
    assert(xml.hasAttributes(element))
    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element))
        console.error('sectiondef attribute:', attributeName, 'not implemented yet')
      }
    }

    assert(kind)
    const section = new SectionDef({ kind })

    if (header?.length > 0) {
      section.header = header
    }
    if (description?.length > 0) {
      section.description = description
    }

    // console.log(section)
    return section
  }

  parseMemberDef (element: XmlMemberDefElement): MemberDef {
    // console.log(util.inspect(element))

    let name: string | undefined
    let location: Location | undefined
    let briefDescription: string | undefined
    let detailedDescription: string | undefined
    let inbodyDescription: string | undefined

    for (const innerElement of element.memberdef) {
      if (xml.hasInnerElement(innerElement, '#text')) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'name')) {
        const nameInnerElements = (innerElement as XmlNameElement).name
        assert(nameInnerElements.length === 1)
        assert(xml.hasInnerElement(nameInnerElements[0], '#text'))
        name = xml.getInnerText(nameInnerElements[0])
      } else if (xml.hasInnerElement(innerElement, 'location')) {
        location = this.parseLocation(innerElement as XmlLocationElement)
        // console.log(util.inspect(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
        // console.log(util.inspect(item))
        briefDescription = this.generateDescription((innerElement as XmlBriefDescriptionElement).briefdescription)
        // console.log('briefdescription:', this.briefDescription)
      } else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
        // console.log(util.inspect(item))
        detailedDescription = this.generateDescription((innerElement as XmlDetailedDescriptionElement).detaileddescription)
        // console.log('detaileddescription:', this.detailedDescription)
      } else if (xml.hasInnerElement(innerElement, 'inbodydescription')) {
        // console.log(util.inspect(item))
        inbodyDescription = this.generateDescription((innerElement as XmlInbodyDescriptionElement).inbodydescription)
        // console.log('detaileddescription:', this.detailedDescription)
      } else {
        console.error(util.inspect(innerElement))
        console.error('memberdef element:', Object.keys(innerElement), 'not implemented yet')
      }
    }

    let kind: string | undefined
    let id: string | undefined
    let prot: string | undefined

    let _static = false
    let _const = false
    let _constexpr = false
    let _explicit = false
    let _inline = false
    let _mutable = false
    let virt: string | undefined

    assert(xml.hasAttributes(element))
    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_kind') {
        kind = xml.getAttributeStringValue(element, '@_kind')
      } else if (attributeName === '@_id') {
        id = xml.getAttributeStringValue(element, '@_id')
      } else if (attributeName === '@_prot') {
        prot = xml.getAttributeStringValue(element, '@_prot')
      } else if (attributeName === '@_static') {
        _static = xml.getAttributeBooleanValue(element, '@_static')
      } else if (attributeName === '@_const') {
        _const = xml.getAttributeBooleanValue(element, '@_const')
      } else if (attributeName === '@_constexpr') {
        _constexpr = xml.getAttributeBooleanValue(element, '@_constexpr')
      } else if (attributeName === '@_explicit') {
        _explicit = xml.getAttributeBooleanValue(element, '@_explicit')
      } else if (attributeName === '@_inline') {
        _inline = xml.getAttributeBooleanValue(element, '@_inline')
      } else if (attributeName === '@_mutable') {
        _mutable = xml.getAttributeBooleanValue(element, '@_mutable')
      } else if (attributeName === '@_virt') {
        virt = xml.getAttributeStringValue(element, '@_virt')
      } else {
        console.error(util.inspect(element))
        console.error('memberdef attribute:', attributeName, 'not implemented yet')
      }
    }

    assert(name)
    assert(kind)
    assert(id)
    assert(prot)

    const memberDef = new MemberDef({
      name,
      location,
      kind,
      id,
      prot,
      _static
    })

    memberDef._const = _const
    memberDef._constexpr = _constexpr
    memberDef._explicit = _explicit
    memberDef._inline = _inline
    memberDef._mutable = _mutable

    if (virt !== undefined) {
      memberDef.virt = virt
    }

    if (briefDescription !== undefined) {
      memberDef.briefDescription = briefDescription
    }

    if (detailedDescription !== undefined) {
      memberDef.detailedDescription = detailedDescription
    }

    if (inbodyDescription !== undefined) {
      memberDef.inbodyDescription = inbodyDescription
    }

    // console.log(memberDef)
    return memberDef
  }

  parseLocation (element: XmlLocationElement): Location {
    // console.log(util.inspect(element))

    let file: string | undefined
    let line: number | undefined

    let column: number | undefined
    let declfile: string | undefined
    let declline: number | undefined
    let declcolumn: number | undefined
    let bodyfile: string | undefined
    let bodystart: number | undefined
    let bodyend: number | undefined

    assert(xml.hasAttributes(element))
    const attributesNames = xml.getAttributesNames(element)
    // console.log(attributesNames)
    for (const attributeName of attributesNames) {
      // console.log(attributeName)
      if (attributeName === '@_file') {
        file = xml.getAttributeStringValue(element, '@_file')
      } else if (attributeName === '@_line') {
        line = xml.getAttributeNumberValue(element, '@_line')
      } else if (attributeName === '@_column') {
        column = xml.getAttributeNumberValue(element, '@_column')
      } else if (attributeName === '@_declfile') {
        declfile = xml.getAttributeStringValue(element, '@_declfile')
      } else if (attributeName === '@_declline') {
        declline = xml.getAttributeNumberValue(element, '@_declline')
      } else if (attributeName === '@_declcolumn') {
        declcolumn = xml.getAttributeNumberValue(element, '@_declcolumn')
      } else if (attributeName === '@_bodyfile') {
        bodyfile = xml.getAttributeStringValue(element, '@_bodyfile')
      } else if (attributeName === '@_bodystart') {
        bodystart = xml.getAttributeNumberValue(element, '@_bodystart')
      } else if (attributeName === '@_bodyend') {
        bodyend = xml.getAttributeNumberValue(element, '@_bodyend')
      } else {
        console.error(util.inspect(element))
        console.error('location attribute:', attributeName, 'not implemented yet')
      }
    }

    assert(file)
    assert(line !== undefined)

    const location = new Location({
      file,
      line
    })

    if (column !== undefined) {
      location.column = column
    }
    if (declfile !== undefined) {
      location.declfile = declfile
    }
    if (declline !== undefined) {
      location.declline = declline
    }
    if (declcolumn !== undefined) {
      location.declcolumn = declcolumn
    }
    if (bodyfile !== undefined) {
      location.bodyfile = bodyfile
    }
    if (bodystart !== undefined) {
      location.bodystart = bodystart
    }
    if (bodyend !== undefined) {
      location.bodyend = bodyend
    }

    // console.log(location)
    return location
  }
}

// ----------------------------------------------------------------------------
