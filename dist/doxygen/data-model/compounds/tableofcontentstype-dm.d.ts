import { DoxygenXmlParser } from '../../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
/**
 * @public
 */
export declare abstract class AbstractTableOfContentsType extends AbstractDataModelBase {
    tocSect: TocSectDataModel[] | undefined;
    tableOfContents: TableOfContentsDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class TableOfContentsDataModel extends AbstractTableOfContentsType {
    constructor(xml: DoxygenXmlParser, element: object);
}
/**
 * @public
 */
export declare abstract class AbstractTableOfContentsKindType extends AbstractDataModelBase {
    name: string;
    reference: string;
    tableOfContents: TableOfContentsDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * @public
 */
export declare class TocSectDataModel extends AbstractTableOfContentsKindType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare abstract class AbstractTocDocItemType extends AbstractDataModelBase {
    id: string;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class TocItemDataModel extends AbstractTocDocItemType {
    constructor(xml: DoxygenXmlParser, element: object);
}
export declare abstract class AbstractDocTocListType extends AbstractDataModelBase {
    tocItems?: TocItemDataModel[] | undefined;
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
export declare class TocListDataModel extends AbstractDocTocListType {
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=tableofcontentstype-dm.d.ts.map