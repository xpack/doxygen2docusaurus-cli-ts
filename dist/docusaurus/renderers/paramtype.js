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
import * as util from 'node:util';
import { ElementLinesRendererBase } from './element-renderer-base.js';
// ----------------------------------------------------------------------------
// <xsd:complexType name="paramType">
//   <xsd:sequence>
//     <xsd:element name="attributes" type="xsd:string" minOccurs="0" />
//     <xsd:element name="type" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="declname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defname" type="xsd:string" minOccurs="0" />
//     <xsd:element name="array" type="xsd:string" minOccurs="0" />
//     <xsd:element name="defval" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="typeconstraint" type="linkedTextType" minOccurs="0" />
//     <xsd:element name="briefdescription" type="descriptionType"
//        minOccurs="0" />
//   </xsd:sequence>
// </xsd:complexType>
export class ParamTypeLinesRenderer extends ElementLinesRendererBase {
    renderToLines(element, type) {
        // console.log(util.inspect(element, { compact: false, depth: 999 }))
        if (element.attributes !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property attributes not yet rendered in', this.constructor.name);
        }
        if (element.defname !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property defname not yet rendered in', this.constructor.name);
        }
        if (element.typeconstraint !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property typeconstraint not yet rendered in', this.constructor.name);
        }
        if (element.briefdescription !== undefined) {
            console.error(util.inspect(element, { compact: false, depth: 999 }));
            console.error(element.elementName, 'property briefdescription not yet rendered in', this.constructor.name);
        }
        let text = '';
        text += this.workspace.renderElementToString(element.type, type);
        if (element.declname !== undefined) {
            text += ` ${element.declname}`;
            if (element.array !== undefined) {
                text += `=${element.array}`;
            }
            if (element.defval !== undefined) {
                text += `=${this.workspace.renderElementToString(element.defval, type)}`;
            }
        }
        return [text];
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=paramtype.js.map