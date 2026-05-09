import assert from 'node:assert';
import { AbstractCompoundDefType } from '../../doxygen/data-model/compounds/compounddef-dm.js';
import { TocItemDataModel, TocListDataModel, } from '../../doxygen/data-model/compounds/tableofcontentstype-dm.js';
import { AbstractDataModelBase } from '../../doxygen/data-model/types.js';
import { Classes } from './classes-vm.js';
import { DescriptionAnchor, DescriptionTocItem, DescriptionTocList, } from './description-anchors.js';
import { FilesAndFolders } from './files-and-folders-vm.js';
import { Groups } from './groups-vm.js';
import { Member } from './members-vm.js';
import { Namespaces } from './namespaces-vm.js';
import { Pages } from './pages-vm.js';
import { AbstractDocAnchorType, AbstractDocSectType, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import { stripPermalinkHexAnchor } from '../utils.js';
import { Concepts } from './concepts-vm.js';
export class ViewModel {
    options;
    workspace;
    collections;
    compoundsById = new Map();
    membersById = new Map();
    descriptionTocLists = [];
    descriptionTocItemsById = new Map();
    descriptionAnchorsById = new Map();
    constructor(workspace) {
        this.workspace = workspace;
        this.options = workspace.options;
        this.collections = new Map();
    }
    create() {
        this.collections.set('groups', new Groups(this.workspace));
        this.collections.set('namespaces', new Namespaces(this.workspace));
        this.collections.set('concepts', new Concepts(this.workspace));
        this.collections.set('classes', new Classes(this.workspace));
        this.collections.set('files', new FilesAndFolders(this.workspace));
        this.collections.set('pages', new Pages(this.workspace));
        this.createVieModelObjects();
        this.createCompoundsHierarchies();
        this.createMembersMap();
        this.initializeCompoundsLate();
        this.initializeMemberLate();
        this.validatePermalinks();
        this.cleanups();
    }
    createVieModelObjects() {
        console.log('Creating view model objects...');
        for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
            let compound = undefined;
            const { kind } = compoundDefDataModel;
            const collectionName = this.workspace.collectionNamesByKind[kind];
            const collection = this.collections.get(collectionName);
            if (collection !== undefined) {
                if (this.options.debug) {
                    console.log(compoundDefDataModel.kind, compoundDefDataModel.compoundName);
                }
                compound = collection.addChild(compoundDefDataModel);
                this.compoundsById.set(compound.id, compound);
            }
            if (compound !== undefined) {
                if (compoundDefDataModel instanceof AbstractCompoundDefType &&
                    compoundDefDataModel.detailedDescription !== undefined) {
                    this.findDescriptionIdsRecursively(compound, compoundDefDataModel.detailedDescription);
                }
            }
            else {
                console.error('compoundDefDataModel', compoundDefDataModel.kind, 'not implemented yet in', this.constructor.name, 'createVieModelObjects');
            }
        }
        if (this.options.verbose) {
            console.log(this.compoundsById.size, 'compound definitions');
        }
    }
    findDescriptionIdsRecursively(compound, element) {
        if (element.children === undefined) {
            return;
        }
        for (const childDataModel of element.children) {
            if (childDataModel instanceof TocListDataModel) {
                const tocList = new DescriptionTocList(compound);
                assert(childDataModel.tocItems !== undefined);
                for (const tocItemDataModel of childDataModel.tocItems) {
                    if (tocItemDataModel instanceof TocItemDataModel) {
                        const tocItem = new DescriptionTocItem(tocItemDataModel.id, tocList);
                        tocList.tocItems.push(tocItem);
                        this.descriptionTocItemsById.set(tocItem.id, tocItem);
                    }
                }
                this.descriptionTocLists.push(tocList);
            }
            else if (childDataModel instanceof AbstractDocSectType) {
                if (childDataModel.id !== undefined) {
                    const anchor = new DescriptionAnchor(compound, childDataModel.id);
                    this.descriptionAnchorsById.set(anchor.id, anchor);
                }
                this.findDescriptionIdsRecursively(compound, childDataModel);
            }
            else if (childDataModel instanceof AbstractDocAnchorType) {
                if (childDataModel.id.length > 0) {
                    const section = new DescriptionAnchor(compound, childDataModel.id);
                    this.descriptionAnchorsById.set(section.id, section);
                }
            }
            else if (childDataModel instanceof AbstractDataModelBase) {
                this.findDescriptionIdsRecursively(compound, childDataModel);
            }
        }
    }
    createCompoundsHierarchies() {
        if (this.options.verbose) {
            console.log();
        }
        console.log('Creating compounds hierarchies...');
        for (const [collectionName, collection] of this.collections) {
            collection.createCompoundsHierarchies();
        }
    }
    initializeCompoundsLate() {
        if (this.options.verbose) {
            console.log();
        }
        console.log('Performing compounds late initializations...');
        for (const [collectionName, collection] of this.collections) {
            for (const [, compound] of collection.collectionCompoundsById) {
                if (this.options.debug) {
                    console.log(compound.kind, compound.compoundName);
                }
                compound.initializeLate();
            }
        }
    }
    createMembersMap() {
        if (this.options.verbose) {
            console.log();
        }
        console.log('Creating member definitions map...');
        for (const [, compound] of this.compoundsById) {
            for (const section of compound.sections) {
                for (const member of section.indexMembers) {
                    if (member instanceof Member) {
                        const memberCompoundId = stripPermalinkHexAnchor(member.id);
                        if (memberCompoundId !== compound.id) {
                        }
                        else {
                            if (this.membersById.has(member.id)) {
                                if (this.options.verbose) {
                                    console.warn('member already in map', member.id, 'in', this.membersById.get(member.id)?.name);
                                }
                            }
                            else {
                                this.membersById.set(member.id, member);
                            }
                        }
                    }
                }
            }
        }
        if (this.options.verbose) {
            console.log(this.membersById.size, 'member definitions');
        }
    }
    initializeMemberLate() {
        if (this.options.verbose) {
            console.log();
        }
        console.log('Performing members late initializations...');
        for (const [, compound] of this.compoundsById) {
            if (this.options.debug) {
                console.log(compound.kind, compound.compoundName, compound.id);
            }
            for (const section of compound.sections) {
                section.initializeLate();
                if (this.options.debug) {
                    console.log('  ', section.kind);
                }
                for (const member of section.indexMembers) {
                    if (member instanceof Member) {
                        if (this.options.debug) {
                            console.log('    ', member.kind, member.id);
                        }
                        member.initializeLate();
                    }
                }
            }
        }
    }
    validatePermalinks() {
        if (this.options.verbose) {
            console.log();
        }
        console.log('Validating permalinks...');
        const pagePermalinksById = new Map();
        const compoundsByPermalink = new Map();
        for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
            const { id } = compoundDefDataModel;
            if (pagePermalinksById.has(id)) {
                console.warn('Duplicate id', id);
            }
            const compound = this.compoundsById.get(id);
            if (compound === undefined) {
                console.error('compoundDefDataModel', id, 'not yet processed in', this.constructor.name, 'validatePermalinks');
                continue;
            }
            const permalink = compound.relativePermalink;
            if (permalink !== undefined) {
                let compoundsMap = compoundsByPermalink.get(permalink);
                if (compoundsMap === undefined) {
                    compoundsMap = new Map();
                    compoundsByPermalink.set(permalink, compoundsMap);
                }
                pagePermalinksById.set(id, permalink);
                if (!compoundsMap.has(compound.id)) {
                    compoundsMap.set(compound.id, compound);
                }
            }
        }
        for (const [permalink, compoundsMap] of compoundsByPermalink) {
            if (compoundsMap.size > 1) {
                if (this.options.verbose) {
                    console.warn('Permalink', permalink, 'has', compoundsMap.size, 'occurrences:');
                }
                let count = 1;
                for (const [, compound] of compoundsMap) {
                    const suffix = `-${count.toString()}`;
                    count += 1;
                    assert(compound.relativePermalink !== undefined);
                    compound.relativePermalink += suffix;
                    assert(compound.sidebarId !== undefined);
                    compound.sidebarId += suffix;
                    if (this.options.verbose) {
                        console.warn('-', compound.relativePermalink, compound.id);
                    }
                }
            }
        }
    }
    cleanups() {
        for (const [, compound] of this.compoundsById) {
            compound._private._compoundDef = undefined;
        }
    }
}
//# sourceMappingURL=view-model.js.map