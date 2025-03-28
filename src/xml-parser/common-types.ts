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
// Attributes common to top elements in all files.

export interface XmlTopElementAttributes {
  ':@': {
    '@_noNamespaceSchemaLocation': string
    '@_version': string
    '@_lang': string
  }
}

export interface XmlCompoundAttributes {
  ':@': {
    '@_refid': string
    '@_kind': string
  }
}

export interface XmlText {
  '#text': string
}

// ----------------------------------------------------------------------------
// <?xml version='1.0' encoding='UTF-8' standalone='no'?>

export interface XmlProlog {
  '?xml': [XmlText] // an empty text
  ':@': {
    '@_version': string
    '@_encoding': string
    '@_standalone': string
  }
}

// ----------------------------------------------------------------------------
