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
import { RefTextDataModel } from './reftexttype-dm.js'
import { AbstractDataModelBase } from '../types.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="linkedTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//   <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

/**
 * @public
 */
export abstract class AbstractLinkedTextType extends AbstractDataModelBase {
  // Any sequence of them.
  // children: Array<string | AbstractRefTextType> = []

  constructor(xml: DoxygenXmlParser, element: object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)

    this.children = []

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefTextDataModel(xml, innerElement))
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

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
// <xsd:element name="type" type="linkedTextType" minOccurs="0" />
// <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
// <xsd:element name="exceptions" type="linkedTextType" minOccurs="0" />

// <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />

// <xsd:element name="type" type="linkedTextType" minOccurs="0" />

// <xsd:element name="defval" type="linkedTextType" minOccurs="0" />
// <xsd:element name="typeconstraint" type="linkedTextType" minOccurs="0" />

/**
 * @public
 */
export class InitializerDataModel extends AbstractLinkedTextType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'initializer')
  }
}

/**
 * @public
 */
export class TypeDataModel extends AbstractLinkedTextType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'type')
  }
}

/**
 * @public
 */
export class DefValDataModel extends AbstractLinkedTextType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'defval')
  }
}

/**
 * @public
 */
export class TypeConstraintDataModel extends AbstractLinkedTextType {
  constructor(xml: DoxygenXmlParser, element: object) {
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    super(xml, element, 'typeconstraint')
  }
}

// ----------------------------------------------------------------------------
