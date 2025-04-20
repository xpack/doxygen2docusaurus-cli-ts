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

export default function SectionUser({title, children}) {
  return (
    <dl class="doxySectionUser">
      <dt><b>{title}</b></dt>
      <dd>
        {children}
      </dd>
    </dl>
  );
}

// ----------------------------------------------------------------------------
