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

import { ElementLinesGeneratorBase } from './element-generator-base.js'
import { AbstractDescriptionType, AbstractDocAnchorType, AbstractDocEmptyType, AbstractDocMarkupType, AbstractDocParamListType, AbstractDocParaType, AbstractDocRefTextType, AbstractDocSimpleSectType, AbstractDocURLLink, AbstractSpType, ParaDataModel, ParameterNameDataModel, ParameterTypeDataModel } from '../../data-model/compounds/descriptiontype-dm.js'
import { escapeMdx } from '../../docusaurus-generator/utils.js'

// ----------------------------------------------------------------------------

export class DescriptionTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDescriptionType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.title !== undefined && element.title.length > 0) {
      console.error('title ignored in', element.constructor.name)
    }

    let text = ''
    text += this.workspace.renderElementsToMdxText(element.children).trim()

    // console.log(result)
    return [text]
  }
}

// ----------------------------------------------------------------------------

export class DocParaTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocParaType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []
    lines.push(this.workspace.renderElementsToMdxText(element.children))
    if (element instanceof ParaDataModel) {
      lines.push('')
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class DocURLLinkGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocURLLink): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text = ''
    text += `<a href="${element.url}">`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += '</a>'

    return [text]
  }
}

// ----------------------------------------------------------------------------

const htmlElements: { [key: string]: string } = {
  BoldDataModel: 'b',
  ComputerOutputDataModel: 'code',
  EmphasisDataModel: 'em'
}

export class DocMarkupTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocMarkupType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const htmlElement: string | undefined = htmlElements[element.constructor.name]
    if (htmlElement === undefined) {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      return []
    }

    let text = ''
    text += `<${htmlElement}>`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += `</${htmlElement}>`

    return [text]
  }
}

// ----------------------------------------------------------------------------

export class DocRefTextTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocRefTextType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    if (element.external !== undefined && element.external.length > 0) {
      console.error('external ignored in', element.constructor.name)
    }

    let text = ''

    const permalink: string = this.workspace.getPermalink({
      refid: element.refid,
      kindref: element.kindref
    })

    assert(permalink !== undefined && permalink.length > 1)

    text += `<Link to="${permalink}">`
    text += this.workspace.renderElementsToMdxText(element.children)
    text += '</Link>'

    return [text]
  }
}

// ----------------------------------------------------------------------------

export class DocSimpleSectTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocSimpleSectType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    if (element.kind === 'par') {
      assert(element.title !== undefined)
      lines.push(`<SectionUser title="${element.title}">`)
      lines.push(...this.workspace.renderElementsToMdxLines(element.children)) // trim?
      lines.push('</SectionUser>')
    } else if (element.kind === 'return') {
      lines.push('<SectionUser title="Returns">')
      lines.push(...this.workspace.renderElementsToMdxLines(element.children)) // trim?
      lines.push('</SectionUser>')
    } else if (element.kind === 'since') {
      lines.push('<SectionUser title="Since">')
      lines.push(...this.workspace.renderElementsToMdxLines(element.children)) // trim?
      lines.push('</SectionUser>')
    } else if (element.kind === 'note') {
      // https://docusaurus.io/docs/markdown-features/admonitions
      lines.push(':::info')
      lines.push(...this.workspace.renderElementToMdxLines(element.children)) // trim?
      lines.push(':::')
    } else if (element.kind === 'warning') {
      lines.push(':::warning')
      lines.push(...this.workspace.renderElementToMdxLines(element.children)) // trim?
      lines.push(':::')
    } else {
      console.error(util.inspect(element, { compact: false, depth: 999 }))
      console.error(element.constructor.name, 'kind', element.kind, 'not yet rendered in', this.constructor.name)
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class SpTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractSpType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    let text: string = ''
    let spaces: number = 1

    if (element.value !== undefined && element.value.valueOf() > 1) {
      spaces = element.value.valueOf()
    }

    for (let i = 0; i < spaces; i++) {
      text += ' '
    }

    return [text]
  }
}

// ----------------------------------------------------------------------------

export class DocEmptyTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocEmptyType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    switch (element.constructor.name) {
      case 'Hruler':
        lines.push('<hr/>')
        break

      case 'LineBreak':
        lines.push('<br/>')
        break

      default:
        console.error(util.inspect(element, { compact: false, depth: 999 }))
        console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class DocParamListTypegenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocParamListType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

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
        case 'ParameterListDataModel':
          lines.push(`<ParametersList title="${title}">`)
          for (const parameterItem of element.parameterItems) {
            // console.log(util.inspect(parameterItem, { compact: false, depth: 999 }))

            const names: string[] = []
            if (parameterItem.parameterNameList !== undefined) {
              for (const parameterName of parameterItem.parameterNameList) {
                // console.log(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                for (const child of parameterName.children) {
                  for (const subChild of child.children) {
                    if (typeof subChild === 'string') {
                      if (child instanceof ParameterNameDataModel) {
                        if (child.direction !== undefined) {
                          names.push(`[${child.direction}] ${subChild}`)
                        } else {
                          names.push(escapeMdx(subChild))
                        }
                      } else if (child instanceof ParameterTypeDataModel) {
                        console.error(util.inspect(parameterName.children, { compact: false, depth: 999 }))
                        console.error(element.constructor.name, 'ParameterType not yet rendered in', this.constructor.name)
                      } else {
                        names.push(escapeMdx(subChild))
                      }
                    } else {
                      console.error(util.inspect(subChild, { compact: false, depth: 999 }))
                      console.error(element.constructor.name, 'sub child not yet rendered in', this.constructor.name)
                    }
                  }
                }
              }
            }

            lines.push(`<ParametersListItem name="${names.join(', ')}">`)
            lines.push(...this.workspace.renderElementToMdxLines(parameterItem.parameterDescription))
            lines.push('</ParametersListItem>')
          }
          lines.push('</ParametersList>')
          break

        default:
          console.error(util.inspect(element, { compact: false, depth: 999 }))
          console.error(element.constructor.name, 'not yet rendered in', this.constructor.name)
      }
    }

    return lines
  }
}

// ----------------------------------------------------------------------------

export class DocAnchorTypeGenerator extends ElementLinesGeneratorBase {
  renderToMdxLines (element: AbstractDocAnchorType): string[] {
    // console.log(util.inspect(element, { compact: false, depth: 999 }))

    const lines: string[] = []

    const permalink = this.workspace.getXrefPermalink(element.id)
    lines.push(`<Link id="${permalink}" />`)

    return lines
  }
}

// ----------------------------------------------------------------------------
