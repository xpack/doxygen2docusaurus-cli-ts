// DO NOT EDIT!
// Automatically generated from docusaurus-template-liquid/templates/docusaurus.

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import cliSidebar from "./sidebar-cli";
import {customDocsSidebar} from "./sidebar-docs-custom";
import tsdocSidebarItems from './sidebar-category-tsdoc.json';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {

  docsSidebar: customDocsSidebar,

  tsdocSidebar: [
    tsdocSidebarItems,
  ],

  cliSidebar,
};

export default sidebars;
