import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractRefTextType } from './reftexttype-dm.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractLinkedTextType extends AbstractDataModelBase {
    children: Array<string | AbstractRefTextType>;
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
