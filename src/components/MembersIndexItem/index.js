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

export default function MembersIndexItem({
  template,
  itemLeft,
  itemRight,
  children
}) {
  return (
    <>
      {template &&
        <tr class="doxyMemberIndexTemplate">
          <td class="" colspan="2"><div>{template}</div></td>
        </tr>
      }
      <tr class="doxyMemberIndexItem">
        <td class="doxyMemberIndexItemLeft" align="right" valign="top"><div>{itemLeft}</div></td>
        <td class="doxyMemberIndexItemRight" align="left" valign="top"><div>{itemRight}</div></td>
      </tr>
      <tr class="doxyMemberIndexDescription">
        <td class="doxyMemberIndexDescriptionLeft"></td>
        <td class="doxyMemberIndexDescriptionRight">{children}</td>
      </tr>
      <tr class="doxyMemberIndexSeparator">
        <td class="doxyMemberIndexSeparatorLeft" colspan="2"></td>
      </tr>
    </>
  );
}

// ----------------------------------------------------------------------------
