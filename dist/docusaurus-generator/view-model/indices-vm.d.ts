import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
export declare class IndexEntry {
    name: string;
    kind: string;
    objectKind: string;
    longName: string;
    className?: string;
    permalink: string | undefined;
    id: string;
    constructor(object: Class | Member | EnumValue);
}
