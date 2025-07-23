import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractTemplateParamListType extends AbstractDataModelBase {
    params?: ParamDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
/**
 * @public
 */
export declare class TemplateParamListDataModel extends AbstractTemplateParamListType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=templateparamlisttype-dm.d.ts.map