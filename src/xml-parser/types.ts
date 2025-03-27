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

export type XmlCompoundDefChildren = XmlCompoundName | XmlTitle | XmlInnerGroup | XmlInnerNamespace | XmlInnerDir | XmlInnerFile | XmlInnerNamespace | XmlBriefDescription | XmlDetailedDescription

export interface XmlCompoundDef extends XmlCompoundDefBase {
  compounddef: XmlCompoundDefChildren[]
}

export interface XmlText {
  '#text': string
}

export interface XmlCompoundName {
  compoundname: [XmlText]
}

export interface XmlTitle {
  title: [XmlText]
}

export interface XmlInnerGroup {
  innergroup: [XmlText]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerNamespace {
  innernamespace: [XmlText]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerDir {
  innerdir: [XmlText]
  ':@': {
    '@_refid': string
  }
}

export interface XmlInnerFile {
  innerfile: [XmlText]
  ':@': {
    '@_refid': string
  }
}

export interface XmlDerivedCompound {
  derivedcompoundref: [XmlText]
  ':@': {
    '@_refid': string
    '@_prot': string
    '@_virt': string
  }
}

export interface XmlBriefDescription {
  briefdescription: XmlDescriptionType[]
}

export interface XmlDetailedDescription {
  detaileddescription: XmlDescriptionType[]
}

export type XmlDescriptionType = XmlPara | XmlText | XmlBold | XmlParameterList | XmlComputerOutput | XmlRef | XmlSimpleSect | XmlProgramListing

export interface XmlPara {
  para: XmlDescriptionType[]
}

export interface XmlBold {
  bold: XmlDescriptionType[]
}

export interface XmlComputerOutput {
  computeroutput: XmlDescriptionType[]
}

export interface XmlRef {
  ref: XmlDescriptionType[]
  ':@': {
    '@_refid': string
    '@_kindref': string
  }
}

export interface XmlParameterList {
  parameterlist: XmlParameterItem[]
  ':@': {
    '@_kind': string
  }
}

// Two items array.
export interface XmlParameterItem {
  parameteritem: [XmlParameterNameList, XmlParameterDescription]
}

// Array of names.
export interface XmlParameterNameList {
  parameternamelist: XmlParameterName[]
}

export interface XmlParameterDescription {
  parameterdescription: XmlDescriptionType[]
}

export interface XmlParameterName {
  parametername: [XmlText]
}

export interface XmlSimpleSect {
  simplesect: Array<XmlTitle | XmlPara>
  ':@': {
    '@_kind': string
  }
}

export interface XmlProgramListing {
  programlisting: XmlCodeLine[]
  ':@': {
    '@_filename': string
  }
}

export interface XmlCodeLine {
  codeline: XmlHighlight[]
  ':@': {
    '@_lineno': string
    '@_refid': string
    '@_refkind': string
    '@_external': string
  }
}

export interface XmlHighlight {
  highlight: Array<XmlText | XmlSp | XmlRefText>
  ':@': {
    '@_filename': string
  }
}

export interface XmlSp {
  sp: any[]
  ':@': {
    '@_value': string
  }
}

export interface XmlRefText {
  ref: XmlText[]
  ':@': {
    '@_refid': string
    '@_kindref': string
    '@_external': string
    '@_tooltip': string
  }
}

export interface XmlInclude {
  include: XmlText[]
  ':@': {
    '@_refid': string
    '@_local': string
  }
}

// export interface XmlDescriptionType {
//   title?: string
//   para?: string | XmlDocParaType | XmlDocParaType[]
//   internal?: XmlDocInternalType
//   sect1?: any // TODO
// }

// export interface XmlDocParaType extends XmlDocCmdGroup {
// }

// export interface XmlDocInternalType {
//   para?: XmlDocParaType
//   sect1?: any // TODO
// }

// export interface XmlDocSect1Type {
//   title?: XmlDocTitleType
// }

// export interface XmlDocTitleType extends XmlDocTitleCmdGroup {
// }

// export interface XmlDocTitleCmdGroup {
//   [key: string]: string // TODO
// }

// export interface XmlDocCmdGroup {
//   [key: string]: string // TODO
// }

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
