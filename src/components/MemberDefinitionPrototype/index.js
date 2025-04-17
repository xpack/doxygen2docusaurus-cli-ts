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

export default function MemberDefinitionPrototype({template, labels, children}) {
  return (
    <div class="doxyMemberProto">
      {template && <div class="doxyMemberTemplate">{template}</div>}
      <table class="doxyMemberLabels">
          <tbody>
          <tr class="doxyMemberLabels">
            <td class="doxyMemberLabelsLeft">
              <table class="doxyMemberName">
                <tbody>
                  <tr>
                  <td class="doxyMemberName">{children}</td>
                  </tr>
                  </tbody>
              </table>
            </td>
            {
              labels && labels.length > 0 && <td class="doxyMemberLabelsRight">
                <span class="doxyMemberLabels">
                  {
                    labels.map((label) => (
                      <span class={`doxyMemberLabel ${label}`}>{label}</span>
                    ))
                  }
                </span>
              </td>
            }
          </tr>
          </tbody>
      </table>
    </div>
  );
}

// ----------------------------------------------------------------------------
