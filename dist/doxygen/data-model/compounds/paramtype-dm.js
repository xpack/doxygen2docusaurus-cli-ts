import assert from 'node:assert';
import * as util from 'node:util';
import { DefValDataModel, TypeDataModel, TypeConstraintDataModel, } from './linkedtexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractParamType extends AbstractDataModelBase {
    attributes;
    type;
    declname;
    defname;
    array;
    defval;
    typeconstraint;
    briefdescription;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'attributes')) {
                const attributesElements = xml.getInnerElements(innerElement, 'attributes');
                assert(attributesElements.length === 1);
                assert(attributesElements[0] !== undefined);
                this.attributes = xml.getInnerText(attributesElements[0]);
            }
            else if (xml.hasInnerElement(innerElement, 'type')) {
                this.type = new TypeDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'declname')) {
                const declnameElements = xml.getInnerElements(innerElement, 'declname');
                assert(declnameElements.length === 1);
                assert(declnameElements[0] !== undefined);
                this.declname = xml.getInnerText(declnameElements[0]);
            }
            else if (xml.hasInnerElement(innerElement, 'defname')) {
                const defnameElements = xml.getInnerElements(innerElement, 'defname');
                assert(defnameElements.length === 1);
                assert(defnameElements[0] !== undefined);
                this.declname = xml.getInnerText(defnameElements[0]);
            }
            else if (xml.hasInnerElement(innerElement, 'array')) {
                const arrayElements = xml.getInnerElements(innerElement, 'array');
                assert(arrayElements.length === 1);
                assert(arrayElements[0] !== undefined);
                this.array = xml.getInnerText(arrayElements[0]);
            }
            else if (xml.hasInnerElement(innerElement, 'defval')) {
                this.defval = new DefValDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'typeconstraint')) {
                this.typeconstraint = new TypeConstraintDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class ParamDataModel extends AbstractParamType {
    constructor(xml, element) {
        super(xml, element, 'param');
    }
}
//# sourceMappingURL=paramtype-dm.js.map