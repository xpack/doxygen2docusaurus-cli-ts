import assert from 'node:assert';
import * as util from 'node:util';
import { XMLParser } from 'fast-xml-parser';
export class DoxygenXmlParser {
    options;
    xmlParser;
    images = [];
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
    hasAttributes(element) {
        return Object.hasOwn(element, ':@');
    }
    getAttributesNames(element) {
        return Object.keys(element[':@']);
    }
    hasAttribute(element, name) {
        if (Object.hasOwn(element, ':@')) {
            const elementWithAttributes = element;
            return Object.hasOwn(elementWithAttributes[':@'], name);
        }
        else {
            return false;
        }
    }
    getAttributeStringValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (typeof attributeValue === 'string') {
                return attributeValue;
            }
            else if (typeof attributeValue === 'number') {
                return String(attributeValue);
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`);
    }
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
    hasInnerElement(element, name) {
        if (Object.hasOwn(element, name)) {
            if (name === '#text') {
                const value = element['#text'];
                return (typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean');
            }
            else {
                return Array.isArray(element[name]);
            }
        }
        else {
            return false;
        }
    }
    isInnerElementText(element, name) {
        if (Object.hasOwn(element, name)) {
            const innerElements = element[name];
            if (innerElements.length === 1) {
                if (Object.hasOwn(innerElements[0], '#text')) {
                    const value = innerElements[0]['#text'];
                    assert(typeof value === 'string' ||
                        typeof value === 'number' ||
                        typeof value === 'boolean');
                    return true;
                }
            }
            else if (innerElements.length === 0) {
                return true;
            }
        }
        return false;
    }
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
    getInnerElements(element, name) {
        const innerElements = element[name];
        if (innerElements !== undefined) {
            return innerElements;
        }
        throw new Error(`Element ${util.inspect(element, { compact: false, depth: 999 })} ` +
            `does not have the ${name} child element`);
    }
    getInnerElementText(element, name) {
        const innerElements = element[name];
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
    getInnerElementNumber(element, name) {
        const innerElements = element[name];
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
    getInnerElementBoolean(element, name) {
        const innerElements = element[name];
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
    getInnerText(element) {
        const value = element['#text'];
        assert(typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean');
        return value.toString();
    }
}
//# sourceMappingURL=doxygen-xml-parser.js.map