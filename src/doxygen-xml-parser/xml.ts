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
import { XmlElement } from './types.js'

// ----------------------------------------------------------------------------
// This is the TypeScript equivalent of a namespace.

export const xml = {
  hasAttributes,
  getAttributesNames,
  hasAttribute,
  getAttributeStringValue,
  getAttributeNumberValue,
  getAttributeBooleanValue,
  getOptionalAttributeValue,
  getOptionalValue,
  hasInnerElement,
  hasInnerText,
  getInnerElements,
  isInnerElementText,
  getInnerElementText,
  getInnerText,
  parseBoolean
}

// ----------------------------------------------------------------------------

function hasAttributes (element: Object): boolean {
  return Object.hasOwn(element, ':@')
}

function getAttributesNames (element: Object): string[] {
  return Object.keys((element as { ':@': {} })[':@'])
}

function hasAttribute (element: Object, name: string): boolean {
  if (Object.hasOwn(element, ':@') === true) {
    const elementWithAttributes = element as { ':@': {} }
    return elementWithAttributes[':@'] !== undefined && Object.hasOwn(elementWithAttributes[':@'], name)
  } else {
    return false
  }
}

function getAttributeStringValue (element: Object, name: string): string {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`)
}

function getAttributeNumberValue (element: Object, name: string): number {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: number } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'number') {
      return attributeValue
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} number attribute`)
}

function getAttributeBooleanValue (element: Object, name: string): boolean {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue.toLowerCase() === 'yes'
    }
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} boolean attribute`)
}

function getOptionalAttributeValue (element: Object, name: string, defaultValue: string = ''): string {
  if (hasAttribute(element, name)) {
    const elementWithNamedAttribute = (element as { ':@': { [name]: string } })[':@']
    const attributeValue = elementWithNamedAttribute[name]
    if (attributeValue !== undefined && typeof attributeValue === 'string') {
      return attributeValue
    } else {
      throw new Error(`Element ${util.inspect(element)} attribute ${name} is not string`)
    }
  }
  return defaultValue
}

function getOptionalValue (attributeValue: string | undefined, defaultValue: string = ''): string {
  if (attributeValue !== undefined) {
    if (typeof attributeValue === 'string') {
      return attributeValue
    } else {
      throw new Error(`Attribute ${String(attributeValue)} is not string`)
    }
  } else {
    return defaultValue
  }
}

export function hasInnerElement (element: Object, name: string): boolean {
  if (Object.hasOwn(element, name) === true) {
    if (name === '#text') {
      const value = (element as { ['#text']: any })['#text']
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    } else {
      return Array.isArray((element as { [name]: any })[name])
    }
  } else {
    return false
  }
}

function isInnerElementText (element: Object, name: string): boolean {
  if (Object.hasOwn(element, name) === true) {
    const innerElements: XmlElement[] | undefined = (element as { [name]: XmlElement[] })[name]
    // console.log('isInnerElementText', util.inspect(element))
    assert(innerElements !== undefined)
    if (innerElements.length === 1) {
      assert(innerElements[0] !== undefined)
      if (Object.hasOwn(innerElements[0], '#text') === true) {
        const value = (innerElements[0] as { ['#text']: any })['#text']
        assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return true
      }
    } else if (innerElements.length === 0) {
      // Empty string.
      return true
    }
  }
  return false
}

function hasInnerText (element: Object): boolean {
  if (Object.hasOwn(element, '#text') === true) {
    const value = (element as { ['#text']: any })['#text']
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  } else {
    return false
  }
}

// T must be an array of elements.
function getInnerElements<T = XmlElement[]> (element: Object, name: string): T {
  // assert(Object.hasOwn(element, name) === true && Array.isArray((element as { [name]: T })[name]))
  const innerElements: T | undefined = (element as { [name]: T })[name]
  if (innerElements !== undefined) {
    return innerElements
  }
  throw new Error(`Element ${util.inspect(element)} does not have the ${name} child element`)
}

function getInnerElementText (element: Object, name: string): string {
  const innerElements: XmlElement[] | undefined = (element as { [name]: XmlElement[] })[name]

  if (innerElements === undefined) {
    throw new Error('No inner elements')
  }
  if (innerElements.length === 1) {
    const value = (innerElements[0] as { ['#text']: any })['#text']
    return value.toString()
  } else if (innerElements.length === 0) {
    return ''
  } else {
    throw new Error('Too many elements')
  }
}

function getInnerText (element: Object): string {
  // assert(Object.hasOwn(element, '#text') === true)
  const value = (element as { ['#text']: any })['#text']
  assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  return value.toString()
}

function parseBoolean (attributeValue: string | undefined): boolean {
  if (attributeValue !== undefined) {
    if (typeof attributeValue === 'string') {
      return attributeValue.toLowerCase() === 'yes'
    } else {
      throw new Error(`Attribute ${String(attributeValue)} is not string`)
    }
  } else {
    return false
  }
}

// ----------------------------------------------------------------------------
