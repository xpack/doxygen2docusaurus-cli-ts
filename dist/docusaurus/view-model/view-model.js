/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------
/**
 * @public
 */
export class ViewModel {
    options;
    workspace;
    // The key is one of the above collection names.
    // groups, classes, namespaces, files, pages.
    collections;
    // View model objects.
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
    // --------------------------------------------------------------------------
    createVieModelObjects() {
        console.log('Creating view model objects...');
        for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
            let compound = undefined;
            const { kind } = compoundDefDataModel;
            const collectionName = this.workspace.collectionNamesByKind[kind];
            const collection = this.collections.get(collectionName);
            if (collection !== undefined) {
                // Create the compound object and add it to the parent collection.
                // console.log(
                //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
                // )
                compound = collection.addChild(compoundDefDataModel);
                // Also add it to the global compounds map.
                this.compoundsById.set(compound.id, compound);
                // console.log('compoundsById.set', compound.kind, compound.id)
            }
            if (compound !== undefined) {
                if (compoundDefDataModel instanceof AbstractCompoundDefType &&
                    compoundDefDataModel.detailedDescription !== undefined) {
                    this.findDescriptionIdsRecursively(compound, compoundDefDataModel.detailedDescription);
                }
            }
            else {
                // console.error(
                //   util.inspect(compoundDefDataModel, { compact: false, depth: 999 })
                // )
                console.error('compoundDefDataModel', compoundDefDataModel.kind, 'not implemented yet in', this.constructor.name, 'createVieModelObjects');
            }
        }
        if (this.options.verbose) {
            console.log(this.compoundsById.size, 'compound definitions');
        }
        // console.log(this.descriptionTocLists)
    }
    findDescriptionIdsRecursively(compound, element) {
        // console.log(compound.id, typeof element)
        if (element.children === undefined) {
            return;
        }
        for (const childDataModel of element.children) {
            if (childDataModel instanceof TocListDataModel) {
                const tocList = new DescriptionTocList(compound);
                // console.log(elementChild)
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
                // console.log(childDataModel)
                if (childDataModel.id.length > 0) {
                    const section = new DescriptionAnchor(compound, childDataModel.id);
                    this.descriptionAnchorsById.set(section.id, section);
                }
            }
            else if (childDataModel instanceof AbstractDataModelBase) {
                // if (childDataModel instanceof AbstractDocEntryType) {
                //   console.log(childDataModel)
                // }
                this.findDescriptionIdsRecursively(compound, childDataModel);
            }
        }
    }
    // --------------------------------------------------------------------------
    createCompoundsHierarchies() {
        console.log('Creating compounds hierarchies...');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [collectionName, collection] of this.collections) {
            // console.log('createHierarchies:', collectionName)
            collection.createCompoundsHierarchies();
        }
    }
    // --------------------------------------------------------------------------
    // Required since references can be resolved only after all objects are in.
    initializeCompoundsLate() {
        console.log('Performing compounds late initializations...');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [collectionName, collection] of this.collections) {
            // console.log('createHierarchies:', collectionName)
            for (const [, compound] of collection.collectionCompoundsById) {
                if (this.options.debug) {
                    console.log(compound.kind, compound.compoundName);
                }
                compound.initializeLate();
            }
        }
    }
    // --------------------------------------------------------------------------
    createMembersMap() {
        console.log('Creating member definitions map...');
        for (const [, compound] of this.compoundsById) {
            // console.log(compound.kind, compound.compoundName, compound.id)
            for (const section of compound.sections) {
                // console.log('  ', sectionDef.kind)
                for (const member of section.indexMembers) {
                    if (member instanceof Member) {
                        const memberCompoundId = stripPermalinkHexAnchor(member.id);
                        if (memberCompoundId !== compound.id) {
                            // Skip member definitions from different compounds.
                            // Hopefully they are defined properly there.
                            // console.log(
                            //   'member from another compound', compoundId, 'skipped'
                            // )
                        }
                        else {
                            // console.log('    ', memberDef.kind, memberDef.id)
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
    // --------------------------------------------------------------------------
    // Required since references can be resolved only after all objects are in.
    initializeMemberLate() {
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
    // --------------------------------------------------------------------------
    /**
     * @brief Validate the uniqueness of permalinks.
     */
    validatePermalinks() {
        console.log('Validating permalinks...');
        const pagePermalinksById = new Map();
        const compoundsByPermalink = new Map();
        for (const compoundDefDataModel of this.workspace.dataModel.compoundDefs) {
            // console.log(
            //   compoundDefDataModel.kind, compoundDefDataModel.compoundName
            // )
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
                // console.log('permalink:', permalink)
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
                    assert(compound.docusaurusId !== undefined);
                    compound.docusaurusId += suffix;
                    if (this.options.verbose) {
                        console.warn('-', compound.relativePermalink, compound.id);
                    }
                }
            }
        }
    }
    // --------------------------------------------------------------------------
    cleanups() {
        for (const [, compound] of this.compoundsById) {
            compound._private._compoundDef = undefined;
        }
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=view-model.js.map