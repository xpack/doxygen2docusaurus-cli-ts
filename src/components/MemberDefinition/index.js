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

import styles from './styles.module.css';
import React from 'react';

// ----------------------------------------------------------------------------

export default function MemberDefinition({id, title, template, name, labels, children}) {
  return (
    <>
      <a id={id} name={id}></a>
      <h3 class="memtitle">
        <span class="permalink"><a href={id}>◆&nbsp;</a></span>
        {title}
      </h3>
      <div class="memitem">
        <div class="memproto">
          {template && <div class="memtemplate">{template}</div>}
          <table class="memname">
            <tbody>
              <tr>
                <td class="memname">{name}</td>
                {
                  labels && <td class="mlabels-right">
                    <span class="mlabels">
                      {
                        labels.map((label) => (
                          <span class="mlabel {item}">{label}</span>
                        ))
                      }
                    </span>
                  </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
        <div class="memdoc">
          {children}
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------------
