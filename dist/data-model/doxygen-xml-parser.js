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
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { XMLParser } from 'fast-xml-parser';
import { DoxygenIndexDataModel } from './index/indexdoxygentype-dm.js';
import { DoxygenFileDataModel } from './doxyfile/doxyfiletype-dm.js';
import { DoxygenDataModel } from './compounds/doxygentype-dm.js';
// ----------------------------------------------------------------------------
export class DoxygenXmlParser {
    constructor({ verbose = false }) {
        this.verbose = false;
        this.parsedFilesCounter = 0;
        this.verbose = verbose;
    }
    async parse({ folderPath }) {
        // The parser is configured to preserve the original, non-trimmed content
        // and the original elements order. The downsize
        // Some details are from the schematic documentation:
        // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/README.md#documents
        // The defaults are in the project source:
        // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlparser/OptionsBuilder.js
        const xmlParser = new XMLParser({
            preserveOrder: true,
            removeNSPrefix: true,
            ignoreAttributes: false,
            parseTagValue: true,
            parseAttributeValue: true,
            trimValues: false
        });
        // console.log(folderPath)
        // ------------------------------------------------------------------------
        // Parse the top index.xml file.
        if (!this.verbose) {
            console.log('Parsing Doxygen generated .xml files...');
        }
        const parsedIndexElements = await this.parseFile({ fileName: 'index.xml', folderPath, xmlParser });
        // console.log(util.inspect(parsedIndex))
        // console.log(util.inspect(parsedIndex[0]['?xml']))
        // console.log(JSON.stringify(parsedIndex, null, '  '))
        let doxygenindex;
        for (const element of parsedIndexElements) {
            if (this.hasInnerElement(element, '?xml')) {
                // Ignore the top xml prologue.
            }
            else if (this.hasInnerText(element)) {
                // Ignore top texts.
            }
            else if (this.hasInnerElement(element, 'doxygenindex')) {
                doxygenindex = new DoxygenIndexDataModel(this, element);
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error('index.xml element:', Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(doxygenindex !== undefined);
        // ------------------------------------------------------------------------
        // Parse all compound *.xml files mentioned in the index.
        const compoundDefs = [];
        if (Array.isArray(doxygenindex.compounds)) {
            for (const compound of doxygenindex.compounds) {
                const parsedDoxygenElements = await this.parseFile({ fileName: `${compound.refid}.xml`, folderPath, xmlParser });
                // console.log(util.inspect(parsedDoxygen))
                // console.log(JSON.stringify(parsedDoxygen, null, '  '))
                for (const element of parsedDoxygenElements) {
                    if (this.hasInnerElement(element, '?xml')) {
                        // Ignore the top xml prologue.
                    }
                    else if (this.hasInnerText(element)) {
                        // Ignore top texts.
                    }
                    else if (this.hasInnerElement(element, 'doxygen')) {
                        const doxygen = new DoxygenDataModel(this, element);
                        if (Array.isArray(doxygen.compoundDefs)) {
                            compoundDefs.push(...doxygen.compoundDefs);
                        }
                    }
                    else {
                        console.error(util.inspect(element, { compact: false, depth: 999 }));
                        console.error(`${compound.refid}.xml element:`, Object.keys(element), 'not implemented yet in', this.constructor.name);
                    }
                }
            }
            const memberDefsById = new Map();
            for (const compoundDef of compoundDefs) {
                if (compoundDef.sectionDefs !== undefined) {
                    for (const sectionDef of compoundDef.sectionDefs) {
                        if (sectionDef.memberDefs !== undefined) {
                            for (const memberDef of sectionDef.memberDefs) {
                                memberDefsById.set(memberDef.id, memberDef);
                            }
                        }
                        if (sectionDef.members !== undefined) {
                            for (const member of sectionDef.members) {
                                if (member.kind.length === 0) {
                                    const memberDef = memberDefsById.get(member.refid);
                                    assert(memberDef !== undefined);
                                    member.kind = memberDef.kind;
                                }
                            }
                        }
                    }
                }
            }
        }
        // ------------------------------------------------------------------------
        // Parse the Doxyfile.xml with the options.
        const parsedDoxyfileElements = await this.parseFile({ fileName: 'Doxyfile.xml', folderPath, xmlParser });
        // console.log(util.inspect(parsedDoxyfile))
        // console.log(JSON.stringify(parsedDoxyfile, null, '  '))
        let doxyfile;
        for (const element of parsedDoxyfileElements) {
            if (this.hasInnerElement(element, '?xml')) {
                // Ignore the top xml prologue.
            }
            else if (this.hasInnerElement(element, '#text')) {
                // Ignore top texts.
            }
            else if (this.hasInnerElement(element, 'doxyfile')) {
                doxyfile = new DoxygenFileDataModel(this, element);
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error('Doxyfile.xml element:', Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(doxyfile);
        if (this.verbose) {
            console.log(this.parsedFilesCounter, 'xml files parsed');
        }
        // ------------------------------------------------------------------------
        return {
            doxygenindex,
            compoundDefs,
            doxyfile
        };
    }
    // --------------------------------------------------------------------------
    // Support methods.
    async parseFile({ fileName, folderPath, xmlParser }) {
        const filePath = path.join(folderPath, fileName);
        const xmlString = await fs.readFile(filePath, { encoding: 'utf8' });
        if (this.verbose) {
            console.log(`Parsing ${fileName}...`);
        }
        this.parsedFilesCounter += 1;
        return xmlParser.parse(xmlString);
    }
    // --------------------------------------------------------------------------
    hasAttributes(element) {
        return Object.hasOwn(element, ':@');
    }
    getAttributesNames(element) {
        return Object.keys(element[':@']);
    }
    hasAttribute(element, name) {
        if (Object.hasOwn(element, ':@') === true) {
            const elementWithAttributes = element;
            return elementWithAttributes[':@'] !== undefined && Object.hasOwn(elementWithAttributes[':@'], name);
        }
        else {
            return false;
        }
    }
    getAttributeStringValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (attributeValue !== undefined && typeof attributeValue === 'string') {
                return attributeValue;
            }
            else if (attributeValue !== undefined && typeof attributeValue === 'number') {
                // The xml parser returns attributes like `refid="21"` as numbers,
                // but the DTD defines them as strings and the applications expects
                // strings.
                return String(attributeValue);
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} attribute`);
    }
    getAttributeNumberValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (attributeValue !== undefined && typeof attributeValue === 'number') {
                return attributeValue;
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} number attribute`);
    }
    getAttributeBooleanValue(element, name) {
        if (this.hasAttribute(element, name)) {
            const elementWithNamedAttribute = element[':@'];
            const attributeValue = elementWithNamedAttribute[name];
            if (attributeValue !== undefined && typeof attributeValue === 'string') {
                return attributeValue.toLowerCase() === 'yes';
            }
        }
        throw new Error(`Element ${util.inspect(element)} does not have the ${name} boolean attribute`);
    }
    hasInnerElement(element, name) {
        if (Object.hasOwn(element, name) === true) {
            if (name === '#text') {
                const value = element['#text'];
                return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
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
        if (Object.hasOwn(element, name) === true) {
            const innerElements = element[name];
            // console.log('isInnerElementText', util.inspect(element, { compact: false, depth: 999 })
            assert(innerElements !== undefined);
            if (innerElements.length === 1) {
                assert(innerElements[0] !== undefined);
                if (Object.hasOwn(innerElements[0], '#text') === true) {
                    const value = innerElements[0]['#text'];
                    assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');
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
    hasInnerText(element) {
        if (Object.hasOwn(element, '#text') === true) {
            const value = element['#text'];
            return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
        }
        else {
            return false;
        }
    }
    // T must be an array of elements.
    getInnerElements(element, name) {
        // assert(Object.hasOwn(element, name) === true && Array.isArray((element as { [name]: T })[name]))
        const innerElements = element[name];
        if (innerElements !== undefined) {
            return innerElements;
        }
        throw new Error(`Element ${util.inspect(element, { compact: false, depth: 999 })} does not have the ${name} child element`);
    }
    getInnerElementText(element, name) {
        const innerElements = element[name];
        if (innerElements === undefined) {
            throw new Error('No inner elements');
        }
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
        if (innerElements === undefined) {
            throw new Error('No inner elements');
        }
        if (innerElements.length === 1) {
            const value = innerElements[0]['#text'];
            return parseInt(value);
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
        if (innerElements === undefined) {
            throw new Error('No inner elements');
        }
        if (innerElements.length === 1) {
            const value = (innerElements[0]['#text']).trim().toLowerCase();
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
        // assert(Object.hasOwn(element, '#text') === true)
        const value = element['#text'];
        assert(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean');
        return value.toString();
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doxygen-xml-parser.js.map