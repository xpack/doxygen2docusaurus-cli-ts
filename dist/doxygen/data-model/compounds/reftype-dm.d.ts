import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
export declare abstract class AbstractRefType extends AbstractDataModelBase {
    text: string;
    refid: string;
    prot?: string | undefined;
    inline?: boolean | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class InnerModuleDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerDirDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerFileDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerClassDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerConceptDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerNamespaceDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerPageDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare class InnerGroupDataModel extends AbstractRefType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=reftype-dm.d.ts.map