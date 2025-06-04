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
import ReactMarkdown from 'react-markdown'

// ----------------------------------------------------------------------------

export default function TreeTableRow({
  itemIconLetter,
  itemIconClass,
  itemLabel,
  itemLink,
  depth,
  children
}) {
  return (
    <tr class="doxyTreeItem">
      <td class="doxyTreeItemLeft" align="left" valign="top">
        <span style={{ width: `${depth * 12}px`, display: "inline-block" }}></span>
        {itemIconLetter && <><span class="doxyTreeIconBox"><span class="doxyTreeIcon">{itemIconLetter}</span></span></>}
        {itemIconClass ? <a href={itemLink}><span class={itemIconClass}>{itemLabel}</span></a> : <a href={itemLink}><ReactMarkdown components={{p:({children}) => <>{children}</>}}>{itemLabel}</ReactMarkdown></a>}
      </td>
      <td class="doxyTreeItemRight" align="left" valign="top">{children}</td>
    </tr>
  );
}

// ----------------------------------------------------------------------------
