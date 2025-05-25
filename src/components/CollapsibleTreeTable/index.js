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

import Link from '@docusaurus/Link'

import TreeTable from '../TreeTable/index.js'
import TreeTableRow from '../TreeTableRow/index.js'

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
      const doxyClass = `doxyTreeItemLeft doxyTreeIndent${level}`
      return (
        <React.Fragment key={row.id}>
          <tr class="doxyTreeItem">
            <td class={doxyClass} align="left" valign="top">
              {row.iconLetter && <><span class="doxyTreeIconBox"><span class="doxyTreeIcon">{row.iconLetter}</span></span></>}
              {row.iconClass ? <Link to={itemLink}><span class={row.iconClass}><ReactMarkdown components={{p:({children}) => <>{children}</>}}>{row.label}</ReactMarkdown></span></Link> : <Link to={row.link}><ReactMarkdown components={{p:({children}) => <>{children}</>}}>{row.label}</ReactMarkdown></Link>}
            </td>
            <td class="doxyTreeItemRight" align="left" valign="top">{row.description}</td>
          </tr>
          {row.children && /* expanded.has(row.id) && */ renderRows(row.children, level + 1)}
        </React.Fragment>
      )
    });

  return (
    <table class="doxyTreeTable">
      {renderRows(rows)}
    </table>
  );
}

// ----------------------------------------------------------------------------
