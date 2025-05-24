import { Class } from './classes-vm.js';
import { Member } from './members-vm.js';
export declare class IndexEntry {
    name: string;
    kind: string;
    objectKind: string;
    longName: string;
    permalink: string;
    id: string;
    constructor(object: Member | Class);
}
