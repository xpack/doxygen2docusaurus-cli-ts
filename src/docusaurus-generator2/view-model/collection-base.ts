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

import * as fs from 'node:fs/promises'
import * as util from 'node:util'
import assert from 'node:assert'
import path from 'node:path'

import { Workspace } from '../workspace.js'
import { CompoundDefDataModel } from '../../data-model/compounds/compounddef-dm.js'
import { SidebarItem } from '../../plugin/types.js'
import { FrontMatter } from '../../docusaurus-generator/types.js'
import { CompoundBase } from './compound-base-vm.js'
import { pluginName } from '../../plugin/docusaurus.js'
// import { CompoundBase } from './compound-base-vm.js'

export abstract class CollectionBase {
  workspace: Workspace
  // compoundsById: Map<string, CompoundBase>

  constructor (workspace: Workspace) {
    this.workspace = workspace

    // this.compoundsById = new Map()
  }

  abstract addChild (compoundDef: CompoundDefDataModel): CompoundBase
  abstract createHierarchies (): void
  // It must return an array since groups can have multiple top pages.
  abstract createSidebarItems (): SidebarItem[]
  abstract generateIndexDotMdxFile (): Promise<void>

  async writeFile ({
    filePath,
    bodyLines,
    frontMatter,
    title
  }: {
    filePath: string
    bodyLines: string[]
    frontMatter: FrontMatter
    title?: string
  }): Promise<void> {
    const lines: string[] = []

    lines.push('')
    lines.push(`<DoxygenPage version="${this.workspace.dataModel.doxygenindex.version}">`)
    lines.push('')
    lines.push(...bodyLines)
    lines.push('')
    lines.push('</DoxygenPage>')

    const text = lines.join('\n')

    // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
    const frontMatterLines: string[] = []

    frontMatterLines.push('---')
    frontMatterLines.push('')
    frontMatterLines.push('# DO NOT EDIT!')
    frontMatterLines.push('# Automatically generated via docusaurus-plugin-doxygen by Doxygen.')
    frontMatterLines.push('')
    for (const [key, value] of Object.entries(frontMatter)) {
      if (Array.isArray(value)) {
        frontMatterLines.push(`${key}:`)
        for (const arrayValue of frontMatter[key] as string[]) {
          frontMatterLines.push(`  - ${arrayValue}`)
        }
      } else if (typeof value === 'boolean') {
        frontMatterLines.push(`${key}: ${value ? 'true' : 'false'}`)
      } else {
        frontMatterLines.push(`${key}: ${value}`)
      }
    }
    frontMatterLines.push('')

    // Skip date, to avoid unnecessary git commits.
    // frontMatterText += `date: ${formatDate(new Date())}\n`
    // frontMatterText += '\n'
    frontMatterLines.push('---')
    frontMatterLines.push('')

    if (text.includes('<Link')) {
      frontMatterLines.push('import Link from \'@docusaurus/Link\'')
    }

    // Theme components.
    if (text.includes('<CodeBlock')) {
      frontMatterLines.push('import CodeBlock from \'@theme/CodeBlock\'')
    }
    if (text.includes('<Admonition')) {
      frontMatterLines.push('import Admonition from \'@theme/Admonition\'')
    }

    frontMatterLines.push('')

    const componentNames = [
      'CodeLine',
      'DoxygenPage',
      'GeneratedByDoxygen',
      'Highlight',
      'IncludesList',
      'IncludesListItem',
      'MemberDefinition',
      'MembersIndex',
      'MembersIndexItem',
      'ParametersList',
      'ParametersListItem',
      'ProgramListing',
      'SectionDefinition',
      'SectionUser',
      'TreeTable',
      'TreeTableRow',
      'XrefSect'
    ]

    // Add includes for the plugin components.
    for (const componentName of componentNames) {
      if (text.includes(`<${componentName}`)) {
        frontMatterLines.push(`import ${componentName} from '${pluginName}/components/${componentName}'`)
      }
    }

    frontMatterLines.push('')
    if (frontMatter.title === undefined && title !== undefined) {
      frontMatterLines.push(`# ${title}`)
      frontMatterLines.push('')
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    const fileHandle = await fs.open(filePath, 'ax')

    await fileHandle.write(frontMatterLines.join('\n'))
    await fileHandle.write(text)

    await fileHandle.close()
  }
}

// ----------------------------------------------------------------------------
