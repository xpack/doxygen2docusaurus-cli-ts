import assert from 'node:assert';
import util from 'node:util';
import { AbstractDataModelBase } from '../types.js';
import { ListItemDataModel, TermDataModel } from './descriptiontype-dm.js';
export class AbstractDocVarListEntryType extends AbstractDataModelBase {
    term;
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'term')) {
                assert(this.term === undefined);
                this.term = new TermDataModel(xml, innerElement);
            }
            else {
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.term !== undefined);
        assert(!xml.hasAttributes(element));
    }
}
export class VarListEntryDataModel extends AbstractDocVarListEntryType {
    constructor(xml, element) {
        super(xml, element, 'varlistentry');
    }
}
export class VariableListPairDataModel extends AbstractDataModelBase {
    varlistentry;
    listitem;
    constructor(varlistentry, listitem) {
        super('variablelistpair');
        this.varlistentry = varlistentry;
        this.listitem = listitem;
    }
}
export class AbstractDocVariableListType extends AbstractDataModelBase {
    constructor(xml, element, elementName) {
        super(elementName);
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        this.children = [];
        let varlistentry;
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
            }
            else if (xml.hasInnerElement(innerElement, 'varlistentry')) {
                varlistentry = new VarListEntryDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'listitem')) {
                const listitem = new ListItemDataModel(xml, innerElement);
                assert(varlistentry !== undefined);
                this.children.push(new VariableListPairDataModel(varlistentry, listitem));
                varlistentry = undefined;
            }
            else {
                console.error(util.inspect(innerElement, { compact: false, depth: 999 }));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        assert(!xml.hasAttributes(element));
    }
}
export class VariableListDataModel extends AbstractDocVariableListType {
    constructor(xml, element) {
        super(xml, element, 'variablelist');
    }
}
//# sourceMappingURL=docvarlistentrytype-dm.js.map