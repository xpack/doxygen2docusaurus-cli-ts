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
import { Folder } from '../data-model/folders-dm.js'
import { FileGenerator } from './file.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class FolderGenerator extends PageGeneratorBase {
  fileGenerator: FileGenerator | undefined

  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += this.context.renderBriefDescriptionMdx(compoundDef)

    if (compoundDef.innerDirs !== undefined && compoundDef.innerDirs.length > 0) {
      result += '\n'
      result += '## Folders\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerDir of compoundDef.innerDirs) {
        const folder = this.context.folders.membersById.get(innerDir.refid)
        assert(folder !== undefined)

        const permalink = this.context.getPagePermalink(innerDir.refid)

        const itemRight = `<Link to="${permalink}">${escapeHtml(folder.summaryName)}</Link>`

        result += '\n'
        result += `<MembersListItem itemLeft="folder" itemRight={${itemRight}}>\n`

        const compoundDef = this.context.compoundDefsById.get(innerDir.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
        result += briefDescription

        result += '\n'
        result += '</MembersListItem>\n'
      }
      result += '\n'
      result += '</MembersList>\n'
    }

    if (compoundDef.innerFiles !== undefined && compoundDef.innerFiles.length > 0) {
      result += '\n'
      result += '## Files\n'

      result += '\n'
      result += '<MembersList>\n'

      for (const innerFile of compoundDef.innerFiles) {
        const file = this.context.files.membersById.get(innerFile.refid)
        assert(file !== undefined)

        const permalink = this.context.getPagePermalink(innerFile.refid)

        const itemRight = `<Link to="${permalink}">${escapeHtml(file.summaryName)}</Link>`

        result += '\n'
        result += `<MembersListItem itemLeft="file" itemRight={${itemRight}}>\n`

        const compoundDef = this.context.compoundDefsById.get(innerFile.refid)
        assert(compoundDef !== undefined)
        const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
        result += briefDescription

        result += '\n'
        result += '</MembersListItem>\n'
      }
      result += '\n'
      result += '</MembersList>\n'
    }

    const fullFolderPath = this.context.folders.getRelativePathRecursively(compoundDef.id)

    result += this.context.renderDetailedDescriptionMdx({
      compoundDef,
      todo: `@dir ${fullFolderPath}`
    })

    return result
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef, { compact: false, depth: 999 }))

    let result: string = ''

    result += 'The folders & files that contributed content to this site are:\n'

    result += '\n'
    result += '<TreeTable>\n'

    for (const folderId of this.context.folders.topLevelFolderIds) {
      result += this.renderIndexFolderRecursively(folderId, 1)
    }

    assert(this.fileGenerator !== undefined)
    for (const fileId of this.context.files.topLevelFileIds) {
      result += this.fileGenerator.renderIndexFile(fileId, 1)
    }

    result += '\n'
    result += '</TreeTable>\n'

    return result
  }

  private renderIndexFolderRecursively (folderId: string, depth: number): string {
    const folder: Folder | undefined = this.context.folders.membersById.get(folderId)
    assert(folder !== undefined)

    // console.log(util.inspect(namespace, { compact: false, depth: 999 }))

    let result: string = ''

    const compoundDef = folder.compoundDef
    const label = escapeHtml(folder.compoundDef.compoundName)
    const permalink = this.context.getPagePermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    result += '\n'
    result += `<TreeTableRow itemIconClass="doxyIconFolder" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.context.renderElementMdx(compoundDef.briefDescription)
    result += briefDescription.replace(/[.]$/, '')

    result += '\n'
    result += '</TreeTableRow>\n'

    if (folder.childrenIds.length > 0) {
      for (const childFolderId of folder.childrenIds) {
        result += this.renderIndexFolderRecursively(childFolderId, depth + 1)
      }
    }

    assert(this.fileGenerator !== undefined)
    if (folder.childrenFileIds.length > 0) {
      for (const childFileId of folder.childrenFileIds) {
        result += this.fileGenerator.renderIndexFile(childFileId, depth + 1)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------
