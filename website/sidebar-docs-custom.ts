/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2024 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/license/mit.
 */

export const customDocsSidebar = [
  {
    type: 'doc',
    id: 'getting-started/index',
    label: 'Getting Started',
  },
  {
    type: 'doc',
    id: 'install/index',
    label: 'Installation Guide',
  },
  {
    type: 'category',
    label: "User's Guide",
    link: {
      type: 'doc',
      id: 'user/index',
    },
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'user/configuration/index',
        label: 'Configuration Variables',
      },
    ],
  },
  {
    type: 'doc',
    id: 'author/index',
    label: "Author's Guide",
  },
  {
    type: 'doc',
    id: 'developer/index',
    label: "Contributor's Guide",
  },
  {
    type: 'doc',
    id: 'maintainer/index',
    label: "Maintainer's Guide",
  },
  {
    type: 'doc',
    id: 'faq/index',
    label: 'FAQ',
  },
  {
    type: 'doc',
    id: 'support/index',
    label: 'Help Centre',
  },
  {
    type: 'doc',
    id: 'releases/index',
    label: 'Releases',
  },
  {
    type: 'category',
    label: 'Project',
    link: {
      type: 'doc',
      id: 'project/about/index',
    },
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'project/about/index',
        label: 'About',
      },
      {
        type: 'doc',
        id: 'project/history/index',
        label: 'History',
      },
      {
        type: 'link',
        label: 'License',
        href: 'https://opensource.org/license/mit',
      },
    ],
  },
]
