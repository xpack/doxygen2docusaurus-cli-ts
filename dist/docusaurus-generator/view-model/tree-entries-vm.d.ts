import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
import { Namespace } from './namespaces-vm.js';
import { File } from './files-and-folders-vm.js';
export declare class TreeEntryBase {
    /** @brief The short name shown in the left part of the index lines. */
    name: string;
    /** @brief The full name, used internally as the second sort criteria. */
    longName: string;
    /** @brief The internal id, used to compute the permalink. */
    id: string;
    /**
     * @brief The compound or member kind.
     *
     * @details
     * classes: `class`, `struct`, `union`
     * namespaces: `namespace`
     * members: `function`, `variable`, `typedef`, `enum`, ...
     * enumvalue: `enumvalue`
     * */
    kind: string;
    /** @brief displayed outside the link */
    linkKind: string;
    /** @brief The name of the linked target object. */
    linkName: string;
    /** @brief The short name of the linked target object, to be compared with name. */
    comparableLinkName: string;
    /** @brief The URL of the target object, including the anchor. */
    permalink?: string | undefined;
    constructor(entry: Class | Namespace | Member | EnumValue);
}
export declare class ClassTreeEntry extends TreeEntryBase {
    constructor(entry: Class | Member | EnumValue, classs: Class);
}
export declare class NamespaceTreeEntry extends TreeEntryBase {
    constructor(entry: Namespace | Class | Member | EnumValue, namespace: Namespace);
}
export declare class FileTreeEntry extends TreeEntryBase {
    constructor(entry: Namespace | Class | Member | EnumValue, file: File);
}
