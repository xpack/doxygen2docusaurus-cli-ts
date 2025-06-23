import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { AbstractDataModelBase } from '../types.js';
import { ListItemDataModel, TermDataModel } from './descriptiontype-dm.js';
export declare abstract class AbstractDocVarListEntryType extends AbstractDataModelBase {
    term: TermDataModel | undefined;
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class VarListEntryDataModel extends AbstractDocVarListEntryType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
export declare class VariableListPairDataModel extends AbstractDataModelBase {
    varlistentry: VarListEntryDataModel;
    listitem: ListItemDataModel;
    constructor(varlistentry: VarListEntryDataModel, listitem: ListItemDataModel);
}
export declare abstract class AbstractDocVariableListType extends AbstractDataModelBase {
    constructor(xml: DoxygenXmlParser, element: Object, elementName: string);
}
export declare class VariableListDataModel extends AbstractDocVariableListType {
    constructor(xml: DoxygenXmlParser, element: Object);
}
