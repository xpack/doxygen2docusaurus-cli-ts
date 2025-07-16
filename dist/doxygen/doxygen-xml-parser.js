import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { XMLParser } from 'fast-xml-parser';
import { DoxygenIndexDataModel } from './data-model/index/indexdoxygentype-dm.js';
import { DoxygenFileDataModel } from './data-model/doxyfile/doxyfiletype-dm.js';
import { DoxygenDataModel } from './data-model/compounds/doxygentype-dm.js';
export class DoxygenXmlParser {
    options;
    parsedFilesCounter = 0;
    xmlParser;
    dataModel = {
        compoundDefs: [],
    };
    constructor({ options }) {
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
    async parse() {
        if (!this.options.verbose) {
            console.log('Parsing Doxygen generated .xml files...');
        }
        await this.parseDoxygenIndex();
        assert(this.dataModel.doxygenindex !== undefined);
        if (Array.isArray(this.dataModel.doxygenindex.compounds)) {
            for (const indexCompound of this.dataModel.doxygenindex.compounds) {
                const parsedDoxygenElements = await this.parseFile({
                    fileName: `${indexCompound.refid}.xml`,
                });
                this.processCompoundDefs(indexCompound, parsedDoxygenElements);
            }
            this.processMemberdefs();
        }
        await this.parseDoxyfile();
        assert(this.dataModel.doxyfile);
        console.log(this.parsedFilesCounter, 'xml files parsed');
        if (this.options.verbose) {
            if (this.dataModel.images !== undefined) {
                console.log(this.dataModel.images.length, 'images identified');
            }
        }
        return this.dataModel;
    }
    async parseDoxygenIndex() {
        const parsedIndexElements = await this.parseFile({
            fileName: 'index.xml',
        });
        for (const element of parsedIndexElements) {
            if (this.hasInnerElement(element, '?xml')) {
            }
            else if (this.hasInnerText(element)) {
            }
            else if (this.hasInnerElement(element, 'doxygenindex')) {
                this.dataModel.doxygenindex = new DoxygenIndexDataModel(this, element);
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error('index.xml element:', Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
    }
    processCompoundDefs(indexCompound, parsedDoxygenElements) {
        for (const element of parsedDoxygenElements) {
            if (this.hasInnerElement(element, '?xml')) {
            }
            else if (this.hasInnerText(element)) {
            }
            else if (this.hasInnerElement(element, 'doxygen')) {
                const doxygen = new DoxygenDataModel(this, element);
                if (Array.isArray(doxygen.compoundDefs)) {
                    this.dataModel.compoundDefs.push(...doxygen.compoundDefs);
                }
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${indexCompound.refid}.xml element:`, Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
    }
    processMemberdefs() {
        const memberDefsById = new Map();
        for (const compoundDef of this.dataModel.compoundDefs) {
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
    async parseDoxyfile() {
        const parsedDoxyfileElements = await this.parseFile({
            fileName: 'Doxyfile.xml',
        });
        for (const element of parsedDoxyfileElements) {
            if (this.hasInnerElement(element, '?xml')) {
            }
            else if (this.hasInnerElement(element, '#text')) {
            }
            else if (this.hasInnerElement(element, 'doxyfile')) {
                this.dataModel.doxyfile = new DoxygenFileDataModel(this, element);
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error('Doxyfile.xml element:', Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
    }
    async parseFile({ fileName }) {
        const folderPath = this.options.doxygenXmlInputFolderPath;
        const filePath = path.join(folderPath, fileName);
        const xmlString = await fs.readFile(filePath, { encoding: 'utf8' });
        if (this.options.verbose) {
            console.log(`Parsing ${fileName}...`);
        }
        this.parsedFilesCounter += 1;
        return this.xmlParser.parse(xmlString);
    }
    hasAttributes(element) {
        return Object.hasOwn(element, ':@');
    }
    getAttributesNames(element) {
        return Object.keys(element[':@']);
    }
    hasAttribute(element, name) {
        if (Object.hasOwn(element, ':@') === true) {
            const elementWithAttributes = element;
            return (elementWithAttributes[':@'] !== undefined &&
                Object.hasOwn(elementWithAttributes[':@'], name));
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
            else if (attributeValue !== undefined &&
                typeof attributeValue === 'number') {
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
        if (Object.hasOwn(element, name) === true) {
            const innerElements = element[name];
            assert(innerElements !== undefined);
            if (innerElements.length === 1) {
                assert(innerElements[0] !== undefined);
                if (Object.hasOwn(innerElements[0], '#text') === true) {
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
        if (Object.hasOwn(element, '#text') === true) {
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
            const value = innerElements[0]['#text']
                .trim()
                .toLowerCase();
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