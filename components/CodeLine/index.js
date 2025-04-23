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

import styles from './styles.module.css'
import React from 'react'

import Link from '@docusaurus/Link'

// ----------------------------------------------------------------------------

export default function CodeLine({ lineNumber, lineLink, children }) {
  return (
    <div class="doxyCodeLine">
      {lineNumber && <span class="doxyLineNumber">{lineLink ? <><Link to={lineLink}>{lineNumber}</Link></> : `${lineNumber}`}</span>}
      {!lineNumber && <span class="doxyNoLineNumber">&nbsp;</span>}
      <span class="doxyLineContent">{children}</span>
    </div>
  )
}

// ----------------------------------------------------------------------------
