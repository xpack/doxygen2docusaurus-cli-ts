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

import { XmlProlog, XmlTopElementAttributes, XmlNameElement, XmlText } from './common-types.js'

// ----------------------------------------------------------------------------
// index.xsd

// <?xml version='1.0' encoding='UTF-8' standalone='no'?>
// <doxygenindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="index.xsd" version="1.13.2" xml:lang="en-US">
//   <compound refid="classmicro__os__plus_1_1utils_1_1double__list" kind="class"><name>micro_os_plus::utils::double_list</name>
//   ...
//   </compound>
// </doxygenindex>

export type XmlIndexFile = XmlIndexFileElements[]

export type XmlIndexFileElements = XmlProlog | XmlDoxygenIndexElement | XmlText

// ----------------------------------------------------------------------------

// <xsd:element name="doxygenindex" type="DoxygenType"/>

export interface XmlDoxygenIndexElement extends XmlTopElementAttributes {
  doxygenindex: XmlDoxygenIndexTypeElements[]
}

// WARNING: it clashes with the definition in compound.xsd.
// <xsd:complexType name="DoxygenType">
//   <xsd:sequence>
//     <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>

export type XmlDoxygenIndexTypeElements = XmlCompoundElement

export interface XmlDoxygenIndexTypeAttributes {
  ':@': {
    '@_version': string
    '@_lang': string
  }
}

export interface XmlCompoundElement extends XmlCompoundTypeAttributes {
  compound: XmlCompoundTypeElements[]
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="CompoundType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//     <xsd:element name="member" type="MemberType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="CompoundKind" use="required"/>
// </xsd:complexType>

export type XmlCompoundTypeElements = XmlNameElement | XmlMemberElement | XmlText

export interface XmlCompoundTypeAttributes {
  ':@': {
    '@_refid': string
    '@_kind': XmlCompoundKind
  }
}

export interface XmlMemberElement extends XmlMemberTypeAttributes {
  member: XmlMemberTypeElements[]
}

// <xsd:complexType name="MemberType">
//   <xsd:sequence>
//     <xsd:element name="name" type="xsd:string"/>
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" use="required"/>
//   <xsd:attribute name="kind" type="MemberKind" use="required"/>
// </xsd:complexType>

export type XmlMemberTypeElements = XmlMemberElement | XmlText

export interface XmlMemberTypeAttributes {
  ':@': {
    '@_refid': string
    '@_kind': XmlMemberKind
  }
}

// <xsd:simpleType name="CompoundKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="class"/>
//     <xsd:enumeration value="struct"/>
//     <xsd:enumeration value="union"/>
//     <xsd:enumeration value="interface"/>
//     <xsd:enumeration value="protocol"/>
//     <xsd:enumeration value="category"/>
//     <xsd:enumeration value="exception"/>
//     <xsd:enumeration value="file"/>
//     <xsd:enumeration value="namespace"/>
//     <xsd:enumeration value="group"/>
//     <xsd:enumeration value="page"/>
//     <xsd:enumeration value="example"/>
//     <xsd:enumeration value="dir"/>
//     <xsd:enumeration value="type"/>
//     <xsd:enumeration value="concept"/>
//     <xsd:enumeration value="module"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlCompoundKind = 'class' | 'struct' | 'union' | 'interface' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'protocol' | 'category' | 'exception' | 'file' | 'namespace' | 'group' | 'page' | 'example' | 'dir' | 'type' | 'concept' | 'module'

// <xsd:simpleType name="MemberKind">
//   <xsd:restriction base="xsd:string">
//     <xsd:enumeration value="define"/>
//     <xsd:enumeration value="property"/>
//     <xsd:enumeration value="event"/>
//     <xsd:enumeration value="variable"/>
//     <xsd:enumeration value="typedef"/>
//     <xsd:enumeration value="enum"/>
//     <xsd:enumeration value="enumvalue"/>
//     <xsd:enumeration value="function"/>
//     <xsd:enumeration value="signal"/>
//     <xsd:enumeration value="prototype"/>
//     <xsd:enumeration value="friend"/>
//     <xsd:enumeration value="dcop"/>
//     <xsd:enumeration value="slot"/>
//   </xsd:restriction>
// </xsd:simpleType>

export type XmlMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'enumvalue' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot'

// ----------------------------------------------------------------------------
