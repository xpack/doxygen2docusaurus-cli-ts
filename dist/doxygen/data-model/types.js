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
/**
 * Abstract base class for all data model elements in the Doxygen XML layer.
 *
 * @remarks
 * Provides the common interface and properties for all data model elements
 * parsed from Doxygen XML files. All concrete data model classes should
 * extend this base class to ensure consistent structure and behaviour.
 *
 * @public
 */
export class AbstractDataModelBase {
    /**
     * The name of the XML element represented by this data model instance.
     *
     * @remarks
     * Used to identify the XML element type for this data model object.
     */
    elementName;
    /**
     * Indicates whether paragraph processing should be skipped for this element.
     *
     * @remarks
     * Optional property used to control paragraph handling during documentation
     * generation. If true, paragraph tags are not generated for this element.
     */
    skipPara;
    /**
     * The child elements or text nodes contained within this data model element.
     *
     * @remarks
     * Contains an array of child elements or text nodes, supporting recursive
     * data model structures for complex XML hierarchies.
     */
    children;
    /**
     * Constructs a new data model base instance for a given XML element name.
     *
     * @param elementName - The name of the XML element represented by this
     *   instance
     *
     * @remarks
     * Initialises the base data model with the specified element name. All
     * derived data model classes should call this constructor.
     */
    constructor(elementName) {
        this.elementName = elementName;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=types.js.map