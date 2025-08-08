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
import assert from 'node:assert';
import * as util from 'node:util';
import { XMLParser } from 'fast-xml-parser';
// ----------------------------------------------------------------------------
/**
 * XML parser for Doxygen-generated documentation files.
 *
 * @remarks
 * This class initialises the XML parser with options that preserve the order
 * and structure of the original XML content, ensuring accurate conversion
 * for documentation purposes. It maintains a counter for the number of files
 * parsed and stores the resulting data model.
 *
 * The parser is configured to handle Doxygen's specific XML format whilst
 * maintaining fidelity to the source structure and content organisation.
 *
 * @example
 * ```typescript
 * const parser = new DoxygenXmlParser({ options });
 * const dataModel = await parser.parse();
 * ```
 *
 * @public
 */
export class DoxygenXmlParser {
    /**
     * The global configuration options for the parsing operation.
     *
     * @remarks
     * Contains the command-line interface options that control the behaviour
     * of the parser throughout the XML processing workflow.
     */
    options;
    /**
     * The XML parser instance configured specifically for Doxygen XML format.
     *
     * @remarks
     * Configured with settings that preserve element order, remove namespace
     * prefixes, and maintain fidelity to the original XML structure for
     * accurate data model construction.
     */
    xmlParser;
    /**
     * Collection of image references extracted during XML parsing.
     *
     * @remarks
     * Accumulates image elements found in the documentation content,
     * allowing for centralised image processing and reference management.
     */
    images = [];
    /**
     * Constructs a new instance of the DoxygenXmlParser class.
     *
     * @param options - The global configuration options
     *
     * @remarks
     * This constructor initialises the XML parser with settings that preserve the
     * order and structure of the original XML content, remove namespace prefixes,
     * and ensure that both tag and attribute values are parsed. The values are
     * not trimmed, maintaining fidelity to the source XML. The provided options
     * are stored for use throughout the parsing process.
     */
    constructor(options) {
        this.options = options;
        this.xmlParser = new XMLParser({
            preserveOrder: true,
            removeNSPrefix: true,
            ignoreAttributes: false,
            parseTagValue: true,
            parseAttributeValue: true,
            trimValues: false,
        });
    }
    // --------------------------------------------------------------------------
    /**
     * Determines whether the specified XML element has any attributes.
     *
     * @param element - The XML element to inspect for attributes
     * @returns True if the element has attributes; otherwise, false
     *
     * @remarks
     * This method checks for the presence of the ':\@' property on the XML
     * element, which is the convention used by the XML parser for storing
     * attributes. If this property exists, the element has attributes; if not,
     * the element has no attributes. This is a prerequisite check before calling
     * {@link DoxygenXmlParser.getAttributesNames} or other attribute-related
     * methods.
     */
    hasAttributes(element) {
        return Object.hasOwn(element, ':@');
    }
    /**
     * Retrieves the names of all attributes present on the specified XML element.
     *
     * @param element - The XML element to inspect for attribute names
     * @returns An array of strings containing the names of all attributes
     *
     * @remarks
     * This method accesses the ':\@' property of the XML element, which is the
     * convention used by the XML parser for storing attributes, and returns the
     * keys of this object as an array of attribute names. The method assumes the
     * element has attributes and does not perform validation - use
     * {@link DoxygenXmlParser.hasAttributes} to check for attribute presence
     * first.
     */
    getAttributesNames(element) {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        return Object.keys(element[':@']);
    }
    /**
     * Determines whether the specified attribute exists on the given XML element.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the attribute to check for
     * @returns True if the attribute exists; otherwise, false
     *
     * @remarks
     * This method checks for the presence of an attribute within the ':\@'
     * property of the XML element, which is the convention used by the XML
     * parser for storing attributes. It returns true if the attribute is found,
     * otherwise false.
     */
    hasAttribute(element, name) {
        if (Object.hasOwn(element, ':@')) {
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            const elementWithAttributes = element;
            return Object.hasOwn(elementWithAttributes[':@'], name);
        }
        else {
            return false;
        }
    }
    /**
     * Retrieves the value of a named attribute as a string.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns The attribute value as a string
     * @throws If the attribute does not exist
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element and returns its value as a string. If the attribute value is
     * originally a number (as the XML parser may return numeric strings as
     * numbers), it is converted to a string to maintain consistency with the
     * DTD specification. If the attribute is missing, an error is thrown to
     * indicate the absence.
     */
    getAttributeStringValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (typeof attributeValue === 'string') {
                return attributeValue;
            }
            else if (typeof attributeValue === 'number') {
                // The xml parser returns attributes like `refid="21"` as numbers,
                // but the DTD defines them as strings and the applications expects
                // strings.
                return String(attributeValue);
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`);
    }
    /**
     * Retrieves the value of a named attribute as a number.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns The attribute value as a number
     * @throws If the attribute does not exist or is not a number
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element and returns its value as a number. If the attribute is missing
     * or its value is not a number, an error is thrown to indicate the absence
     * or incorrect type.
     */
    getAttributeNumberValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (typeof attributeValue === 'number') {
                return attributeValue;
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} number ` +
            'attribute');
    }
    /**
     * Retrieves the value of a named attribute as a boolean.
     *
     * @param element - The XML element containing the attribute
     * @param name - The name of the attribute to retrieve
     * @returns True if the attribute value is 'yes' (case-insensitive);
     * otherwise, false
     * @throws If the attribute does not exist or is not a string
     *
     * @remarks
     * This method checks whether the specified attribute exists on the XML
     * element, and returns true if its value is the string 'yes'
     * (case-insensitive). If the attribute is missing or its value is not a
     * string, an error is thrown.
     */
    getAttributeBooleanValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (typeof attributeValue === 'string') {
                return attributeValue.toLowerCase() === 'yes';
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} ` +
            'boolean attribute');
    }
    /**
     * Determines whether the specified inner element exists on the given XML
     * element.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the inner element to check for
     * @returns True if the inner element exists; otherwise, false
     *
     * @remarks
     * This method checks for the presence of a named property on the XML element.
     * For text nodes ('#text'), it verifies the value is a string, number, or
     * boolean. For other elements, it confirms the property is an array, as
     * per the XML parser's convention.
     */
    hasInnerElement(element, name) {
        if (Object.hasOwn(element, name)) {
            if (name === '#text') {
                const value = element['#text'];
                return (typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean');
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return Array.isArray(element[name]);
            }
        }
        else {
            return false;
        }
    }
    /**
     * Determines whether a named inner element contains text.
     *
     * @param element - The XML element to inspect
     * @param name - The name of the inner element
     * @returns True if the inner element contains text or is empty;
     * otherwise, false
     *
     * @remarks
     * This method checks if the specified inner element exists and contains a
     * single text node, or is an empty array (representing an empty string).
     * It asserts the expected structure and type of the value for robustness.
     */
    isInnerElementText(element, name) {
        if (Object.hasOwn(element, name)) {
            const innerElements = element[name];
            // console.log('isInnerElementText', util.inspect(element,
            //   { compact: false, depth: 999 })
            // assert(innerElements !== undefined)
            if (innerElements.length === 1) {
                // assert(innerElements[0] !== undefined)
                if (Object.hasOwn(innerElements[0], '#text')) {
                    const value = innerElements[0]['#text'];
                    assert(typeof value === 'string' ||
                        typeof value === 'number' ||
                        typeof value === 'boolean');
                    return true;
                }
            }
            else if (innerElements.length === 0) {
                // Empty string.
                return true;
            }
        }
        return false;
    }
    /**
     * Determines whether the XML element contains a text node.
     *
     * @param element - The XML element to inspect
     * @returns True if the element contains a text node; otherwise, false
     *
     * @remarks
     * This method checks for the presence of a '#text' property on the XML
     * element, and verifies that its value is a string, number, or boolean.
     */
    hasInnerText(element) {
        if (Object.hasOwn(element, '#text')) {
            const value = element['#text'];
            return (typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean');
        }
        else {
            return false;
        }
    }
    /**
     * Retrieves an array of named child elements from the given XML element.
     *
     * @typeParam T - The expected type of the child elements array
     * (defaults to XmlElement[])
     * @param element - The XML element containing the child elements
     * @param name - The name of the child elements to retrieve
     * @returns The array of child elements
     * @throws If the child elements do not exist
     *
     * @remarks
     * This method accesses the specified property on the XML element and
     * returns it as an array of child elements. If the property is undefined,
     * an error is thrown indicating the absence of the expected child element.
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    getInnerElements(element, name) {
        // assert(Object.hasOwn(element, name) === true &&
        //   Array.isArray((element as { [name]: T })[name]))
        const innerElements = element[name];
        if (innerElements !== undefined) {
            return innerElements;
        }
        throw new Error(`Element ${util.inspect(element, { compact: false, depth: 999 })} ` +
            `does not have the ${name} child element`);
    }
    /**
     * Retrieves the text content of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns The text content of the child element
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its text
     * content. If the child element is missing, an error is thrown. If the
     * child element is empty, an empty string is returned. If there is more
     * than one child element, an error is thrown to indicate unexpected
     * structure.
     */
    getInnerElementText(element, name) {
        const innerElements = element[name];
        // if (innerElements === undefined) {
        //   throw new Error('No inner elements')
        // }
        if (innerElements.length === 1) {
            const value = innerElements[0]['#text'];
            return value.toString();
        }
        else if (innerElements.length === 0) {
            return '';
        }
        else {
            throw new Error('Too many elements');
        }
    }
    /**
     * Retrieves the numeric value of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns The numeric value of the child element
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its value
     * as a number. If the child element is missing, an error is thrown. If the
     * child element is empty, NaN is returned. If there is more than one child
     * element, an error is thrown to indicate unexpected structure.
     */
    getInnerElementNumber(element, name) {
        const innerElements = element[name];
        // if (innerElements === undefined) {
        //   throw new Error('No inner elements')
        // }
        if (innerElements.length === 1) {
            const value = innerElements[0]['#text'];
            return parseInt(value.toString());
        }
        else if (innerElements.length === 0) {
            return NaN;
        }
        else {
            throw new Error('Too many elements');
        }
    }
    /**
     * Retrieves the boolean value of a named child element.
     *
     * @param element - The XML element containing the child element
     * @param name - The name of the child element
     * @returns True if the child element's text is 'true'
     * (case-insensitive); otherwise, false
     * @throws If the child element does not exist or contains more than one
     * element
     *
     * @remarks
     * This method accesses the specified child element and returns its value
     * as a boolean. If the child element is missing, an error is thrown. If
     * the child element is empty, false is returned. If there is more than one
     * child element, an error is thrown to indicate unexpected structure.
     */
    getInnerElementBoolean(element, name) {
        const innerElements = element[name];
        // if (innerElements === undefined) {
        //   throw new Error('No inner elements')
        // }
        if (innerElements.length === 1) {
            const textValue = innerElements[0]['#text'];
            const value = textValue.toString().trim().toLowerCase();
            return value === 'true';
        }
        else if (innerElements.length === 0) {
            return false;
        }
        else {
            throw new Error('Too many elements');
        }
    }
    /**
     * Retrieves the text content of the XML element.
     *
     * @param element - The XML element to retrieve text from
     * @returns The text content of the element
     * @throws If the element does not contain a valid text node
     *
     * @remarks
     * This method accesses the '#text' property of the XML element and
     * returns its value as a string. It asserts that the value is of type
     * string, number, or boolean before converting it to a string. If the
     * property is missing or the value is of an unexpected type, an error is
     * thrown.
     */
    getInnerText(element) {
        // assert(Object.hasOwn(element, '#text') === true)
        const value = element['#text'];
        assert(typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean');
        return value.toString();
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doxygen-xml-parser.js.map