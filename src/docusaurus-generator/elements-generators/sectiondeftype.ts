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
import * as util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractSectionDefType } from '../../doxygen-xml-parser/sectiondeftype.js'

// ----------------------------------------------------------------------------

export class SectionDefType extends ElementGeneratorBase {
  renderMdx (element: AbstractSectionDefType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    switch (element.kind) {
      case 'public-type':
        result += '## Public Types\n'
        break

      case 'public-func':
        result += '## Public Member Functions\n'
        break

      case 'protected-func':
        result += '## Protected Member Functions\n'
        break

      case 'protected-attrib':
        result += '## Protected Attributes\n'
        break

      default:
        console.error(util.inspect(element), { compact: false, depth: 999 })
        console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
    }

    result += '\n'
    result += '<MembersList>\n'

    const xxx: Record<string, string> = {
      typedef: 'using'
    }

    assert(element.memberDefs !== undefined)
    for (const memberDef of element.memberDefs) {
      // console.log(util.inspect(memberDef), { compact: false, depth: 999 })

      let itemKind = xxx[memberDef.kind]
      if (itemKind === undefined) {
        console.error(util.inspect(element), { compact: false, depth: 999 })
        console.error(element.constructor.name, 'member kind', memberDef.kind, 'not yet rendered in', this.constructor.name)
        itemKind = '???'
      }
      result += `<MembersListItem itemKind="using" itemLabel="${memberDef.name}" itemLink="xxx">\n`

      const briefDescription: string = this.context.renderElementMdx(memberDef.briefDescription)
      result += briefDescription
      result += '\n'

      result += '</MembersListItem>\n'
    }

    result += '</MembersList>\n'
    result += '\n'

    return result
  }
}

// ----------------------------------------------------------------------------
