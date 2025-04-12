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
import { PageGeneratorBase } from './generator-base.js'
import { CompoundDef } from '../../doxygen-xml-parser/compounddef.js'
import { Class } from '../data-model/classes.js'

// ----------------------------------------------------------------------------

export class ClassPageGenerator extends PageGeneratorBase {
  renderMdx (compoundDef: CompoundDef, frontMatter: FrontMatter): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let bodyText: string = ''

    bodyText += 'The classes, structs, union and interfaces with brief descriptions are:\n'
    bodyText += '\n'

    bodyText += '<TreeTable>\n'

    bodyText += '</TreeTable>\n'

    return bodyText
  }

  renderIndexMdx (): string {
    // console.log(util.inspect(compoundDef), { compact: false, depth: 999 })

    let bodyText: string = ''

    bodyText += 'The classes, structs, union and interfaces with brief descriptions are:\n'
    bodyText += '\n'

    bodyText += '<TreeTable>\n'

    for (const classId of this.generator.classes.topLevelClassIds) {
      bodyText += this.renderClassRecursively(classId, 1)
    }

    bodyText += '</TreeTable>\n'

    return bodyText
  }

  renderClassRecursively (classId: string, depth: number): string {
    const _class: Class | undefined = this.generator.classes.membersById.get(classId)
    assert(_class !== undefined)

    // console.log(util.inspect(_class), { compact: false, depth: 999 })

    let bodyText: string = ''

    const compoundDef = _class.compoundDef
    const label = compoundDef.compoundName.replace(/^.*::/, '')

    const permalink = this.generator.getPermalink(compoundDef.id)
    assert(permalink !== undefined && permalink.length > 1)

    const iconLetters: Record<string, string> = {
      class: 'C'
    }

    const iconLetter: string = iconLetters[compoundDef.kind] || '?'

    bodyText += `<TreeTableRow itemIcon="${iconLetter}" itemLabel="${label}" itemLink="${permalink}" depth="${depth}">\n`

    const briefDescription: string = this.generator.renderElementMdx(compoundDef.briefDescription)
    bodyText += briefDescription.replace(/[.]$/, '')
    bodyText += '\n'

    bodyText += '</TreeTableRow>\n'

    if (_class.childrenClassIds.length > 0) {
      for (const childClassId of _class.childrenClassIds) {
        bodyText += this.renderClassRecursively(childClassId, depth + 1)
      }
    }

    return bodyText
  }
}

// ----------------------------------------------------------------------------
