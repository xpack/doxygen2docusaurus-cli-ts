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

import { CompoundDefDataModel } from './compounds/compounddef-dm.js'
import { AbstractDocImageType } from './compounds/descriptiontype-dm.js'
import { AbstractDocTocListType } from './compounds/tableofcontentstype-dm.js'
import { DoxygenFileDataModel } from './doxyfile/doxyfiletype-dm.js'
import { DoxygenIndexDataModel } from './index/indexdoxygentype-dm.js'

// ----------------------------------------------------------------------------

// <?xml version='1.0' encoding='UTF-8' standalone='no'?>

export interface XmlPrologue {
  '?xml': [XmlText] // an empty text
  ':@': {
    '@_version': string
    '@_encoding': string
    '@_standalone': string
  }
}

// ----------------------------------------------------------------------------
// Generic types.

export interface XmlAttributes {
  ':@': {
    [key: string]: string | number | boolean
  }
}

export interface XmlElement {
  // Each element has only one key mapped to an array.
  (key: string): XmlElement[]
  '#text': string | number | boolean
  ':@'?: {
    [key: string]: string | number | boolean
  }
}

export interface XmlText {
  '#text': string
}

export interface XmlCDATA {
  '#cdata': string
}

export interface XmlNameElement {
  name: {
    '#text': string
  }
}

// ----------------------------------------------------------------------------

export abstract class AbstractDataModelBase {
  elementName: string
  skipPara?: boolean

  constructor (elementName: string) {
    this.elementName = elementName
  }
}

// ----------------------------------------------------------------------------
// Top structure to hold the parsed Doxygen xml data as JS objects.
// All objects are defined in the `data-model` folder.

export interface DataModel {
  doxygenindex?: DoxygenIndexDataModel // from index.xml
  compoundDefs: CompoundDefDataModel[] // from `${'@_refid'}.xml`
  doxyfile?: DoxygenFileDataModel // from Doxyfile.xml

  images?: AbstractDocImageType[]
  tocLists?: AbstractDocTocListType[]
}

// ----------------------------------------------------------------------------
