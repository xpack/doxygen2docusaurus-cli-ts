import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractReferenceType extends AbstractDataModelBase {
    text: string;
    refid: string;
    startline: Number | undefined;
    endline: Number | undefined;
    compoundref?: string | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
/**
 * @public
 */
export declare class ReferenceDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
/**
 * @public
 */
export declare class ReferencedByDataModel extends AbstractReferenceType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
//# sourceMappingURL=referencetype-dm.d.ts.map