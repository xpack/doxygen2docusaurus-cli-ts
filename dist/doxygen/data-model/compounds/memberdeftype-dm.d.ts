import { DoxygenXmlParser } from '../doxygen-xml-parser.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, InbodyDescriptionDataModel } from './descriptiontype-dm.js';
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { EnumValueDataModel } from './enumvaluetype-dm.js';
import { ReimplementDataModel } from './reimplementtype-dm.js';
import { ReferenceDataModel, ReferencedByDataModel } from './referencetype-dm.js';
/**
 * Union type representing all possible member kinds within Doxygen
 * documentation.
 *
 * @remarks
 * Defines the complete set of member types that can be documented by Doxygen,
 * encompassing various programming language constructs including C/C++
 * elements, Qt-specific constructs, and language-specific features from
 * multiple programming paradigms.
 *
 * The enumeration covers traditional programming constructs (functions,
 * variables, typedefs), modern C++ features, Qt framework elements (signals,
 * slots), and specialised constructs from various development environments.
 *
 * @public
 */
export type DoxMemberKind = 'define' | 'property' | 'event' | 'variable' | 'typedef' | 'enum' | 'function' | 'signal' | 'prototype' | 'friend' | 'dcop' | 'slot' | 'interface' | 'service';
/**
 * Abstract base class for member-related data models within documentation.
 *
 * @remarks
 * Provides foundational functionality for all member-related elements within
 * the Doxygen documentation system. This class establishes the basic
 * structure for member identification and classification, serving as the
 * foundation for more specific member definition processing.
 *
 * The class maintains essential member information including name and kind
 * identification, which are fundamental properties required by all member
 * types within the documentation hierarchy.
 *
 * @public
 */
export declare abstract class AbstractMemberBaseType extends AbstractDataModelBase {
    /**
     * The name of the member element.
     *
     * @remarks
     * Contains the identifier name for the member as extracted from the
     * documentation source. This represents the primary identification
     * mechanism for the member within its containing scope.
     *
     * @public
     */
    name: string;
    /**
     * The kind classification of the member element.
     *
     * @remarks
     * Specifies the type category of the member, corresponding to the
     * DoxMemberKind enumeration values. This classification determines
     * how the member is processed and presented within the documentation
     * generation workflow.
     *
     * @public
     */
    kind: string;
}
/**
 * Abstract base class for comprehensive member definition data models.
 *
 * @remarks
 * Extends the basic member functionality to provide complete member
 * definition processing capabilities. This class handles the complex XML
 * Schema definition for memberdefType elements, which represent detailed
 * member information including location data, type information, parameters,
 * descriptions, and various language-specific attributes.
 *
 * The implementation processes extensive member metadata including template
 * parameters, function signatures, initialization values, documentation
 * descriptions, and cross-reference information. It also manages a
 * comprehensive set of language-specific attributes covering C++, Qt,
 * C++/CLI, C#, Objective-C, and UNO IDL constructs.
 *
 * @public
 */
export declare abstract class AbstractMemberDefType extends AbstractMemberBaseType {
    /**
     * The location information for the member definition.
     *
     * @remarks
     * Contains comprehensive source code location data including file paths,
     * line numbers, and column positions for both declarations and
     * implementations. This enables precise navigation between documentation
     * and source code.
     *
     * @public
     */
    location: LocationDataModel | undefined;
    /**
     * The unique identifier for the member element.
     *
     * @remarks
     * Provides a unique identification string for the member within the
     * documentation system. This identifier is used for cross-referencing
     * and linking between different parts of the documentation.
     *
     * @public
     */
    id: string;
    /**
     * The protection level of the member element.
     *
     * @remarks
     * Specifies the access protection level (public, protected, private)
     * for the member, determining its visibility and accessibility within
     * the containing class or namespace scope.
     *
     * @public
     */
    prot: string;
    /**
     * Indicates whether the member is declared as static.
     *
     * @remarks
     * Boolean flag indicating static member declaration, affecting the
     * member's association with class instances versus the class itself.
     * This information is crucial for understanding member accessibility
     * and usage patterns.
     *
     * @public
     */
    staticc: boolean | undefined;
    /**
     * Template parameter list information for templated members.
     *
     * @remarks
     * Contains detailed information about template parameters when the member
     * is part of a template declaration. This includes parameter names, types,
     * and default values essential for template documentation.
     *
     * @public
     */
    templateparamlist?: TemplateParamListDataModel | undefined;
    /**
     * Type information for the member element.
     *
     * @remarks
     * Provides comprehensive type data including linked text with embedded
     * cross-references. This information describes the member's data type,
     * return type for functions, or variable type for data members.
     *
     * @public
     */
    type?: TypeDataModel | undefined;
    /**
     * The complete definition string for the member.
     *
     * @remarks
     * Contains the full member definition as it appears in the source code,
     * including type information, qualifiers, and parameter lists. This
     * provides the complete syntactic representation of the member.
     *
     * @public
     */
    definition?: string | undefined;
    /**
     * The argument string for function members.
     *
     * @remarks
     * Contains the parameter list specification for function-like members,
     * including parameter types, names, and default values. This information
     * is essential for understanding function signatures and usage.
     *
     * @public
     */
    argsstring?: string | undefined;
    /**
     * The fully qualified name of the member element.
     *
     * @remarks
     * Provides the complete qualified name including namespace and class
     * prefixes, enabling unambiguous identification of the member within
     * the entire codebase context.
     *
     * @public
     */
    qualifiedName?: string | undefined;
    /**
     * Bitfield specification for member variables.
     *
     * @remarks
     * Contains the bitfield width specification for member variables that
     * are declared as bitfields in C/C++ structures or classes. This string
     * represents the number of bits allocated to the member within the
     * containing structure's memory layout.
     */
    bitfield?: string | undefined;
    /**
     * List of reimplemented member references.
     *
     * @remarks
     * Contains references to members that this member reimplements or
     * overrides from base classes. This property captures inheritance
     * relationships where the current member provides a new implementation
     * of a virtual method from a parent class.
     */
    reimplements?: ReimplementDataModel[] | undefined;
    /**
     * List of members that reimplement this member.
     *
     * @remarks
     * Contains references to derived class members that reimplement or
     * override this member. This property provides reverse inheritance
     * relationship information, showing which child classes provide
     * alternative implementations of this member.
     */
    reimplementedBys?: ReimplementDataModel[] | undefined;
    /**
     * Parameter list for function or method members.
     *
     * @remarks
     * Contains detailed parameter information for function-like members,
     * including parameter names, types, descriptions, and default values.
     * This comprehensive parameter data enables complete function signature
     * documentation and API reference generation.
     */
    params?: ParamDataModel[] | undefined;
    /**
     * Enumeration values for enum members.
     *
     * @remarks
     * Contains the list of enumeration constants when the member is an enum
     * type. Each enumeration value includes its name, numeric value, and
     * associated documentation, providing complete enum documentation
     * for API references.
     */
    enumvalues?: EnumValueDataModel[] | undefined;
    /**
     * Initializer expression for the member.
     *
     * @remarks
     * Contains the initialization expression or default value assigned to
     * the member in its declaration. This linked text may include
     * cross-references to other documented entities and provides insight
     * into the member's default behaviour or initial state.
     */
    initializer?: InitializerDataModel | undefined;
    /**
     * Brief description of the member.
     *
     * @remarks
     * Contains a concise summary description of the member extracted from
     * documentation comments. This brief description is typically used in
     * member listings and summary views to provide quick understanding
     * of the member's purpose.
     */
    briefDescription?: BriefDescriptionDataModel | undefined;
    /**
     * Detailed description of the member.
     *
     * @remarks
     * Contains comprehensive documentation for the member including detailed
     * explanations, usage examples, parameter descriptions, and return value
     * information. This forms the primary documentation content for the
     * member in generated API documentation.
     */
    detailedDescription?: DetailedDescriptionDataModel | undefined;
    /**
     * In-body description of the member.
     *
     * @remarks
     * Contains documentation that appears within the member's implementation
     * body, typically used for additional implementation notes or internal
     * documentation that supplements the main member description.
     */
    inbodyDescription?: InbodyDescriptionDataModel | undefined;
    /**
     * References made by this member to other entities.
     *
     * @remarks
     * Contains a list of references to other documented entities that this
     * member uses or calls. This information enables dependency analysis
     * and cross-reference navigation in the generated documentation.
     */
    references?: ReferenceDataModel[] | undefined;
    /**
     * References to this member from other entities.
     *
     * @remarks
     * Contains a list of other documented entities that reference or use
     * this member. This reverse reference information helps understand
     * the member's usage throughout the codebase and enables comprehensive
     * cross-reference navigation.
     */
    referencedBy?: ReferencedByDataModel[] | undefined;
    /**
     * Indicates whether the member has external linkage.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with external
     * linkage, typically using the 'extern' keyword in C/C++. This affects
     * the member's visibility and linkage across translation units.
     */
    extern?: boolean | undefined;
    /**
     * Indicates whether the member has strong typing.
     *
     * @remarks
     * Boolean flag indicating strong type enforcement for the member,
     * typically used in languages or contexts where type strength can
     * be explicitly specified to prevent implicit conversions.
     */
    strong?: boolean | undefined;
    /**
     * Indicates whether the member is declared as const.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with the const
     * qualifier, making it immutable after initialization. This affects
     * the member's usage patterns and compiler optimizations.
     */
    constt?: boolean | undefined;
    /**
     * Indicates whether the member is declared as explicit.
     *
     * @remarks
     * Boolean flag indicating that constructors or conversion operators
     * are marked as explicit, preventing implicit conversions. This is
     * particularly important for type safety in C++ class design.
     */
    explicit?: boolean | undefined;
    /**
     * Indicates whether the member is declared as inline.
     *
     * @remarks
     * Boolean flag indicating that the member is defined inline, suggesting
     * to the compiler that calls should be expanded in place rather than
     * using function call mechanisms. This affects performance and linking.
     */
    inline?: boolean | undefined;
    /**
     * Indicates the reference qualifier for the member.
     *
     * @remarks
     * Boolean flag related to C++11 reference qualifiers (&, &&) that
     * specify whether member functions can be called on lvalue or rvalue
     * objects. This affects method overload resolution and move semantics.
     */
    refqual?: boolean | undefined;
    /**
     * Virtual specification for the member.
     *
     * @remarks
     * String indicating the virtual nature of the member using DoxVirtualKind
     * values ('non-virtual', 'virtual', 'pure-virtual'). This determines
     * the member's behaviour in inheritance hierarchies and polymorphism.
     */
    virt?: string | undefined;
    /**
     * Indicates whether the member is declared as volatile.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with the volatile
     * qualifier, preventing compiler optimizations that assume the value
     * doesn't change unexpectedly. This is important for hardware registers
     * and multi-threaded contexts.
     */
    volatile?: boolean | undefined;
    /**
     * Indicates whether the member is declared as mutable.
     *
     * @remarks
     * Boolean flag indicating that the member can be modified even in const
     * objects. This is typically used for caching, lazy evaluation, or
     * other implementation details that don't affect the logical state.
     */
    mutable?: boolean | undefined;
    /**
     * Indicates whether the member is declared as noexcept.
     *
     * @remarks
     * Boolean flag indicating that the member promises not to throw
     * exceptions. This C++11 feature enables compiler optimizations and
     * affects exception safety guarantees in the API design.
     */
    noexcept?: boolean | undefined;
    /**
     * Indicates whether the member has a noexcept expression.
     *
     * @remarks
     * Boolean flag indicating that the member's noexcept specification
     * includes a conditional expression that determines exception safety
     * at compile time based on template parameters or other conditions.
     */
    noexceptexpression?: boolean | undefined;
    /**
     * Indicates whether the member is declared as nodiscard.
     *
     * @remarks
     * Boolean flag indicating that the member's return value should not
     * be ignored by callers. This C++17 attribute helps prevent common
     * programming errors where important return values are discarded.
     */
    nodiscard?: boolean | undefined;
    /**
     * Indicates whether the member is declared as constexpr.
     *
     * @remarks
     * Boolean flag indicating that the member can be evaluated at compile
     * time when given constant expressions as arguments. This C++11 feature
     * enables compile-time computation and optimization.
     */
    constexpr?: boolean | undefined;
    /**
     * Indicates whether the member is declared as consteval.
     *
     * @remarks
     * Boolean flag indicating that the member must be evaluated at compile
     * time. This C++20 feature is stronger than constexpr, requiring
     * immediate evaluation during compilation.
     */
    consteval?: boolean | undefined;
    /**
     * Indicates whether the member is declared as constinit.
     *
     * @remarks
     * Boolean flag indicating that the member must be initialized with
     * a constant expression during static initialization. This C++20
     * feature helps prevent initialization order issues.
     */
    constinit?: boolean | undefined;
    /**
     * Indicates whether the member is declared as final.
     *
     * @remarks
     * Boolean flag indicating that virtual members cannot be overridden
     * in derived classes. This provides explicit control over inheritance
     * hierarchies and enables compiler optimizations.
     */
    final?: boolean | undefined;
    /**
     * Constructs a new member definition data model from XML element data.
     *
     * @param xml - The XML parser instance for processing element data
     * @param element - The XML element containing member definition information
     * @param elementName - The name of the XML element being processed
     *
     * @remarks
     * Processes the comprehensive XML element representing member definition
     * information and extracts all available metadata including location data,
     * type information, parameters, descriptions, and language-specific
     * attributes. The constructor handles the complex memberdefType schema
     * with its extensive set of optional elements and attributes.
     *
     * The implementation validates mandatory elements (name, location, kind,
     * id, protection) whilst gracefully handling optional elements and
     * attributes. It processes various member types including functions,
     * variables, typedefs, enums, and specialised constructs from multiple
     * programming languages and frameworks.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object, elementName: string);
}
/**
 * Concrete implementation for memberdef elements within compound documentation.
 *
 * @remarks
 * Provides specific handling for memberdef XML elements that contain
 * comprehensive member definition information within classes, structures,
 * namespaces, and other compound types. This implementation extends the
 * abstract base class functionality to process the complete range of
 * member definitions including functions, variables, typedefs, enums,
 * and specialised language constructs.
 *
 * The class ensures proper instantiation of member definition data models
 * whilst maintaining all the detailed metadata required for accurate
 * documentation generation including cross-references, location information,
 * and language-specific attributes.
 *
 * @public
 */
export declare class MemberDefDataModel extends AbstractMemberDefType {
    /**
     * Constructs a new memberdef data model instance.
     *
     * @param xml - The XML parser instance for processing elements
     * @param element - The source XML element containing memberdef data
     *
     * @remarks
     * Initialises the data model with the specific element name 'memberdef'
     * and delegates processing to the abstract base class implementation.
     * This ensures consistent handling of member definition information
     * whilst maintaining proper element identification.
     *
     * @public
     */
    constructor(xml: DoxygenXmlParser, element: object);
}
//# sourceMappingURL=memberdeftype-dm.d.ts.map