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
import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { RefTextDataModel } from './reftexttype-dm.js';
import { VariableListDataModel } from './docvarlistentrytype-dm.js';
import { DocBookOnlyDataModel, HtmlOnlyDataModel } from './compounddef-dm.js';
import { TocListDataModel } from './tableofcontentstype-dm.js';
// ----------------------------------------------------------------------------
// A bit unusual, since string values should be stored as object properties.
// However, for consistency reasons, for objects like XXXonly perhaps it is
// better to use objects,
export class AbstractStringType extends AbstractDataModelBase {
    text = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="descriptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDescriptionType extends AbstractDataModelBase {
    // Optional elements.
    title; // Only one.
    // Any sequence of them.
    // children: Array<string | ParaDataModel | InternalDataModel | Sect1DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractListingTypeBase extends AbstractDataModelBase {
    // Optional elements.
    codelines;
    // Optional attributes.
    filename;
}
export class AbstractListingType extends AbstractListingTypeBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'codeline')) {
                if (this.codelines === undefined) {
                    this.codelines = [];
                }
                this.codelines.push(new CodeLineDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_filename') {
                    this.filename = xml.getAttributeStringValue(element, '@_filename');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="programlisting" type="listingType" />
export class ProgramListingDataModel extends AbstractListingType {
    constructor(xml, element) {
        super(xml, element, 'programlisting');
    }
}
export class MemberProgramListingDataModel extends AbstractListingTypeBase {
    constructor(programListing, startLine, endLine) {
        super(programListing.elementName);
        assert(startLine <= endLine);
        if (programListing.codelines !== undefined) {
            const filteredCodelines = [];
            for (const codeline of programListing.codelines) {
                if (codeline.lineno !== undefined) {
                    const lineno = codeline.lineno.valueOf();
                    if (startLine <= lineno && lineno <= endLine) {
                        filteredCodelines.push(codeline);
                    }
                }
            }
            if (filteredCodelines.length > 0) {
                this.codelines = filteredCodelines;
            }
        }
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
export class AbstractCodeLineType extends AbstractDataModelBase {
    // Optional elements.
    highlights;
    // Optional attributes.
    lineno;
    refid;
    refkind;
    external;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // May be empty, like `<codeline></codeline>`
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'highlight')) {
                if (this.highlights === undefined) {
                    this.highlights = [];
                }
                this.highlights.push(new HighlightDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_lineno') {
                    this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'));
                }
                else if (attributeName === '@_refid') {
                    this.refid = xml.getAttributeStringValue(element, '@_refid');
                }
                else if (attributeName === '@_refkind') {
                    this.refkind = xml.getAttributeStringValue(element, '@_refkind');
                }
                else if (attributeName === '@_external') {
                    this.external = Boolean(xml.getAttributeBooleanValue(element, '@_external'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="codeline" type="codelineType" minOccurs="0" maxOccurs="unbounded" />
export class CodeLineDataModel extends AbstractCodeLineType {
    constructor(xml, element) {
        super(xml, element, 'codeline');
    }
}
export class AbstractHighlightType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | SpDataModel | RefTextDataModel> = []
    // Mandatory attributes.
    classs = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        this.children = [];
        const innerElements = xml.getInnerElements(element, elementName);
        if (innerElements.length > 0) {
            for (const innerElement of innerElements) {
                if (xml.hasInnerText(innerElement)) {
                    this.children.push(xml.getInnerText(innerElement));
                }
                else if (xml.isInnerElementText(innerElement, 'sp')) {
                    this.children.push(new SpDataModel(xml, innerElement));
                }
                else if (xml.hasInnerElement(innerElement, 'ref')) {
                    this.children.push(new RefTextDataModel(xml, innerElement));
                }
                else {
                    console.error(util.inspect(innerElement));
                    console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_class') {
                this.classs = xml.getAttributeStringValue(element, '@_class');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.classs.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="highlight" type="highlightType" minOccurs="0" maxOccurs="unbounded" />
export class HighlightDataModel extends AbstractHighlightType {
    constructor(xml, element) {
        super(xml, element, 'highlight');
    }
}
// <xsd:complexType name="spType" mixed="true">   <-- Character data is allowed to appear between the child elements!
// <xsd:attribute name="value" type="xsd:integer" use="optional"/>
// </xsd:complexType>
export class AbstractSpType extends AbstractDataModelBase {
    text = '';
    // Optional attributes.
    value;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_value') {
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="sp" type="spType" />
export class SpDataModel extends AbstractSpType {
    constructor(xml, element) {
        super(xml, element, 'sp');
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
export class AbstractDocSectType extends AbstractDataModelBase {
    title;
    // Any sequence of them.
    // children: Array<string | ParaDataModel | InternalS1DataModel | Sect2DataModel> = []
    // Optional attribute.
    id;
}
export class AbstractDocSect1Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS1DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocSect2Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS2DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocSect3Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS3DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocSect4Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS4DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocSect5Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS5DataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocSect6Type extends AbstractDocSectType {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = new TitleDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'internal')) {
                this.children.push(new InternalS6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_id') {
                    this.id = xml.getAttributeStringValue(element, '@_id');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
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
export class AbstractDocInternalType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect1DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect1')) {
                this.children.push(new Sect1DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS1Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect2DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect2')) {
                this.children.push(new Sect2DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS2Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect3DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect3')) {
                this.children.push(new Sect3DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS3Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect4DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect4')) {
                this.children.push(new Sect4DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS4Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect5DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS5Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel | Sect6DataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect6')) {
                this.children.push(new Sect6DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
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
export class AbstractDocInternalS6Type extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
export function parseDocTitleCmdGroup(xml, element, elementName) {
    const children = [];
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'underline')) {
        children.push(new UnderlineDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'subscript')) {
        children.push(new SubscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'superscript')) {
        children.push(new SuperscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'small')) {
        children.push(new SmallDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cite')) {
        children.push(new CiteDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'del')) {
        children.push(new DelDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ins')) {
        children.push(new InsDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'htmlonly')) {
        children.push(new HtmlOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'manonly')) {
        // Skipped, no Man output.
        // children.push(new ManOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'xmlonly')) {
        // children.push(new XmlOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'rtfonly')) {
        // Skipped, no RTF output.
        // children.push(new RtfOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'latexonly')) {
        // Skipped, no LaTeX output.
        // children.push(new LatexOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'docbookonly')) {
        // Skipped, no DocBook output.
        // children.push(new DocBookOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'image')) {
        children.push(new ImageDataModel(xml, element));
        // dot
        // msc
        // plantuml
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'formula')) {
        children.push(new FormulaDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emoji')) {
        children.push(new EmojiDataModel(xml, element));
        // Substring elements.
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
        children.push(new NonBreakableSpaceDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'copy')) {
        children.push(new CopyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iexcl')) {
        children.push(new IexclDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cent')) {
        children.push(new CentDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pound')) {
        children.push(new PoundDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'curren')) {
        children.push(new CurrenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yen')) {
        children.push(new YenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'brvbar')) {
        children.push(new BrvbarDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sect')) {
        children.push(new SectDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'umlaut')) {
        children.push(new UmlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordf')) {
        children.push(new OrdfDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'laquo')) {
        children.push(new LaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'not')) {
        children.push(new NotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'shy')) {
        children.push(new ShyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'registered')) {
        children.push(new RegisteredDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'macr')) {
        children.push(new MacrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'deg')) {
        children.push(new DegDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'plusmn')) {
        children.push(new PlusmnDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup2')) {
        children.push(new Sup2DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup3')) {
        children.push(new Sup3DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acute')) {
        children.push(new AcuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'micro')) {
        children.push(new MicroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'para')) {
        children.push(new ParaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'middot')) {
        children.push(new MiddotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cedil')) {
        children.push(new CedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup1')) {
        children.push(new Sup1DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordm')) {
        children.push(new OrdmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'raquo')) {
        children.push(new RaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac14')) {
        children.push(new Frac14DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac12')) {
        children.push(new Frac12DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac34')) {
        children.push(new Frac34DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iquest')) {
        children.push(new IquestDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Agrave')) {
        children.push(new AgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aacute')) {
        children.push(new AacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Acirc')) {
        children.push(new AcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Atilde')) {
        children.push(new AtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aumlaut')) {
        children.push(new AumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aring')) {
        children.push(new AringDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'AElig')) {
        children.push(new AEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ccedil')) {
        children.push(new CcedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Egrave')) {
        children.push(new EgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eacute')) {
        children.push(new EacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ecirc')) {
        children.push(new EcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eumlaut')) {
        children.push(new EumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Igrave')) {
        children.push(new IgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iacute')) {
        children.push(new IacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Icirc')) {
        children.push(new IcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iumlaut')) {
        children.push(new IumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ETH')) {
        children.push(new ETHDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ntilde')) {
        children.push(new NtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ograve')) {
        children.push(new OgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oacute')) {
        children.push(new OacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ocirc')) {
        children.push(new OcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Otilde')) {
        children.push(new OtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oumlaut')) {
        children.push(new OumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'times')) {
        children.push(new TimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oslash')) {
        children.push(new OslashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ugrave')) {
        children.push(new UgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uacute')) {
        children.push(new UacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ucirc')) {
        children.push(new UcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uumlaut')) {
        children.push(new UumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yacute')) {
        children.push(new YacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'THORN')) {
        children.push(new THORNDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'szlig')) {
        children.push(new SzligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'agrave')) {
        children.push(new AgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aacute')) {
        children.push(new AacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acirc')) {
        children.push(new AcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'atilde')) {
        children.push(new AtildeSmallDocMarkupType(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aumlaut')) {
        children.push(new AumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aring')) {
        children.push(new AringSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aelig')) {
        children.push(new AeligSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ccedil')) {
        children.push(new CcedilSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'egrave')) {
        children.push(new EgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eacute')) {
        children.push(new EacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ecirc')) {
        children.push(new EcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eumlaut')) {
        children.push(new EumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'igrave')) {
        children.push(new IgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iacute')) {
        children.push(new IacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'icirc')) {
        children.push(new IcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iumlaut')) {
        children.push(new IumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eth')) {
        children.push(new EthSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ntilde')) {
        children.push(new NtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ograve')) {
        children.push(new OgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oacute')) {
        children.push(new OacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ocirc')) {
        children.push(new OcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otilde')) {
        children.push(new OtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oumlaut')) {
        children.push(new OumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yumlaut')) {
        children.push(new YumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'divide')) {
        children.push(new DivideDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'fnof')) {
        children.push(new FnofDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Alpha')) {
        children.push(new AlphaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Beta')) {
        children.push(new BetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Gamma')) {
        children.push(new GammaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Delta')) {
        children.push(new DeltaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Epsilon')) {
        children.push(new EpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Zeta')) {
        children.push(new ZetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eta')) {
        children.push(new EtaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Theta')) {
        children.push(new ThetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iota')) {
        children.push(new IotaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Kappa')) {
        children.push(new KappaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Lambda')) {
        children.push(new LambdaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Mu')) {
        children.push(new MuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Nu')) {
        children.push(new NuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Xi')) {
        children.push(new XiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omicron')) {
        children.push(new OmicronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Pi')) {
        children.push(new PiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Rho')) {
        children.push(new RhoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Sigma')) {
        children.push(new SigmaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Tau')) {
        children.push(new TauDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Upsilon')) {
        children.push(new UpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Phi')) {
        children.push(new PhiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Chi')) {
        children.push(new ChiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Psi')) {
        children.push(new PsiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omega')) {
        children.push(new OmegaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alpha')) {
        children.push(new AlphaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'beta')) {
        children.push(new BetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'gamma')) {
        children.push(new GammaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'delta')) {
        children.push(new DeltaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'epsilon')) {
        children.push(new EpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zeta')) {
        children.push(new ZetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eta')) {
        children.push(new EtaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'theta')) {
        children.push(new ThetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iota')) {
        children.push(new IotaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'kappa')) {
        children.push(new KappaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lambda')) {
        children.push(new LambdaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mu')) {
        children.push(new MuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nu')) {
        children.push(new NuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xi')) {
        children.push(new XiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omicron')) {
        children.push(new OmicronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pi')) {
        children.push(new PiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rho')) {
        children.push(new RhoSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigma')) {
        children.push(new SigmaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigmaf')) {
        children.push(new SigmafSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tau')) {
        children.push(new TauSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsilon')) {
        children.push(new UpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'phi')) {
        children.push(new PhiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'chi')) {
        children.push(new ChiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'psi')) {
        children.push(new PsiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omega')) {
        children.push(new OmegaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thetasym')) {
        children.push(new ThetasymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsih')) {
        children.push(new UpsihDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'piv')) {
        children.push(new PivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bull')) {
        children.push(new BullDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hellip')) {
        children.push(new HellipDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prime')) {
        children.push(new PrimeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Prime')) {
        children.push(new PrimeUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oline')) {
        children.push(new OlineDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frasl')) {
        children.push(new FraslDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'weierp')) {
        children.push(new WeierpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'imaginary')) {
        children.push(new ImaginaryDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'real')) {
        children.push(new RealDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'trademark')) {
        children.push(new TrademarkDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alefsym')) {
        children.push(new AlefsymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'larr')) {
        children.push(new LarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uarr')) {
        children.push(new UarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rarr')) {
        children.push(new RarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'darr')) {
        children.push(new DarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'harr')) {
        children.push(new HarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'crarr')) {
        children.push(new CrarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lArr')) {
        children.push(new LArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uArr')) {
        children.push(new UArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rArr')) {
        children.push(new RArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dArr')) {
        children.push(new DArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hArr')) {
        children.push(new HArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'forall')) {
        children.push(new ForallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'part')) {
        children.push(new PartDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'exist')) {
        children.push(new ExistDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'empty')) {
        children.push(new EmptyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nabla')) {
        children.push(new NablaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'isin')) {
        children.push(new IsinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'notin')) {
        children.push(new NotinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ni')) {
        children.push(new NiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prod')) {
        children.push(new ProdDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sum')) {
        children.push(new SumDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'minus')) {
        children.push(new MinusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lowast')) {
        children.push(new LowastDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'radic')) {
        children.push(new RadicDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prop')) {
        children.push(new PropDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'infin')) {
        children.push(new InfinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ang')) {
        children.push(new AngDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'and')) {
        children.push(new AndDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'or')) {
        children.push(new OrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cap')) {
        children.push(new CapDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cup')) {
        children.push(new CupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'int')) {
        children.push(new IntDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'there4')) {
        children.push(new There4DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sim')) {
        children.push(new SimDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cong')) {
        children.push(new CongDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'asymp')) {
        children.push(new AsympDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ne')) {
        children.push(new NeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'equiv')) {
        children.push(new EquivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'le')) {
        children.push(new LeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ge')) {
        children.push(new GeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sub')) {
        children.push(new SubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup')) {
        children.push(new SupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nsub')) {
        children.push(new NsubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sube')) {
        children.push(new SubeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'supe')) {
        children.push(new SupeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oplus')) {
        children.push(new OplusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otimes')) {
        children.push(new OtimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'perp')) {
        children.push(new PerpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sdot')) {
        children.push(new SdotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lceil')) {
        children.push(new LceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rceil')) {
        children.push(new RceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lfloor')) {
        children.push(new LfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rfloor')) {
        children.push(new RfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lang')) {
        children.push(new LangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rang')) {
        children.push(new RangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'loz')) {
        children.push(new LozDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'spades')) {
        children.push(new SpadesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'clubs')) {
        children.push(new ClubsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hearts')) {
        children.push(new HeartsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'diams')) {
        children.push(new DiamsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'OElig')) {
        children.push(new OEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oelig')) {
        children.push(new OeligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Scaron')) {
        children.push(new ScaronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'scaron')) {
        children.push(new ScaronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yumlaut')) {
        children.push(new YumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'circ')) {
        children.push(new CircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tilde')) {
        children.push(new TildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ensp')) {
        children.push(new EnspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emsp')) {
        children.push(new EmspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thinsp')) {
        children.push(new ThinspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwnj')) {
        children.push(new ZwnjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lrm')) {
        children.push(new LrmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rlm')) {
        children.push(new RlmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sbquo')) {
        children.push(new SbquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ldquo')) {
        children.push(new LdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rdquo')) {
        children.push(new RdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bdquo')) {
        children.push(new BdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dagger')) {
        children.push(new DaggerDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Dagger')) {
        children.push(new DaggerUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'permil')) {
        children.push(new PermilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsaquo')) {
        children.push(new LsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsaquo')) {
        children.push(new RsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'euro')) {
        children.push(new EuroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tm')) {
        children.push(new TmDocMarkupDataModel(xml, element));
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocTitleCmdGroup()');
    }
    return children;
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docTitleType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocTitleType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocTitleCmdGroup> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // May be empty.
        // assert(innerElements.length > 0)
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
function parseDocCmdGroup(xml, element, elementName) {
    const children = [];
    // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
    if (xml.hasInnerElement(element, 'ulink')) {
        children.push(new UlinkDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bold')) {
        children.push(new BoldDataModel(xml, element));
        // s
        // strike
    }
    else if (xml.hasInnerElement(element, 'underline')) {
        children.push(new UnderlineDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emphasis')) {
        children.push(new EmphasisDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'computeroutput')) {
        children.push(new ComputerOutputDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'subscript')) {
        children.push(new SubscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'superscript')) {
        children.push(new SuperscriptDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'center')) {
        children.push(new CenterDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'small')) {
        children.push(new SmallDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cite')) {
        children.push(new CiteDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'del')) {
        children.push(new DelDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ins')) {
        children.push(new InsDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'htmlonly')) {
        children.push(new HtmlOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'manonly')) {
        // Skipped, no Man output.
        // children.push(new ManOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'xmlonly')) {
        // children.push(new XmlOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'rtfonly')) {
        // Skipped, no RTF output.
        // children.push(new RtfOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'latexonly')) {
        // Skipped, no LaTeX output.
        // children.push(new LatexOnlyDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'docbookonly')) {
        // Skipped, no DocBook output.
        children.push(new DocBookOnlyDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'image')) {
        children.push(new ImageDataModel(xml, element));
        // dot
        // msc
        // plantuml
    }
    else if (xml.hasInnerElement(element, 'anchor')) {
        children.push(new AnchorDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'formula')) {
        children.push(new FormulaDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ref')) {
        children.push(new RefDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emoji')) {
        children.push(new EmojiDataModel(xml, element));
        // ----
        // Substring elements.
    }
    else if (xml.hasInnerElement(element, 'linebreak')) {
        children.push(new LineBreakDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nonbreakablespace')) {
        children.push(new NonBreakableSpaceDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsquo')) {
        children.push(new LsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsquo')) {
        children.push(new RsquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'copy')) {
        children.push(new CopyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iexcl')) {
        children.push(new IexclDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cent')) {
        children.push(new CentDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pound')) {
        children.push(new PoundDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'curren')) {
        children.push(new CurrenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yen')) {
        children.push(new YenDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'brvbar')) {
        children.push(new BrvbarDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sect')) {
        children.push(new SectDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'umlaut')) {
        children.push(new UmlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nzwj')) {
        children.push(new NzwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwj')) {
        children.push(new ZwjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ndash')) {
        children.push(new NdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mdash')) {
        children.push(new MdashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordf')) {
        children.push(new OrdfDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'laquo')) {
        children.push(new LaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'not')) {
        children.push(new NotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'shy')) {
        children.push(new ShyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'registered')) {
        children.push(new RegisteredDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'macr')) {
        children.push(new MacrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'deg')) {
        children.push(new DegDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'plusmn')) {
        children.push(new PlusmnDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup2')) {
        children.push(new Sup2DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup3')) {
        children.push(new Sup3DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acute')) {
        children.push(new AcuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'micro')) {
        children.push(new MicroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'para')) {
        children.push(new ParaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'middot')) {
        children.push(new MiddotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cedil')) {
        children.push(new CedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup1')) {
        children.push(new Sup1DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ordm')) {
        children.push(new OrdmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'raquo')) {
        children.push(new RaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac14')) {
        children.push(new Frac14DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac12')) {
        children.push(new Frac12DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frac34')) {
        children.push(new Frac34DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iquest')) {
        children.push(new IquestDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Agrave')) {
        children.push(new AgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aacute')) {
        children.push(new AacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Acirc')) {
        children.push(new AcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Atilde')) {
        children.push(new AtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aumlaut')) {
        children.push(new AumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Aring')) {
        children.push(new AringDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'AElig')) {
        children.push(new AEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ccedil')) {
        children.push(new CcedilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Egrave')) {
        children.push(new EgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eacute')) {
        children.push(new EacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ecirc')) {
        children.push(new EcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eumlaut')) {
        children.push(new EumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Igrave')) {
        children.push(new IgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iacute')) {
        children.push(new IacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Icirc')) {
        children.push(new IcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iumlaut')) {
        children.push(new IumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ETH')) {
        children.push(new ETHDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ntilde')) {
        children.push(new NtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ograve')) {
        children.push(new OgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oacute')) {
        children.push(new OacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ocirc')) {
        children.push(new OcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Otilde')) {
        children.push(new OtildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oumlaut')) {
        children.push(new OumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'times')) {
        children.push(new TimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Oslash')) {
        children.push(new OslashDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ugrave')) {
        children.push(new UgraveDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uacute')) {
        children.push(new UacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Ucirc')) {
        children.push(new UcircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Uumlaut')) {
        children.push(new UumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yacute')) {
        children.push(new YacuteDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'THORN')) {
        children.push(new THORNDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'szlig')) {
        children.push(new SzligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'agrave')) {
        children.push(new AgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aacute')) {
        children.push(new AacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'acirc')) {
        children.push(new AcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'atilde')) {
        children.push(new AtildeSmallDocMarkupType(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aumlaut')) {
        children.push(new AumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aring')) {
        children.push(new AringSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'aelig')) {
        children.push(new AeligSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ccedil')) {
        children.push(new CcedilSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'egrave')) {
        children.push(new EgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eacute')) {
        children.push(new EacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ecirc')) {
        children.push(new EcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eumlaut')) {
        children.push(new EumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'igrave')) {
        children.push(new IgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iacute')) {
        children.push(new IacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'icirc')) {
        children.push(new IcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iumlaut')) {
        children.push(new IumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eth')) {
        children.push(new EthSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ntilde')) {
        children.push(new NtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ograve')) {
        children.push(new OgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oacute')) {
        children.push(new OacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ocirc')) {
        children.push(new OcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otilde')) {
        children.push(new OtildeSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oumlaut')) {
        children.push(new OumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yumlaut')) {
        children.push(new YumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'divide')) {
        children.push(new DivideDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oslash')) {
        children.push(new OslashSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ugrave')) {
        children.push(new UgraveSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uacute')) {
        children.push(new UacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ucirc')) {
        children.push(new UcircSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uumlaut')) {
        children.push(new UumlautSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'yacute')) {
        children.push(new YacuteSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thorn')) {
        children.push(new ThornSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'fnof')) {
        children.push(new FnofDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Alpha')) {
        children.push(new AlphaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Beta')) {
        children.push(new BetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Gamma')) {
        children.push(new GammaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Delta')) {
        children.push(new DeltaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Epsilon')) {
        children.push(new EpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Zeta')) {
        children.push(new ZetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Eta')) {
        children.push(new EtaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Theta')) {
        children.push(new ThetaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Iota')) {
        children.push(new IotaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Kappa')) {
        children.push(new KappaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Lambda')) {
        children.push(new LambdaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Mu')) {
        children.push(new MuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Nu')) {
        children.push(new NuDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Xi')) {
        children.push(new XiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omicron')) {
        children.push(new OmicronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Pi')) {
        children.push(new PiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Rho')) {
        children.push(new RhoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Sigma')) {
        children.push(new SigmaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Tau')) {
        children.push(new TauDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Upsilon')) {
        children.push(new UpsilonDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Phi')) {
        children.push(new PhiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Chi')) {
        children.push(new ChiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Psi')) {
        children.push(new PsiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Omega')) {
        children.push(new OmegaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alpha')) {
        children.push(new AlphaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'beta')) {
        children.push(new BetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'gamma')) {
        children.push(new GammaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'delta')) {
        children.push(new DeltaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'epsilon')) {
        children.push(new EpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zeta')) {
        children.push(new ZetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'eta')) {
        children.push(new EtaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'theta')) {
        children.push(new ThetaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'iota')) {
        children.push(new IotaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'kappa')) {
        children.push(new KappaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lambda')) {
        children.push(new LambdaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'mu')) {
        children.push(new MuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nu')) {
        children.push(new NuSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xi')) {
        children.push(new XiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omicron')) {
        children.push(new OmicronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'pi')) {
        children.push(new PiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rho')) {
        children.push(new RhoSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigma')) {
        children.push(new SigmaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sigmaf')) {
        children.push(new SigmafSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tau')) {
        children.push(new TauSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsilon')) {
        children.push(new UpsilonSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'phi')) {
        children.push(new PhiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'chi')) {
        children.push(new ChiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'psi')) {
        children.push(new PsiSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'omega')) {
        children.push(new OmegaSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thetasym')) {
        children.push(new ThetasymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'upsih')) {
        children.push(new UpsihDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'piv')) {
        children.push(new PivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bull')) {
        children.push(new BullDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hellip')) {
        children.push(new HellipDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prime')) {
        children.push(new PrimeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Prime')) {
        children.push(new PrimeUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oline')) {
        children.push(new OlineDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'frasl')) {
        children.push(new FraslDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'weierp')) {
        children.push(new WeierpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'imaginary')) {
        children.push(new ImaginaryDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'real')) {
        children.push(new RealDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'trademark')) {
        children.push(new TrademarkDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'alefsym')) {
        children.push(new AlefsymDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'larr')) {
        children.push(new LarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uarr')) {
        children.push(new UarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rarr')) {
        children.push(new RarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'darr')) {
        children.push(new DarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'harr')) {
        children.push(new HarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'crarr')) {
        children.push(new CrarrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lArr')) {
        children.push(new LArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'uArr')) {
        children.push(new UArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rArr')) {
        children.push(new RArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dArr')) {
        children.push(new DArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hArr')) {
        children.push(new HArrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'forall')) {
        children.push(new ForallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'part')) {
        children.push(new PartDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'exist')) {
        children.push(new ExistDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'empty')) {
        children.push(new EmptyDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nabla')) {
        children.push(new NablaDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'isin')) {
        children.push(new IsinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'notin')) {
        children.push(new NotinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ni')) {
        children.push(new NiDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prod')) {
        children.push(new ProdDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sum')) {
        children.push(new SumDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'minus')) {
        children.push(new MinusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lowast')) {
        children.push(new LowastDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'radic')) {
        children.push(new RadicDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'prop')) {
        children.push(new PropDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'infin')) {
        children.push(new InfinDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ang')) {
        children.push(new AngDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'and')) {
        children.push(new AndDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'or')) {
        children.push(new OrDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cap')) {
        children.push(new CapDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cup')) {
        children.push(new CupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'int')) {
        children.push(new IntDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'there4')) {
        children.push(new There4DocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sim')) {
        children.push(new SimDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'cong')) {
        children.push(new CongDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'asymp')) {
        children.push(new AsympDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ne')) {
        children.push(new NeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'equiv')) {
        children.push(new EquivDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'le')) {
        children.push(new LeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ge')) {
        children.push(new GeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sub')) {
        children.push(new SubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sup')) {
        children.push(new SupDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'nsub')) {
        children.push(new NsubDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sube')) {
        children.push(new SubeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'supe')) {
        children.push(new SupeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oplus')) {
        children.push(new OplusDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'otimes')) {
        children.push(new OtimesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'perp')) {
        children.push(new PerpDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sdot')) {
        children.push(new SdotDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lceil')) {
        children.push(new LceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rceil')) {
        children.push(new RceilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lfloor')) {
        children.push(new LfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rfloor')) {
        children.push(new RfloorDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lang')) {
        children.push(new LangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rang')) {
        children.push(new RangDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'loz')) {
        children.push(new LozDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'spades')) {
        children.push(new SpadesDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'clubs')) {
        children.push(new ClubsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'hearts')) {
        children.push(new HeartsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'diams')) {
        children.push(new DiamsDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'OElig')) {
        children.push(new OEligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'oelig')) {
        children.push(new OeligDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Scaron')) {
        children.push(new ScaronDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'scaron')) {
        children.push(new ScaronSmallDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Yumlaut')) {
        children.push(new YumlautDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'circ')) {
        children.push(new CircDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tilde')) {
        children.push(new TildeDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ensp')) {
        children.push(new EnspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'emsp')) {
        children.push(new EmspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'thinsp')) {
        children.push(new ThinspDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'zwnj')) {
        children.push(new ZwnjDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lrm')) {
        children.push(new LrmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rlm')) {
        children.push(new RlmDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'sbquo')) {
        children.push(new SbquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'ldquo')) {
        children.push(new LdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rdquo')) {
        children.push(new RdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'bdquo')) {
        children.push(new BdquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'dagger')) {
        children.push(new DaggerDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'Dagger')) {
        children.push(new DaggerUpperDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'permil')) {
        children.push(new PermilDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'lsaquo')) {
        children.push(new LsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'rsaquo')) {
        children.push(new RsaquoDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'euro')) {
        children.push(new EuroDocMarkupDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'tm')) {
        children.push(new TmDocMarkupDataModel(xml, element));
        // ----
    }
    else if (xml.hasInnerElement(element, 'hruler')) {
        children.push(new HrulerDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'preformatted')) {
        children.push(new PreformattedDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'programlisting')) {
        children.push(new ProgramListingDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'verbatim')) {
        children.push(new VerbatimDataModel(xml, element));
        // javadocliteral
        // javadoccode
    }
    else if (xml.hasInnerElement(element, 'indexentry')) {
        // Skipped, no index rendered.
        // children.push(new IndexEntryDataModel(xml, element))
    }
    else if (xml.hasInnerElement(element, 'orderedlist')) {
        children.push(new OrderedListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'itemizedlist')) {
        children.push(new ItemizedListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'simplesect')) {
        children.push(new SimpleSectDataModel(xml, element));
        // title
    }
    else if (xml.hasInnerElement(element, 'variablelist')) {
        children.push(new VariableListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'table')) {
        children.push(new DocTableDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'heading')) {
        children.push(new HeadingDataModel(xml, element));
        // dotfile
        // mscfile
        // dialfile
        // plantumlfile
    }
    else if (xml.hasInnerElement(element, 'toclist')) {
        children.push(new TocListDataModel(xml, element));
        // language
    }
    else if (xml.hasInnerElement(element, 'parameterlist')) {
        children.push(new ParameterListDataModel(xml, element));
    }
    else if (xml.hasInnerElement(element, 'xrefsect')) {
        children.push(new XrefSectDataModel(xml, element));
        // copydoc
        // details
    }
    else if (xml.hasInnerElement(element, 'blockquote')) {
        children.push(new BlockquoteDataModel(xml, element));
        // parblock
    }
    else {
        console.error(util.inspect(element, { compact: false, depth: 999 }));
        console.error(`${elementName} element:`, Object.keys(element), 'not implemented yet by parseDocCmdGroup()');
    }
    return children;
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docParaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocParaType extends AbstractDataModelBase {
    // children: Array<string | DocCmdGroup> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // May be empty. Do not check children.length.
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docMarkupType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>
export class AbstractDocMarkupType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocCmdGroup> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // SubstringDocMarkupType has no inner elments
        // assert(innerElements.length > 0)
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
export class SubstringDocMarkupType extends AbstractDocMarkupType {
    substring;
    constructor(xml, element, elementName, substring) {
        super(xml, element, elementName);
        this.substring = substring;
    }
}
// <xsd:element name="mdash" type="docEmptyType" />
// <xsd:element name="lsquo" type="docEmptyType" />
// <xsd:element name="rsquo" type="docEmptyType" />
// copyright
export class CopyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'copy', '\u00A9');
    }
}
// inverted exclamation mark
export class IexclDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iexcl', '\u00A1');
    }
}
// cent
export class CentDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cent', '\u00A2');
    }
}
// pound
export class PoundDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'pound', '\u00A3');
    }
}
// curren
export class CurrenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'curren', '\u00A4');
    }
}
// yen
export class YenDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yen', '\u00A5');
    }
}
// brvbar
export class BrvbarDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'brvbar', '\u00A6');
    }
}
// sect
export class SectDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sect', '\u00A7');
    }
}
// umlaut (diaeresis)
export class UmlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'umlaut', '\u00A8');
    }
}
// Zero Width Non-Joiner
export class NzwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nzwj', '\u200C');
    }
}
// Zero Width Joiner.
export class ZwjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zwj', '\u200D');
    }
}
// en dash.
export class NdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ndash', '\u2013'); // '–'
    }
}
// em dash.
export class MdashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'mdash', '\u2014'); // '—'
    }
}
// ordfeminine
export class OrdfDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ordf', '\u00AA');
    }
}
// left-pointing double angle quotation mark
export class LaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'laquo', '\u00AB');
    }
}
// not sign
export class NotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'not', '\u00AC');
    }
}
// soft hyphen
export class ShyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'shy', '\u00AD');
    }
}
// registered sign
export class RegisteredDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'registered', '\u00AE');
    }
}
// macron
export class MacrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'macr', '\u00AF');
    }
}
// degree sign
export class DegDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'deg', '\u00B0');
    }
}
// plus-minus sign
export class PlusmnDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'plusmn', '\u00B1');
    }
}
// superscript two
export class Sup2DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup2', '\u00B2');
    }
}
// superscript three
export class Sup3DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup3', '\u00B3');
    }
}
// acute accent
export class AcuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'acute', '\u00B4');
    }
}
// micro sign
export class MicroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'micro', '\u00B5');
    }
}
// pilcrow/paragraph sign
export class ParaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'para', '\u00B6');
    }
}
// middle dot
export class MiddotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'middot', '\u00B7');
    }
}
// cedilla
export class CedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cedil', '\u00B8');
    }
}
// superscript one
export class Sup1DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup1', '\u00B9');
    }
}
// masculine ordinal indicator
export class OrdmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ordm', '\u00BA');
    }
}
// right-pointing double angle quotation mark
export class RaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'raquo', '\u00BB');
    }
}
// fraction one quarter
export class Frac14DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac14', '\u00BC');
    }
}
// fraction one half
export class Frac12DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac12', '\u00BD');
    }
}
// fraction three quarters
export class Frac34DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frac34', '\u00BE');
    }
}
// inverted question mark
export class IquestDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iquest', '\u00BF');
    }
}
// Latin capital letter A with grave
export class AgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Agrave', '\u00C0');
    }
}
// Latin capital letter A with acute
export class AacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aacute', '\u00C1');
    }
}
// Latin capital letter A with circumflex
export class AcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Acirc', '\u00C2');
    }
}
// Latin capital letter A with tilde
export class AtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Atilde', '\u00C3');
    }
}
// Latin capital letter A with diaeresis (umlaut)
export class AumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aumlaut', '\u00C4');
    }
}
// Latin capital letter A with ring above
export class AringDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Aring', '\u00C5');
    }
}
// Latin capital letter AE
export class AEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'AElig', '\u00C6');
    }
}
// Latin capital letter C with cedilla
export class CcedilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ccedil', '\u00C7');
    }
}
// Latin capital letter E with grave
export class EgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Egrave', '\u00C8');
    }
}
// Latin capital letter E with acute
export class EacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eacute', '\u00C9');
    }
}
// Latin capital letter E with circumflex
export class EcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ecirc', '\u00CA');
    }
}
// Latin capital letter E with diaeresis (umlaut)
export class EumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eumlaut', '\u00CB');
    }
}
// Latin capital letter I with grave
export class IgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Igrave', '\u00CC');
    }
}
// Latin capital letter I with acute
export class IacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iacute', '\u00CD');
    }
}
// Latin capital letter I with circumflex
export class IcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Icirc', '\u00CE');
    }
}
// Latin capital letter I with diaeresis (umlaut)
export class IumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iumlaut', '\u00CF');
    }
}
// Latin capital letter ETH
export class ETHDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ETH', '\u00D0');
    }
}
// Latin capital letter N with tilde
export class NtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ntilde', '\u00D1');
    }
}
// Latin capital letter O with grave
export class OgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ograve', '\u00D2');
    }
}
// Latin capital letter O with acute
export class OacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oacute', '\u00D3');
    }
}
// Latin capital letter O with circumflex
export class OcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ocirc', '\u00D4');
    }
}
// Latin capital letter O with tilde
export class OtildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Otilde', '\u00D5');
    }
}
// Latin capital letter O with diaeresis (umlaut)
export class OumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oumlaut', '\u00D6');
    }
}
// multiplication sign
export class TimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'times', '\u00D7');
    }
}
// Latin capital letter O with stroke
export class OslashDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Oslash', '\u00D8');
    }
}
// Latin capital letter U with grave
export class UgraveDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ugrave', '\u00D9');
    }
}
// Latin capital letter U with acute
export class UacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Uacute', '\u00DA');
    }
}
// Latin capital letter U with circumflex
export class UcircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Ucirc', '\u00DB');
    }
}
// Latin capital letter U with diaeresis (umlaut)
export class UumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Uumlaut', '\u00DC');
    }
}
// Latin capital letter Y with acute
export class YacuteDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Yacute', '\u00DD');
    }
}
// Latin capital letter Thorn
export class THORNDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'THORN', '\u00DE');
    }
}
// Latin small letter sharp s (eszett)
export class SzligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'szlig', '\u00DF');
    }
}
// Latin small letter a with grave
export class AgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'agrave', '\u00E0');
    }
}
// Latin small letter a with acute
export class AacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aacute', '\u00E1');
    }
}
// Latin small letter a with circumflex
export class AcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'acirc', '\u00E2');
    }
}
// Latin small letter a with tilde
export class AtildeSmallDocMarkupType extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'atilde', '\u00E3');
    }
}
// Latin small letter a with diaeresis (umlaut)
export class AumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aumlaut', '\u00E4');
    }
}
// Latin small letter a with ring above
export class AringSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aring', '\u00E5');
    }
}
// Latin small letter ae
export class AeligSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'aelig', '\u00E6');
    }
}
// Latin small letter c with cedilla
export class CcedilSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ccedil', '\u00E7');
    }
}
// Latin small letter e with grave
export class EgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'egrave', '\u00E8');
    }
}
// Latin small letter e with acute
export class EacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eacute', '\u00E9');
    }
}
// Latin small letter e with circumflex
export class EcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ecirc', '\u00EA');
    }
}
// Latin small letter e with diaeresis (umlaut)
export class EumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eumlaut', '\u00EB');
    }
}
// Latin small letter i with grave
export class IgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'igrave', '\u00EC');
    }
}
// Latin small letter i with acute
export class IacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iacute', '\u00ED');
    }
}
// Latin small letter i with circumflex
export class IcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'icirc', '\u00EE');
    }
}
// Latin small letter i with diaeresis (umlaut)
export class IumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iumlaut', '\u00EF');
    }
}
// Latin small letter eth
export class EthSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eth', '\u00F0');
    }
}
// Latin small letter n with tilde
export class NtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ntilde', '\u00F1');
    }
}
// Latin small letter o with grave
export class OgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ograve', '\u00F2');
    }
}
// Latin small letter o with acute
export class OacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oacute', '\u00F3');
    }
}
// Latin small letter o with circumflex
export class OcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ocirc', '\u00F4');
    }
}
// Latin small letter o with tilde
export class OtildeSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'otilde', '\u00F5');
    }
}
// Latin small letter o with diaeresis (umlaut)
export class OumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oumlaut', '\u00F6');
    }
}
// division sign
export class DivideDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'divide', '\u00F7');
    }
}
// Latin small letter o with stroke
export class OslashSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oslash', '\u00F8');
    }
}
// Latin small letter u with grave
export class UgraveSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ugrave', '\u00F9');
    }
}
// Latin small letter u with acute
export class UacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uacute', '\u00FA');
    }
}
// Latin small letter u with circumflex
export class UcircSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ucirc', '\u00FB');
    }
}
// Latin small letter u with diaeresis (umlaut)
export class UumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uumlaut', '\u00FC');
    }
}
// Latin small letter y with acute
export class YacuteSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yacute', '\u00FD');
    }
}
// Latin small letter thorn
export class ThornSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thorn', '\u00FE');
    }
}
// Latin small letter y with diaeresis (umlaut)
export class YumlautSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'yumlaut', '\u00FF');
    }
}
// Latin small letter f with hook (function)
export class FnofDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'fnof', '\u0192');
    }
}
// Greek capital letter Alpha
export class AlphaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Alpha', '\u0391');
    }
}
// Greek capital letter Beta
export class BetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Beta', '\u0392');
    }
}
// Greek capital letter Gamma
export class GammaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Gamma', '\u0393');
    }
}
// Greek capital letter Delta
export class DeltaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Delta', '\u0394');
    }
}
// Greek capital letter Epsilon
export class EpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Epsilon', '\u0395');
    }
}
// Greek capital letter Zeta
export class ZetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Zeta', '\u0396');
    }
}
// Greek capital letter Eta
export class EtaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Eta', '\u0397');
    }
}
// Greek capital letter Theta
export class ThetaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Theta', '\u0398');
    }
}
// Greek capital letter Iota
export class IotaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Iota', '\u0399');
    }
}
// Greek capital letter Kappa
export class KappaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Kappa', '\u039A');
    }
}
// Greek capital letter Lambda
export class LambdaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Lambda', '\u039B');
    }
}
// Greek capital letter Mu
export class MuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Mu', '\u039C');
    }
}
// Greek capital letter Nu
export class NuDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Nu', '\u039D');
    }
}
// Greek capital letter Xi
export class XiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Xi', '\u039E');
    }
}
// Greek capital letter Omicron
export class OmicronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Omicron', '\u039F');
    }
}
// Greek capital letter Pi
export class PiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Pi', '\u03A0');
    }
}
// Greek capital letter Rho
export class RhoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Rho', '\u03A1');
    }
}
// Greek capital letter Sigma
export class SigmaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Sigma', '\u03A3');
    }
}
// Greek capital letter Tau
export class TauDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Tau', '\u03A4');
    }
}
// Greek capital letter Upsilon
export class UpsilonDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Upsilon', '\u03A5');
    }
}
// Greek capital letter Phi
export class PhiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Phi', '\u03A6');
    }
}
// Greek capital letter Chi
export class ChiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Chi', '\u03A7');
    }
}
// Greek capital letter Psi
export class PsiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Psi', '\u03A8');
    }
}
// Greek capital letter Omega
export class OmegaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Omega', '\u03A9');
    }
}
// Greek small letter alpha
export class AlphaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'alpha', '\u03B1');
    }
}
// Greek small letter beta
export class BetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'beta', '\u03B2');
    }
}
// Greek small letter gamma
export class GammaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'gamma', '\u03B3');
    }
}
// Greek small letter delta
export class DeltaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'delta', '\u03B4');
    }
}
// Greek small letter epsilon
export class EpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'epsilon', '\u03B5');
    }
}
// Greek small letter zeta
export class ZetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zeta', '\u03B6');
    }
}
// Greek small letter eta
export class EtaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'eta', '\u03B7');
    }
}
// Greek small letter theta
export class ThetaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'theta', '\u03B8');
    }
}
// Greek small letter iota
export class IotaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'iota', '\u03B9');
    }
}
// Greek small letter kappa
export class KappaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'kappa', '\u03BA');
    }
}
// Greek small letter lambda
export class LambdaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lambda', '\u03BB');
    }
}
// Greek small letter mu
export class MuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'mu', '\u03BC');
    }
}
// Greek small letter nu
export class NuSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nu', '\u03BD');
    }
}
// Greek small letter xi
export class XiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'xi', '\u03BE');
    }
}
// Greek small letter omicron
export class OmicronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'omicron', '\u03BF');
    }
}
// Greek small letter pi
export class PiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'pi', '\u03C0');
    }
}
// Greek small letter rho
export class RhoSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rho', '\u03C1');
    }
}
// Greek small letter sigma
export class SigmaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sigma', '\u03C3');
    }
}
// Greek small letter sigmaf
export class SigmafSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sigmaf', '\u03C2');
    }
}
// Greek small letter tau
export class TauSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tau', '\u03C4');
    }
}
// Greek small letter upsilon
export class UpsilonSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'upsilon', '\u03C5');
    }
}
// Greek small letter phi
export class PhiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'phi', '\u03C6');
    }
}
// Greek small letter chi
export class ChiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'chi', '\u03C7');
    }
}
// Greek small letter psi
export class PsiSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'psi', '\u03C8');
    }
}
// Greek small letter omega
export class OmegaSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'omega', '\u03C9');
    }
}
// Greek small letter theta symbol
export class ThetasymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thetasym', '\u03D1');
    }
}
// Greek upsilon with hook symbol
export class UpsihDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'upsih', '\u03D2');
    }
}
// Greek pi symbol (variant)
export class PivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'piv', '\u03D6');
    }
}
// Bullet
export class BullDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bull', '\u2022');
    }
}
// Horizontal ellipsis
export class HellipDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hellip', '\u2026');
    }
}
// Prime (minutes, feet)
export class PrimeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prime', '\u2032');
    }
}
// Double prime (seconds, inches)
export class PrimeUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Prime', '\u2033');
    }
}
// Overline
export class OlineDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oline', '\u203E');
    }
}
// Fraction slash
export class FraslDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'frasl', '\u2044');
    }
}
// Script capital P (Weierstrass p)
export class WeierpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'weierp', '\u2118');
    }
}
// Imaginary part
export class ImaginaryDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'imaginary', '\u2111');
    }
}
// Real part
export class RealDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'real', '\u211C');
    }
}
// Trademark
export class TrademarkDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'trademark', '\u2122');
    }
}
// Alef symbol
export class AlefsymDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'alefsym', '\u2135');
    }
}
// Leftwards arrow
export class LarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'larr', '\u2190');
    }
}
// Upwards arrow
export class UarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uarr', '\u2191');
    }
}
// Rightwards arrow
export class RarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rarr', '\u2192');
    }
}
// Downwards arrow
export class DarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'darr', '\u2193');
    }
}
// Left right arrow
export class HarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'harr', '\u2194');
    }
}
// Downwards arrow with corner leftwards (carriage return)
export class CrarrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'crarr', '\u21B5');
    }
}
// Leftwards double arrow
export class LArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lArr', '\u21D0');
    }
}
// Upwards double arrow
export class UArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'uArr', '\u21D1');
    }
}
// Rightwards double arrow
export class RArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rArr', '\u21D2');
    }
}
// Downwards double arrow
export class DArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'dArr', '\u21D3');
    }
}
// Left right double arrow
export class HArrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hArr', '\u21D4');
    }
}
// For all
export class ForallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'forall', '\u2200');
    }
}
// Partial differential
export class PartDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'part', '\u2202');
    }
}
// There exists
export class ExistDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'exist', '\u2203');
    }
}
// Empty set
export class EmptyDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'empty', '\u2205');
    }
}
// Nabla
export class NablaDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nabla', '\u2207');
    }
}
// Element of
export class IsinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'isin', '\u2208');
    }
}
// Not an element of
export class NotinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'notin', '\u2209');
    }
}
// Contains as member
export class NiDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ni', '\u220B');
    }
}
// N-ary product
export class ProdDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prod', '\u220F');
    }
}
// N-ary summation
export class SumDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sum', '\u2211');
    }
}
// Minus sign
export class MinusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'minus', '\u2212');
    }
}
// Asterisk operator
export class LowastDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lowast', '\u2217');
    }
}
// Square root
export class RadicDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'radic', '\u221A');
    }
}
// Proportional to
export class PropDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'prop', '\u221D');
    }
}
// Infinity
export class InfinDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'infin', '\u221E');
    }
}
// Angle
export class AngDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ang', '\u2220');
    }
}
// Logical and
export class AndDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'and', '\u2227');
    }
}
// Logical or
export class OrDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'or', '\u2228');
    }
}
// Intersection
export class CapDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cap', '\u2229');
    }
}
// Union
export class CupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cup', '\u222A');
    }
}
// Integral
export class IntDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'int', '\u222B');
    }
}
// Therefore
export class There4DocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'there4', '\u2234');
    }
}
// Tilde operator
export class SimDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sim', '\u223C');
    }
}
// Approximately equal to
export class CongDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cong', '\u2245');
    }
}
// Almost equal to
export class AsympDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'asymp', '\u2248');
    }
}
// Not equal to
export class NeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ne', '\u2260');
    }
}
// Identical to
export class EquivDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'equiv', '\u2261');
    }
}
// Less-than or equal to
export class LeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'le', '\u2264');
    }
}
// Greater-than or equal to
export class GeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ge', '\u2265');
    }
}
// Subset of
export class SubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sub', '\u2282');
    }
}
// Superset of
export class SupDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sup', '\u2283');
    }
}
// Not a subset of
export class NsubDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'nsub', '\u2284');
    }
}
// Subset of or equal to
export class SubeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sube', '\u2286');
    }
}
// Superset of or equal to
export class SupeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'supe', '\u2287');
    }
}
// Circled plus
export class OplusDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oplus', '\u2295');
    }
}
// Circled times
export class OtimesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'otimes', '\u2297');
    }
}
// Perpendicular
export class PerpDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'perp', '\u22A5');
    }
}
// Dot operator
export class SdotDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sdot', '\u22C5');
    }
}
// Left ceiling
export class LceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lceil', '\u2308');
    }
}
// Right ceiling
export class RceilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rceil', '\u2309');
    }
}
// Left floor
export class LfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lfloor', '\u230A');
    }
}
// Right floor
export class RfloorDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rfloor', '\u230B');
    }
}
// Left-pointing angle bracket
export class LangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lang', '\u2329');
    }
}
// Right-pointing angle bracket
export class RangDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rang', '\u232A');
    }
}
// Lozenge
export class LozDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'loz', '\u25CA');
    }
}
// Black spade suit
export class SpadesDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'spades', '\u2660');
    }
}
// Black club suit
export class ClubsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'clubs', '\u2663');
    }
}
// Black heart suit
export class HeartsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'hearts', '\u2665');
    }
}
// Black diamond suit
export class DiamsDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'diams', '\u2666');
    }
}
// Latin capital ligature OE
export class OEligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'OElig', '\u0152');
    }
}
// Latin small ligature oe
export class OeligDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'oelig', '\u0153');
    }
}
// Latin capital letter S with caron
export class ScaronDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Scaron', '\u0160');
    }
}
// Latin small letter s with caron
export class ScaronSmallDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'scaron', '\u0161');
    }
}
// Latin capital letter Y with diaeresis (umlaut)
export class YumlautDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Yumlaut', '\u0178');
    }
}
// Modifier letter circumflex accent
export class CircDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'circ', '\u02C6');
    }
}
// Small tilde
export class TildeDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tilde', '\u02DC');
    }
}
// En space
export class EnspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ensp', '\u2002');
    }
}
// Em space
export class EmspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'emsp', '\u2003');
    }
}
// Thin space
export class ThinspDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'thinsp', '\u2009');
    }
}
// Zero width non-joiner
export class ZwnjDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'zwnj', '\u200C');
    }
}
// Left-to-right mark
export class LrmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lrm', '\u200E');
    }
}
// Right-to-left mark
export class RlmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rlm', '\u200F');
    }
}
// Single low-9 quotation mark
export class SbquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'sbquo', '\u201A');
    }
}
// Left double quotation mark
export class LdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ldquo', '\u201C');
    }
}
// Right double quotation mark
export class RdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rdquo', '\u201D');
    }
}
// Double low-9 quotation mark
export class BdquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bdquo', '\u201E');
    }
}
// Dagger
export class DaggerDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'dagger', '\u2020');
    }
}
// Double dagger
export class DaggerUpperDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'Dagger', '\u2021');
    }
}
// Per mille sign
export class PermilDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'permil', '\u2030');
    }
}
// Single left-pointing angle quotation mark
export class LsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lsaquo', '\u2039');
    }
}
// Single right-pointing angle quotation mark
export class RsaquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rsaquo', '\u203A');
    }
}
// Euro sign
export class EuroDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'euro', '\u20AC');
    }
}
// Trade mark sign
export class TmDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'tm', '\u2122');
    }
}
// Left single quote.
export class LsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'lsquo', '\u2018'); // '‘'
    }
}
// Right single quote.
export class RsquoDocMarkupDataModel extends SubstringDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'rsquo', '\u0060'); // '`'
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docURLLink" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="url" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocURLLink extends AbstractDataModelBase {
    // children: Array<string | DocTitleCmdGroup> = []
    // Mandatory attributes.
    url = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_url') {
                this.url = xml.getAttributeStringValue(element, '@_url');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.url.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="ulink" type="docURLLink" />
export class UlinkDataModel extends AbstractDocURLLink {
    constructor(xml, element) {
        super(xml, element, 'ulink');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docAnchorType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocAnchorType extends AbstractDataModelBase {
    // children: string[] = []
    // Mandatory attributes.
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // Usually empty `<anchor id="deprecated_1_deprecated000014"/>`
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        if (this.children.length > 0) {
            console.error('Unexpected <anchor> text content in', this.constructor.name);
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="anchor" type="docAnchorType" />
export class AnchorDataModel extends AbstractDocAnchorType {
    constructor(xml, element) {
        super(xml, element, 'anchor');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docFormulaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocFormulaType extends AbstractDataModelBase {
    // Mandatory elements.
    text = ''; // The name of the reference, passed as element text.
    // Mandatory attributes.
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        assert(this.text.length > 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="formula" type="docFormulaType" />
export class FormulaDataModel extends AbstractDocFormulaType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'formula');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docIndexEntryType">
//   <xsd:sequence>
//     <xsd:element name="primaryie" type="xsd:string" />
//     <xsd:element name="secondaryie" type="xsd:string" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocIndexEntryType extends AbstractDataModelBase {
    // Mandatory elements.
    primaryie = '';
    secondaryie = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'primaryie')) {
                this.primaryie = xml.getInnerElementText(innerElement, 'primaryie');
            }
            else if (xml.isInnerElementText(innerElement, 'secondaryie')) {
                this.secondaryie = xml.getInnerElementText(innerElement, 'secondaryie');
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // May be empty.
        // assert(this.primaryie.length > 0)
        // assert(this.secondaryie.length > 0)
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="indexentry" type="docIndexEntryType" />
export class IndexEntryDataModel extends AbstractDocIndexEntryType {
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'indexentry');
    }
}
// ----------------------------------------------------------------------------
// WARNING: start & type are optionsl.
// <xsd:complexType name="docListType">
//   <xsd:sequence>
//     <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="type" type="DoxOlType" />
//   <xsd:attribute name="start" type="xsd:integer" />
// </xsd:complexType>
// <xsd:simpleType name="DoxOlType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="1" />
//     <xsd:enumeration value="a" />
//     <xsd:enumeration value="A" />
//     <xsd:enumeration value="i" />
//     <xsd:enumeration value="I" />
//   </xsd:restriction>
// </xsd:simpleType>
export class AbstractDocListType extends AbstractDataModelBase {
    // Mandatory elements.
    listItems = [];
    // Optional attributes.
    type = '';
    start;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'listitem')) {
                this.listItems.push(new ListItemDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_type') {
                    this.type = xml.getAttributeStringValue(element, '@_type');
                }
                else if (attributeName === '@_start') {
                    assert(this.start === undefined);
                    this.start = Number(xml.getAttributeNumberValue(element, '@_start'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
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
export class AbstractDocListItemType extends AbstractDataModelBase {
    // Optional elements.
    paras;
    // Optional attributes.
    override;
    value;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // May be empty.
        // assert(innerElements.length > 0)
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                if (this.paras === undefined) {
                    this.paras = [];
                }
                this.paras.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_override') {
                    this.override = xml.getAttributeStringValue(element, '@_override');
                }
                else if (attributeName === '@_value') {
                    assert(this.value === undefined);
                    this.value = Number(xml.getAttributeNumberValue(element, '@_value'));
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="listitem" type="docListItemType" maxOccurs="unbounded" />
export class ListItemDataModel extends AbstractDocListItemType {
    constructor(xml, element) {
        super(xml, element, 'listitem');
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
export class AbstractDocSimpleSectType extends AbstractDataModelBase {
    // Optional elements.
    title; // Only one.
    // Any sequence of them.
    // children: Array<string | ParaDataModel> = []
    // Mandatory attributes.
    kind = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                assert(this.title === undefined);
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
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
export class AbstractDocRefTextType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocTitleCmdGroup> = []
    // Mandatory attributes.
    refid = '';
    kindref = ''; // DoxRefKind
    // Optional attributes.
    external;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_refid') {
                this.refid = xml.getAttributeStringValue(element, '@_refid');
            }
            else if (attributeName === '@_kindref') {
                this.kindref = xml.getAttributeStringValue(element, '@_kindref');
            }
            else if (attributeName === '@_external') {
                this.external = xml.getAttributeStringValue(element, '@_external');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        // WARNING may be empty
        // assert(this.refid.length > 0)
        assert(this.kindref.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="ref" type="docRefTextType" />
export class RefDataModel extends AbstractDocRefTextType {
    constructor(xml, element) {
        super(xml, element, 'ref');
    }
}
// <xsd:complexType name="docTableType">
//   <xsd:sequence>
//     <xsd:element name="caption" type="docCaptionType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="rows" type="xsd:integer" />
//   <xsd:attribute name="cols" type="xsd:integer" />
//   <xsd:attribute name="width" type="xsd:string" /> // WARNING: optional
// </xsd:complexType>
export class AbstractDocTableType extends AbstractDataModelBase {
    caption = undefined;
    rows = undefined;
    // Mandatory attributes.
    rowsCount = NaN;
    colsCount = NaN;
    // Optional
    width;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'caption')) {
                assert(this.caption === undefined);
                this.caption = new DocCaptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'row')) {
                if (this.rows === undefined) {
                    this.rows = [];
                }
                const docRow = new DocRowDataModel(xml, innerElement);
                this.rows.push(docRow);
                this.children.push(docRow);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_rows') {
                assert(isNaN(this.rowsCount));
                this.rowsCount = xml.getAttributeNumberValue(element, '@_rows');
            }
            else if (attributeName === '@_cols') {
                assert(isNaN(this.colsCount));
                this.colsCount = xml.getAttributeNumberValue(element, '@_cols');
            }
            else if (attributeName === '@_width') {
                assert(this.width === undefined);
                this.width = xml.getAttributeStringValue(element, '@_width');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.rowsCount > 0);
        assert(this.colsCount > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="table" type="docTableType" />
export class DocTableDataModel extends AbstractDocTableType {
    constructor(xml, element) {
        super(xml, element, 'table');
    }
}
// <xsd:complexType name="docRowType">
//   <xsd:sequence>
//     <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocRowType extends AbstractDataModelBase {
    // Optional elements.
    entries;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'entry')) {
                if (this.entries === undefined) {
                    this.entries = [];
                }
                const docEntry = new DocEntryDataModel(xml, innerElement);
                this.entries.push(docEntry);
                this.children.push(docEntry);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
export class DocRowDataModel extends AbstractDocRowType {
    constructor(xml, element) {
        super(xml, element, 'row');
    }
}
// <xsd:complexType name="docEntryType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="thead" type="DoxBool" />
//   <xsd:attribute name="colspan" type="xsd:integer" /> // WARNING: optional
//   <xsd:attribute name="rowspan" type="xsd:integer" /> // WARNING: optional
//   <xsd:attribute name="align" type="DoxAlign" /> // WARNING: optional
//   <xsd:attribute name="valign" type="DoxVerticalAlign" /> // WARNING: optional
//   <xsd:attribute name="width" type="xsd:string" /> // WARNING: optional
//   <xsd:attribute name="class" type="xsd:string" /> // WARNING: optional
//   <xsd:anyAttribute processContents="skip"/>
// </xsd:complexType>
export class AbstractDocEntryType extends AbstractDataModelBase {
    // Optional elements.
    paras;
    // Mandatory attributes.
    thead = false;
    colspan;
    rowspan;
    align;
    valign;
    width;
    classs;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                if (this.paras === undefined) {
                    this.paras = [];
                }
                const para = new ParaDataModel(xml, innerElement);
                this.paras.push(para);
                this.children.push(para);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_thead') {
                    this.thead = xml.getAttributeBooleanValue(element, '@_thead');
                }
                else if (attributeName === '@_colspan') {
                    assert(this.colspan === undefined);
                    this.colspan = Number(xml.getAttributeNumberValue(element, '@_colspan'));
                }
                else if (attributeName === '@_rowspan') {
                    assert(this.rowspan === undefined);
                    this.rowspan = Number(xml.getAttributeNumberValue(element, '@_rowspan'));
                }
                else if (attributeName === '@_align') {
                    assert(this.align === undefined);
                    this.align = xml.getAttributeStringValue(element, '@_align');
                }
                else if (attributeName === '@_valign') {
                    assert(this.valign === undefined);
                    this.valign = xml.getAttributeStringValue(element, '@_valign');
                }
                else if (attributeName === '@_width') {
                    assert(this.width === undefined);
                    this.width = xml.getAttributeStringValue(element, '@_width');
                }
                else if (attributeName === '@_class') {
                    assert(this.classs === undefined);
                    this.classs = xml.getAttributeStringValue(element, '@_class');
                }
                else {
                    console.error(`${elementName} attribute:`, attributeName, 'not in DTD, skipped', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="entry" type="docEntryType" minOccurs="0" maxOccurs="unbounded" />
export class DocEntryDataModel extends AbstractDocEntryType {
    constructor(xml, element) {
        super(xml, element, 'entry');
    }
}
// <xsd:complexType name="docCaptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocCaptionType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocTitleCmdGroup> = []
    // Mandatory attributes.
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                assert(this.id.length === 0);
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="row" type="docRowType" minOccurs="0" maxOccurs="unbounded" />
export class DocCaptionDataModel extends AbstractDocCaptionType {
    constructor(xml, element) {
        super(xml, element, 'caption');
    }
}
// <xsd:simpleType name="range_1_6">
//   <xsd:restriction base="xsd:integer">
//     <xsd:minInclusive value="1"/>
//     <xsd:maxInclusive value="6"/>
//   </xsd:restriction>
// </xsd:simpleType>
// ----------------------------------------------------------------------------
// <xsd:complexType name="docHeadingType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="level" type="range_1_6" />
// </xsd:complexType>
export class AbstractDocHeadingType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocTitleCmdGroup> = []
    // Mandatory attributes.
    level = NaN;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_level') {
                    this.level = xml.getAttributeNumberValue(element, '@_level');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="heading" type="docHeadingType" />
export class HeadingDataModel extends AbstractDocHeadingType {
    constructor(xml, element) {
        super(xml, element, 'heading');
    }
}
// ----------------------------------------------------------------------------
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
// <xsd:simpleType name="DoxImageKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="html" />
//     <xsd:enumeration value="latex" />
//     <xsd:enumeration value="docbook" />
//     <xsd:enumeration value="rtf" />
//     <xsd:enumeration value="xml" />
//   </xsd:restriction>
// </xsd:simpleType>
export class AbstractDocImageType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | DocTitleCmdGroup> = []
    // Optional attributes.
    type;
    name;
    width;
    height;
    alt;
    inline;
    caption;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_type') {
                this.type = xml.getAttributeStringValue(element, '@_type');
            }
            else if (attributeName === '@_name') {
                this.name = xml.getAttributeStringValue(element, '@_name');
            }
            else if (attributeName === '@_width') {
                this.width = xml.getAttributeStringValue(element, '@_width');
            }
            else if (attributeName === '@_height') {
                this.height = xml.getAttributeStringValue(element, '@_height');
            }
            else if (attributeName === '@_alt') {
                this.alt = xml.getAttributeStringValue(element, '@_alt');
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else if (attributeName === '@_caption') {
                this.caption = xml.getAttributeStringValue(element, '@_caption');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Keep track of html images, to copy them to the output.
        if (this.type === 'html') {
            if (xml.dataModel.images === undefined) {
                xml.dataModel.images = [];
            }
            xml.dataModel.images.push(this);
        }
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="image" type="docImageType" />
export class ImageDataModel extends AbstractDocImageType {
    constructor(xml, element) {
        super(xml, element, 'image');
    }
}
// ----------------------------------------------------------------------------
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
export class AbstractDocParamListType extends AbstractDataModelBase {
    // Optional elements.
    parameterItems;
    // Mandatory attributes.
    kind = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'parameteritem')) {
                if (this.parameterItems === undefined) {
                    this.parameterItems = [];
                }
                this.parameterItems.push(new ParameterItemDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="parameterlist" type="docParamListType" />
export class ParameterListDataModel extends AbstractDocParamListType {
    constructor(xml, element) {
        super(xml, element, 'parameterlist');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docParamListItem">
//   <xsd:sequence>
//     <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parameterdescription" type="descriptionType" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamListItem extends AbstractDataModelBase {
    // Mandatory elements.
    parameterDescription;
    // Optional elements.
    parameterNameList;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'parameternamelist')) {
                if (this.parameterNameList === undefined) {
                    this.parameterNameList = [];
                }
                this.parameterNameList.push(new ParameterNamelistDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parameterdescription')) {
                this.parameterDescription = new ParameterDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.parameterDescription !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="parameteritem" type="docParamListItem" minOccurs="0" maxOccurs="unbounded" />
export class ParameterItemDataModel extends AbstractDocParamListItem {
    constructor(xml, element) {
        super(xml, element, 'parameteritem');
    }
}
// WARNING: must be pairs of type/name.
// <xsd:complexType name="docParamNameList">
//   <xsd:sequence>
//     <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamNameList extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<ParameterTypeDataModel | ParameterNameDataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'parametertype')) {
                this.children.push(new ParameterTypeDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'parametername')) {
                this.children.push(new ParameterNameDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="parameternamelist" type="docParamNameList" minOccurs="0" maxOccurs="unbounded" />
export class ParameterNamelistDataModel extends AbstractDocParamNameList {
    constructor(xml, element) {
        super(xml, element, 'parameternamelist');
    }
}
// <xsd:complexType name="docParamType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocParamType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | RefTextDataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="parametertype" type="docParamType" minOccurs="0" maxOccurs="unbounded" />
export class ParameterTypeDataModel extends AbstractDocParamType {
    constructor(xml, element) {
        super(xml, element, 'parametertype');
    }
}
// <xsd:complexType name="docParamName" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="ref" type="refTextType" minOccurs="0" maxOccurs="1" />
//   </xsd:sequence>
//   <xsd:attribute name="direction" type="DoxParamDir" use="optional" />
// </xsd:complexType>
export class AbstractDocParamName extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | RefTextDataModel> = []
    // Optional attributes.
    direction;
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'ref')) {
                this.children.push(new RefTextDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_direction') {
                    this.direction = xml.getAttributeStringValue(element, '@_direction');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//  <xsd:element name="parametername" type="docParamName" minOccurs="0" maxOccurs="unbounded" />
export class ParameterNameDataModel extends AbstractDocParamName {
    constructor(xml, element) {
        super(xml, element, 'parametername');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docXRefSectType">
//   <xsd:sequence>
//     <xsd:element name="xreftitle" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="xrefdescription" type="descriptionType" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>
export class AbstractDocXRefSectType extends AbstractDataModelBase {
    // Mandatory elements.
    xreftitle;
    xrefdescription;
    // Mandatory attributes.
    id = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))ect(element))ect(element))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'xreftitle')) {
                this.xreftitle = xml.getInnerElementText(innerElement, 'xreftitle');
            }
            else if (xml.hasInnerElement(innerElement, 'xrefdescription')) {
                this.xrefdescription = new XrefDescriptionDataModel(xml, innerElement);
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.xrefdescription !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
//     <xsd:element name="xrefsect" type="docXRefSectType" />
export class XrefSectDataModel extends AbstractDocXRefSectType {
    constructor(xml, element) {
        super(xml, element, 'xrefsect');
    }
}
// ----------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------
// <xsd:complexType name="docBlockQuoteType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
export class AbstractDocBlockQuoteType extends AbstractDataModelBase {
    // Any sequence of them.
    // children: Array<string | ParaDataModel> = []
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        // SubstringDocMarkupType has no inner elments
        // assert(innerElements.length > 0)
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
export class BlockquoteDataModel extends AbstractDocBlockQuoteType {
    constructor(xml, element) {
        super(xml, element, 'blockquote');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docParBlockType">
//   <xsd:sequence>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
// ----------------------------------------------------------------------------
// <xsd:complexType name="docEmptyType"/>
export class AbstractDocEmptyType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // Empty.
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docEmojiType">
//   <xsd:attribute name="name" type="xsd:string"/>
//   <xsd:attribute name="unicode" type="xsd:string"/>
// </xsd:complexType>
export class AbstractEmojiType extends AbstractDataModelBase {
    name = '';
    unicode = '';
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_name') {
                this.name = xml.getAttributeStringValue(element, '@_name');
            }
            else if (attributeName === '@_unicode') {
                this.unicode = xml.getAttributeStringValue(element, '@_unicode');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="emoji" type="docEmojiType" />
export class EmojiDataModel extends AbstractEmojiType {
    constructor(xml, element) {
        super(xml, element, 'emoji');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="description" type="descriptionType" minOccurs="0" />
// <xsd:element name="inbodydescription" type="descriptionType" minOccurs="0" />
// <xsd:element name="parameterdescription" type="descriptionType" />
// <xsd:element name="xrefdescription" type="descriptionType" />
// <xsd:element name="parameterdescription" type="descriptionType" />
export class BriefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'briefdescription');
    }
}
export class DetailedDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'detaileddescription');
    }
}
export class InbodyDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'inbodydescription');
    }
}
export class DescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'description');
    }
}
export class XrefDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'xrefdescription');
    }
}
export class ParameterDescriptionDataModel extends AbstractDescriptionType {
    constructor(xml, element) {
        super(xml, element, 'parameterdescription');
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
// <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect3" type="docSect3Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect4" type="docSect4Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect5" type="docSect5Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="sect6" type="docSect6Type" minOccurs="0" maxOccurs="unbounded" />
// <xsd:element name="title" type="docTitleType" minOccurs="0" />
// <xsd:element name="term" type="docTitleType" />
export class InternalDataModel extends AbstractDocInternalType {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS1DataModel extends AbstractDocInternalS1Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS2DataModel extends AbstractDocInternalS2Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS3DataModel extends AbstractDocInternalS3Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS4DataModel extends AbstractDocInternalS4Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS5DataModel extends AbstractDocInternalS5Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class InternalS6DataModel extends AbstractDocInternalS6Type {
    constructor(xml, element) {
        super(xml, element, 'internal');
    }
}
export class Sect1DataModel extends AbstractDocSect1Type {
    constructor(xml, element) {
        super(xml, element, 'sect1');
    }
}
export class Sect2DataModel extends AbstractDocSect2Type {
    constructor(xml, element) {
        super(xml, element, 'sect2');
    }
}
export class Sect3DataModel extends AbstractDocSect3Type {
    constructor(xml, element) {
        super(xml, element, 'sect3');
    }
}
export class Sect4DataModel extends AbstractDocSect4Type {
    constructor(xml, element) {
        super(xml, element, 'sect4');
    }
}
export class Sect5DataModel extends AbstractDocSect5Type {
    constructor(xml, element) {
        super(xml, element, 'sect5');
    }
}
export class Sect6DataModel extends AbstractDocSect6Type {
    constructor(xml, element) {
        super(xml, element, 'sect6');
    }
}
export class TitleDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'title');
    }
}
export class TermDataModel extends AbstractDocTitleType {
    constructor(xml, element) {
        super(xml, element, 'term');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
export class ParaDataModel extends AbstractDocParaType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="bold" type="docMarkupType" />
// <xsd:element name="underline" type="docMarkupType" />
// <xsd:element name="emphasis" type="docMarkupType" />
// <xsd:element name="computeroutput" type="docMarkupType" />
export class BoldDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'bold');
    }
}
export class SDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 's');
    }
}
export class StrikeDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'strike');
    }
}
export class UnderlineDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'underline');
    }
}
export class EmphasisDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'emphasis');
    }
}
export class ComputerOutputDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'computeroutput');
    }
}
export class SubscriptDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'subscript');
    }
}
export class SuperscriptDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'superscript');
    }
}
export class CenterDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'center');
    }
}
export class SmallDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'small');
    }
}
export class CiteDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'cite');
    }
}
export class DelDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'del');
    }
}
export class InsDataModel extends AbstractDocMarkupType {
    constructor(xml, element) {
        super(xml, element, 'ins');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="simplesect" type="docSimpleSectType" />
export class SimpleSectDataModel extends AbstractDocSimpleSectType {
    constructor(xml, element) {
        super(xml, element, 'simplesect');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="itemizedlist" type="docListType" />
export class ItemizedListDataModel extends AbstractDocListType {
    constructor(xml, element) {
        super(xml, element, 'itemizedlist');
    }
}
// <xsd:element name="orderedlist" type="docListType" />
export class OrderedListDataModel extends AbstractDocListType {
    constructor(xml, element) {
        super(xml, element, 'orderedlist');
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="linebreak" type="docEmptyType" />
// <xsd:element name="hruler" type="docEmptyType" />
export class LineBreakDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'linebreak');
    }
}
export class HrulerDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'hruler');
    }
}
export class NonBreakableSpaceDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'nonbreakablespace');
    }
}
// Not yet used, present just to remind its presence.
// <xsd:element name="para" type="docEmptyType" />
export class ParaEmptyDataModel extends AbstractDocEmptyType {
    constructor(xml, element) {
        super(xml, element, 'para');
    }
}
// ----------------------------------------------------------------------------
export class AbstractVerbatimType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // WARNING: not text only, ref encountered in Doxygen reference site.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// WARNING: not text only, ref encountered in Doxygen reference site.
// <xsd:element name="verbatim" type="xsd:string" />
export class VerbatimDataModel extends AbstractVerbatimType {
    constructor(xml, element) {
        super(xml, element, 'verbatim');
    }
}
// ----------------------------------------------------------------------------
export class AbstractPreformattedType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else {
                this.children.push(...parseDocTitleCmdGroup(xml, innerElement, elementName));
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// <xsd:element name="preformatted" type="docMarkupType" />
export class PreformattedDataModel extends AbstractPreformattedType {
    constructor(xml, element) {
        super(xml, element, 'preformatted');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=descriptiontype-dm.js.map