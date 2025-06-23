import { CompoundBase } from './compound-base-vm.js';
export declare class TocList {
    compound: CompoundBase;
    tocItems: TocItem[];
    constructor(compound: CompoundBase);
}
export declare class TocItem {
    id: string;
    tocList: TocList;
    constructor(id: string, tocList: TocList);
}
