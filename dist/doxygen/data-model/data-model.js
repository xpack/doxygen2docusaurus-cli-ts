import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { DoxygenFileDataModel } from './doxyfile/doxyfiletype-dm.js';
import { DoxygenIndexDataModel } from './index/indexdoxygentype-dm.js';
import { DoxygenDataModel } from './compounds/doxygentype-dm.js';
import { DoxygenXmlParser } from './doxygen-xml-parser.js';
export class DataModel {
    options;
    xml;
    parsedFilesCounter = 0;
    doxygenindex;
    compoundDefs;
    doxyfile;
    projectVersion;
    constructor(options) {
        this.options = options;
        this.xml = new DoxygenXmlParser(options);
        this.compoundDefs = [];
    }
    async parse() {
        if (!this.options.verbose) {
            console.log('Parsing Doxygen generated .xml files...');
        }
        await this.parseDoxygenIndex();
        assert(this.doxygenindex !== undefined);
        if (Array.isArray(this.doxygenindex.compounds)) {
            for (const indexCompound of this.doxygenindex.compounds) {
                const parsedDoxygenElements = await this.parseFile({
                    fileName: `${indexCompound.refid}.xml`,
                });
                this.processCompoundDefs(indexCompound, parsedDoxygenElements);
            }
            this.processMemberdefs();
        }
        await this.parseDoxyfile();
        assert(this.doxyfile);
        console.log(this.parsedFilesCounter, 'xml files parsed');
        if (this.options.verbose) {
            if (this.xml.images.length > 0) {
                console.log(this.xml.images.length, 'images identified');
            }
        }
    }
    async parseDoxygenIndex() {
        const parsedIndexElements = await this.parseFile({
            fileName: 'index.xml',
        });
        for (const element of parsedIndexElements) {
            if (this.xml.hasInnerElement(element, '?xml')) {
            }
            else if (this.xml.hasInnerText(element)) {
            }
            else if (this.xml.hasInnerElement(element, 'doxygenindex')) {
                this.doxygenindex = new DoxygenIndexDataModel(this.xml, element);
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error('index.xml element:', Object.keys(element), 'not implemented yet in', this.constructor.name);
            }
        }
    }
    processCompoundDefs(indexCompound, parsedDoxygenElements) {
        for (const element of parsedDoxygenElements) {
            if (this.xml.hasInnerElement(element, '?xml')) {
            }
            else if (this.xml.hasInnerText(element)) {
            }
            else if (this.xml.hasInnerElement(element, 'doxygen')) {
                const doxygen = new DoxygenDataModel(this.xml, element);
                if (Array.isArray(doxygen.compoundDefs)) {
                    this.compoundDefs.push(...doxygen.compoundDefs);
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
        for (const compoundDef of this.compoundDefs) {
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
        const parsedDoxyfileElements = (await this.parseFile({
            fileName: 'Doxyfile.xml',
        }));
        for (const element of parsedDoxyfileElements) {
            if (this.xml.hasInnerElement(element, '?xml')) {
            }
            else if (this.xml.hasInnerElement(element, '#text')) {
            }
            else if (this.xml.hasInnerElement(element, 'doxyfile')) {
                this.doxyfile = new DoxygenFileDataModel(this.xml, element);
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
            console.log(`Parsing '${fileName}'...`);
        }
        this.parsedFilesCounter += 1;
        return this.xml.xmlParser.parse(xmlString);
    }
}
//# sourceMappingURL=data-model.js.map