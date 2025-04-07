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

export abstract class AbstractParsedObjectBase {
  elementName: string

  constructor (elementName: string) {
    this.elementName = elementName
  }
}

// ----------------------------------------------------------------------------
