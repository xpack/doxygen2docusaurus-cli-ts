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

export interface XmlProlog {
  '?xml': [XmlText] // an empty text
  ':@': {
    '@_version': string
    '@_encoding': string
    '@_standalone': string
  }
}

// ----------------------------------------------------------------------------
// Attributes common to top elements in all files.

// <doxygenindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="index.xsd" version="1.13.2" xml:lang="en-US">
// <doxygen xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="compound.xsd" version="1.13.2" xml:lang="en-US">
// <doxyfile xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="doxyfile.xsd" version="1.13.2" xml:lang="en-US">

export interface XmlTopElementAttributes {
  ':@': {
    '@_noNamespaceSchemaLocation': string
    '@_version': string
    '@_lang': string
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
