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

import assert from 'assert'
import * as util from 'node:util'

import { DoxygenXmlParser } from './index.js'
import { AbstractParsedObjectBase } from './types.js'
import { RefText } from './reftexttype.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="descriptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDescriptionType extends AbstractParsedObjectBase {
  // Optional elements.
  title?: string | undefined // Only one.

  // Any sequence of them.
  children: Array<string | Para | Internal | Sect1> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new Internal(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect1')) {
        this.children.push(new Sect1(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="listingType">
// <xsd:sequence>
//   <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="filename" type="xsd:string" use="optional"/>
// </xsd:complexType>

export abstract class AbstractListingType extends AbstractParsedObjectBase {
  // Optional elements.
  codelines?: Codeline[] | undefined

  // Optional attributes.
  filename?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'codeline')) {
        if (this.codelines === undefined) {
          this.codelines = []
        }
        this.codelines.push(new Codeline(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_filename') {
          this.filename = xml.getAttributeStringValue(element, '@_filename')
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="programlisting" type="listingType" />

export class ProgramListing extends AbstractListingType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'programlisting')
  }
}

// WARNING: attributes are all optional
// <xsd:complexType name="codelineType">
// <xsd:sequence>
//   <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
// </xsd:sequence>
// <xsd:attribute name="lineno" type="xsd:integer" />
// <xsd:attribute name="refid" type="xsd:string" />
// <xsd:attribute name="refkind" type="DoxRefKind" />
// <xsd:attribute name="external" type="DoxBool" />
// </xsd:complexType>

export abstract class AbstractCodelineType extends AbstractParsedObjectBase {
  // Optional elements.
  highlights?: Highlight[] | undefined

  // Optional attributes.
  lineno: Number | undefined
  refid: string | undefined
  kindref: string | undefined
  external: Boolean | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'highlight')) {
        if (this.highlights === undefined) {
          this.highlights = []
        }
        this.highlights.push(new Highlight(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_lineno') {
          this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'))
        } else if (attributeName === '@_refid') {
          this.refid = xml.getAttributeStringValue(element, '@_refid')
        } else if (attributeName === '@_kindref') {
          this.kindref = xml.getAttributeStringValue(element, '@_kindref')
        } else if (attributeName === '@_external') {
          this.external = Boolean(xml.getAttributeBooleanValue(element, '@_external'))
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />

export class Codeline extends AbstractCodelineType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'codeline')
  }
}

// <xsd:complexType name="highlightType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:choice minOccurs="0" maxOccurs="unbounded">
//   <xsd:element name="sp" type="spType" />
//   <xsd:element name="ref" type="refTextType" />
// </xsd:choice>
// <xsd:attribute name="class" type="DoxHighlightClass" />
// </xsd:complexType>

export abstract class AbstractHighlightType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Sp | RefText> = []

  // Mandatory attributes.
  _class: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    if (innerElements.length > 0) {
      for (const innerElement of innerElements) {
        if (xml.hasInnerText(innerElement)) {
          this.children.push(xml.getInnerText(innerElement))
        } else if (xml.isInnerElementText(innerElement, 'sp')) {
          this.children.push(new Sp(xml, innerElement))
        } else if (xml.hasInnerElement(innerElement, 'ref')) {
          this.children.push(new RefText(xml, innerElement))
        } else {
          console.error(util.inspect(innerElement))
          console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_class') {
        this._class = xml.getAttributeStringValue(element, '@_class')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this._class.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />

export class Highlight extends AbstractHighlightType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'highlight')
  }
}

// <xsd:complexType name="spType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>

export abstract class AbstractSpType extends AbstractParsedObjectBase {
  // Optional attributes.
  value?: Number | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length === 0)

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_value') {
          this.value = Number(xml.getAttributeNumberValue(element, '@_value'))
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="sp" type="spType" />

export class Sp extends AbstractSpType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sp')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS1Type" minOccurs="0"  maxOccurs="unbounded" />
//       <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect1Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS1 | Sect2> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS1(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect2')) {
        this.children.push(new Sect2(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docSect2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect2Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS2 | Sect3> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS2(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect3')) {
        this.children.push(new Sect3(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docSect3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect3Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS3 | Sect4> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS3(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect4')) {
        this.children.push(new Sect4(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docSect4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect4Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS4 | Sect5> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS4(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect5')) {
        this.children.push(new Sect5(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docSect5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect5Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS5 | Sect6> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS5(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect6')) {
        this.children.push(new Sect6(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docSect6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocSect6Type extends AbstractParsedObjectBase {
  title?: Title | undefined

  // Any sequence of them.
  children: Array<string | Para | InternalS6> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = new Title(xml, innerElement)
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new InternalS6(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect1> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect1')) {
        this.children.push(new Sect1(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalS1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS1Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect2> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect2')) {
        this.children.push(new Sect2(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalS2Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS2Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect3> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect3')) {
        this.children.push(new Sect3(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalS3Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS3Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect4> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect4')) {
        this.children.push(new Sect4(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalS4Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS4Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect5> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect5')) {
        this.children.push(new Sect5(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// WARNING: should be "sect6"

// <xsd:complexType name="docInternalS5Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect5" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS5Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para | Sect6> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'sect6')) {
        this.children.push(new Sect6(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:complexType name="docInternalS6Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export abstract class AbstractDocInternalS6Type extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | Para> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
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

// <xsd:group name="docTitleCmdGroup">
//   <xsd:choice>
//     <xsd:element name="ulink" type="docURLLink" />
//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />
//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />
//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />
//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />
//     <xsd:element name="emoji" type="docEmojiType" />
//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//   </xsd:choice>
// </xsd:group>

export type DocTitleCmdGroup = (Bold | Emphasis | ComputerOutput | Ref | LineBreak | Ulink)

function parseDocTitleCmdGroup (
  xml: DoxygenXmlParser,
  element: Object,
  elementName: string
): DocTitleCmdGroup[] {
  const children: DocTitleCmdGroup[] = []

  // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

  if (xml.hasInnerElement(element, 'bold')) {
    children.push(new Bold(xml, element))
  } else if (xml.hasInnerElement(element, 'emphasis')) {
    children.push(new Emphasis(xml, element))
  } else if (xml.hasInnerElement(element, 'computeroutput')) {
    children.push(new ComputerOutput(xml, element))
  } else if (xml.hasInnerElement(element, 'ref')) {
    children.push(new Ref(xml, element))
  } else if (xml.hasInnerElement(element, 'linebreak')) {
    children.push(new LineBreak(xml, element))
  } else if (xml.hasInnerElement(element, 'ulink')) {
    children.push(new Ulink(xml, element))
  } else {
    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocTitleCmdGroup()')
  }
  return children
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docTitleType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export class AbstractDocTitleType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | DocTitleCmdGroup> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName))
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

// <xsd:complexType name="docSummaryType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:group name="docCmdGroup">
//   <xsd:choice>
//     <!-- start workaround for xsd.exe
//       <xsd:group ref="docTitleCmdGroup"/>
//     -->
//     <xsd:element name="ulink" type="docURLLink" />
//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />
//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />
//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />
//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />
//     <xsd:element name="emoji" type="docEmojiType" />
//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//     <!-- end workaround for xsd.exe -->
//     <xsd:element name="hruler" type="docEmptyType" />
//     <xsd:element name="preformatted" type="docMarkupType" />
//     <xsd:element name="programlisting" type="listingType" />
//     <xsd:element name="verbatim" type="xsd:string" />
//     <xsd:element name="javadocliteral" type="xsd:string" />
//     <xsd:element name="javadoccode" type="xsd:string" />
//     <xsd:element name="indexentry" type="docIndexEntryType" />
//     <xsd:element name="orderedlist" type="docListType" />
//     <xsd:element name="itemizedlist" type="docListType" />
//     <xsd:element name="simplesect" type="docSimpleSectType" />
//     <xsd:element name="title" type="docTitleType" />
//     <xsd:element name="variablelist" type="docVariableListType" />
//     <xsd:element name="table" type="docTableType" />
//     <xsd:element name="heading" type="docHeadingType" />
//     <xsd:element name="dotfile" type="docImageFileType" />
//     <xsd:element name="mscfile" type="docImageFileType" />
//     <xsd:element name="diafile" type="docImageFileType" />
//     <xsd:element name="plantumlfile" type="docImageFileType" />
//     <xsd:element name="toclist" type="docTocListType" />
//     <xsd:element name="language" type="docLanguageType" />
//     <xsd:element name="parameterlist" type="docParamListType" />
//     <xsd:element name="xrefsect" type="docXRefSectType" />
//     <xsd:element name="copydoc" type="docCopyType" />
//     <xsd:element name="details" type="docDetailsType" />
//     <xsd:element name="blockquote" type="docBlockQuoteType" />
//     <xsd:element name="parblock" type="docParBlockType" />
//   </xsd:choice>
// </xsd:group>

export type DocCmdGroup = (Bold | SimpleSect | Emphasis | ParameterList | ComputerOutput | Ref | ItemizedList | LineBreak | Ulink)

function parseDocCmdGroup (
  xml: DoxygenXmlParser,
  element: Object,
  elementName: string
): DocCmdGroup[] {
  const children: DocCmdGroup[] = []

  // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

  if (xml.hasInnerElement(element, 'bold')) {
    children.push(new Bold(xml, element))
  } else if (xml.hasInnerElement(element, 'simplesect')) {
    children.push(new SimpleSect(xml, element))
  } else if (xml.hasInnerElement(element, 'emphasis')) {
    children.push(new Emphasis(xml, element))
  } else if (xml.hasInnerElement(element, 'parameterlist')) {
    children.push(new ParameterList(xml, element))
  } else if (xml.hasInnerElement(element, 'computeroutput')) {
    children.push(new ComputerOutput(xml, element))
  } else if (xml.hasInnerElement(element, 'ref')) {
    children.push(new Ref(xml, element))
  } else if (xml.hasInnerElement(element, 'itemizedlist')) {
    children.push(new ItemizedList(xml, element))
  } else if (xml.hasInnerElement(element, 'linebreak')) {
    children.push(new LineBreak(xml, element))
  } else if (xml.hasInnerElement(element, 'programlisting')) {
    children.push(new ProgramListing(xml, element))
  } else if (xml.hasInnerElement(element, 'ulink')) {
    children.push(new Ulink(xml, element))
  } else {
    console.error(util.inspect(element, { compact: false, depth: 999 }))
    console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocCmdGroup()')
  }
  return children
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docParaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export abstract class AbstractDocParaType extends AbstractParsedObjectBase {
  children: Array<string | DocCmdGroup> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)

    // May be empty. Do not check children.length.

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocCmdGroup(xml, innerElement, elementName))
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

// <xsd:complexType name="docMarkupType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export class AbstractDocMarkupType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | DocCmdGroup> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocCmdGroup(xml, innerElement, elementName))
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

// <xsd:complexType name="docURLLink" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="url" type="xsd:string" />
// </xsd:complexType>

export class AbstractDocURLLink extends AbstractParsedObjectBase {
  children: Array<string | DocTitleCmdGroup> = []

  // Mandatory attributes.
  url: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName))
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_url') {
        this.url = xml.getAttributeStringValue(element, '@_url')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.url.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="ulink" type="docURLLink" />

export class Ulink extends AbstractDocURLLink {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'ulink')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docAnchorType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docFormulaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docIndexEntryType">
//   <xsd:sequence>
//     <xsd:element name="primaryie" type="xsd:string" />
//     <xsd:element name="secondaryie" type="xsd:string" />
//   </xsd:sequence>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// WARNING: start & type are optionsl.

// <xsd:complexType name="docListType">
//   <xsd:sequence>
//     <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="type" type="DoxOlType" />
//   <xsd:attribute name="start" type="xsd:integer" />
// </xsd:complexType>

export abstract class AbstractDocListType extends AbstractParsedObjectBase {
  // Mandatory elements.
  listItems: ListItem[] = []

  // Optional attributes.
  type: string = ''
  start: Number | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'listitem')) {
        this.listItems.push(new ListItem(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_type') {
          this.type = xml.getAttributeStringValue(element, '@_type')
        } else if (attributeName === '@_start') {
          assert(this.start === undefined)
          this.start = Number(xml.getAttributeNumberValue(element, '@_start'))
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// WARNING: override is optional.

// <xsd:complexType name="docListItemType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="override" type="DoxCheck" />
//   <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>

export abstract class AbstractDocListItemType extends AbstractParsedObjectBase {
  // Optional elements.
  paras?: Para[] | undefined

  // Optional attributes.
  override: string | undefined
  value: Number | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        if (this.paras === undefined) {
          this.paras = []
        }
        this.paras.push(new Para(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_override') {
          this.override = xml.getAttributeStringValue(element, '@_override')
        } else if (attributeName === '@_value') {
          assert(this.value === undefined)
          this.value = Number(xml.getAttributeNumberValue(element, '@_value'))
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />

export class ListItem extends AbstractDocListItemType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'listitem')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSimpleSectType">
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:sequence minOccurs="0" maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="1" maxOccurs="unbounded" />
//     </xsd:sequence>
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxSimpleSectKind" />
// </xsd:complexType>

export abstract class AbstractDocSimpleSectType extends AbstractParsedObjectBase {
  // Optional elements.
  title?: string | undefined // Only one.

  // Any sequence of them.
  children: Array<string | Para> = []

  // Mandatory attributes.
  kind: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new Para(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docVarListEntryType">
//   <xsd:sequence>
//     <xsd:element name="term" type="docTitleType" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:group name="docVariableListGroup">
//   <xsd:sequence>
//     <xsd:element name="varlistentry" type="docVarListEntryType" />
//     <xsd:element name="listitem" type="docListItemType" />
//   </xsd:sequence>
// </xsd:group>

// <xsd:complexType name="docVariableListType">
//   <xsd:sequence>
//     <xsd:group ref="docVariableListGroup" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docRefTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="kindref" type="DoxRefKind" />
//   <xsd:attribute name="external" type="xsd:string" />
// </xsd:complexType>

export abstract class AbstractDocRefTextType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | DocTitleCmdGroup> = []

  // Mandatory attributes.
  refid: string = ''
  kindref: string = '' // DoxRefKind

  // Optional attributes.
  external?: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else {
        this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName))
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_refid') {
        this.refid = xml.getAttributeStringValue(element, '@_refid')
      } else if (attributeName === '@_kindref') {
        this.kindref = xml.getAttributeStringValue(element, '@_kindref')
      } else if (attributeName === '@_external') {
        this.external = xml.getAttributeStringValue(element, '@_external')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.refid.length > 0)
    assert(this.kindref.length > 0)

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="ref" type="docRefTextType" />

export class Ref extends AbstractDocRefTextType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'ref')
  }
}

// <xsd:complexType name="docTableType">
//   <xsd:sequence>
//     <xsd:element name="caption" type="docCaptionType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="rows" type="xsd:integer" />
//   <xsd:attribute name="cols" type="xsd:integer" />
//   <xsd:attribute name="width" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docRowType">
//   <xsd:sequence>
//     <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docEntryType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="thead" type="DoxBool" />
//   <xsd:attribute name="colspan" type="xsd:integer" />
//   <xsd:attribute name="rowspan" type="xsd:integer" />
//   <xsd:attribute name="align" type="DoxAlign" />
//   <xsd:attribute name="valign" type="DoxVerticalAlign" />
//   <xsd:attribute name="width" type="xsd:string" />
//   <xsd:attribute name="class" type="xsd:string" />
//   <xsd:anyAttribute processContents="skip"/>
// </xsd:complexType>

// <xsd:complexType name="docCaptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:simpleType name="range_1_6">
//   <xsd:restriction base="xsd:integer">
//     <xsd:minInclusive value="1"/>
//     <xsd:maxInclusive value="6"/>
//   </xsd:restriction>
// </xsd:simpleType>

// <xsd:complexType name="docHeadingType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="level" type="range_1_6" />
// </xsd:complexType>

// <xsd:complexType name="docImageType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="type" type="DoxImageKind" use="optional"/>
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="alt" type="xsd:string" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docDotMscType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docImageFileType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional">
//     <xsd:annotation>
//       <xsd:documentation>The mentioned file will be located in the directory as specified by XML_OUTPUT</xsd:documentation>
//     </xsd:annotation>
//   </xsd:attribute>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docPlantumlType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
//   <xsd:attribute name="engine" type="DoxPlantumlEngine" use="optional"/>
// </xsd:complexType>

// <xsd:complexType name="docTocItemType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docTocListType">
//   <xsd:sequence>
//     <xsd:element name="tocitem" type="docTocItemType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docLanguageType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="langid" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docParamListType">
//   <xsd:sequence>
//     <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="kind" type="DoxParamListKind" />
// </xsd:complexType>

export abstract class AbstractDocParamListType extends AbstractParsedObjectBase {
  // Optional elements.
  parameterItems?: ParameterItem[] | undefined

  // Mandatory attributes.
  kind: string = ''

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parameteritem')) {
        if (this.parameterItems === undefined) {
          this.parameterItems = []
        }
        this.parameterItems.push(new ParameterItem(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(xml.hasAttributes(element))

    const attributesNames = xml.getAttributesNames(element)
    for (const attributeName of attributesNames) {
      if (attributeName === '@_kind') {
        this.kind = xml.getAttributeStringValue(element, '@_kind')
      } else {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="parameterlist" type="docParamListType" />

export class ParameterList extends AbstractDocParamListType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parameterlist')
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docParamListItem">
//   <xsd:sequence>
//     <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parameterdescription" type="descriptionType" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamListItem extends AbstractParsedObjectBase {
  // Mandatory elements.
  parameterDescription: ParameterDescription | undefined

  // Optional elements.
  parameterNameList?: ParameterNamelist[] | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parameternamelist')) {
        if (this.parameterNameList === undefined) {
          this.parameterNameList = []
        }
        this.parameterNameList.push(new ParameterNamelist(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'parameterdescription')) {
        this.parameterDescription = new ParameterDescription(xml, innerElement)
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    assert(this.parameterDescription !== undefined)

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />

export class ParameterItem extends AbstractDocParamListItem {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parameteritem')
  }
}

// WARNING: must be pairs of type/name.
// <xsd:complexType name="docParamNameList">
//   <xsd:sequence>
//     <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamNameList extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<ParameterType | ParameterName> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.hasInnerElement(innerElement, 'parametertype')) {
        this.children.push(new ParameterType(xml, innerElement))
      } else if (xml.hasInnerElement(innerElement, 'parametername')) {
        this.children.push(new ParameterName(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

// <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />

export class ParameterNamelist extends AbstractDocParamNameList {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parameternamelist')
  }
}

// <xsd:complexType name="docParamType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
// </xsd:complexType>

export class AbstractDocParamType extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | RefText> = []

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefText(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />

export class ParameterType extends AbstractDocParamType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parametertype')
  }
}

// <xsd:complexType name="docParamName" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
//   <xsd:attribute name="direction" type="DoxParamDir" use="optional" />
// </xsd:complexType>

export class AbstractDocParamName extends AbstractParsedObjectBase {
  // Any sequence of them.
  children: Array<string | RefText> = []

  // Optional attributes.
  direction: string | undefined

  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        this.children.push(xml.getInnerText(innerElement))
      } else if (xml.hasInnerElement(innerElement, 'ref')) {
        this.children.push(new RefText(xml, innerElement))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name)
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    if (xml.hasAttributes(element)) {
      const attributesNames = xml.getAttributesNames(element)
      for (const attributeName of attributesNames) {
        if (attributeName === '@_direction') {
          this.direction = xml.getAttributeStringValue(element, '@_direction')
        } else {
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name)
        }
      }
    }

    // ------------------------------------------------------------------------

    // console.log(util.inspect(this, { compact: false, depth: 999 }))
  }
}

//  <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />

export class ParameterName extends AbstractDocParamName {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parametername')
  }
}

// <xsd:complexType name="docXRefSectType">
//   <xsd:sequence>
//     <xsd:element name="xreftitle" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="xrefdescription" type="descriptionType" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docCopyType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="link" type="xsd:string" />
// </xsd:complexType>

// <xsd:complexType name="docDetailsType">
//   <xsd:sequence>
//     <xsd:element name="summary" type="docSummaryType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docBlockQuoteType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="docParBlockType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:complexType name="docEmptyType"/>

export class AbstractDocEmptyType extends AbstractParsedObjectBase {
  constructor (xml: DoxygenXmlParser, element: Object, elementName: string) {
    super(elementName)

    // Empty.
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docEmojiType">
//   <xsd:attribute name="name" type="xsd:string"/>
//   <xsd:attribute name="unicode" type="xsd:string"/>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />

// <xsd:element name="description" type="descriptionType" minOccurs="0" />

// <xsd:element name="inbodydescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="parameterdescription" type="descriptionType" />
// <xsd:element name="xrefdescription" type="descriptionType" />

// <xsd:element name="parameterdescription" type="descriptionType" />

export class BriefDescription extends AbstractDescriptionType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'briefdescription')
  }
}

export class DetailedDescription extends AbstractDescriptionType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'detaileddescription')
  }
}

export class InbodyDescription extends AbstractDescriptionType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'inbodydescription')
  }
}

export class Description extends AbstractDescriptionType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'description')
  }
}

export class ParameterDescription extends AbstractDescriptionType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'parameterdescription')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
// <xsd:element name="internal" type="docInternalS1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="internal" type="docInternalS2Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS3Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS4Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS5Type" minOccurs="0" />
// <xsd:element name="internal" type="docInternalS6Type" minOccurs="0" />
// <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="title" type="docTitleType" minOccurs="0" />

export class Internal extends AbstractDocInternalType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS1 extends AbstractDocInternalS1Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS2 extends AbstractDocInternalS2Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS3 extends AbstractDocInternalS3Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS4 extends AbstractDocInternalS4Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS5 extends AbstractDocInternalS5Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class InternalS6 extends AbstractDocInternalS6Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'internal')
  }
}

export class Para extends AbstractDocParaType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'para')
  }
}

export class Sect1 extends AbstractDocSect1Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect1')
  }
}

export class Sect2 extends AbstractDocSect2Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect2')
  }
}

export class Sect3 extends AbstractDocSect3Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect3')
  }
}

export class Sect4 extends AbstractDocSect4Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect4')
  }
}

export class Sect5 extends AbstractDocSect5Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect5')
  }
}

export class Sect6 extends AbstractDocSect6Type {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'sect6')
  }
}

export class Title extends AbstractDocTitleType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'title')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="bold" type="docMarkupType" />
// <xsd:element name="emphasis" type="docMarkupType" />
// <xsd:element name="computeroutput" type="docMarkupType" />

export class Bold extends AbstractDocMarkupType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'bold')
  }
}

export class Emphasis extends AbstractDocMarkupType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'emphasis')
  }
}

export class ComputerOutput extends AbstractDocMarkupType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'computeroutput')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="simplesect" type="docSimpleSectType" />

export class SimpleSect extends AbstractDocSimpleSectType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'simplesect')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="itemizedlist" type="docListType" />

export class ItemizedList extends AbstractDocListType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'itemizedlist')
  }
}

// ----------------------------------------------------------------------------

// <xsd:element name="linebreak" type="docEmptyType" />

export class LineBreak extends AbstractDocEmptyType {
  constructor (xml: DoxygenXmlParser, element: Object) {
    super(xml, element, 'linebreak')
  }
}

// ----------------------------------------------------------------------------
