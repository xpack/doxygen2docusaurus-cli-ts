import * as util from 'node:util';
import assert from 'node:assert';
import { getPermalinkAnchor, sanitizeAnonymousNamespace } from '../utils.js';
import { MemberProgramListingDataModel, ParaDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
export const sectionHeaders = {
    typedef: ['Typedefs', 100],
    'public-type': ['Public Member Typedefs', 110],
    'protected-type': ['Protected Member Typedefs', 120],
    'private-type': ['Private Member Typedefs', 130],
    'package-type': ['Package Member Typedefs', 140],
    enum: ['Enumerations', 150],
    friend: ['Friends', 160],
    interface: ['Interfaces', 170],
    constructorr: ['Constructors', 200],
    'public-constructorr': ['Public Constructors', 200],
    'protected-constructorr': ['Protected Constructors', 210],
    'private-constructorr': ['Private Constructors', 220],
    'public-destructor': ['Public Destructor', 230],
    'protected-destructor': ['Protected Destructor', 240],
    'private-destructor': ['Private Destructor', 250],
    operator: ['Operators', 300],
    'public-operator': ['Public Operators', 310],
    'protected-operator': ['Protected Operators', 320],
    'private-operator': ['Private Operators', 330],
    'package-operator': ['Package Operators', 340],
    func: ['Functions', 350],
    function: ['Functions', 350],
    'public-func': ['Public Member Functions', 360],
    'protected-func': ['Protected Member Functions', 370],
    'private-func': ['Private Member Functions', 380],
    'package-func': ['Package Member Functions', 390],
    var: ['Variables', 400],
    variable: ['Variables', 400],
    'public-attrib': ['Public Member Attributes', 410],
    'protected-attrib': ['Protected Member Attributes', 420],
    'private-attrib': ['Private Member Attributes', 430],
    'package-attrib': ['Package Member Attributes', 440],
    'public-static-operator': ['Public Operators', 450],
    'protected-static-operator': ['Protected Operators', 460],
    'private-static-operator': ['Private Operators', 470],
    'package-static-operator': ['Package Operators', 480],
    'public-static-func': ['Public Static Functions', 500],
    'protected-static-func': ['Protected Static Functions', 510],
    'private-static-func': ['Private Static Functions', 520],
    'package-static-func': ['Package Static Functions', 530],
    'public-static-attrib': ['Public Static Attributes', 600],
    'protected-static-attrib': ['Protected Static Attributes', 610],
    'private-static-attrib': ['Private Static Attributes', 620],
    'package-static-attrib': ['Package Static Attributes', 630],
    slot: ['Slots', 700],
    'public-slot': ['Public Slots', 700],
    'protected-slot': ['Protected Slot', 710],
    'private-slot': ['Private Slot', 720],
    related: ['Related', 800],
    define: ['Macro Definitions', 810],
    prototype: ['Prototypes', 820],
    signal: ['Signals', 830],
    dcop: ['DCOP Functions', 840],
    property: ['Properties', 850],
    event: ['Events', 860],
    service: ['Services', 870],
    'user-defined': ['Definitions', 1000],
};
export class Section {
    compound;
    kind;
    headerName;
    descriptionLines;
    indexMembers = [];
    definitionMembers = [];
    _private = {};
    constructor(compound, sectionDef) {
        this._private._sectionDef = sectionDef;
        this.compound = compound;
        const { kind } = sectionDef;
        this.kind = kind;
        this.headerName = this.getHeaderNameByKind(sectionDef);
        assert(this.headerName.length > 0);
        const members = [];
        if (sectionDef.memberDefs !== undefined) {
            for (const memberDefDataModel of sectionDef.memberDefs) {
                const member = new Member(this, memberDefDataModel);
                members.push(member);
            }
        }
        if (sectionDef.members !== undefined) {
            for (const memberRef of sectionDef.members) {
                members.push(new MemberRef(this, memberRef));
            }
        }
        this.indexMembers = members;
        const definitionMembers = [];
        for (const member of this.indexMembers) {
            if (member instanceof Member) {
                definitionMembers.push(member);
            }
        }
        this.definitionMembers = definitionMembers.sort((a, b) => a.name.localeCompare(b.name));
    }
    initializeLate() {
        const { workspace } = this.compound.collection;
        assert(this._private._sectionDef !== undefined);
        const { _sectionDef: sectionDef } = this._private;
        if (sectionDef.description !== undefined) {
            this.descriptionLines = workspace.renderElementToLines(sectionDef.description, 'html');
        }
    }
    hasDefinitionMembers() {
        return this.definitionMembers.length > 0;
    }
    getHeaderNameByKind(sectionDef) {
        const { header, kind } = sectionDef;
        if (kind === 'user-defined') {
            if (header !== undefined) {
                return header.trim();
            }
            console.warn('sectionDef of kind user-defined');
            return 'User Defined';
        }
        if (header !== undefined) {
            console.warn('header', header, 'ignored in sectionDef of kind', kind);
        }
        const sectionHeader = sectionHeaders[kind];
        if (sectionHeader === undefined) {
            console.error(util.inspect(sectionDef, { compact: false, depth: 999 }));
            console.error(sectionDef.constructor.name, 'kind', kind, 'not yet rendered in', this.constructor.name, 'getHeaderNameByKind');
            return '';
        }
        return sectionHeader[0].trim();
    }
    getSectionOrderByKind() {
        const { kind } = this;
        if (kind === 'user-defined') {
            return 1000;
        }
        const header = sectionHeaders[kind];
        assert(header !== undefined);
        return header[1];
    }
    renderIndexToLines() {
        const lines = [];
        if (this.indexMembers.length > 0) {
            lines.push('');
            lines.push(`## ${this.headerName} Index`);
            lines.push('');
            lines.push('<table class="doxyMembersIndex">');
            for (const member of this.indexMembers) {
                if (member instanceof Member) {
                    lines.push(...member.renderIndexToLines());
                }
                else if (member instanceof MemberRef) {
                    const referredMember = this.compound.collection.workspace.membersById.get(member.refid);
                    assert(referredMember !== undefined);
                    lines.push(...referredMember.renderIndexToLines());
                }
            }
            lines.push('');
            lines.push('</table>');
        }
        return lines;
    }
    renderToLines() {
        const lines = [];
        if (!this.hasDefinitionMembers()) {
            return lines;
        }
        lines.push('');
        lines.push('<div class="doxySectionDef">');
        lines.push('');
        lines.push(`## ${this.headerName}`);
        if (this.descriptionLines !== undefined) {
            lines.push('');
            lines.push(...this.compound.renderDetailedDescriptionToHtmlLines({
                detailedDescriptionHtmlLines: this.descriptionLines,
                showHeader: false,
            }));
        }
        for (const member of this.definitionMembers) {
            lines.push(...member.renderToLines());
        }
        lines.push('');
        lines.push('</div>');
        return lines;
    }
}
class MemberBase {
    section;
    name;
    constructor(section, name) {
        this.section = section;
        this.name = name;
    }
    initializeLate() { }
}
export class Member extends MemberBase {
    id;
    kind;
    briefDescriptionHtmlString;
    detailedDescriptionHtmlLines;
    argsstring;
    qualifiedName;
    definition;
    type;
    initializerHtmlLines;
    locationMarkdownLines;
    templateParameters;
    enumHtmlLines;
    parametersHtmlString;
    programListing;
    referencedByMarkdownString;
    referencesMarkdownString;
    enumValues;
    labels = [];
    isTrailingType = false;
    isConstexpr = false;
    isStrong = false;
    isConst = false;
    isStatic = false;
    _private = {};
    constructor(section, memberDef) {
        super(section, memberDef.name);
        this._private._memberDef = memberDef;
        const { id, kind } = memberDef;
        this.id = id;
        this.kind = kind;
    }
    initializeLate() {
        super.initializeLate();
        const { _memberDef: memberDef } = this._private;
        assert(memberDef !== undefined);
        const { workspace } = this.section.compound.collection;
        if (memberDef.briefDescription !== undefined) {
            assert(memberDef.briefDescription.children !== undefined);
            for (const child of memberDef.briefDescription.children) {
                if (child instanceof ParaDataModel) {
                    child.skipPara = true;
                }
            }
            this.briefDescriptionHtmlString = workspace
                .renderElementToString(memberDef.briefDescription, 'html')
                .trim();
        }
        if (memberDef.detailedDescription !== undefined) {
            this.detailedDescriptionHtmlLines = workspace.renderElementToLines(memberDef.detailedDescription, 'html');
        }
        const { argsstring } = memberDef;
        this.argsstring = argsstring;
        if (memberDef.type !== undefined) {
            this.type = workspace.renderElementToString(memberDef.type, 'html').trim();
        }
        if (memberDef.initializer !== undefined) {
            this.initializerHtmlLines = workspace.renderElementToLines(memberDef.initializer, 'html');
        }
        if (memberDef.location !== undefined) {
            this.locationMarkdownLines = this.section.compound.renderLocationToLines(memberDef.location);
            if (workspace.options.renderProgramListingInline ?? false) {
                this.programListing = this.filterProgramListingForLocation(memberDef.location);
            }
        }
        if (memberDef.references !== undefined) {
            this.referencesMarkdownString =
                this.section.compound.renderReferencesToHtmlString(memberDef.references);
        }
        if (memberDef.referencedBy !== undefined) {
            this.referencedByMarkdownString =
                this.section.compound.renderReferencedByToHtmlString(memberDef.referencedBy);
        }
        const labels = [];
        if (memberDef.inline?.valueOf() ?? false) {
            labels.push('inline');
        }
        if (memberDef.explicit?.valueOf() ?? false) {
            labels.push('explicit');
        }
        if (memberDef.nodiscard?.valueOf() ?? false) {
            labels.push('nodiscard');
        }
        if (memberDef.constexpr?.valueOf() ?? false) {
            labels.push('constexpr');
        }
        if (memberDef.noexcept?.valueOf() ?? false) {
            labels.push('noexcept');
        }
        if (memberDef.prot === 'protected') {
            labels.push('protected');
        }
        if (memberDef.staticc?.valueOf() ?? false) {
            this.isStatic = true;
            labels.push('static');
        }
        if (memberDef.virt !== undefined && memberDef.virt === 'virtual') {
            labels.push('virtual');
        }
        if (memberDef.argsstring?.endsWith('=delete') ?? false) {
            labels.push('delete');
        }
        if (memberDef.argsstring?.endsWith('=default') ?? false) {
            labels.push('default');
        }
        if (memberDef.strong?.valueOf() ?? false) {
            labels.push('strong');
        }
        if (memberDef.mutable?.valueOf() ?? false) {
            labels.push('mutable');
        }
        this.labels = labels;
        const type = this.type ?? '';
        const templateParamList = memberDef.templateparamlist ??
            this.section.compound.templateParamList;
        if (this.section.compound.isTemplate(templateParamList) &&
            (type.includes('decltype(') ||
                (type.includes('&lt;') && type.includes('&gt;')))) {
            this.isTrailingType = true;
        }
        if (templateParamList?.params !== undefined) {
            this.templateParameters = sanitizeAnonymousNamespace(this.section.compound.renderTemplateParametersToString({
                templateParamList,
                withDefaults: true,
            }));
        }
        if (memberDef.params !== undefined) {
            const parameters = [];
            for (const param of memberDef.params) {
                parameters.push(workspace.renderElementToString(param, 'html').trim());
            }
            if (parameters.length > 0) {
                this.parametersHtmlString = parameters.join(', ');
            }
        }
        if (memberDef.kind === 'enum' && memberDef.enumvalues !== undefined) {
            const enumValues = [];
            for (const enumValueDataModel of memberDef.enumvalues) {
                enumValues.push(new EnumValue(this, enumValueDataModel));
            }
            if (enumValues.length > 0) {
                this.enumValues = enumValues;
                this.enumHtmlLines = this.renderEnumToLines();
            }
        }
        if (memberDef.qualifiedName !== undefined) {
            this.qualifiedName = sanitizeAnonymousNamespace(memberDef.qualifiedName);
        }
        if (memberDef.definition !== undefined) {
            this.definition = sanitizeAnonymousNamespace(memberDef.definition);
        }
        if ((memberDef.constexpr?.valueOf() ?? false) &&
            !type.includes('constexpr')) {
            this.isConstexpr = true;
        }
        this.isStrong = memberDef.strong?.valueOf() ?? false;
        this.isConst = memberDef.constt?.valueOf() ?? false;
        this._private._memberDef = undefined;
    }
    filterProgramListingForLocation(location) {
        const { workspace } = this.section.compound.collection;
        if (location === undefined) {
            return undefined;
        }
        let programListing = undefined;
        let definitionFile = undefined;
        let startLine = -1;
        let endLine = -1;
        if (location.bodyfile !== undefined) {
            definitionFile = workspace.filesByPath.get(location.bodyfile);
            if (definitionFile === undefined) {
                console.log('no definition');
                return undefined;
            }
            if (definitionFile.programListing === undefined) {
                console.log('no listing');
                return undefined;
            }
            if (location.bodystart !== undefined) {
                startLine = location.bodystart.valueOf();
                if (location.bodyend !== undefined) {
                    endLine = location.bodyend.valueOf();
                }
                if (endLine === -1) {
                    endLine = startLine;
                }
            }
            else {
                return undefined;
            }
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
        }
        if (definitionFile?.programListing !== undefined) {
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
        }
        return programListing;
    }
    renderIndexToLines() {
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        const permalink = workspace.getPermalink({
            refid: this.id,
            kindref: 'member',
        });
        assert(permalink !== undefined && permalink.length > 1);
        const name = workspace.renderString(this.name, 'html');
        let itemTemplate = '';
        let itemType = '';
        let itemName = `<a href="${permalink}">${name}</a>`;
        if (this.templateParameters !== undefined &&
            this.templateParameters.length > 0) {
            if (this.templateParameters.length < 64) {
                itemTemplate = workspace.renderString(`template ${this.templateParameters}`, 'html');
            }
            else {
                itemTemplate = workspace.renderString('template < ... >', 'html');
            }
        }
        switch (this.kind) {
            case 'typedef':
                if (this.definition?.startsWith('typedef') ?? false) {
                    itemType = 'typedef';
                    itemName = `${this.type} ${itemName}${this.argsstring}`;
                }
                else if (this.definition?.startsWith('using') ?? false) {
                    itemType = 'using';
                    if (this.type !== undefined) {
                        itemName += ' = ';
                        itemName += this.type;
                    }
                }
                else {
                    console.error('Unsupported typedef in member', this.definition);
                }
                break;
            case 'function':
                {
                    const type = this.type ?? '';
                    if (this.isStatic) {
                        itemType += 'static ';
                    }
                    if (this.isConstexpr) {
                        itemType += 'constexpr ';
                    }
                    if (this.argsstring !== undefined) {
                        itemName += ' ';
                        itemName += workspace.renderString(this.argsstring, 'html');
                    }
                    if (this.isTrailingType) {
                        if (!itemType.includes('auto')) {
                            itemType += 'auto ';
                        }
                        itemName += workspace.renderString(' -> ', 'html');
                        itemName += type;
                    }
                    else {
                        itemType += type;
                    }
                    if (this.initializerHtmlLines !== undefined) {
                        itemName += ' ';
                        if (this.initializerHtmlLines.length === 1) {
                            itemName += this.initializerHtmlLines[0];
                        }
                        else {
                            itemName += '= ...';
                        }
                    }
                }
                break;
            case 'variable':
                if (this.isStatic) {
                    itemType += 'static ';
                }
                if (this.isConstexpr) {
                    itemType += 'constexpr ';
                }
                itemType += this.type;
                if (this.definition?.startsWith('struct ') ?? false) {
                    itemType = workspace.renderString('struct { ... }', 'html');
                }
                else if (this.definition?.startsWith('class ') ?? false) {
                    itemType = workspace.renderString('class { ... }', 'html');
                }
                if (this.argsstring !== undefined) {
                    itemName += this.argsstring;
                }
                if (this.initializerHtmlLines !== undefined) {
                    itemName += ' ';
                    if (this.initializerHtmlLines.length === 1) {
                        itemName += this.initializerHtmlLines[0];
                    }
                    else {
                        itemName += '= ...';
                    }
                }
                break;
            case 'enum':
                itemType = '';
                if (this.name.length === 0) {
                    itemType += 'anonymous ';
                }
                itemType += 'enum';
                if (this.isStrong) {
                    itemType += ' class';
                }
                itemName = this.name;
                if (this.type !== undefined && this.type.length > 0) {
                    itemName += ` : ${this.type}`;
                }
                itemName += workspace.renderString(' { ', 'html');
                itemName += `<a href="${permalink}">...</a>`;
                itemName += workspace.renderString(' }', 'html');
                break;
            case 'friend':
                itemType = this.type ?? 'class';
                break;
            case 'define':
                itemType = '#define';
                if (this.parametersHtmlString !== undefined) {
                    itemName += `(${this.parametersHtmlString})`;
                }
                if (this.initializerHtmlLines !== undefined) {
                    itemName += '&nbsp;&nbsp;&nbsp;';
                    if (this.initializerHtmlLines.length === 1) {
                        itemName += this.initializerHtmlLines[0];
                    }
                    else {
                        itemName += '...';
                    }
                }
                break;
            default:
                console.error('member kind', this.kind, 'not implemented yet in', this.constructor.name, 'renderIndexToLines');
        }
        lines.push('');
        if (itemName.length === 0) {
            if (this.section.compound.collection.workspace.options.debug) {
                console.log(this);
            }
            console.warn('empty name in', this.id);
        }
        const childrenLines = [];
        const { briefDescriptionHtmlString: briefDescriptionString } = this;
        if (briefDescriptionString !== undefined &&
            briefDescriptionString.length > 0) {
            childrenLines.push(this.section.compound.renderBriefDescriptionToHtmlString({
                briefDescriptionHtmlString: briefDescriptionString,
                morePermalink: permalink,
            }));
        }
        lines.push(...workspace.renderMembersIndexItemToHtmlLines({
            template: itemTemplate,
            type: itemType,
            name: itemName,
            childrenLines,
        }));
        return lines;
    }
    renderToLines() {
        const lines = [];
        const workspace = this.section.compound.collection.workspace;
        const isFunction = this.section.kind.startsWith('func') ||
            this.section.kind.endsWith('func') ||
            this.section.kind.endsWith('constructorr') ||
            this.section.kind.endsWith('destructor') ||
            this.section.kind.endsWith('operator');
        const id = getPermalinkAnchor(this.id);
        const name = this.name + (isFunction ? '()' : '');
        lines.push('');
        if (this.kind !== 'enum') {
            lines.push(`### ${workspace.renderString(name, 'markdown')} {#${id}}`);
        }
        let template = undefined;
        let prototype = undefined;
        const { labels } = this;
        const childrenLines = [];
        switch (this.kind) {
            case 'function':
            case 'typedef':
            case 'variable':
                assert(this.definition !== undefined);
                prototype = workspace.renderString(this.definition, 'html');
                if (this.isStatic) {
                    prototype = prototype.replace(/^static /, '');
                }
                if (this.kind === 'function') {
                    prototype += ' (';
                    if (this.parametersHtmlString !== undefined) {
                        prototype += this.parametersHtmlString;
                    }
                    prototype += ')';
                }
                if (this.initializerHtmlLines !== undefined) {
                    if (this.initializerHtmlLines.length === 1) {
                        prototype += ` ${this.initializerHtmlLines[0]}`;
                    }
                }
                if (this.templateParameters !== undefined &&
                    this.templateParameters.length > 0) {
                    template = workspace.renderString(`template ${this.templateParameters}`, 'html');
                }
                if (this.briefDescriptionHtmlString !== undefined) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToHtmlString({
                        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                    }));
                }
                if (this.initializerHtmlLines !== undefined &&
                    this.initializerHtmlLines.length > 1) {
                    childrenLines.push('');
                    childrenLines.push('<dl class="doxySectionUser">');
                    childrenLines.push('<dt>Initialiser</dt>');
                    childrenLines.push('<dd>');
                    if (this.initializerHtmlLines.length === 1) {
                        childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}</div>`);
                    }
                    else {
                        childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}`);
                        for (const initializerLine of this.initializerHtmlLines.slice(1)) {
                            if (initializerLine.trim().length > 0) {
                                childrenLines.push(initializerLine);
                            }
                        }
                        childrenLines.push('</div>');
                    }
                    childrenLines.push('</dd>');
                    childrenLines.push('</dl>');
                }
                if (this.detailedDescriptionHtmlLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToHtmlLines({
                        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
                        showHeader: false,
                        showBrief: false,
                    }));
                }
                break;
            case 'enum':
                prototype = '';
                if (this.name.length === 0) {
                    prototype += 'anonymous ';
                }
                prototype += 'enum ';
                if (this.isStrong) {
                    prototype += 'class ';
                }
                if (this.name.length > 0) {
                    lines.push(`### ${workspace.renderString(name, 'markdown')} {#${id}}`);
                }
                else {
                    lines.push(`### ${prototype} {#${id}}`);
                }
                if (this.briefDescriptionHtmlString !== undefined &&
                    this.briefDescriptionHtmlString.length > 0) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToHtmlString({
                        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                    }));
                }
                if (this.enumHtmlLines !== undefined) {
                    childrenLines.push(...this.enumHtmlLines);
                }
                if (this.detailedDescriptionHtmlLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToHtmlLines({
                        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
                        showHeader: false,
                        showBrief: false,
                    }));
                }
                if (this.name.length > 0 && this.qualifiedName !== undefined) {
                    prototype += `${workspace.renderString(this.qualifiedName, 'html')} `;
                }
                else if (this.name.length > 0) {
                    prototype += `${workspace.renderString(this.name, 'html')} `;
                }
                if (this.type !== undefined && this.type.length > 0) {
                    prototype += `: ${this.type}`;
                }
                break;
            case 'friend':
                prototype = `friend ${this.type} ${this.parametersHtmlString}`;
                if (this.detailedDescriptionHtmlLines !== undefined) {
                    childrenLines.push(...this.section.compound.renderDetailedDescriptionToHtmlLines({
                        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                        detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
                        showHeader: false,
                        showBrief: true,
                    }));
                }
                break;
            case 'define':
                prototype = `#define ${name}`;
                if (this.parametersHtmlString !== undefined) {
                    prototype += `(${this.parametersHtmlString})`;
                }
                if (this.initializerHtmlLines !== undefined) {
                    prototype += '&nbsp;&nbsp;&nbsp;';
                    if (this.initializerHtmlLines.length === 1) {
                        prototype += this.initializerHtmlLines[0];
                    }
                    else {
                        prototype += '...';
                    }
                }
                if (this.briefDescriptionHtmlString !== undefined) {
                    childrenLines.push(this.section.compound.renderBriefDescriptionToHtmlString({
                        briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                    }));
                }
                if (this.initializerHtmlLines !== undefined &&
                    this.initializerHtmlLines.length > 1) {
                    childrenLines.push('');
                    childrenLines.push('<dl class="doxySectionUser">');
                    childrenLines.push('<dt>Value</dt>');
                    childrenLines.push('<dd>');
                    if (this.initializerHtmlLines.length === 1) {
                        childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}</div>`);
                    }
                    else {
                        childrenLines.push(`<div class="doxyVerbatim">${this.initializerHtmlLines[0]}`);
                        for (const initializerLine of this.initializerHtmlLines.slice(1)) {
                            if (initializerLine.trim().length > 0) {
                                childrenLines.push(initializerLine);
                            }
                        }
                        childrenLines.push('</div>');
                    }
                    childrenLines.push('</dd>');
                    childrenLines.push('</dl>');
                }
                childrenLines.push(...this.section.compound.renderDetailedDescriptionToHtmlLines({
                    briefDescriptionHtmlString: this.briefDescriptionHtmlString,
                    detailedDescriptionHtmlLines: this.detailedDescriptionHtmlLines,
                    showHeader: false,
                    showBrief: false,
                }));
                break;
            default:
                lines.push('');
                console.warn('memberDef', this.kind, this.name, 'not implemented yet in', this.constructor.name, 'renderToLines');
        }
        if (this.locationMarkdownLines !== undefined) {
            childrenLines.push(...this.locationMarkdownLines);
        }
        if (this.programListing !== undefined) {
            childrenLines.push(...this.section.compound.collection.workspace.renderElementToLines(this.programListing, 'html'));
        }
        if (this.referencesMarkdownString !== undefined) {
            childrenLines.push('');
            childrenLines.push(this.referencesMarkdownString);
        }
        if (this.referencedByMarkdownString !== undefined) {
            childrenLines.push('');
            childrenLines.push(this.referencedByMarkdownString);
        }
        lines.push('');
        if (prototype !== undefined) {
            lines.push(...this.renderMemberDefinitionToLines({
                template,
                prototype,
                labels,
                childrenLines,
            }));
        }
        return lines;
    }
    renderMemberDefinitionToLines({ template, prototype, labels, childrenLines, }) {
        const lines = [];
        lines.push('<div class="doxyMemberItem">');
        lines.push('<div class="doxyMemberProto">');
        if (template !== undefined && template.length > 0) {
            lines.push(`<div class="doxyMemberTemplate">${template}</div>`);
        }
        lines.push('<table class="doxyMemberLabels">');
        lines.push('<tr class="doxyMemberLabels">');
        lines.push('<td class="doxyMemberLabelsLeft">');
        lines.push('<table class="doxyMemberName">');
        lines.push('<tr>');
        lines.push(`<td class="doxyMemberName">${prototype}</td>`);
        lines.push('</tr>');
        lines.push('</table>');
        lines.push('</td>');
        if (labels.length > 0) {
            lines.push('<td class="doxyMemberLabelsRight">');
            lines.push('<span class="doxyMemberLabels">');
            for (const label of labels) {
                lines.push(`<span class="doxyMemberLabel ${label}">${label}</span>`);
            }
            lines.push('</span>');
            lines.push('</td>');
        }
        lines.push('</tr>');
        lines.push('</table>');
        lines.push('</div>');
        lines.push('<div class="doxyMemberDoc">');
        lines.push('');
        lines.push(...childrenLines);
        lines.push('</div>');
        lines.push('</div>');
        return lines;
    }
    renderEnumToLines() {
        const lines = [];
        lines.push('');
        lines.push('<dl class="doxyEnumList">');
        lines.push('<dt class="doxyEnumTableTitle">Enumeration values</dt>');
        lines.push('<dd>');
        lines.push('<table class="doxyEnumTable">');
        if (this.enumValues !== undefined) {
            for (const enumValue of this.enumValues) {
                const anchor = getPermalinkAnchor(enumValue.id);
                let enumBriefDescriptionHtmlString = (enumValue.briefDescriptionHtmlString ?? '').replace(/[.]$/, '');
                const { initializerHtmlString: value } = enumValue;
                if (value !== undefined && value.length > 0) {
                    enumBriefDescriptionHtmlString += ` (${value})`;
                }
                lines.push('');
                lines.push('<tr class="doxyEnumItem">');
                lines.push(`<td class="doxyEnumItemName">${enumValue.name}` +
                    `<a id="${anchor}"></a></td>`);
                if (!enumBriefDescriptionHtmlString.includes('\n')) {
                    lines.push(`<td class="doxyEnumItemDescription">` +
                        `${enumBriefDescriptionHtmlString}</td>`);
                }
                else {
                    lines.push('<td class="doxyEnumItemDescription">');
                    lines.push(...enumBriefDescriptionHtmlString.split('\n'));
                    lines.push('</td>');
                }
                lines.push('</tr>');
            }
        }
        lines.push('');
        lines.push('</table>');
        lines.push('</dd>');
        lines.push('</dl>');
        return lines;
    }
}
export class MemberRef extends MemberBase {
    refid;
    constructor(section, memberRef) {
        super(section, memberRef.name);
        const { refid } = memberRef;
        this.refid = refid;
    }
}
export class EnumValue {
    name;
    id;
    briefDescriptionHtmlString;
    initializerHtmlString;
    member;
    constructor(member, enumValue) {
        this.member = member;
        this.name = enumValue.name.trim();
        const { id } = enumValue;
        this.id = id;
        const workspace = member.section.compound.collection.workspace;
        if (enumValue.briefDescription !== undefined) {
            assert(enumValue.briefDescription.children != null);
            for (const child of enumValue.briefDescription.children) {
                if (child instanceof ParaDataModel) {
                    child.skipPara = true;
                }
            }
        }
        if (enumValue.briefDescription?.children !== undefined) {
            workspace.skipElementsPara(enumValue.briefDescription.children);
            this.briefDescriptionHtmlString = workspace
                .renderElementToString(enumValue.briefDescription, 'html')
                .trim();
        }
        if (enumValue.initializer !== undefined) {
            this.initializerHtmlString = workspace.renderElementToString(enumValue.initializer, 'html');
        }
    }
}
//# sourceMappingURL=members-vm.js.map