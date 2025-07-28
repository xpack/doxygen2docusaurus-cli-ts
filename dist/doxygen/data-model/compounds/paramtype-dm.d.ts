import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { BriefDescriptionDataModel } from './descriptiontype-dm.js';
import { DefValDataModel, TypeDataModel, TypeConstraintDataModel } from './linkedtexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractParamType extends AbstractDataModelBase {
    attributes?: string | undefined;
    type?: TypeDataModel | undefined;
    declname?: string | undefined;
    defname?: string | undefined;
    array?: string | undefined;
    defval?: DefValDataModel | undefined;
    typeconstraint?: TypeConstraintDataModel | undefined;
    briefdescription?: BriefDescriptionDataModel | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class ParamDataModel extends AbstractParamType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=paramtype-dm.d.ts.map