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

import util from 'util'

import { ElementGeneratorBase } from './element-generator-base.js'
import { AbstractDescriptionType, AbstractDocEmptyType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractListingType, Para, ParameterName, ParameterType, Sp } from '../../doxygen-xml-parser/descriptiontype.js'
import assert from 'assert'
import { RefText } from '../../doxygen-xml-parser/reftexttype.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeGenerator extends ElementGeneratorBase {
  renderMdx (element: AbstractDescriptionType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    if (element.title !== undefined && element.title.length > 0) {
      console.log('title ignored in', element.constructor.name)
    }

    let result = ''
    result += this.context.renderElementsMdx(element.children)

    // console.log(result)
    return result.trim()
  }
}

// ----------------------------------------------------------------------------

export class DocParaType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocParaType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''
    result += this.context.renderElementsMdx(element.children)
    if (element instanceof Para) {
      result += '\n'
    }
    return result
  }
}

// ----------------------------------------------------------------------------

export class DocURLLink extends ElementGeneratorBase {
  renderMdx (element: AbstractDocURLLink): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

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

export class DocMarkupType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocMarkupType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

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

export class DocRefTextType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocRefTextType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    // kindref not needed.

    if (element.external !== undefined && element.external.length > 0) {
      console.log('external ignored in', element.constructor.name)
    }

    const permalink = this.context.getPermalink(element.refid)
    assert(permalink !== undefined && permalink.length > 1)

    result += `<Link to="${permalink}">`
    result += this.context.renderElementsMdx(element.children)
    result += '</Link>'

    return result
  }
}

// ----------------------------------------------------------------------------

export class DocSimpleSectType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocSimpleSectType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    if (element.kind === 'par') {
      assert(element.title !== undefined)
      result += '<dl class="section user">\n'
      result += `<dt><b>${element.title}</b></dt>\n`
      result += '<dd>\n'
      result += this.context.renderElementsMdx(element.children)
      result += '</dd>\n'
      result += '</dl>\n'
    } else if (element.kind === 'return') {
      result += '<dl class="section user">\n'
      result += '<dt><b>Returns</b></dt>\n'
      result += '<dd>\n'
      result += this.context.renderElementsMdx(element.children)
      result += '</dd>\n'
      result += '</dl>\n'
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

export class ListingType extends ElementGeneratorBase {
  renderMdx (element: AbstractListingType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

    let result = ''

    if (element.filename !== undefined) {
      const filename = element.filename.replace('.', '')
      result += `<CodeBlock language="${filename}">{\n`
    } else {
      result += '<CodeBlock>{\n'
    }
    if (element.codelines !== undefined) {
      for (const codeline of element.codelines) {
        // console.log(util.inspect(codeline), { compact: false, depth: 999 })
        result += '\''
        if (codeline.highlights !== undefined) {
          for (const highlight of codeline.highlights) {
            // console.log(util.inspect(highlight), { compact: false, depth: 999 })
            for (const child of highlight.children) {
              if (typeof child === 'string') {
                result += child
              } else if (child instanceof Sp) {
                const sp = child
                if (sp.value !== undefined && sp.value.valueOf() > 1) {
                  const n = sp.value.valueOf()
                  for (let i = 0; i < n; i++) {
                    result += ' '
                  }
                } else {
                  result += ' '
                }
              } else if (child instanceof RefText) {
                const ref = child
                result += ref.text
              } else {
                console.error(util.inspect(child, { compact: false, depth: 999 }))
                console.error(element.constructor.name, 'ref child not yet rendered in', this.constructor.name)
              }
            }
          }
          result += '\\n\'+\n'
        }
      }
    }
    result += '\'\'}</CodeBlock>\n'
    return result
  }
}

// ----------------------------------------------------------------------------

export class DocEmptyType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocEmptyType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

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

export class DocParamListType extends ElementGeneratorBase {
  renderMdx (element: AbstractDocParamListType): string {
    // console.log(util.inspect(element), { compact: false, depth: 999 })

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
          result += `<ParametersList title="${title}">`
          for (const parameterItem of element.parameterItems) {
            // console.log(util.inspect(parameterItem), { compact: false, depth: 999 })

            const names: string[] = []
            if (parameterItem.parameterNameList !== undefined) {
              for (const parameterName of parameterItem.parameterNameList) {
                // console.log(util.inspect(parameterName.children), { compact: false, depth: 999 })
                for (const child of parameterName.children) {
                  for (const subChild of child.children) {
                    if (typeof subChild === 'string') {
                      if (child instanceof ParameterName) {
                        names.push(`[${child.direction}] ${subChild}`)
                      } else if (child instanceof ParameterType) {
                        console.error(util.inspect(parameterName.children), { compact: false, depth: 999 })
                        console.error(element.constructor.name, 'ParameterType not yet rendered in', this.constructor.name)
                      } else {
                        names.push(subChild)
                      }
                    } else {
                      console.error(util.inspect(subChild), { compact: false, depth: 999 })
                      console.error(element.constructor.name, 'sub child not yet rendered in', this.constructor.name)
                    }
                  }
                }
              }
            }

            result += `<ParametersListItem name="${names.join(', ')}">`
            result += this.context.renderElementMdx(parameterItem.parameterDescription)
            result += '</ParametersListItem>'
          }
          result += '</ParametersList>'
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
