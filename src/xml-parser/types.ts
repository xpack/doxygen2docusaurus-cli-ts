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

// Types mimicking the .xsd definitions.

// Top structure to hold all xml raw data.
export interface XmlRawData {
  version: string
  doxygenindex: XmlCompound[] // from index.xml
  doxygen: XmlCompoundDef[] // from `${'@_refid'}.xml`
  doxyfile: XmlOption[] // from Doxyfile.xml
}

// ----------------------------------------------------------------------------

export interface XmlPreamble {
  '?xml': any
  ':@': {
    '@_version': string
    '@_encoding': string
    '@_standalone': string
  }
}

interface XmlTopBase {
  ':@': {
    '@_noNamespaceSchemaLocation': string
    '@_version': string
    '@_lang': string
  }
}

interface XmlCompoundBase {
  ':@': {
    '@_refid': string
    '@_kind': string
  }
}

interface XmlCompoundDefBase {
  ':@': {
    '@_id': string
    '@_kind': string
  }
}

// ----------------------------------------------------------------------------

// index.xsd
export type XmlDoxygenIndexParsed = [XmlPreamble, XmlDoxygenIndex]

export interface XmlDoxygenIndex extends XmlTopBase {
  doxygenindex: XmlCompound[]
}

export type XmlCompoundChildren = XmlName | XmlMember
export interface XmlCompound extends XmlCompoundBase {
  compound: XmlCompoundChildren[]
}

export interface XmlName {
  name: {
    '#text': string
  }
}

export interface XmlMember extends XmlCompoundBase {
  member: XmlName[]
}

// ----------------------------------------------------------------------------

// component.xsd
export type XmlDoxygenParsed = [XmlPreamble, XmlDoxygen]

export interface XmlDoxygen extends XmlTopBase {
  doxygen: XmlCompoundDef[]
}

export type XmlCompoundDefChildren = XmlCompoundName | XmlTitle | XmlInnerGroup | XmlInnerNamespace | XmlInnerDir | XmlInnerFile | XmlInnerNamespace

export interface XmlCompoundDef extends XmlCompoundDefBase {
  compounddef: XmlCompoundDefChildren[]
}

export interface XmlCompoundName {
  compoundname: [{
    '#text': string
  }]
}

export interface XmlTitle {
  title: [{
    '#text': string
  }]
}

export interface XmlInnerGroup {
  innergroup: [{
    '#text': string
  }]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerNamespace {
  innernamespace: [{
    '#text': string
  }]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerDir {
  innerdir: [{
    '#text': string
  }]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerFile {
  innerfile: [{
    '#text': string
  }]
  ':@': {
    '@_refid': string
  }
}

export interface XmlDerivedCompound {
  derivedcompoundref: [{
    '#text': string
  }]
  ':@': {
    '@_refid': string
    '@_prot': string
    '@_virt': string
  }
}

export interface XmlDescriptionType {
  title?: string
  para?: string | XmlDocParaType | XmlDocParaType[]
  internal?: XmlDocInternalType
  sect1?: any // TODO
}

export interface XmlDocParaType extends XmlDocCmdGroup {
}

export interface XmlDocInternalType {
  para?: XmlDocParaType
  sect1?: any // TODO
}

export interface XmlDocSect1Type {
  title?: XmlDocTitleType
}

export interface XmlDocTitleType extends XmlDocTitleCmdGroup {
}

export interface XmlDocTitleCmdGroup {
  [key: string]: string // TODO
}

export interface XmlDocCmdGroup {
  [key: string]: string // TODO
}

// ----------------------------------------------------------------------------

// doxyfile.xsd
export type XmlDoxygenFileParsed = [XmlPreamble, XmlDoxygenFile]

export interface XmlDoxygenFile extends XmlTopBase {
  doxyfile: XmlOption[]
}

export interface XmlOption {
  value: XmlOptionValueType[]
  '@_id': string
  '@_default': 'yes' | 'no'
  '@_type': XmlOptionValueType
}

export type XmlOptionValueType = 'int' | 'bool' | 'string' | 'stringlist'

// ----------------------------------------------------------------------------
