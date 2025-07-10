import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractLinkedTextType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class InitializerDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TypeDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class DefValDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class TypeConstraintDataModel extends AbstractLinkedTextType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=linkedtexttype-dm.d.ts.map