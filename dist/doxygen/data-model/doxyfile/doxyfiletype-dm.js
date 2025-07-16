import assert from 'node:assert';
import * as util from 'node:util';
import { DoxygenFileOptionDataModel } from './doxyfileoptiontype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractDoxygenFileType extends AbstractDataModelBase {
    version = '';
    lang = '';
    options;
    noNamespaceSchemaLocation;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'option')) {
                if (this.options === undefined) {
                    this.options = [];
                }
                this.options.push(new DoxygenFileOptionDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`doxyfile ${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
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
                console.error(`doxyfile ${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.version.length > 0);
        assert(this.lang.length > 0);
    }
}
export class DoxygenFileDataModel extends AbstractDoxygenFileType {
    constructor(xml, element) {
        super(xml, element, 'doxyfile');
    }
}
//# sourceMappingURL=doxyfiletype-dm.js.map