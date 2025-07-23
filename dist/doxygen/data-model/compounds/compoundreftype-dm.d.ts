import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractCompoundRefType extends AbstractDataModelBase {
    text: string;
    prot: string;
    virt: string;
    refid?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export type DoxProtectionKind = 'public' | 'protected' | 'private' | 'package';
export type DoxVirtualKind = 'non-virtual' | 'virtual' | 'pure-virtual';
/**
 * @public
 */
export declare class BaseCompoundRefDataModel extends AbstractCompoundRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
/**
 * @public
 */
export declare class DerivedCompoundRefDataModel extends AbstractCompoundRefType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=compoundreftype-dm.d.ts.map