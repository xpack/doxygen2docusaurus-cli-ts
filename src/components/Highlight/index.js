/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2024 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */

// ----------------------------------------------------------------------------

import styles from './styles.module.css';
import React from 'react';

// ----------------------------------------------------------------------------

export default function Highlight({ kind, children }) {
  if (React.Children.count(children) === 0) {
    return (<></>)
  }

  if (kind === 'comment') {
    return (
      <span class="doxyHighlightComment">{children}</span>
    );
  } else if (kind === 'preprocessor') {
    return (
      <span class="doxyHighlightPreprocessor">{children}</span>
    );
  } else if (kind === 'keyword') {
    return (
      <span class="doxyHighlightKeyword">{children}</span>
    );
  } else if (kind === 'keywordtype') {
    return (
      <span class="doxyHighlightKeywordType">{children}</span>
    );
  } else if (kind === 'keywordflow') {
    return (
      <span class="doxyHighlightKeywordFlow">{children}</span>
    );
  } else if (kind === 'token') {
    return (
      <span class="doxyHighlightToken">{children}</span>
    );
  } else if (kind === 'stringliteral') {
    return (
      <span class="doxyHighlightStringLiteral">{children}</span>
    );
  } else {
    return (
      <span class="doxyHighlight">{children}</span>
    );
  }
}

// ----------------------------------------------------------------------------
