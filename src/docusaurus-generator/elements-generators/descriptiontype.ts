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
import util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractCodeLineType, AbstractDescriptionType, AbstractDocAnchorType, AbstractDocEmptyType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractHighlightType, AbstractListingType, AbstractSpType, CodeLine, Highlight, Para, ParameterName, ParameterType } from '../../doxygen-xml-parsers/descriptiontype-parser.js'
import { escapeHtml } from '../utils.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDescriptionType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.title !== undefined && element.title.length > 0) {
      console.error('title ignored in', element.constructor.name)
    }

    let result = ''
    result += this.context.renderElementsMdx(element.children)

    // console.log(result)
    return result.trim()
  }
}

// ----------------------------------------------------------------------------

export class DocParaTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocParaType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''
    result += this.context.renderElementsMdx(element.children)
    if (element instanceof Para) {
      result += '\n'
    }
    return result
  }
}

// ----------------------------------------------------------------------------

export class DocURLLinkGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocURLLink): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''
    result += `<a href="${element.url}">`
    result += this.context.renderElementsMdx(element.children)
    result += '</a>'
    return result
  }
}

// ----------------------------------------------------------------------------

const htmlElements: { [key: string]: string } = {
  Bold: 'b',
  ComputerOutput: 'code',
  Emphasis: 'em'
}

export class DocMarkupTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocMarkupType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const htmlElement: string | undefined = htmlElements[element.constructor.name]
    if (htmlElement === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      return ''
    }

    let result = ''
    result += `<${htmlElement}>`
    result += this.context.renderElementsMdx(element.children)
    result += `</${htmlElement}>`

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocRefTextTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocRefTextType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined && element.external.length > 0) {
      console.error('external ignored in', element.constructor.name)
    }

    let result = ''

    const permalink: string = this.context.getPermalink({
      refid: element.refid,
      kindref: element.kindref
    })

    assert(permalink !== undefined && permalink.length > 1)

    result += `<Link to="${permalink}">`
    result += this.context.renderElementsMdx(element.children)
    result += '</Link>'

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocSimpleSectTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSimpleSectType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    if (element.kind === 'par') {
      assert(element.title !== undefined)
      result += `<SectionUser title="${element.title}">\n`
      result += this.context.renderElementsMdx(element.children).trim()
      result += '\n'
      result += '</SectionUser>\n'
    } else if (element.kind === 'return') {
      result += '<SectionUser title="Returns">\n'
      result += this.context.renderElementsMdx(element.children).trim()
      result += '\n'
      result += '</SectionUser>\n'
    } else if (element.kind === 'since') {
      result += '<SectionUser title="Since">\n'
      result += this.context.renderElementsMdx(element.children).trim()
      result += '\n'
      result += '</SectionUser>\n'
    } else if (element.kind === 'note') {
      // https://docusaurus.io/docs/markdown-features/admonitions
      result += ':::info\n'
      result += `${this.context.renderElementMdx(element.children).trim()}\n`
      result += ':::\n'
    } else if (element.kind === 'warning') {
      result += ':::warning\n'
      result += `${this.context.renderElementMdx(element.children).trim()}\n`
      result += ':::\n'
    } else {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
    }

    return result
  }
}

// ----------------------------------------------------------------------------

export class SpTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractSpType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result: string = ''
    let spaces: number = 1

    if (element.value !== undefined && element.value.valueOf() > 1) {
      spaces = element.value.valueOf()
    }

    for (let i = 0; i < spaces; i++) {
      result += ' '
    }

    return result
  }
}

// ----------------------------------------------------------------------------

export class ListingTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractListingType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    result += '\n'
    result += '<ProgramListing'
    if (element.filename !== undefined && element.filename.length > 0) {
      const extension = element.filename.replace('.', '')
      result += ` extension="${extension}"`
    }
    result += '>\n'
    result += '\n'

    result += this.context.renderElementsMdx(element.codelines)

    result += '\n'
    result += '</ProgramListing>\n'

    return result
  }
}

// ----------------------------------------------------------------------------

export class CodeLineTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractCodeLineType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    assert(element instanceof CodeLine)

    if (element.external !== undefined) {
      console.error('external ignored in', element.constructor.name)
    }

    let permalink: string | undefined
    if (element.refid !== undefined && element.refkind !== undefined) {
      permalink = this.context.getPermalink({
        refid: element.refid,
        kindref: element.refkind
      })
    }

    let result = ''

    if (element.lineno !== undefined) {
      const anchor = `l${element.lineno.toString().padStart(5, '0')}`
      result += `<Link id="${anchor}"/>`
    }
    result += '<CodeLine'
    if (element.lineno !== undefined) {
      result += ` lineNumber="${element.lineno.toString()}"`
    }
    if (permalink !== undefined) {
      result += ` lineLink="${permalink}"`
    }
    result += '>'

    result += this.context.renderElementsMdx(element.highlights)

    result += '</CodeLine>\n'

    return result
  }
}

// ----------------------------------------------------------------------------

export class HighlightTypeGenerator extends ElementGeneratorBase {
  knownClasses = [
    'normal',
    'comment',
    'preprocessor',
    'keyword',
    'keywordtype',
    'keywordflow',
    'token',
    'stringliteral',
    'charliteral'
  ]

  renderMdx (element: AbstractHighlightType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    assert(element instanceof Highlight)

    let kind = element.classs
    if (!this.knownClasses.includes(element.classs)) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.classs, 'not implemented yet in', this.constructor.name)
      kind = 'normal'
    }

    let result = ''

    result += `<Highlight kind="${kind}">`
    result += this.context.renderElementsMdx(element.children)
    result += '</Highlight>'

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocEmptyTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocEmptyType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    switch (element.constructor.name) {
      case 'Hruler':
        result += '<hr/>'
        break
      case 'LineBreak':
        result += '<br/>'
        break
      default:
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
    }

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocParamListTypegenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocParamListType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    if (element.parameterItems !== undefined) {
      const titlesByKind: Record<string, string> = {
        templateparam: 'Template Parameters',
        retval: 'Return Values',
        param: 'Parameters'
      }

      const title = titlesByKind[element.kind]
      if (title === undefined) {
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
      }

      switch (element.constructor.name) {
        case 'ParameterList':
          result += `<ParametersList title="${title}">\n`
          for (const parameterItem of element.parameterItems) {
            // console.log(util.inspect(parameterItem, { compact: false, depth: 999 }))

            const names: string[] = []
            if (parameterItem.parameterNameList !== undefined) {
              for (const parameterName of parameterItem.parameterNameList) {
                // console.log(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                for (const child of parameterName.children) {
                  for (const subChild of child.children) {
                    if (typeof subChild === 'string') {
                      if (child instanceof ParameterName) {
                        if (child.direction !== undefined) {
                          names.push(`[${child.direction}] ${subChild}`)
                        } else {
                          names.push(escapeHtml(subChild))
                        }
                      } else if (child instanceof ParameterType) {
                        console.error(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                        console.error(element.constructor.name, 'ParameterType not yet rendered in', this.constructor.name)
                      } else {
                        names.push(escapeHtml(subChild))
                      }
                    } else {
                      console.error(util.inspect(subChild, { compact: false, depth: 999 }))
                      console.error(element.constructor.name, 'sub child not yet rendered in', this.constructor.name)
                    }
                  }
                }
              }
            }

            result += `<ParametersListItem name="${names.join(', ')}">`
            result += this.context.renderElementMdx(parameterItem.parameterDescription)
            result += '</ParametersListItem>\n'
          }
          result += '</ParametersList>\n'
          break
        default:
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      }
    }

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocAnchorTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDocAnchorType): string {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let result = ''

    const permalink = this.context.getXrefPermalink(element.id)
    result = `<Link id="${permalink}" />`

    return result
  }
}

// ----------------------------------------------------------------------------
