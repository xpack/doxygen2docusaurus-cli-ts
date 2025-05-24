import { Class } from './classes-vm.js';
import { Member } from './members-vm.js';
export class IndexEntry {
    constructor(object) {
        if (object instanceof Member) {
            // console.log(object.kind, object.name)
            this.name = object.name;
            this.kind = object.kind;
            this.id = object.id;
            this.longName = object.qualifiedName ?? '???';
            this.permalink = object.section.compound.collection.workspace.getPermalink({
                refid: object.id,
                kindref: 'member'
            });
            if (this.kind === 'function') {
                this.name += '()';
                this.longName += object.argsstring;
                // console.log(object)
            }
            this.objectKind = 'member';
        }
        else if (object instanceof Class) {
            // console.log(object.kind, object.unqualifiedName)
            this.name = object.unqualifiedName;
            this.kind = object.kind;
            this.id = object.id;
            this.longName = object.fullyQualifiedName ?? '???';
            this.permalink = object.collection.workspace.getPermalink({
                refid: object.id,
                kindref: 'compound'
            });
            this.objectKind = 'compound';
        }
        else {
            console.error('object type not supported in IndexEntry');
            this.name = '?';
            this.kind = '?';
            this.objectKind = '?';
            this.longName = '?';
            this.permalink = '';
            this.id = '?';
        }
        // console.log(this)
    }
}
