import assert from 'node:assert';
import * as util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
export class AbstractLocationType extends AbstractDataModelBase {
    file = '';
    line;
    column;
    declfile;
    declline;
    declcolumn;
    bodyfile;
    bodystart;
    bodyend;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length === 0);
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        for (const attributeName of attributesNames) {
            if (attributeName === '@_file') {
                this.file = xml.getAttributeStringValue(element, '@_file');
            }
            else if (attributeName === '@_line') {
                this.line = Number(xml.getAttributeNumberValue(element, '@_line'));
            }
            else if (attributeName === '@_column') {
                this.column = Number(xml.getAttributeNumberValue(element, '@_column'));
            }
            else if (attributeName === '@_declfile') {
                this.declfile = xml.getAttributeStringValue(element, '@_declfile');
            }
            else if (attributeName === '@_declline') {
                this.declline = Number(xml.getAttributeNumberValue(element, '@_declline'));
            }
            else if (attributeName === '@_declcolumn') {
                this.declcolumn = Number(xml.getAttributeNumberValue(element, '@_declcolumn'));
            }
            else if (attributeName === '@_bodyfile') {
                this.bodyfile = xml.getAttributeStringValue(element, '@_bodyfile');
            }
            else if (attributeName === '@_bodystart') {
                this.bodystart = xml.getAttributeNumberValue(element, '@_bodystart');
            }
            else if (attributeName === '@_bodyend') {
                this.bodyend = xml.getAttributeNumberValue(element, '@_bodyend');
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.file.length > 0);
    }
}
export class LocationDataModel extends AbstractLocationType {
    constructor(xml, element) {
        super(xml, element, 'location');
    }
}
//# sourceMappingURL=locationtype-dm.js.map