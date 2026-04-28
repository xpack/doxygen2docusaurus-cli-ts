import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractLinkedTextType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class InitializerDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class RequiresClauseDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TypeDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class DefValDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class TypeConstraintDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=linkedtexttype-dm.d.ts.map