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
// ----------------------------------------------------------------------------
/**
 * Abstract template class for creating new data model objects.
 *
 * @remarks
 * This template provides a standardised structure for implementing new
 * data model types with common properties and processing patterns. It
 * demonstrates the typical XML parsing approach used throughout the
 * Doxygen data model implementation, including element and attribute
 * processing workflows.
 *
 * @public
 */
// Template, to be used for creating new objects.
export class AbstractXyzType extends AbstractDataModelBase {
    // If the object has a text.
    text = '';
    // Mandatory elements.
    compoundName = '';
    colsCount = NaN;
    elm12 = false;
    // elm13: BriefDescriptionDataModel
    // Optional elements.
    elm20;
    elm21;
    elm22;
    briefDescription;
    includes;
    // Mandatory attributes.
    id = '';
    rowsCount = NaN;
    thead = false;
    // Optional attributes.
    language;
    final;
    lineno;
    attr23;
    // ------------------------------------------
    // children: Array<string | ParaDataModel | Sect5DataModel> = []
    /**
     * Constructs a new template data model instance.
     *
     * @remarks
     * Demonstrates the standard XML parsing workflow used throughout the
     * data model implementation. This includes processing inner elements,
     * handling mixed content with ordered children, and extracting attributes
     * with appropriate type conversion and validation.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // If the object has only a text.
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        // ------------------------------------------
        // If the object has sub-elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'compoundname')) {
                this.compoundName = xml.getInnerElementText(innerElement, 'compoundname');
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'includes')) {
                // console.log(util.inspect(item))
                this.includes ??= [];
                this.includes.push(new IncludesDataModel(xml, innerElement));
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------
        // If the object has to keep trak of the order of mixed type children.
        // const innerElements = xml.getInnerElements(element, elementName)
        // assert(innerElements.length > 0)
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
        // ------------------------------------------------------------------------
        // Process attributes.
        // If the object has no attributes.
        assert(!xml.hasAttributes(element));
        // ------------------------------------------
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
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
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
/**
 * Concrete implementation of the template data model.
 *
 * @remarks
 * Provides a specific implementation of the abstract template class,
 * demonstrating how to create concrete data model objects for particular
 * XML element types. This pattern is used throughout the data model
 * for creating type-specific implementations.
 *
 * @public
 */
export class XyzDataModel extends AbstractXyzType {
    /**
     * Constructs a new XyzDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'xyz' XML elements by delegating
     * to the parent constructor with the appropriate element name.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'xyz');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="compounddefType">
//   <xsd:sequence>
//     <xsd:element name="compoundname" type="xsd:string"/>
//     <xsd:element name="title" type="xsd:string" minOccurs="0" />
//     <xsd:element name="basecompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="derivedcompoundref" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="includes" type="incType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="includedby" type="incType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="incdepgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="invincdepgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="innermodule" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerdir" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerfile" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerclass" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerconcept" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innernamespace" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innerpage" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="innergroup" type="refType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="qualifier" type="xsd:string" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="templateparamlist" type="templateparamlistType" minOccurs="0" />
//     <xsd:element name="sectiondef" type="sectiondefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="tableofcontents" type="tableofcontentsType" minOccurs="0" maxOccurs="1" />
//     <xsd:element name="requiresclause" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="initializer" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="detaileddescription" type="descriptionType" minOccurs="0" />
//     <xsd:element name="exports" type="exportsType" minOccurs="0" maxOccurs="1"/>
//     <xsd:element name="inheritancegraph" type="graphType" minOccurs="0" />
//     <xsd:element name="collaborationgraph" type="graphType" minOccurs="0" />
//     <xsd:element name="programlisting" type="listingType" minOccurs="0" />
//     <xsd:element name="location" type="locationType" minOccurs="0" />
//     <xsd:element name="listofallmembers" type="listofallmembersType" minOccurs="0" />
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
//   <xsd:attribute name="kind" type="DoxCompoundKind" />
//   <xsd:attribute name="language" type="DoxLanguage" use="optional"/>
//   <xsd:attribute name="prot" type="DoxProtectionKind" />
//   <xsd:attribute name="final" type="DoxBool" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="sealed" type="DoxBool" use="optional"/>
//   <xsd:attribute name="abstract" type="DoxBool" use="optional"/>
// </xsd:complexType>
// <xsd:simpleType name="DoxCompoundKind">
// <xsd:restriction base="xsd:string">
//   <xsd:enumeration value="class" />
//   <xsd:enumeration value="struct" />
//   <xsd:enumeration value="union" />
//   <xsd:enumeration value="interface" />
//   <xsd:enumeration value="protocol" />
//   <xsd:enumeration value="category" />
//   <xsd:enumeration value="exception" />
//   <xsd:enumeration value="service" />
//   <xsd:enumeration value="singleton" />
//   <xsd:enumeration value="module" />
//   <xsd:enumeration value="type" />
//   <xsd:enumeration value="file" />
//   <xsd:enumeration value="namespace" />
//   <xsd:enumeration value="group" />
//   <xsd:enumeration value="page" />
//   <xsd:enumeration value="example" />
//   <xsd:enumeration value="dir" />
//   <xsd:enumeration value="concept" />
// </xsd:restriction>
// </xsd:simpleType>
/**
 * Abstract base class for Doxygen compound definition data models.
 *
 * @remarks
 * Represents the core structure of compound definitions in Doxygen XML output,
 * including classes, structures, files, namespaces, and other compound types.
 * This class handles the complete XML schema for compound definitions with
 * comprehensive element and attribute processing to capture all aspects of
 * the documented code structures.
 *
 * @public
 */
export class AbstractCompoundDefType extends AbstractDataModelBase {
    // Mandatory elements.
    /**
     * The name of the compound element.
     *
     * @remarks
     * Contains the fully qualified name of the compound (class, namespace,
     * file, etc.) as extracted from the 'compoundname' XML element. This
     * represents the primary identifier for the compound in the documentation
     * hierarchy and is mandatory for all compound types except namespaces.
     */
    compoundName = '';
    // Optional elements.
    /**
     * Optional title for the compound.
     *
     * @remarks
     * Provides a human-readable title for the compound that may differ from
     * the compound name. This is typically used for pages and groups where
     * a descriptive title is more appropriate than the technical identifier.
     */
    title;
    /**
     * Brief description of the compound.
     *
     * @remarks
     * Contains a concise summary description of the compound extracted from
     * the 'briefdescription' XML element. This provides a short overview
     * suitable for listings and summary views of the documented entity.
     */
    briefDescription;
    /**
     * Detailed description of the compound.
     *
     * @remarks
     * Contains comprehensive documentation for the compound extracted from
     * the 'detaileddescription' XML element. This includes full description
     * text with formatting, examples, and other detailed documentation
     * content.
     */
    detailedDescription;
    /**
     * Base compound references for inheritance relationships.
     *
     * @remarks
     * Contains references to base classes or parent compounds from which
     * this compound inherits. This property captures the inheritance
     * hierarchy information extracted from 'basecompoundref' XML elements
     * for object-oriented documentation structures.
     */
    baseCompoundRefs;
    /**
     * Derived compound references for inheritance relationships.
     *
     * @remarks
     * Contains references to derived classes or child compounds that inherit
     * from this compound. This property captures the inheritance hierarchy
     * information extracted from 'derivedcompoundref' XML elements for
     * complete inheritance documentation.
     */
    derivedCompoundRefs;
    /**
     * Include file references for this compound.
     *
     * @remarks
     * Contains information about header files or modules that this compound
     * includes or depends upon. This property captures dependency
     * relationships extracted from 'includes' XML elements, providing
     * visibility into the file inclusion structure.
     */
    includes;
    /**
     * Reverse include file references for this compound.
     *
     * @remarks
     * Contains information about other files or compounds that include this
     * compound. This property captures reverse dependency relationships
     * extracted from 'includedby' XML elements, showing which entities
     * depend on this compound.
     */
    includedBy;
    /**
     * Template parameter list for templated compounds.
     *
     * @remarks
     * Contains the template parameter definitions for templated classes,
     * functions, or other templated entities. This property captures
     * template information extracted from 'templateparamlist' XML elements,
     * providing details about generic programming constructs.
     */
    templateParamList;
    /**
     * Section definitions within the compound.
     *
     * @remarks
     * Contains organised sections of members and documentation within the
     * compound. This property captures structured content extracted from
     * 'sectiondef' XML elements, providing hierarchical organisation of
     * compound members by type and visibility.
     */
    sectionDefs;
    /**
     * Table of contents for the compound documentation.
     *
     * @remarks
     * Contains the navigation structure for complex compound documentation.
     * This property captures hierarchical content organisation extracted
     * from 'tableofcontents' XML elements, providing structured navigation
     * for large documentation entities.
     */
    tableOfContents;
    // innerModules
    /**
     * Inner folder references contained within this compound.
     *
     * @remarks
     * Contains references to subdirectories or folders that are logically
     * contained within this compound. This property captures hierarchical
     * folder structure extracted from 'innerdir' XML elements, typically
     * used for directory-based documentation organisation.
     */
    innerDirs;
    /**
     * Inner file references contained within this compound.
     *
     * @remarks
     * Contains references to files that are logically contained within this
     * compound. This property captures file relationships extracted from
     * 'innerfile' XML elements, providing visibility into compound-to-file
     * associations in the documentation structure.
     */
    innerFiles;
    /**
     * Inner class references contained within this compound.
     *
     * @remarks
     * Contains references to classes, structures, or other class-like
     * entities that are defined within this compound. This property captures
     * nested type relationships extracted from 'innerclass' XML elements,
     * supporting hierarchical type documentation.
     */
    innerClasses;
    // innerConcepts
    /**
     * Inner namespace references contained within this compound.
     *
     * @remarks
     * Contains references to namespaces that are nested within this compound.
     * This property captures namespace hierarchy relationships extracted from
     * 'innernamespace' XML elements, supporting multi-level namespace
     * documentation organisation.
     */
    innerNamespaces;
    /**
     * Inner page references contained within this compound.
     *
     * @remarks
     * Contains references to documentation pages that are logically
     * associated with this compound. This property captures page
     * relationships extracted from 'innerpage' XML elements, supporting
     * structured documentation navigation.
     */
    innerPages;
    /**
     * Inner group references contained within this compound.
     *
     * @remarks
     * Contains references to documentation groups that are associated with
     * this compound. This property captures group relationships extracted
     * from 'innergroup' XML elements, supporting thematic organisation of
     * related documentation elements.
     */
    innerGroups;
    /**
     * Program listing or source code for the compound.
     *
     * @remarks
     * Contains the actual source code implementation or listing for the
     * compound when available. This property captures code content extracted
     * from 'programlisting' XML elements, providing syntax-highlighted
     * source code display in the documentation.
     */
    programListing;
    /**
     * Location information for the compound definition.
     *
     * @remarks
     * Contains file path, line number, and other location details for where
     * the compound is defined in the source code. This property captures
     * location metadata extracted from 'location' XML elements, enabling
     * source code navigation and reference linking.
     */
    location;
    /**
     * Complete list of all members contained in the compound.
     *
     * @remarks
     * Contains a comprehensive list of all members (methods, properties,
     * etc.) that belong to this compound, including inherited members.
     * This property captures member information extracted from
     * 'listofallmembers' XML elements for complete API documentation.
     */
    listOfAllMembers;
    // Mandatory attributes.
    /**
     * Unique identifier for the compound.
     *
     * @remarks
     * Contains the unique ID assigned to this compound by Doxygen for
     * cross-referencing and linking purposes. This identifier is mandatory
     * and serves as the primary key for compound identification throughout
     * the documentation system.
     */
    id = '';
    /**
     * The kind or type of compound.
     *
     * @remarks
     * Specifies the compound type using DoxCompoundKind enumeration values
     * such as 'class', 'struct', 'file', 'namespace', 'page', etc. This
     * mandatory attribute determines how the compound should be processed
     * and displayed in the documentation output.
     */
    kind = ''; // DoxCompoundKind
    // Optional attributes.
    /**
     * Programming language of the compound.
     *
     * @remarks
     * Specifies the programming language using DoxLanguage enumeration
     * values when the compound is language-specific. This optional attribute
     * enables language-aware processing and appropriate syntax highlighting
     * in the generated documentation.
     */
    language; // DoxLanguage
    // WARNING: This attribute is not marked as optional, but is not present.
    /**
     * Protection level of the compound.
     *
     * @remarks
     * Specifies the access protection level (public, private, protected)
     * for the compound using DoxProtectionKind enumeration values. Note
     * that whilst this attribute is not marked as optional in the XML
     * schema, it may not be present in all compound definitions.
     */
    prot;
    /**
     * Indicates whether the compound is marked as final.
     *
     * @remarks
     * Specifies that the compound cannot be inherited from or extended,
     * typically used in object-oriented programming languages that support
     * final classes or sealed types. This boolean attribute reflects the
     * final modifier in the source code.
     */
    final;
    /**
     * Indicates whether the compound is inline.
     *
     * @remarks
     * Specifies that the compound is defined inline, typically used for
     * functions, methods, or other constructs that are implemented directly
     * in header files. This boolean attribute reflects inline declarations
     * in the source code.
     */
    inline;
    /**
     * Indicates whether the compound is sealed.
     *
     * @remarks
     * Specifies that the compound is sealed and cannot be inherited from,
     * similar to final but using different language-specific terminology.
     * This boolean attribute reflects sealed modifiers found in languages
     * like C# or other object-oriented programming environments.
     */
    sealed;
    /**
     * Indicates whether the compound is abstract.
     *
     * @remarks
     * Specifies that the compound is abstract and cannot be instantiated
     * directly, typically requiring concrete implementations of abstract
     * methods or properties. This boolean attribute reflects abstract
     * modifiers in object-oriented programming languages.
     */
    abstract;
    // Not in xsd.
    // parentId: string = ''
    // permalink: string = ''
    /**
     * Constructs a new compound definition data model instance.
     *
     * @remarks
     * Parses the complete XML structure for compound definitions, processing
     * all elements and attributes according to the Doxygen XML schema. This
     * includes handling optional and mandatory elements, complex nested
     * structures, and comprehensive attribute validation to ensure data
     * integrity throughout the parsing process.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        // console.log(util.inspect(element, { compact: false, depth: 999 })
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
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
                this.baseCompoundRefs ??= [];
                this.baseCompoundRefs.push(new BaseCompoundRefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'derivedcompoundref')) {
                this.derivedCompoundRefs ??= [];
                this.derivedCompoundRefs.push(new DerivedCompoundRefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'includes')) {
                // console.log(util.inspect(item))
                this.includes ??= [];
                this.includes.push(new IncludesDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'includedby')) {
                // console.log(util.inspect(item))
                this.includedBy ??= [];
                this.includedBy.push(new IncludedByDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'incdepgraph')) {
                // TODO: Ignored, not used for now.
            }
            else if (xml.hasInnerElement(innerElement, 'invincdepgraph')) {
                // TODO: Ignored, not used for now.
            }
            else if (xml.hasInnerElement(innerElement, 'innerdir')) {
                this.innerDirs ??= [];
                this.innerDirs.push(new InnerDirDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerfile')) {
                this.innerFiles ??= [];
                this.innerFiles.push(new InnerFileDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerclass')) {
                this.innerClasses ??= [];
                this.innerClasses.push(new InnerClassDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innernamespace')) {
                this.innerNamespaces ??= [];
                this.innerNamespaces.push(new InnerNamespaceDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innerpage')) {
                this.innerPages ??= [];
                this.innerPages.push(new InnerPageDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'innergroup')) {
                this.innerGroups ??= [];
                this.innerGroups.push(new InnerGroupDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
                this.templateParamList = new TemplateParamListDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'sectiondef')) {
                this.sectionDefs ??= [];
                this.sectionDefs.push(new SectionDefDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'tableofcontents')) {
                this.tableOfContents = new TableOfContentsDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'inheritancegraph')) {
                // TODO: Ignored, not used for now.
            }
            else if (xml.hasInnerElement(innerElement, 'collaborationgraph')) {
                // TODO: Ignored, not used for now.
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
        // Moved down, depends on kind.
        // assert(this.compoundName.length > 0)
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
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
        // WARNING: The attribute is not marked as optional, but is not present.
        // assert(this.prot.length > 0)
        if (this.kind !== 'namespace') {
            assert(this.compoundName.length > 0);
        }
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="compounddef" type="compounddefType" minOccurs="0" />
/**
 * Concrete implementation of compound definition data model.
 *
 * @remarks
 * Provides the primary data model implementation for Doxygen compound
 * definitions, handling all types of compounds including classes, structures,
 * files, namespaces, and pages. This class serves as the main entry point
 * for processing compound definition XML elements in the Doxygen output.
 *
 * @public
 */
export class CompoundDefDataModel extends AbstractCompoundDefType {
    /**
     * Constructs a new CompoundDefDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'compounddef' XML elements by delegating
     * to the parent constructor with the appropriate element name. This
     * represents the root element for all compound definitions in Doxygen XML
     * output.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'compounddef');
    }
}
// ----------------------------------------------------------------------------
// <xsd:complexType name="docHtmlOnlyType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="block" type="xsd:string" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>
/**
 * Abstract base class for HTML-only documentation content.
 *
 * @remarks
 * Represents content that should only be rendered in HTML output formats,
 * providing a mechanism for format-specific content inclusion in Doxygen
 * documentation. This class handles the 'docHtmlOnlyType' XML schema
 * structure with text content and optional block attributes.
 *
 * @public
 */
export class AbstractDocHtmlOnlyType extends AbstractDataModelBase {
    text = '';
    block;
    /**
     * Constructs a new HTML-only content data model instance.
     *
     * @remarks
     * Parses HTML-only content elements from Doxygen XML output, extracting
     * the text content and any optional block attributes. This content is
     * intended for rendering only in HTML-based output formats whilst being
     * excluded from other documentation formats.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     * @param elementName - The name of the XML element being processed
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        assert(xml.isInnerElementText(element, elementName));
        this.text = xml.getInnerElementText(element, elementName);
        // ------------------------------------------------------------------------
        // Process attributes.
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
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="htmlonly" type="docHtmlOnlyType" />
/**
 * Data model for HTML-only content elements.
 *
 * @remarks
 * Represents content that should only be included in HTML output formats,
 * typically used for web-specific markup or styling that is not appropriate
 * for other documentation formats. This implementation handles the 'htmlonly'
 * XML element from Doxygen output.
 *
 * @public
 */
export class HtmlOnlyDataModel extends AbstractDocHtmlOnlyType {
    /**
     * Constructs a new HtmlOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'htmlonly' XML elements, which contain
     * content specifically intended for HTML output rendering only.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'htmlonly');
    }
}
// Normally strings are properties, but these are unusual, so we keep them
// as objects.
// <xsd:element name="manonly" type="xsd:string" />
// <xsd:element name="xmlonly" type="xsd:string" />
// <xsd:element name="rtfonly" type="xsd:string" />
// <xsd:element name="latexonly" type="xsd:string" />
// <xsd:element name="docbookonly" type="xsd:string" />
/**
 * Data model for manual-only content elements.
 *
 * @remarks
 * Represents content that should only be included in manual page output
 * formats. This class handles string content specifically intended for
 * Unix manual page generation whilst excluding it from other documentation
 * formats.
 *
 * @public
 */
export class ManOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new ManOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'manonly' XML elements containing
     * content specifically intended for manual page output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'manonly');
    }
}
/**
 * Data model for XML-only content elements.
 *
 * @remarks
 * Represents content that should only be included in XML output formats.
 * This class handles string content specifically intended for XML-based
 * documentation generation whilst excluding it from other output formats.
 *
 * @public
 */
export class XmlOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new XmlOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'xmlonly' XML elements containing
     * content specifically intended for XML output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'xmlonly');
    }
}
/**
 * Data model for RTF-only content elements.
 *
 * @remarks
 * Represents content that should only be included in Rich Text Format (RTF)
 * output. This class handles string content specifically intended for RTF
 * document generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export class RtfOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new RtfOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'rtfonly' XML elements containing
     * content specifically intended for RTF output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'rtfonly');
    }
}
/**
 * Data model for LaTeX-only content elements.
 *
 * @remarks
 * Represents content that should only be included in LaTeX output formats.
 * This class handles string content specifically intended for LaTeX document
 * generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export class LatexOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new LatexOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'latexonly' XML elements containing
     * content specifically intended for LaTeX output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'latexonly');
    }
}
/**
 * Data model for DocBook-only content elements.
 *
 * @remarks
 * Represents content that should only be included in DocBook output formats.
 * This class handles string content specifically intended for DocBook XML
 * document generation whilst excluding it from other documentation formats.
 *
 * @public
 */
export class DocBookOnlyDataModel extends AbstractStringType {
    /**
     * Constructs a new DocBookOnlyDataModel instance.
     *
     * @remarks
     * Creates a data model object for 'docbookonly' XML elements containing
     * content specifically intended for DocBook output rendering.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The XML element object to parse
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'docbookonly');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=compounddef-dm.js.map