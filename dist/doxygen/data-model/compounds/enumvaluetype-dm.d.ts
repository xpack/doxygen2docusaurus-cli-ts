import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel } from './descriptiontype-dm.js';
import { InitializerDataModel } from './linkedtexttype-dm.js';
/**
 * @public
 */
export declare abstract class AbstractEnumValueType extends AbstractDataModelBase {
    name: string;
    initializer?: InitializerDataModel | undefined;
    briefDescription?: BriefDescriptionDataModel | undefined;
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    id: string;
    prot: string;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class EnumValueDataModel extends AbstractEnumValueType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=enumvaluetype-dm.d.ts.map