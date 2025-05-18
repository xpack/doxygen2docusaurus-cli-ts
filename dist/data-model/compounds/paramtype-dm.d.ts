import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { BriefDescriptionDataModel } from './descriptiontype-dm.js';
import { DefValDataModel, TypeDataModel, TypeConstraintDataModel } from './linkedtexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractParamType extends AbstractDataModelBase {
    attributes?: string | undefined;
    type?: TypeDataModel | undefined;
    declname?: string | undefined;
    defname?: string | undefined;
    array?: string | undefined;
    defval?: DefValDataModel | undefined;
    typeconstraint?: TypeConstraintDataModel | undefined;
    briefdescription?: BriefDescriptionDataModel | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class ParamDataModel extends AbstractParamType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
