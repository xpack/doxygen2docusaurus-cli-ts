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
// import assert from 'node:assert'
// import * as util from 'node:util'
import { ElementStringRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="linkedTextType" mixed="true">   <-- Character data
//                  is allowed to appear between the child elements!
//   <xsd:sequence>
//   <xsd:element name="ref" type="refTextType" minOccurs="0"
//                                              maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>
/**
 * Renderer for Doxygen linked text elements containing mixed content.
 *
 * @remarks
 * Handles complex text structures that contain both character data and
 * reference elements. Renders child elements recursively to build the
 * complete text output with embedded links.
 *
 * @public
 */
export class LinkedTextTypeStringRenderer extends ElementStringRendererBase {
    /**
     * Renders a linked text element to a formatted string.
     *
     * @remarks
     * Processes all child elements in sequence to generate the complete
     * text output with embedded references and mixed content. Maintains
     * the original order of text and reference elements.
     *
     * @param element - The linked text element to render
     * @param type - The rendering context type
     * @returns The formatted string with mixed content
     */
    renderToString(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        let text = '';
        text += this.workspace.renderElementsArrayToString(element.children, type);
        return text;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=linkedtexttype.js.map