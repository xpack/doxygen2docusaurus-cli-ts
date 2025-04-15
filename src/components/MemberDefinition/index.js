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

export default function MemberDefinition({template, name, labels, children}) {
  return (
    <>
      <div class="memitem">
        <div class="memproto">
          {template && <div class="memtemplate">{template}</div>}
          <table class="mlabels">
              <tbody>
              <tr class="mlabels">
                <td class="mlabels-left">
                  <table class="memname">
                    <tbody>
                      <tr>
                      <td class="memname">{name}</td>
                      </tr>
                     </tbody>
                  </table>
                </td>
                {
                  labels.length > 0 && <td class="mlabels-right">
                    <span class="mlabels">
                      {
                        labels.map((label) => (
                          <span class={`mlabel ${label}`}>{label}</span>
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
