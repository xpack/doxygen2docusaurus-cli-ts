import type { MemberDefDataModel } from '../../doxygen/data-model/compounds/memberdeftype-dm.js';
import type { MemberDataModel } from '../../doxygen/data-model/compounds/membertype-dm.js';
import type { SectionDefDataModel } from '../../doxygen/data-model/compounds/sectiondeftype-dm.js';
import type { CompoundBase } from './compound-base-vm.js';
import { MemberProgramListingDataModel, type ProgramListingDataModel } from '../../doxygen/data-model/compounds/descriptiontype-dm.js';
import type { LocationDataModel } from '../../doxygen/data-model/compounds/locationtype-dm.js';
import type { EnumValueDataModel } from '../../doxygen/data-model/compounds/enumvaluetype-dm.js';
export declare const sectionHeaders: Record<string, [string, number]>;
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
export declare class Section {
    /**
     * The parent compound containing this section.
     *
     * @remarks
     * References the compound (class, namespace, file, etc.) that owns
     * this section for context and rendering operations.
     */
    compound: CompoundBase;
    /**
     * The section kind identifier from Doxygen.
     *
     * @remarks
     * Specifies the type of section (e.g., 'public-func', 'private-attrib',
     * 'typedef') which determines member organisation and display headers.
     */
    kind: string;
    /**
     * The display header name for this section.
     *
     * @remarks
     * Human-readable section title derived from the kind, used for
     * generating section headers in the documentation output.
     */
    headerName: string;
    /**
     * Optional section description lines in HTML format.
     *
     * @remarks
     * Contains processed description content for sections that include
     * additional explanatory text beyond the standard header.
     */
    descriptionLines: string[] | undefined;
    /**
     * All members in this section including references and definitions.
     *
     * @remarks
     * Contains both member definitions and member references in their
     * original order, used for generating member indices and overviews.
     */
    indexMembers: (MemberRef | Member)[];
    /**
     * Only member definitions in this section, sorted alphabetically.
     *
     * @remarks
     * Filtered collection containing only actual member definitions
     * (not references), sorted by name for detailed documentation rendering.
     */
    definitionMembers: Member[];
    /**
     * Private data available only during initialisation.
     *
     * @remarks
     * Temporary storage for section definition data that is cleared
     * after late initialisation to reduce memory usage.
     *
     * @internal
     */
    _private: {
        _sectionDef?: SectionDefDataModel;
    };
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
    constructor(compound: CompoundBase, sectionDef: SectionDefDataModel);
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
    initializeLate(): void;
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
    hasDefinitionMembers(): boolean;
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
    getHeaderNameByKind(sectionDef: SectionDefDataModel): string;
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
    getSectionOrderByKind(): number;
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
    renderIndexToLines(): string[];
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
    renderToLines(): string[];
}
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
declare class MemberBase {
    /**
     * The parent section containing this member.
     *
     * @remarks
     * References the section that owns this member for context and
     * access to compound and workspace information.
     */
    section: Section;
    /**
     * The member name identifier.
     *
     * @remarks
     * Base name of the member used for identification and documentation
     * generation across different member types.
     */
    name: string;
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
    constructor(section: Section, name: string);
    /**
     * Performs late initialisation for members.
     *
     * @remarks
     * Base implementation is intentionally empty, allowing subclasses to
     * override with specific initialisation logic as needed.
     *
     * @public
     */
    initializeLate(): void;
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
export declare class Member extends MemberBase {
    /**
     * Unique identifier for this member.
     *
     * @remarks
     * Doxygen-generated unique ID used for cross-references, permalinks,
     * and member lookup operations throughout the documentation.
     */
    id: string;
    /**
     * The member kind from Doxygen classification.
     *
     * @remarks
     * Specifies the type of member (e.g., 'function', 'variable', 'enum',
     * 'typedef') which determines rendering and documentation behaviour.
     */
    kind: string;
    /**
     * Brief description in HTML format.
     *
     * @remarks
     * Optional short description of the member, processed into HTML for
     * display in indices and member overviews.
     */
    briefDescriptionHtmlString: string | undefined;
    /**
     * Detailed description lines in HTML format.
     *
     * @remarks
     * Comprehensive member documentation including parameters, return values,
     * examples, and detailed explanations processed into HTML lines.
     */
    detailedDescriptionHtmlLines: string[] | undefined;
    /**
     * Function argument string from Doxygen.
     *
     * @remarks
     * Contains the complete function signature arguments including types,
     * names, and default values for function-type members.
     */
    argsstring: string | undefined;
    /**
     * Fully qualified member name.
     *
     * @remarks
     * Complete qualified name including namespace and class scope,
     * used for accurate member identification and documentation.
     */
    qualifiedName: string | undefined;
    /**
     * Member definition string from Doxygen.
     *
     * @remarks
     * Complete member definition including type, qualifiers, and signature,
     * used for generating accurate member documentation and prototypes.
     */
    definition: string | undefined;
    /**
     * Member type information in HTML format.
     *
     * @remarks
     * Type specification for the member including template parameters and
     * qualifiers, processed into HTML for documentation display.
     */
    type: string | undefined;
    /**
     * Member initialiser lines in HTML format.
     *
     * @remarks
     * Variable or constant initialisation values, processed into HTML lines
     * for display in member documentation and indices.
     */
    initializerHtmlLines: string[] | undefined;
    /**
     * Location information in Markdown format.
     *
     * @remarks
     * File and line number information for the member definition,
     * formatted as Markdown for documentation display.
     */
    locationMarkdownLines: string[] | undefined;
    /**
     * Template parameters string.
     *
     * @remarks
     * Template parameter specification for template members, formatted
     * for display in member documentation headers.
     */
    templateParameters: string | undefined;
    /**
     * Enumeration values in HTML format.
     *
     * @remarks
     * For enum members, contains the formatted enumeration values table
     * with descriptions, processed into HTML lines.
     */
    enumHtmlLines: string[] | undefined;
    /**
     * Function parameters in HTML format.
     *
     * @remarks
     * For function members, contains the processed parameter list with
     * types and names formatted as HTML string.
     */
    parametersHtmlString: string | undefined;
    /**
     * Program listing for inline code display.
     *
     * @remarks
     * When enabled, contains the source code excerpt for the member
     * definition for inline documentation display.
     */
    programListing: ProgramListingDataModel | undefined;
    /**
     * Cross-references to members that reference this member.
     *
     * @remarks
     * Markdown-formatted list of members and locations that reference
     * this member, providing reverse lookup capabilities.
     */
    referencedByMarkdownString: string | undefined;
    /**
     * Cross-references to members referenced by this member.
     *
     * @remarks
     * Markdown-formatted list of members and locations referenced by
     * this member, providing forward lookup capabilities.
     */
    referencesMarkdownString: string | undefined;
    /**
     * Enumeration values for enum members.
     *
     * @remarks
     * For enumeration members, contains the collection of enum values
     * with their documentation and initialiser values.
     */
    enumValues: EnumValue[] | undefined;
    /**
     * Collection of member attribute labels.
     *
     * @remarks
     * Contains labels such as 'static', 'inline', 'virtual', 'const' that
     * are displayed as badges in the member documentation.
     */
    labels: string[];
    /**
     * Indicates if the member uses trailing return type syntax.
     *
     * @remarks
     * For C++ functions with trailing return types (auto func() -> Type),
     * affects how the member signature is formatted in documentation.
     */
    isTrailingType: boolean;
    /**
     * Indicates if the member is declared as constexpr.
     *
     * @remarks
     * True for constexpr members, affects display formatting and
     * documentation generation for compile-time constants.
     */
    isConstexpr: boolean;
    /**
     * Indicates if the member is a strong enum.
     *
     * @remarks
     * True for enum class declarations, affects how enumeration
     * documentation is formatted and displayed.
     */
    isStrong: boolean;
    /**
     * Indicates if the member is declared as const.
     *
     * @remarks
     * True for const members, affects member signature display
     * and documentation formatting.
     */
    isConst: boolean;
    /**
     * Indicates if the member is declared as static.
     *
     * @remarks
     * True for static members, affects member organisation,
     * display formatting, and section classification.
     */
    isStatic: boolean;
    /**
     * Private data available only during initialisation.
     *
     * @remarks
     * Temporary storage for member definition data that is cleared
     * after late initialisation to reduce memory usage.
     *
     * @internal
     */
    _private: {
        _memberDef?: MemberDefDataModel;
    };
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
    constructor(section: Section, memberDef: MemberDefDataModel);
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
    initializeLate(): void;
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
    filterProgramListingForLocation(location: LocationDataModel | undefined): MemberProgramListingDataModel | undefined;
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
    renderIndexToLines(): string[];
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
    renderToLines(): string[];
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
    private renderMemberDefinitionToLines;
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
    renderEnumToLines(): string[];
}
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
export declare class MemberRef extends MemberBase {
    /**
     * Reference ID pointing to the actual member definition.
     *
     * @remarks
     * Unique identifier used to locate the referenced member definition
     * in the global members collection for rendering and cross-referencing.
     */
    refid: string;
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
    constructor(section: Section, memberRef: MemberDataModel);
}
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
export declare class EnumValue {
    /**
     * The enumeration value name.
     *
     * @remarks
     * Identifier name of the enumeration constant as declared in the source code.
     */
    name: string;
    /**
     * Unique identifier for this enumeration value.
     *
     * @remarks
     * Doxygen-generated unique ID used for cross-references and anchor
     * generation in the documentation.
     */
    id: string;
    /**
     * Brief description in HTML format.
     *
     * @remarks
     * Optional description of the enumeration value, processed into HTML
     * for display in enumeration tables and documentation.
     */
    briefDescriptionHtmlString: string | undefined;
    /**
     * Initialiser value in HTML format.
     *
     * @remarks
     * The assigned value for the enumeration constant, if explicitly specified,
     * formatted as HTML for documentation display.
     */
    initializerHtmlString: string | undefined;
    /**
     * Reference to the parent enumeration member.
     *
     * @remarks
     * Back-reference to the Member instance that contains this enumeration
     * value, providing access to parent context and workspace information.
     */
    member: Member;
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
    constructor(member: Member, enumValue: EnumValueDataModel);
}
export {};
//# sourceMappingURL=members-vm.d.ts.map