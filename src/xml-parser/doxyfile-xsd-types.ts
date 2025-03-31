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

import { XmlCDATA, XmlProlog, XmlText, XmlTopElementAttributes } from './common-types.js'

// ----------------------------------------------------------------------------
// doxyfile.xsd

// <?xml version='1.0' encoding='UTF-8' standalone='no'?>
// <doxyfile xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="doxyfile.xsd" version="1.13.2" xml:lang="en-US">
//   <option  id='DOXYFILE_ENCODING' default='yes' type='string'><value><![CDATA[UTF-8]]></value></option>
//   ...
// </doxyfile>

export type XmlDoxyfileFile = XmlDoxyfileFileElements[]

export type XmlDoxyfileFileElements = XmlProlog | XmlDoxyfileElement | XmlText

// ----------------------------------------------------------------------------

// <xsd:element name="doxyfile" type="DoxygenFileType"/>

export interface XmlDoxyfileElement extends XmlTopElementAttributes {
  doxyfile: XmlDoxygenFileTypeElements[]
}

// <xsd:complexType name="DoxygenFileType">
//   <xsd:sequence>
//     <xsd:element name="option" type="OptionType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>

export type XmlDoxygenFileTypeElements = XmlOptionElement | XmlText

export interface XmlDoxygenFileTypeAttributes {
  ':@': {
    '@_version': string
    '@_lang': string
  }
}

export interface XmlOptionElement extends XmlOptionTypeAttributes {
  option: XmlOptionTypeElements[]
}

// <xsd:complexType name="OptionType">
//   <xsd:sequence>
//     <xsd:element name="value" type="valueType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="idType" use="required"/>
//   <xsd:attribute name="default" type="defaultType" use="required"/>
//   <xsd:attribute name="type" type="typeType" use="required"/>
// </xsd:complexType>

export type XmlOptionTypeElements = XmlValueElement | XmlText

export interface XmlOptionTypeAttributes {
  ':@': {
    '@_id': XmlIdType
    '@_default': XmlDefaultType
    '@_type': XmlTypeType
  }
}

export interface XmlValueElement {
  value: XmlValueTypeElements[]
}

// <xsd:simpleType name="valueType">
//   <xsd:restriction base="xsd:string">
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlValueTypeElements = XmlCDATA

// <xsd:simpleType name="idType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="DOXYFILE_ENCODING"/>
//     <xsd:enumeration value="PROJECT_NAME"/>
//     <xsd:enumeration value="PROJECT_NUMBER"/>
//     <xsd:enumeration value="PROJECT_BRIEF"/>
//     <xsd:enumeration value="PROJECT_LOGO"/>
//     <xsd:enumeration value="PROJECT_ICON"/>
//     ... many more
//     <xsd:enumeration value="MSCFILE_DIRS"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlIdType = string // actually an enumeration, but it is very large

// <xsd:simpleType name="defaultType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="yes"/>
//     <xsd:enumeration value="no"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlDefaultType = 'yes' | 'no'

// <xsd:simpleType name="typeType">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="int"/>
//     <xsd:enumeration value="bool"/>
//     <xsd:enumeration value="string"/>
//     <xsd:enumeration value="stringlist"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlTypeType = 'int' | 'bool' | 'string' | 'stringlist'

// ----------------------------------------------------------------------------
