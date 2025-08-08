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
import * as util from 'node:util';
import assert from 'node:assert';
import { getPermalinkAnchor, sanitizeAnonymousNamespace } from '../utils.js';
import { MemberProgramListingDataModel, ParaDataModel, } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
// ----------------------------------------------------------------------------
export const sectionHeaders = {
    typedef: ['Typedefs', 100], // DoxMemberKind too
    'public-type': ['Public Member Typedefs', 110],
    'protected-type': ['Protected Member Typedefs', 120],
    'private-type': ['Private Member Typedefs', 130],
    'package-type': ['Package Member Typedefs', 140],
    enum: ['Enumerations', 150], // DoxMemberKind too
    friend: ['Friends', 160], // DoxMemberKind too
    interface: ['Interfaces', 170], // DoxMemberKind only
    // Extra, not present in Doxygen.
    constructorr: ['Constructors', 200],
    'public-constructorr': ['Public Constructors', 200],
    'protected-constructorr': ['Protected Constructors', 210],
    'private-constructorr': ['Private Constructors', 220],
    // Extra, not present in Doxygen.
    'public-destructor': ['Public Destructor', 230],
    'protected-destructor': ['Protected Destructor', 240],
    'private-destructor': ['Private Destructor', 250],
    // Extra, not present in Doxygen.
    operator: ['Operators', 300],
    'public-operator': ['Public Operators', 310],
    'protected-operator': ['Protected Operators', 320],
    'private-operator': ['Private Operators', 330],
    'package-operator': ['Package Operators', 340],
    func: ['Functions', 350],
    function: ['Functions', 350], // DoxMemberKind only
    'public-func': ['Public Member Functions', 360],
    'protected-func': ['Protected Member Functions', 370],
    'private-func': ['Private Member Functions', 380],
    'package-func': ['Package Member Functions', 390],
    var: ['Variables', 400],
    variable: ['Variables', 400], // DoxMemberKind only
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
    slot: ['Slots', 700], // DoxMemberKind only
    'public-slot': ['Public Slots', 700],
    'protected-slot': ['Protected Slot', 710],
    'private-slot': ['Private Slot', 720],
    related: ['Related', 800],
    define: ['Macro Definitions', 810], // DoxMemberKind too
    prototype: ['Prototypes', 820], // DoxMemberKind too
    signal: ['Signals', 830], // DoxMemberKind too
    // 'dcop-func': ['DCOP Functions', 840],
    dcop: ['DCOP Functions', 840], // DoxMemberKind only
    property: ['Properties', 850], // DoxMemberKind too
    event: ['Events', 860], // DoxMemberKind too
    service: ['Services', 870], // DoxMemberKind only
    'user-defined': ['Definitions', 1000],
};
// ----------------------------------------------------------------------------
/**
 * Represents a documentation section containing member definitions and
 * references.
 *
 * @remarks
 * Sections organise related members (functions, variables, types, etc.) within
 * compounds, providing structured grouping based on visibility, type, and
 * functionality. Each section manages both member definitions and references
 * to members defined elsewhere.
 *
 * @public
 */
export class Section {
    /**
     * The parent compound containing this section.
     *
     * @remarks
     * References the compound (class, namespace, file, etc.) that owns
     * this section for context and rendering operations.
     */
    compound;
    /**
     * The section kind identifier from Doxygen.
     *
     * @remarks
     * Specifies the type of section (e.g., 'public-func', 'private-attrib',
     * 'typedef') which determines member organisation and display headers.
     */
    kind;
    /**
     * The display header name for this section.
     *
     * @remarks
     * Human-readable section title derived from the kind, used for
     * generating section headers in the documentation output.
     */
    headerName;
    /**
     * Optional section description lines in HTML format.
     *
     * @remarks
     * Contains processed description content for sections that include
     * additional explanatory text beyond the standard header.
     */
    descriptionLines;
    /**
     * All members in this section including references and definitions.
     *
     * @remarks
     * Contains both member definitions and member references in their
     * original order, used for generating member indices and overviews.
     */
    indexMembers = [];
    /**
     * Only member definitions in this section, sorted alphabetically.
     *
     * @remarks
     * Filtered collection containing only actual member definitions
     * (not references), sorted by name for detailed documentation rendering.
     */
    definitionMembers = [];
    /**
     * Private data available only during initialisation.
     *
     * @remarks
     * Temporary storage for section definition data that is cleared
     * after late initialisation to reduce memory usage.
     *
     * @internal
     */
    _private = {};
    /**
     * Initialises a new Section instance from section definition data.
     *
     * @remarks
     * Processes the section metadata, creates member instances, and organises
     * them into appropriate collections for index and definition rendering.
     * Members are sorted alphabetically for consistent documentation output.
     *
     * @param compound - The parent compound containing this section
     * @param sectionDef - The section definition containing member data
     *
     * @public
     */
    constructor(compound, sectionDef) {
        // console.log(compound.kind, compound.compoundName, sectionDef.kind)
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
                // Do not add it to the global map since additional checks are needed
                // therefore the procedure is done in the global generator.
            }
        }
        if (sectionDef.members !== undefined) {
            for (const memberRef of sectionDef.members) {
                members.push(new MemberRef(this, memberRef));
            }
        }
        // Original order.
        this.indexMembers = members;
        const definitionMembers = [];
        for (const member of this.indexMembers) {
            if (member instanceof Member) {
                definitionMembers.push(member);
            }
        }
        // Sorted.
        this.definitionMembers = definitionMembers.sort((a, b) => a.name.localeCompare(b.name));
    }
    /**
     * Performs late initialisation for section descriptions.
     *
     * @remarks
     * Processes optional section descriptions into HTML format for rendering.
     * This method is called after all basic initialisation is complete to
     * ensure proper workspace context for description processing.
     *
     * @public
     */
    initializeLate() {
        const { workspace } = this.compound.collection;
        assert(this._private._sectionDef !== undefined);
        const { _sectionDef: sectionDef } = this._private;
        if (sectionDef.description !== undefined) {
            this.descriptionLines = workspace.renderElementToLines(sectionDef.description, 'html');
            // console.log(this.indexMembers, this.descriptionLines)
        }
    }
    /**
     * Determines if this section contains any member definitions.
     *
     * @remarks
     * Checks whether the section has actual member definitions (not just
     * references) that require detailed documentation rendering. Used to
     * filter sections for output generation.
     *
     * @returns True if the section contains member definitions, false otherwise
     *
     * @public
     */
    hasDefinitionMembers() {
        return this.definitionMembers.length > 0;
    }
    // --------------------------------------------------------------------------
    // <xsd:simpleType name="DoxSectionKind">
    //   <xsd:restriction base="xsd:string">
    //     <xsd:enumeration value="user-defined" />
    //     <xsd:enumeration value="public-type" />
    //     <xsd:enumeration value="public-func" />
    //     <xsd:enumeration value="public-attrib" />
    //     <xsd:enumeration value="public-slot" />
    //     <xsd:enumeration value="signal" />
    //     <xsd:enumeration value="dcop-func" />
    //     <xsd:enumeration value="property" />
    //     <xsd:enumeration value="event" />
    //     <xsd:enumeration value="public-static-func" />
    //     <xsd:enumeration value="public-static-attrib" />
    //     <xsd:enumeration value="protected-type" />
    //     <xsd:enumeration value="protected-func" />
    //     <xsd:enumeration value="protected-attrib" />
    //     <xsd:enumeration value="protected-slot" />
    //     <xsd:enumeration value="protected-static-func" />
    //     <xsd:enumeration value="protected-static-attrib" />
    //     <xsd:enumeration value="package-type" />
    //     <xsd:enumeration value="package-func" />
    //     <xsd:enumeration value="package-attrib" />
    //     <xsd:enumeration value="package-static-func" />
    //     <xsd:enumeration value="package-static-attrib" />
    //     <xsd:enumeration value="private-type" />
    //     <xsd:enumeration value="private-func" />
    //     <xsd:enumeration value="private-attrib" />
    //     <xsd:enumeration value="private-slot" />
    //     <xsd:enumeration value="private-static-func" />
    //     <xsd:enumeration value="private-static-attrib" />
    //     <xsd:enumeration value="friend" />
    //     <xsd:enumeration value="related" />
    //     <xsd:enumeration value="define" />
    //     <xsd:enumeration value="prototype" />
    //     <xsd:enumeration value="typedef" />
    //     <xsd:enumeration value="enum" />
    //     <xsd:enumeration value="func" />
    //     <xsd:enumeration value="var" />
    //   </xsd:restriction>
    // </xsd:simpleType>
    /**
     * Determines the display header name for a section based on its kind.
     *
     * @remarks
     * Maps Doxygen section kinds to human-readable header names, handling
     * both standard section types and user-defined sections with custom
     * headers. Falls back to predefined section headers from the global
     * mapping table.
     *
     * @param sectionDef - The section definition containing kind and header data
     * @returns The formatted header name for display
     *
     * @private
     */
    getHeaderNameByKind(sectionDef) {
        // User defined sections have their own header.
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
        // ------------------------------------------------------------------------
        const sectionHeader = sectionHeaders[kind];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (sectionHeader === undefined) {
            console.error(util.inspect(sectionDef, { compact: false, depth: 999 }));
            console.error(sectionDef.constructor.name, 'kind', kind, 'not yet rendered in', this.constructor.name, 'getHeaderNameByKind');
            return '';
        }
        return sectionHeader[0].trim();
    }
    /**
     * Determines the display order for this section based on its kind.
     *
     * @remarks
     * Returns a numeric order value used for sorting sections consistently
     * in documentation output. User-defined sections are placed at the end
     * with order 1000, while predefined sections use values from the global
     * mapping table.
     *
     * @returns Numeric order value for section sorting
     *
     * @public
     */
    getSectionOrderByKind() {
        const { kind } = this;
        if (kind === 'user-defined') {
            return 1000; // At the end.
        }
        const header = sectionHeaders[kind];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        assert(header !== undefined);
        return header[1];
    }
    // --------------------------------------------------------------------------
    /**
     * Renders the section index to HTML table lines.
     *
     * @remarks
     * Generates an HTML table containing all members in this section with
     * their signatures and brief descriptions. Both member definitions and
     * references are included in the index for comprehensive overview.
     *
     * @returns Array of HTML lines representing the section index
     *
     * @public
     */
    renderIndexToLines() {
        const lines = [];
        // console.log(sectionDef)
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
                    const referredMember = this.compound.collection.workspace.viewModel.membersById.get(member.refid);
                    assert(referredMember !== undefined);
                    lines.push(...referredMember.renderIndexToLines());
                }
            }
            lines.push('');
            lines.push('</table>');
        }
        return lines;
    }
    // --------------------------------------------------------------------------
    /**
     * Renders the complete section documentation to HTML lines.
     *
     * @remarks
     * Generates detailed section documentation including header, optional
     * description, and full member definitions. Only sections with member
     * definitions are rendered, ensuring meaningful content output.
     *
     * @returns Array of HTML lines representing the complete section
     *
     * @public
     */
    renderToLines() {
        const lines = [];
        if (!this.hasDefinitionMembers()) {
            return lines;
        }
        // TODO: filter out members defined in other compounds.
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
// ----------------------------------------------------------------------------
/**
 * Base class for member instances providing common functionality.
 *
 * @remarks
 * Provides shared properties and methods for both member definitions and
 * member references, establishing a common interface for member handling
 * throughout the documentation generation process.
 *
 * @internal
 */
class MemberBase {
    /**
     * The parent section containing this member.
     *
     * @remarks
     * References the section that owns this member for context and
     * access to compound and workspace information.
     */
    section;
    /**
     * The member name identifier.
     *
     * @remarks
     * Base name of the member used for identification and documentation
     * generation across different member types.
     */
    name;
    /**
     * Initialises a new MemberBase instance.
     *
     * @remarks
     * Establishes the basic member properties required for all member types,
     * providing foundation for both definitions and references.
     *
     * @param section - The parent section containing this member
     * @param name - The member name identifier
     *
     * @protected
     */
    constructor(section, name) {
        this.section = section;
        this.name = name;
    }
    /**
     * Performs late initialisation for members.
     *
     * @remarks
     * Base implementation is intentionally empty, allowing subclasses to
     * override with specific initialisation logic as needed.
     *
     * @public
     */
    // Intentionally left blank for subclasses to override.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    initializeLate() { }
}
/**
 * Represents a complete member definition with full documentation.
 *
 * @remarks
 * Contains comprehensive member information including documentation,
 * signatures, location data, and rendering capabilities. Handles
 * various member types such as functions, variables, enums, and
 * typedefs with their specific documentation requirements.
 *
 * @public
 */
export class Member extends MemberBase {
    /**
     * Unique identifier for this member.
     *
     * @remarks
     * Doxygen-generated unique ID used for cross-references, permalinks,
     * and member lookup operations throughout the documentation.
     */
    id;
    /**
     * The member kind from Doxygen classification.
     *
     * @remarks
     * Specifies the type of member (e.g., 'function', 'variable', 'enum',
     * 'typedef') which determines rendering and documentation behaviour.
     */
    kind;
    /**
     * Brief description in HTML format.
     *
     * @remarks
     * Optional short description of the member, processed into HTML for
     * display in indices and member overviews.
     */
    briefDescriptionHtmlString;
    /**
     * Detailed description lines in HTML format.
     *
     * @remarks
     * Comprehensive member documentation including parameters, return values,
     * examples, and detailed explanations processed into HTML lines.
     */
    detailedDescriptionHtmlLines;
    /**
     * Function argument string from Doxygen.
     *
     * @remarks
     * Contains the complete function signature arguments including types,
     * names, and default values for function-type members.
     */
    argsstring;
    /**
     * Fully qualified member name.
     *
     * @remarks
     * Complete qualified name including namespace and class scope,
     * used for accurate member identification and documentation.
     */
    qualifiedName;
    /**
     * Member definition string from Doxygen.
     *
     * @remarks
     * Complete member definition including type, qualifiers, and signature,
     * used for generating accurate member documentation and prototypes.
     */
    definition;
    /**
     * Member type information in HTML format.
     *
     * @remarks
     * Type specification for the member including template parameters and
     * qualifiers, processed into HTML for documentation display.
     */
    type;
    /**
     * Member initialiser lines in HTML format.
     *
     * @remarks
     * Variable or constant initialisation values, processed into HTML lines
     * for display in member documentation and indices.
     */
    initializerHtmlLines;
    /**
     * Location information in Markdown format.
     *
     * @remarks
     * File and line number information for the member definition,
     * formatted as Markdown for documentation display.
     */
    locationMarkdownLines;
    /**
     * Template parameters string.
     *
     * @remarks
     * Template parameter specification for template members, formatted
     * for display in member documentation headers.
     */
    templateParameters;
    /**
     * Enumeration values in HTML format.
     *
     * @remarks
     * For enum members, contains the formatted enumeration values table
     * with descriptions, processed into HTML lines.
     */
    enumHtmlLines;
    /**
     * Function parameters in HTML format.
     *
     * @remarks
     * For function members, contains the processed parameter list with
     * types and names formatted as HTML string.
     */
    parametersHtmlString;
    /**
     * Program listing for inline code display.
     *
     * @remarks
     * When enabled, contains the source code excerpt for the member
     * definition for inline documentation display.
     */
    programListing;
    /**
     * Cross-references to members that reference this member.
     *
     * @remarks
     * Markdown-formatted list of members and locations that reference
     * this member, providing reverse lookup capabilities.
     */
    referencedByMarkdownString;
    /**
     * Cross-references to members referenced by this member.
     *
     * @remarks
     * Markdown-formatted list of members and locations referenced by
     * this member, providing forward lookup capabilities.
     */
    referencesMarkdownString;
    /**
     * Enumeration values for enum members.
     *
     * @remarks
     * For enumeration members, contains the collection of enum values
     * with their documentation and initialiser values.
     */
    enumValues;
    /**
     * Collection of member attribute labels.
     *
     * @remarks
     * Contains labels such as 'static', 'inline', 'virtual', 'const' that
     * are displayed as badges in the member documentation.
     */
    labels = [];
    /**
     * Indicates if the member uses trailing return type syntax.
     *
     * @remarks
     * For C++ functions with trailing return types (auto func() -> Type),
     * affects how the member signature is formatted in documentation.
     */
    isTrailingType = false;
    /**
     * Indicates if the member is declared as constexpr.
     *
     * @remarks
     * True for constexpr members, affects display formatting and
     * documentation generation for compile-time constants.
     */
    isConstexpr = false;
    /**
     * Indicates if the member is a strong enum.
     *
     * @remarks
     * True for enum class declarations, affects how enumeration
     * documentation is formatted and displayed.
     */
    isStrong = false;
    /**
     * Indicates if the member is declared as const.
     *
     * @remarks
     * True for const members, affects member signature display
     * and documentation formatting.
     */
    isConst = false;
    /**
     * Indicates if the member is declared as static.
     *
     * @remarks
     * True for static members, affects member organisation,
     * display formatting, and section classification.
     */
    isStatic = false;
    /**
     * Private data available only during initialisation.
     *
     * @remarks
     * Temporary storage for member definition data that is cleared
     * after late initialisation to reduce memory usage.
     *
     * @internal
     */
    _private = {};
    /**
     * Initialises a new Member instance from member definition data.
     *
     * @remarks
     * Creates a member instance with basic identification information.
     * Full initialisation occurs later during the initializeLate phase
     * when workspace context is available for processing descriptions
     * and cross-references.
     *
     * @param section - The parent section containing this member
     * @param memberDef - The member definition containing member metadata
     *
     * @public
     */
    constructor(section, memberDef) {
        super(section, memberDef.name);
        this._private._memberDef = memberDef;
        const { id, kind } = memberDef;
        this.id = id;
        this.kind = kind;
    }
    /**
     * Performs comprehensive late initialisation for member documentation.
     *
     * @remarks
     * Processes member descriptions, signatures, location data, cross-references,
     * and rendering properties. This method transforms raw Doxygen data into
     * formatted HTML content ready for documentation generation. It handles
     * template parameters, enumeration values, and various member attributes.
     *
     * @public
     */
    initializeLate() {
        super.initializeLate();
        const { _memberDef: memberDef } = this._private;
        assert(memberDef !== undefined);
        const { workspace } = this.section.compound.collection;
        if (memberDef.briefDescription !== undefined) {
            // console.log(memberDef.briefDescription)
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
            if (workspace.options.renderProgramListingInline) {
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
        // WARNING: there is no explicit attribute for 'delete'.
        if (memberDef.argsstring?.endsWith('=delete') ?? false) {
            labels.push('delete');
        }
        // WARNING: there is no explicit attribute for 'default'.
        if (memberDef.argsstring?.endsWith('=default') ?? false) {
            labels.push('default');
        }
        if (memberDef.strong?.valueOf() ?? false) {
            labels.push('strong');
        }
        if (memberDef.mutable?.valueOf() ?? false) {
            labels.push('mutable');
        }
        // WARNING: could not find how to generate 'inherited'.
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
        // Clear the reference, it is no longer needed.
        this._private._memberDef = undefined;
    }
    /**
     * Filters program listing content for a specific member location.
     *
     * @remarks
     * Extracts relevant source code lines from file program listings based on
     * member location data. Creates a filtered program listing containing only
     * the code relevant to this specific member for inline documentation display.
     *
     * @param location - The location data containing file and line information
     * @returns Filtered program listing or undefined if unavailable
     *
     * @private
     */
    filterProgramListingForLocation(location) {
        // console.log(location)
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
            // console.log(definitionFile.indexName, startLine, endLine)
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
            // } else if (location.file !== undefined) {
            //   definitionFile = workspace.filesByPath.get(location.file)
            //   if (definitionFile === undefined) {
            //     console.log('no definition')
            //     return undefined
            //   }
            //   if (definitionFile.programListing === undefined) {
            //     console.log('no listing')
            //     return undefined
            //   }
            //   if (location.line !== undefined) {
            //     startLine = location.line.valueOf()
            //     endLine = startLine
            //   } else {
            //     return undefined
            //   }
        }
        if (definitionFile?.programListing !== undefined) {
            // console.log(definitionFile.indexName, startLine, endLine)
            programListing = new MemberProgramListingDataModel(definitionFile.programListing, startLine, endLine);
        }
        // console.log(programListing)
        return programListing;
    }
    // --------------------------------------------------------------------------
    /**
     * Renders the member index entry to HTML table lines.
     *
     * @remarks
     * Generates a formatted HTML table row for member index display, including
     * member signature, type information, template parameters, and brief
     * description. The format varies based on member kind (function, variable,
     * enum, typedef, etc.) to provide appropriate representation.
     *
     * @returns Array of HTML lines representing the member index entry
     *
     * @public
     */
    renderIndexToLines() {
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
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
                    assert(this.type !== undefined);
                    itemName = `${this.type} ${itemName}`;
                    if (this.argsstring !== undefined) {
                        itemName += this.argsstring;
                    }
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
                    // WARNING: the rule to decide which type is trailing is not
                    // in the XMLs.
                    // https://github.com/doxygen/doxygen/discussions/11568
                    // TODO: improve.
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
                        // WARNING: Doxygen shows this, but the resulting line is too long.
                        itemName += workspace.renderString(' -> ', 'html');
                        itemName += type;
                    }
                    else {
                        itemType += type;
                    }
                    if (this.initializerHtmlLines !== undefined) {
                        // Show only short initializers in the index.
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
                assert(this.type !== undefined);
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
                    // Show only short initializers in the index.
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
                // console.log(this)
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
                // console.log(this)
                itemType = this.type ?? 'class';
                break;
            case 'define':
                // console.log(this)
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
                morePermalink: permalink, // No #details, it is already an anchor.
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
    // --------------------------------------------------------------------------
    /**
     * Renders the complete member documentation to HTML lines.
     *
     * @remarks
     * Generates comprehensive member documentation including header, signature,
     * template parameters, descriptions, initialisers, and cross-references.
     * The output format varies based on member type to provide appropriate
     * documentation structure for functions, variables, enums, and other members.
     *
     * @returns Array of HTML lines representing the complete member documentation
     *
     * @public
     */
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
        // console.log(memberDef.kind)
        switch (this.kind) {
            case 'function':
            case 'typedef':
            case 'variable':
                // WARNING: the rule to decide which type is trailing is not in XMLs.
                // TODO: improve.
                assert(this.definition !== undefined);
                prototype = workspace.renderString(this.definition, 'html');
                if (this.isStatic) {
                    // The html pages show `static` only as a label; strip it.
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
                                // } else {
                                //   childrenLines.push('&nbsp;')
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
                // console.log(this)
                assert(this.type !== undefined);
                prototype = `friend ${this.type}`;
                if (this.parametersHtmlString !== undefined) {
                    prototype += ` ${this.parametersHtmlString}`;
                }
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
                // console.log(this)
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
                                // } else {
                                //   childrenLines.push('&nbsp;')
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
    /**
     * Renders a member definition with prototype and documentation.
     *
     * @remarks
     * Generates the HTML structure for displaying member definitions including
     * template parameters, prototype signature, attribute labels, and detailed
     * documentation content. Uses Doxygen-compatible CSS classes for styling.
     *
     * @param options - Rendering options including template, prototype, labels,
     *   and content
     * @returns Array of HTML lines representing the member definition
     *
     * @private
     */
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
        lines.push(''); // Required to make the first line a separate paragraph.
        lines.push(...childrenLines);
        lines.push('</div>');
        lines.push('</div>');
        return lines;
    }
    // --------------------------------------------------------------------------
    /**
     * Renders enumeration values to HTML table lines.
     *
     * @remarks
     * Generates a formatted HTML table displaying all enumeration values with
     * their names, descriptions, and initialiser values. Each enum value
     * includes an anchor for direct linking and proper formatting for
     * documentation display.
     *
     * @returns Array of HTML lines representing the enumeration values table
     *
     * @private
     */
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
                // console.log(`|${enumBriefDescription}|`)
                const { initializerHtmlString: value } = enumValue;
                if (value !== undefined && value.length > 0) {
                    enumBriefDescriptionHtmlString += ` (${value})`;
                }
                lines.push('');
                // lines.push(`<a id="${anchor}"></a>`)
                lines.push('<tr class="doxyEnumItem">');
                lines.push(`<td class="doxyEnumItemName">${enumValue.name}` +
                    `<a id="${anchor}"></a></td>`);
                // lines.push(`<td class="doxyEnumItemDescription">`+
                // `<p>${enumBriefDescription}</p></td>`)
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
// ----------------------------------------------------------------------------
/**
 * Represents a reference to a member defined elsewhere.
 *
 * @remarks
 * Member references point to actual member definitions in other compounds,
 * allowing for cross-referencing and inclusion in multiple contexts without
 * duplicating the complete member definition data.
 *
 * @public
 */
export class MemberRef extends MemberBase {
    /**
     * Reference ID pointing to the actual member definition.
     *
     * @remarks
     * Unique identifier used to locate the referenced member definition
     * in the global members collection for rendering and cross-referencing.
     */
    refid;
    /**
     * Initialises a new MemberRef instance from member reference data.
     *
     * @remarks
     * Creates a lightweight reference to a member defined elsewhere, storing
     * only the essential information needed for lookups and cross-references.
     *
     * @param section - The parent section containing this member reference
     * @param memberRef - The member reference data containing reference ID
     *
     * @public
     */
    constructor(section, memberRef) {
        super(section, memberRef.name);
        // this.memberRef = memberRef
        const { refid } = memberRef;
        this.refid = refid;
    }
}
// ----------------------------------------------------------------------------
/**
 * Represents an individual enumeration value with documentation.
 *
 * @remarks
 * Contains the name, description, and initialiser value for enumeration
 * entries, providing complete documentation support for enum constants
 * including cross-referencing and detailed descriptions.
 *
 * @public
 */
export class EnumValue {
    /**
     * The enumeration value name.
     *
     * @remarks
     * Identifier name of the enumeration constant as declared in the source code.
     */
    name;
    /**
     * Unique identifier for this enumeration value.
     *
     * @remarks
     * Doxygen-generated unique ID used for cross-references and anchor
     * generation in the documentation.
     */
    id;
    /**
     * Brief description in HTML format.
     *
     * @remarks
     * Optional description of the enumeration value, processed into HTML
     * for display in enumeration tables and documentation.
     */
    briefDescriptionHtmlString;
    /**
     * Initialiser value in HTML format.
     *
     * @remarks
     * The assigned value for the enumeration constant, if explicitly specified,
     * formatted as HTML for documentation display.
     */
    initializerHtmlString;
    /**
     * Reference to the parent enumeration member.
     *
     * @remarks
     * Back-reference to the Member instance that contains this enumeration
     * value, providing access to parent context and workspace information.
     */
    member;
    /**
     * Initialises a new EnumValue instance from enumeration value data.
     *
     * @remarks
     * Processes the enumeration value metadata including name, description,
     * and initialiser value, converting them into appropriate HTML format
     * for documentation rendering.
     *
     * @param member - The parent enumeration member
     * @param enumValue - The enumeration value data from Doxygen
     *
     * @public
     */
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
        // console.log(this)
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=members-vm.js.map