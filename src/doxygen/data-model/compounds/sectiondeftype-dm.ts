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

import assert from 'node:assert'
import * as util from 'node:util'
import { DoxygenXmlParser } from '../doxygen-xml-parser.js'
import { DescriptionDataModel } from './descriptiontype-dm.js'
import { MemberDefDataModel } from './memberdeftype-dm.js'
import { MemberDataModel } from './membertype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="sectiondefType">
//   <xsd:sequence>
//     <xsd:element name="header" type="xsd:string" minOccurs="0" />
//     <xsd:element name="description" type="descriptionType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxSectionKind" />
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractSectionDefTypeBase extends AbstractDataModelBase {
  // Mandatory attributes.
  kind = ''

  // Optional elements.
  header?: string | undefined
  description?: DescriptionDataModel | undefined

  // Actually only one is defined at a time.
  memberDefs?: MemberDefDataModel[] | undefined
  members?: MemberDataModel[] | undefined

  constructor(elementName: string, kind: string) {
    super(elementName)

    this.kind = kind
  }

  hasMembers(): boolean {
    return this.memberDefs !== undefined || this.members !== undefined
  }

  computeAdjustedKind(
    sectionSuffix: string,
    memberSuffix: string = sectionSuffix
  ): string {
    // Turn `public-func` into
    // - `public-constructor`
    // - `public-destructor`.
    // - `public-operator` etc.
    if (this.kind === 'user-defined') {
      return memberSuffix
    }
    if (this.kind.includes('-')) {
      // Replace only the last word with the new suffix.
      return `${this.kind.replace(/[-][a-z][a-z]*$/, '-')}${sectionSuffix}`
    } else {
      return memberSuffix
    }
  }
}

/**
 * @public
 */
// eslint-disable-next-line max-len
export abstract class AbstractSectionDefType extends AbstractSectionDefTypeBase {
  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName, '')

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'header')) {
        assert(this.header === undefined)
        this.header = xml.getInnerElementText(innerElement, 'header')
      } else if (xml.hasInnerElement(innerElement, 'description')) {
        assert(this.description === undefined)
        this.description = new DescriptionDataModel(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'memberdef')) {
        this.memberDefs ??= []
        this.memberDefs.push(new MemberDefDataModel(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'member')) {
        this.members ??= []
        this.members.push(new MemberDataModel(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(
          `${elementName} element:`,
          Object.keys(innerElement),
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        assert(this.kind.length === 0)
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(
          `${elementName} attribute:`,
          attributeName,
          'not implemented yet in',
          this.constructor.name
        )
      }
    }

    assert(this.kind.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="sectiondef" type="sectiondefType" minOccurs="0" maxOccurs="unbounded" />

/**
 * @public
 */
export class SectionDefDataModel extends AbstractSectionDefType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'sectiondef')
  }
}

export class SectionDefByKindDataModel extends AbstractSectionDefTypeBase {
  constructor(kind: string) {
    super('sectiondef', kind)
  }
}

// ----------------------------------------------------------------------------
