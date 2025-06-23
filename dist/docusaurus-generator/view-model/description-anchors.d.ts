import { CompoundBase } from './compound-base-vm.js';
export declare class DescriptionAnchor {
    compound: CompoundBase;
    id: string;
    constructor(compound: CompoundBase, id: string);
}
export declare class DescriptionTocList {
    compound: CompoundBase;
    tocItems: DescriptionTocItem[];
    constructor(compound: CompoundBase);
}
export declare class DescriptionTocItem {
    id: string;
    tocList: DescriptionTocList;
    constructor(id: string, tocList: DescriptionTocList);
}
