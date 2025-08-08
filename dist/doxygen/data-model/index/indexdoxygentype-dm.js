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
import { IndexCompoundDataModel } from './indexcompoundtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// WARNING: it clashes with the definition in compound.xsd.
// <xsd:complexType name="DoxygenType">
//   <xsd:sequence>
//     <xsd:element name="compound" type="CompoundType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>
/**
 * Abstract base class for Doxygen index type data models.
 *
 * @remarks
 * Represents the top-level structure of Doxygen index XML files, corresponding
 * to the DoxygenType complex type in the XML schema. This class handles the
 * parsing of version and language attributes, along with compound element
 * collections. Note that this definition may clash with similar types in
 * compound.xsd, requiring careful namespace management.
 *
 * @public
 */
export class AbstractIndexDoxygenType extends AbstractDataModelBase {
    /**
     * The version of the Doxygen tool that generated the XML.
     *
     * @remarks
     * Mandatory attribute extracted from the XML structure that identifies
     * the version of Doxygen used to generate the documentation. This
     * information is crucial for compatibility and parsing decisions.
     */
    version = '';
    /**
     * The language specification for the documentation content.
     *
     * @remarks
     * Mandatory attribute corresponding to the xml:lang attribute in the
     * XML structure. Specifies the primary language used in the documented
     * content for internationalisation purposes.
     */
    lang = '';
    /**
     * Collection of compound data models referenced in the index.
     *
     * @remarks
     * Optional array containing compound elements found within the index
     * structure. Each compound represents a documented entity such as
     * classes, namespaces, or files that are catalogued in the index.
     */
    compounds;
    /**
     * The XML schema location reference for validation.
     *
     * @remarks
     * Optional attribute that specifies the location of the XML schema
     * definition used for validating the structure of the index XML file.
     * This provides schema validation capabilities for the parsed content.
     */
    noNamespaceSchemaLocation;
    /**
     * Constructs a new AbstractIndexDoxygenType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the Doxygen index data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract Doxygen index information
     * including compound collections and mandatory attributes (version and
     * language). The constructor validates that all required attributes are
     * present and processes compound elements into the appropriate data models.
     * Optional schema location attributes are also extracted when present.
     */
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.hasInnerElement(innerElement, 'compound')) {
                this.compounds ??= [];
                this.compounds.push(new IndexCompoundDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`index ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_version') {
                this.version = xml.getAttributeStringValue(element, '@_version');
            }
            else if (attributeName === '@_lang') {
                this.lang = xml.getAttributeStringValue(element, '@_lang');
            }
            else if (attributeName === '@_noNamespaceSchemaLocation') {
                this.noNamespaceSchemaLocation = xml.getAttributeStringValue(element, '@_noNamespaceSchemaLocation');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`index ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.version.length > 0);
        assert(this.lang.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="doxygenindex" type="DoxygenType"/>
/**
 * Concrete data model class for doxygenindex elements.
 *
 * @remarks
 * Represents the root element of Doxygen index XML files, extending the
 * abstract base class to provide specific handling for 'doxygenindex'
 * elements. This class serves as the primary entry point for parsing
 * index files and provides access to all compound definitions and
 * metadata contained within the index structure.
 *
 * @public
 */
export class DoxygenIndexDataModel extends AbstractIndexDoxygenType {
    /**
     * Constructs a new DoxygenIndexDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the doxygenindex data
     *
     * @remarks
     * Initialises the Doxygen index data model by parsing the provided XML
     * element as a 'doxygenindex' element type. The constructor delegates
     * to the parent class for common processing whilst specifying the
     * element name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'doxygenindex');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=indexdoxygentype-dm.js.map