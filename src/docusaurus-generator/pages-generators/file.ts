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
import { CompoundDef } from '../../doxygen-xml-parsers/compounddef-parser.js'
import { File } from '../data-model/files-dm.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class FileGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    result += this.context.renderIncludesIndexMdx(compoundDef)

    if (compoundDef.innerClasses !== undefined) {
      result += '\n'
      result += '## Classes\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerClass of compoundDef.innerClasses) {
        // console.log(util.inspect(innerClass, { compact: false, depth: 999 }))
        const compoundDef = this.context.compoundDefsById.get(innerClass.refid)
        assert(compoundDef !== undefined)

        result += this.context.renderClassSummaryMdx(compoundDef)
      }

      result += '\n'
      result += '</MembersList>\n'
    }

    result += this.context.renderNamespacesIndexMdx(compoundDef)

    // const file = this.context.files.membersById.get(compoundDef.id)
    // console.log('file:', file, 'for', compoundDef.id)
    // console.log('files.membersById', this.context.files.membersById)
    // assert(file?.parentFolderId !== undefined)
    // const fileFolderPath = `${this.context.folders.getRelativePathRecursively(file?.parentFolderId)}/${compoundDef.compoundName}`
    const fileFolderPath = `${this.context.files.getRelativePathRecursively(compoundDef.id)}`

    result += this.context.renderDetailedDescriptionMdx({
      compoundDef,
      todo: `@file ${fileFolderPath}`
    })

    if (compoundDef.programListing !== undefined) {
      result += '\n'
      result += '## File Listing\n'

      result += '\n'
      result += 'The file content with the documentation metadata removed is:\n'

      result += this.context.renderElementMdx(compoundDef.programListing)
    }

    return result
  }

  renderIndexMdx (): string {
    return 'NOT IMPLEMENTED'
  }

  renderIndexFile (fileId: string, depth: number): string {
    const file: File | undefined = this.context.files.membersById.get(fileId)
    assert(file !== undefined)

    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    let result: string = ''

    const compoundDef = file.compoundDef
    const label = escapeHtml(file.compoundDef.compoundName)

    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += '\n'
    result += `<TreeTableRow itemIconClass="doxyIconFile" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')

    result += '\n'
    result += '</TreeTableRow>\n'

    return result
  }
}

// ----------------------------------------------------------------------------
