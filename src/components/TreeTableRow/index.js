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
import Link from '@docusaurus/Link'

// ----------------------------------------------------------------------------

export default function TreeTableRow({
  itemIcon,
  itemLabel,
  itemLink,
  depth,
  children
}) {
  const doxyClass=`doxyTreeItemLeft doxyTreeIndent${depth}`
  return (
    <tr class="doxyTreeItem">
      <td class={doxyClass} align="left" valign="top">
        {itemIcon && <><span class="doxyTreeIconBox"><span class="doxyTreeIcon">{itemIcon}</span></span></>}
        <Link to={itemLink}>{itemLabel}</Link>
      </td>
      <td class="doxyTreeItemRight" align="left" valign="top">{children}</td>
    </tr>
  );
}

// ----------------------------------------------------------------------------
