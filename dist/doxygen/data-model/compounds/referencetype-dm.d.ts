import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractReferenceType extends AbstractDataModelBase {
    text: string;
    refid: string;
    startline: number | undefined;
    endline: number | undefined;
    compoundref?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class ReferenceDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * @public
 */
export declare class ReferencedByDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=referencetype-dm.d.ts.map