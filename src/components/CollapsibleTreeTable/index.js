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
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// ----------------------------------------------------------------------------

// Work in progress, not yet collapsible, it needs the button.

export default function CollapsibleTreeTable({ rows }) {
  // const [expanded, setExpanded] = new Set();

  // const toggle = (id) => {
  //   setExpanded(prev => {
  //     const next = new Set(prev);
  //     next.has(id) ? next.delete(id) : next.add(id);
  //     return next;
  //   });
  // };

  const renderRows = (rows, level = 1) =>
    rows.map((row) => {
      const doxyClass = `doxyCollapsibleTreeItemLeft doxyCollapsibleTreeIndent${level}`
      return (
        <React.Fragment key={row.id}>
          <tr class="doxyCollapsibleTreeItem">
            <td class={doxyClass} align="left" valign="top">
              {row.iconLetter && <><span class="doxyCollapsibleTreeIconBox"><span class="doxyCollapsibleTreeIcon">{row.iconLetter}</span></span></>}
              {row.iconClass ? <a href={itemLink}><span class={row.iconClass}><ReactMarkdown components={{p:({children}) => <>{children}</>}}>{row.label}</ReactMarkdown></span></a> : <a href={row.link}><ReactMarkdown components={{p:({children}) => <>{children}</>}}>{row.label}</ReactMarkdown></a>}
            </td>
            <td class="doxyCollapsibleTreeItemRight" align="left" valign="top">{row.description}</td>
          </tr>
          {row.children && /* expanded.has(row.id) && */ renderRows(row.children, level + 1)}
        </React.Fragment>
      )
    });

  return (
    <table class="doxyCollapsibleTreeTable">
      {renderRows(rows)}
    </table>
  );
}

// ----------------------------------------------------------------------------
