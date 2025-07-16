import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
import { Namespace } from './namespaces-vm.js';
import type { File } from './files-and-folders-vm.js';
export declare class TreeEntryBase {
    name: string;
    longName: string;
    id: string;
    kind: string;
    linkKind: string;
    linkName: string;
    comparableLinkName: string;
    permalink?: string | undefined;
    constructor(entry: Class | Namespace | Member | EnumValue);
}
export declare class ClassTreeEntry extends TreeEntryBase {
    constructor(entry: Class | Member | EnumValue, clazz: Class);
}
export declare class NamespaceTreeEntry extends TreeEntryBase {
    constructor(entry: Namespace | Class | Member | EnumValue, namespace: Namespace);
}
export declare class FileTreeEntry extends TreeEntryBase {
    constructor(entry: Namespace | Class | Member | EnumValue, file: File);
}
//# sourceMappingURL=tree-entries-vm.d.ts.map