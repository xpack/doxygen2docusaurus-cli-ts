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

export default function MembersListItem({
  itemKind,
  itemLabel,
  itemLink,
  children
}) {
  return (
    <>
      <tr class={styles.memberItem}>
        <td class={styles.memberItemLeft} align="right" valign="top">{itemKind}</td>
        <td class={styles.memberItemRight} align="left" valign="top"><Link to="${itemLink}">{itemLabel}</Link></td>
      </tr>
      <tr class={styles.memberDescription}>
        <td class={styles.memberDescriptionLeft}>&nbsp;</td>
        <td class={styles.memberDescriptionRight}>{children}</td>
      </tr>
      <tr class={styles.memberSeparator}>
        <td class={styles.memSeparatorLeft} colspan="2"></td>
      </tr>
    </>
  );
}

// ----------------------------------------------------------------------------
