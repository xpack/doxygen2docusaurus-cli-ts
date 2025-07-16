import assert from 'node:assert';
import * as util from 'node:util';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export class AbstractTemplateParamListType extends AbstractDataModelBase {
    params;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'param')) {
                if (this.params === undefined) {
                    this.params = [];
                }
                this.params.push(new ParamDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class TemplateParamListDataModel extends AbstractTemplateParamListType {
    constructor(xml, element) {
        super(xml, element, 'templateparamlist');
    }
}
//# sourceMappingURL=templateparamlisttype-dm.js.map