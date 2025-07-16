import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
import { Namespace } from './namespaces-vm.js';
import { sanitizeAnonymousNamespace } from '../utils.js';
export class TreeEntryBase {
    name = '???';
    longName = '???';
    id;
    kind = '???';
    linkKind = '';
    linkName = '???';
    comparableLinkName = '';
    permalink;
    constructor(entry) {
        if (entry instanceof Class) {
            const { id, collection, treeEntryName, fullyQualifiedName, kind } = entry;
            this.id = id;
            this.name = collection.workspace.renderString(treeEntryName, 'html');
            this.longName = fullyQualifiedName;
            this.kind = kind;
            this.linkKind = kind;
            this.linkName = fullyQualifiedName;
            this.permalink = collection.workspace.getPermalink({
                refid: id,
                kindref: 'compound',
            });
        }
        else if (entry instanceof Namespace) {
            const { id, treeEntryName, unqualifiedName, kind, collection } = entry;
            this.id = id;
            this.name = treeEntryName;
            this.longName = unqualifiedName;
            this.kind = kind;
            this.linkKind = kind;
            this.linkName = treeEntryName;
            this.permalink = collection.workspace.getPermalink({
                refid: id,
                kindref: 'compound',
            });
        }
        else if (entry instanceof Member) {
            const { id, name, qualifiedName, kind, section } = entry;
            this.id = id;
            this.name = name;
            this.longName = qualifiedName ?? '???';
            this.kind = kind;
            this.permalink = section.compound.collection.workspace.getPermalink({
                refid: id,
                kindref: 'member',
            });
            if (this.kind === 'function') {
                this.name += '()';
            }
        }
        else if (entry instanceof EnumValue) {
            const { id, name, member } = entry;
            this.id = id;
            this.name = name;
            this.longName = name;
            this.kind = 'enumvalue';
            this.permalink =
                member.section.compound.collection.workspace.getPermalink({
                    refid: id,
                    kindref: 'member',
                });
        }
        else {
            this.id = '???';
            console.error('object type', typeof entry, 'not supported in', this.constructor.name);
        }
    }
}
export class ClassTreeEntry extends TreeEntryBase {
    constructor(entry, clazz) {
        super(entry);
        const { kind, classFullName, collection, treeEntryName } = clazz;
        this.linkKind = kind;
        this.linkName = classFullName;
        this.comparableLinkName = collection.workspace.renderString(treeEntryName, 'html');
    }
}
export class NamespaceTreeEntry extends TreeEntryBase {
    constructor(entry, namespace) {
        super(entry);
        this.linkKind = 'namespace';
        this.linkName = sanitizeAnonymousNamespace(namespace.compoundName);
        const { treeEntryName } = namespace;
        this.comparableLinkName = treeEntryName;
    }
}
export class FileTreeEntry extends TreeEntryBase {
    constructor(entry, file) {
        super(entry);
        this.linkKind = 'file';
        const { relativePath } = file;
        this.linkName = relativePath;
    }
}
//# sourceMappingURL=tree-entries-vm.js.map