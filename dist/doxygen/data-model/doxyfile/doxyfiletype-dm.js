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
import { DoxygenFileOptionDataModel } from './doxyfileoptiontype-dm.js';
import { AbstractDataModelBase } from '../types.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="DoxygenFileType">
//   <xsd:sequence>
//     <xsd:element name="option" type="OptionType" minOccurs="0" maxOccurs="unbounded"/>
//   </xsd:sequence>
//   <xsd:attribute name="version" type="xsd:string" use="required"/>
//   <xsd:attribute ref="xml:lang" use="required"/>
// </xsd:complexType>
/**
 * Abstract base class for Doxygen file type data models.
 *
 * @remarks
 * Represents the structure of Doxyfile XML configurations, corresponding
 * to the DoxygenFileType complex type in the XML schema. This class handles
 * the parsing of Doxygen configuration options and mandatory attributes
 * (version and language). All concrete Doxyfile data model classes should
 * extend this abstract base to ensure consistent parsing and data
 * representation of configuration settings.
 *
 * @public
 */
export class AbstractDoxygenFileType extends AbstractDataModelBase {
    /**
     * The version of the Doxygen tool that generated the configuration.
     *
     * @remarks
     * Mandatory attribute extracted from the XML structure that identifies
     * the version of Doxygen used to generate the configuration file. This
     * information is essential for compatibility and configuration parsing
     * decisions.
     */
    version = '';
    /**
     * The language specification for the documentation configuration.
     *
     * @remarks
     * Mandatory attribute corresponding to the xml:lang attribute in the
     * XML structure. Specifies the primary language used in the configuration
     * and documentation generation process for internationalisation purposes.
     */
    lang = '';
    /**
     * Collection of configuration option data models.
     *
     * @remarks
     * Optional array containing option elements found within the Doxyfile
     * structure. Each option represents a specific configuration setting
     * that controls the behaviour of Doxygen during documentation generation.
     * The array supports zero to many options as per the XML schema.
     */
    options;
    /**
     * The XML schema location reference for validation.
     *
     * @remarks
     * Optional attribute that specifies the location of the XML schema
     * definition used for validating the structure of the Doxyfile XML.
     * This provides schema validation capabilities for the parsed
     * configuration content.
     */
    noNamespaceSchemaLocation;
    /**
     * Constructs a new AbstractDoxygenFileType instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the Doxyfile data
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Parses the provided XML element to extract Doxyfile configuration
     * information including option collections and mandatory attributes
     * (version and language). The constructor validates that all required
     * attributes are present and processes option elements into the
     * appropriate data models. Optional schema location attributes are
     * also extracted when present.
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
            else if (xml.hasInnerElement(innerElement, 'option')) {
                this.options ??= [];
                this.options.push(new DoxygenFileOptionDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`doxyfile ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
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
                console.error(`doxyfile ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.version.length > 0);
        assert(this.lang.length > 0);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="doxyfile" type="DoxygenFileType"/>
/**
 * Concrete data model class for doxyfile elements.
 *
 * @remarks
 * Represents the root element of Doxyfile XML configuration files,
 * extending the abstract base class to provide specific handling for
 * 'doxyfile' elements. This class serves as the primary entry point
 * for parsing Doxygen configuration files and provides access to all
 * configuration options and metadata contained within the file structure.
 *
 * @public
 */
export class DoxygenFileDataModel extends AbstractDoxygenFileType {
    /**
     * Constructs a new DoxygenFileDataModel instance from XML data.
     *
     * @param xml - The Doxygen XML parser instance for processing XML elements
     * @param element - The XML element containing the doxyfile data
     *
     * @remarks
     * Initialises the Doxyfile data model by parsing the provided XML element
     * as a 'doxyfile' element type. The constructor delegates to the parent
     * class for common configuration processing whilst specifying the element
     * name for proper XML structure handling.
     */
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'doxyfile');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=doxyfiletype-dm.js.map