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

import assert from 'assert'
import * as util from 'node:util'

import { FrontMatter } from '../types.js'
import { PageGeneratorBase } from './base.js'
import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { File } from '../data-model/files.js'

// ----------------------------------------------------------------------------

export class FileGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    frontMatter.title = `The ${compoundDef.compoundName} File Reference`

    let result: string = ''

    result += this.context.renderBriefDescription(compoundDef)

    result += this.context.renderIncludesIndex(compoundDef)

    result += this.context.renderNamespacesIndex(compoundDef)

    const file = this.context.files.membersById.get(compoundDef.id)
    assert(file?.parentFolderId !== undefined)
    const fileFolderPath = `${this.context.folders.getPathRecursive(file?.parentFolderId)}/${compoundDef.compoundName}`

    result += this.context.renderDetailedDescription({
      compoundDef,
      todo: `@file ${fileFolderPath}`
    })

    return result
  }

  renderIndexMdx (): string {
    return 'NOT IMPLEMENTED'
  }

  renderIndexFile (fileId: string, depth: number): string {
    const file: File | undefined = this.context.files.membersById.get(fileId)
    assert(file !== undefined)

    // console.log(util.inspect(namespace), { compact: false, depth: 999 })

    let result: string = ''

    const compoundDef = file.compoundDef
    const label = file.compoundDef.compoundName
    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += `<TreeTableRow itemIcon="Y" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')
    result += '\n'

    result += '</TreeTableRow>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
