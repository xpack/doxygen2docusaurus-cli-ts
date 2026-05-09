import { Class } from './classes-vm.js';
import { EnumValue, Member } from './members-vm.js';
import { Namespace } from './namespaces-vm.js';
import { sanitizeAnonymousNamespace } from '../utils.js';
import { Concept } from './concepts-vm.js';
export class TreeEntryBase {
    name = '???';
    longName = '???';
    id;
    kind = '???';
    linkKind = '';
    linkName = '???';
    comparableLinkName = '';
    permalink;
    grouptPermalink;
    constructor(entry) {
        this.id = entry.id;
        if (entry instanceof Class) {
            const { collection, treeEntryName, fullyQualifiedName, kind } = entry;
            this.name = collection.workspace.renderString(treeEntryName, 'html');
            this.longName = fullyQualifiedName;
            this.kind = kind;
            this.linkKind = kind;
            this.linkName = fullyQualifiedName;
            this.permalink = collection.workspace.getPermalink({
                refid: this.id,
                kindref: 'compound',
            });
        }
        else if (entry instanceof Namespace) {
            const { treeEntryName, unqualifiedName, kind, collection } = entry;
            this.name = treeEntryName;
            this.longName = unqualifiedName;
            this.kind = kind;
            this.linkKind = kind;
            this.linkName = treeEntryName;
            this.permalink = collection.workspace.getPermalink({
                refid: this.id,
                kindref: 'compound',
            });
        }
        else if (entry instanceof Concept) {
            const { treeEntryName, unqualifiedName, kind, collection } = entry;
            this.name = treeEntryName;
            this.longName = unqualifiedName;
            this.kind = kind;
            this.linkKind = kind;
            this.linkName = treeEntryName;
            this.permalink = collection.workspace.getPermalink({
                refid: this.id,
                kindref: 'compound',
            });
        }
        else if (entry instanceof Member) {
            const { name, qualifiedName, kind, section } = entry;
            this.name = name;
            this.longName = qualifiedName ?? '???';
            this.kind = kind;
            this.permalink = section.compound.collection.workspace.getPermalink({
                refid: this.id,
                kindref: 'member',
            });
            if (this.kind === 'function') {
                this.name += '()';
            }
        }
        else if (entry instanceof EnumValue) {
            const { name, member } = entry;
            this.name = name;
            this.longName = name;
            this.kind = 'enumvalue';
            this.permalink =
                member.section.compound.collection.workspace.getPermalink({
                    refid: this.id,
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
        this.grouptPermalink = collection.workspace.getPermalink({
            refid: clazz.id,
            kindref: 'compound',
        });
    }
}
export class NamespaceTreeEntry extends TreeEntryBase {
    constructor(entry, namespace) {
        super(entry);
        this.linkKind = 'namespace';
        this.linkName = sanitizeAnonymousNamespace(namespace.compoundName);
        const { treeEntryName } = namespace;
        this.comparableLinkName = treeEntryName;
        this.grouptPermalink = namespace.collection.workspace.getPermalink({
            refid: namespace.id,
            kindref: 'compound',
        });
    }
}
export class FileTreeEntry extends TreeEntryBase {
    constructor(entry, file) {
        super(entry);
        this.linkKind = 'file';
        const { relativePath } = file;
        this.linkName = relativePath;
        this.grouptPermalink = file.collection.workspace.getPermalink({
            refid: file.id,
            kindref: 'compound',
        });
    }
}
export class ConceptEntry extends TreeEntryBase {
    constructor(entry) {
        super(entry);
        if (entry.parent !== undefined) {
            this.linkKind = 'namespace';
            this.linkName = entry.parent.compoundName;
            this.grouptPermalink = entry.collection.workspace.getPermalink({
                refid: entry.parent.id,
                kindref: 'compound',
            });
        }
        else {
            this.linkKind = 'top';
            this.linkName = 'namespace';
        }
    }
}
//# sourceMappingURL=tree-entries-vm.js.map