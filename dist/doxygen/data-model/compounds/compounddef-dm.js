import * as util from 'node:util';
import assert from 'node:assert';
import { IncludedByDataModel, IncludesDataModel } from './inctype-dm.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel, } from './compoundreftype-dm.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { SectionDefDataModel } from './sectiondeftype-dm.js';
import { ListOfAllMembersDataModel } from './listofallmemberstype-dm.js';
import { AbstractStringType, BriefDescriptionDataModel, DetailedDescriptionDataModel, ParaDataModel, ProgramListingDataModel, Sect5DataModel, } from './descriptiontype-dm.js';
import { InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel, } from './reftype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TableOfContentsDataModel } from './tableofcontentstype-dm.js';
export class AbstractXyzType extends AbstractDataModelBase {
    text = '';
    compoundName = '';
    colsCount = NaN;
    elm12 = false;
    elm20;
    elm21;
    elm22;
    briefDescription;
    includes;
    id = '';
    rowsCount = NaN;
    thead = false;
    language;
    final;
    lineno;
    attr23;
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'compoundname')) {
                this.compoundName = xml.getInnerElementText(innerElement, 'compoundname');
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'includes')) {
                if (this.includes === undefined) {
                    this.includes = [];
                }
                this.includes.push(new IncludesDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        this.children = [];
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                this.children.push(xml.getInnerText(innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'para')) {
                this.children.push(new ParaDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'sect5')) {
                this.children.push(new Sect5DataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_rows') {
                assert(isNaN(this.rowsCount));
                this.rowsCount = xml.getAttributeNumberValue(element, '@_rows');
            }
            else if (attributeName === '@_thead') {
                this.thead = xml.getAttributeBooleanValue(element, '@_thead');
            }
            else if (attributeName === '@_language') {
                this.language = xml.getAttributeStringValue(element, '@_language');
            }
            else if (attributeName === '@_final') {
                this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'));
            }
            else if (attributeName === '@_lineno') {
                this.lineno = Number(xml.getAttributeNumberValue(element, '@_lineno'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
    }
}
export class XyzDataModel extends AbstractXyzType {
    constructor(xml, element) {
        super(xml, element, 'xyz');
    }
}
export class AbstractCompoundDefType extends AbstractDataModelBase {
    compoundName = '';
    title;
    briefDescription;
    detailedDescription;
    baseCompoundRefs;
    derivedCompoundRefs;
    includes;
    includedBy;
    templateParamList;
    sectionDefs;
    tableOfContents;
    innerDirs;
    innerFiles;
    innerClasses;
    innerNamespaces;
    innerPages;
    innerGroups;
    programListing;
    location;
    listOfAllMembers;
    id = '';
    kind = '';
    language;
    prot;
    final;
    inline;
    sealed;
    abstract;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.isInnerElementText(innerElement, 'compoundname')) {
                this.compoundName = xml.getInnerElementText(innerElement, 'compoundname');
            }
            else if (xml.isInnerElementText(innerElement, 'title')) {
                this.title = xml.getInnerElementText(innerElement, 'title');
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
                this.detailedDescription = new DetailedDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'basecompoundref')) {
                if (this.baseCompoundRefs === undefined) {
                    this.baseCompoundRefs = [];
                }
                this.baseCompoundRefs.push(new BaseCompoundRefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'derivedcompoundref')) {
                if (this.derivedCompoundRefs === undefined) {
                    this.derivedCompoundRefs = [];
                }
                this.derivedCompoundRefs.push(new DerivedCompoundRefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'includes')) {
                if (this.includes === undefined) {
                    this.includes = [];
                }
                this.includes.push(new IncludesDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'includedby')) {
                if (this.includedBy === undefined) {
                    this.includedBy = [];
                }
                this.includedBy.push(new IncludedByDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'incdepgraph')) {
            }
            else if (xml.hasInnerElement(innerElement, 'invincdepgraph')) {
            }
            else if (xml.hasInnerElement(innerElement, 'innerdir')) {
                if (this.innerDirs === undefined) {
                    this.innerDirs = [];
                }
                this.innerDirs.push(new InnerDirDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerfile')) {
                if (this.innerFiles === undefined) {
                    this.innerFiles = [];
                }
                this.innerFiles.push(new InnerFileDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerclass')) {
                if (this.innerClasses === undefined) {
                    this.innerClasses = [];
                }
                this.innerClasses.push(new InnerClassDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innernamespace')) {
                if (this.innerNamespaces === undefined) {
                    this.innerNamespaces = [];
                }
                this.innerNamespaces.push(new InnerNamespaceDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerpage')) {
                if (this.innerPages === undefined) {
                    this.innerPages = [];
                }
                this.innerPages.push(new InnerPageDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innergroup')) {
                if (this.innerGroups === undefined) {
                    this.innerGroups = [];
                }
                this.innerGroups.push(new InnerGroupDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
                this.templateParamList = new TemplateParamListDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'sectiondef')) {
                if (this.sectionDefs === undefined) {
                    this.sectionDefs = [];
                }
                this.sectionDefs.push(new SectionDefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                this.tableOfContents = new TableOfContentsDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'inheritancegraph')) {
            }
            else if (xml.hasInnerElement(innerElement, 'collaborationgraph')) {
            }
            else if (xml.hasInnerElement(innerElement, 'programlisting')) {
                assert(this.programListing === undefined);
                this.programListing = new ProgramListingDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'location')) {
                this.location = new LocationDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'listofallmembers')) {
                this.listOfAllMembers = new ListOfAllMembersDataModel(xml, innerElement);
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else if (attributeName === '@_language') {
                this.language = xml.getAttributeStringValue(element, '@_language');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_final') {
                this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'));
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else if (attributeName === '@_sealed') {
                this.sealed = Boolean(xml.getAttributeBooleanValue(element, '@_sealed'));
            }
            else if (attributeName === '@_abstract') {
                this.abstract = Boolean(xml.getAttributeBooleanValue(element, '@_abstract'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.id.length > 0);
        assert(this.kind.length > 0);
        if (this.kind !== 'namespace') {
            assert(this.compoundName.length > 0);
        }
    }
}
export class CompoundDefDataModel extends AbstractCompoundDefType {
    constructor(xml, element) {
        super(xml, element, 'compounddef');
    }
}
export class AbstractDocHtmlOnlyType extends AbstractDataModelBase {
    text = '';
    block;
    constructor(xml, element, elementName) {
        super(elementName);
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        if (xml.hasAttributes(element)) {
            const attributesNames = xml.getAttributesNames(element);
            for (const attributeName of attributesNames) {
                if (attributeName === '@_block') {
                    this.block = xml.getAttributeStringValue(element, '@_block');
                }
                else {
                    console.error(util.inspect(element, { compact: false, depth: 999 }));
                    console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
                }
            }
        }
    }
}
export class HtmlOnlyDataModel extends AbstractDocHtmlOnlyType {
    constructor(xml, element) {
        super(xml, element, 'htmlonly');
    }
}
export class ManOnlyDataModel extends AbstractStringType {
    constructor(xml, element) {
        super(xml, element, 'manonly');
    }
}
export class XmlOnlyDataModel extends AbstractStringType {
    constructor(xml, element) {
        super(xml, element, 'xmlonly');
    }
}
export class RtfOnlyDataModel extends AbstractStringType {
    constructor(xml, element) {
        super(xml, element, 'rtfonly');
    }
}
export class LatexOnlyDataModel extends AbstractStringType {
    constructor(xml, element) {
        super(xml, element, 'latexonly');
    }
}
export class DocBookOnlyDataModel extends AbstractStringType {
    constructor(xml, element) {
        super(xml, element, 'docbookonly');
    }
}
//# sourceMappingURL=compounddef-dm.js.map