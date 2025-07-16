import assert from 'node:assert';
import * as util from 'node:util';
import { CompoundDefDataModel } from './compounddef-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractDoxygenType extends AbstractDataModelBase {
    version = '';
    lang = '';
    compoundDefs;
    noNamespaceSchemaLocation;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'compounddef')) {
                if (this.compoundDefs === undefined) {
                    this.compoundDefs = [];
                }
                this.compoundDefs.push(new CompoundDefDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
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
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.version.length > 0);
        assert(this.lang.length > 0);
    }
}
export class DoxygenDataModel extends AbstractDoxygenType {
    constructor(xml, element) {
        super(xml, element, 'doxygen');
    }
}
//# sourceMappingURL=doxygentype-dm.js.map