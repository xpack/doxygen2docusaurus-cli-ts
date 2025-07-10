import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractRefType extends AbstractDataModelBase {
    text: string;
    refid: string;
    prot?: string | undefined;
    inline?: Boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class InnerModuleDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerDirDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerFileDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerClassDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerConceptDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerNamespaceDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerPageDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class InnerGroupDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
