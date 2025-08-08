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
import * as util from 'node:util';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, InbodyDescriptionDataModel, } from './descriptiontype-dm.js';
import { InitializerDataModel, TypeDataModel } from './linkedtexttype-dm.js';
import { LocationDataModel } from './locationtype-dm.js';
import { ParamDataModel } from './paramtype-dm.js';
import { AbstractDataModelBase } from '../types.js';
import { TemplateParamListDataModel } from './templateparamlisttype-dm.js';
import { EnumValueDataModel } from './enumvaluetype-dm.js';
import { ReimplementDataModel, ReimplementedByDataModel, } from './reimplementtype-dm.js';
import { ReferenceDataModel, ReferencedByDataModel, } from './referencetype-dm.js';
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
export class AbstractMemberBaseType extends AbstractDataModelBase {
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
    name = '';
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
    kind = '';
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
export class AbstractMemberDefType extends AbstractMemberBaseType {
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
    location;
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
    id = '';
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
    prot = '';
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
    staticc;
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
    templateparamlist;
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
    type;
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
    definition;
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
    argsstring;
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
    qualifiedName;
    // read?: string | undefined
    // write?: string | undefined
    /**
     * Bitfield specification for member variables.
     *
     * @remarks
     * Contains the bitfield width specification for member variables that
     * are declared as bitfields in C/C++ structures or classes. This string
     * represents the number of bits allocated to the member within the
     * containing structure's memory layout.
     */
    bitfield;
    /**
     * List of reimplemented member references.
     *
     * @remarks
     * Contains references to members that this member reimplements or
     * overrides from base classes. This property captures inheritance
     * relationships where the current member provides a new implementation
     * of a virtual method from a parent class.
     */
    reimplements;
    /**
     * List of members that reimplement this member.
     *
     * @remarks
     * Contains references to derived class members that reimplement or
     * override this member. This property provides reverse inheritance
     * relationship information, showing which child classes provide
     * alternative implementations of this member.
     */
    reimplementedBys;
    // qualifier?: string[] | undefined
    /**
     * Parameter list for function or method members.
     *
     * @remarks
     * Contains detailed parameter information for function-like members,
     * including parameter names, types, descriptions, and default values.
     * This comprehensive parameter data enables complete function signature
     * documentation and API reference generation.
     */
    params;
    /**
     * Enumeration values for enum members.
     *
     * @remarks
     * Contains the list of enumeration constants when the member is an enum
     * type. Each enumeration value includes its name, numeric value, and
     * associated documentation, providing complete enum documentation
     * for API references.
     */
    enumvalues;
    // requiresclause?: LinkedTextType | undefined
    /**
     * Initializer expression for the member.
     *
     * @remarks
     * Contains the initialization expression or default value assigned to
     * the member in its declaration. This linked text may include
     * cross-references to other documented entities and provides insight
     * into the member's default behaviour or initial state.
     */
    initializer;
    // exceptions?: LinkedTextType | undefined
    /**
     * Brief description of the member.
     *
     * @remarks
     * Contains a concise summary description of the member extracted from
     * documentation comments. This brief description is typically used in
     * member listings and summary views to provide quick understanding
     * of the member's purpose.
     */
    briefDescription;
    /**
     * Detailed description of the member.
     *
     * @remarks
     * Contains comprehensive documentation for the member including detailed
     * explanations, usage examples, parameter descriptions, and return value
     * information. This forms the primary documentation content for the
     * member in generated API documentation.
     */
    detailedDescription;
    /**
     * In-body description of the member.
     *
     * @remarks
     * Contains documentation that appears within the member's implementation
     * body, typically used for additional implementation notes or internal
     * documentation that supplements the main member description.
     */
    inbodyDescription;
    /**
     * References made by this member to other entities.
     *
     * @remarks
     * Contains a list of references to other documented entities that this
     * member uses or calls. This information enables dependency analysis
     * and cross-reference navigation in the generated documentation.
     */
    references;
    /**
     * References to this member from other entities.
     *
     * @remarks
     * Contains a list of other documented entities that reference or use
     * this member. This reverse reference information helps understand
     * the member's usage throughout the codebase and enables comprehensive
     * cross-reference navigation.
     */
    referencedBy;
    // Optional attributes.
    /**
     * Indicates whether the member has external linkage.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with external
     * linkage, typically using the 'extern' keyword in C/C++. This affects
     * the member's visibility and linkage across translation units.
     */
    extern;
    /**
     * Indicates whether the member has strong typing.
     *
     * @remarks
     * Boolean flag indicating strong type enforcement for the member,
     * typically used in languages or contexts where type strength can
     * be explicitly specified to prevent implicit conversions.
     */
    strong;
    /**
     * Indicates whether the member is declared as const.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with the const
     * qualifier, making it immutable after initialization. This affects
     * the member's usage patterns and compiler optimizations.
     */
    constt;
    /**
     * Indicates whether the member is declared as explicit.
     *
     * @remarks
     * Boolean flag indicating that constructors or conversion operators
     * are marked as explicit, preventing implicit conversions. This is
     * particularly important for type safety in C++ class design.
     */
    explicit;
    /**
     * Indicates whether the member is declared as inline.
     *
     * @remarks
     * Boolean flag indicating that the member is defined inline, suggesting
     * to the compiler that calls should be expanded in place rather than
     * using function call mechanisms. This affects performance and linking.
     */
    inline;
    /**
     * Indicates the reference qualifier for the member.
     *
     * @remarks
     * Boolean flag related to C++11 reference qualifiers (&, &&) that
     * specify whether member functions can be called on lvalue or rvalue
     * objects. This affects method overload resolution and move semantics.
     */
    refqual;
    /**
     * Virtual specification for the member.
     *
     * @remarks
     * String indicating the virtual nature of the member using DoxVirtualKind
     * values ('non-virtual', 'virtual', 'pure-virtual'). This determines
     * the member's behaviour in inheritance hierarchies and polymorphism.
     */
    virt;
    /**
     * Indicates whether the member is declared as volatile.
     *
     * @remarks
     * Boolean flag indicating that the member is declared with the volatile
     * qualifier, preventing compiler optimizations that assume the value
     * doesn't change unexpectedly. This is important for hardware registers
     * and multi-threaded contexts.
     */
    volatile;
    /**
     * Indicates whether the member is declared as mutable.
     *
     * @remarks
     * Boolean flag indicating that the member can be modified even in const
     * objects. This is typically used for caching, lazy evaluation, or
     * other implementation details that don't affect the logical state.
     */
    mutable;
    /**
     * Indicates whether the member is declared as noexcept.
     *
     * @remarks
     * Boolean flag indicating that the member promises not to throw
     * exceptions. This C++11 feature enables compiler optimizations and
     * affects exception safety guarantees in the API design.
     */
    noexcept;
    /**
     * Indicates whether the member has a noexcept expression.
     *
     * @remarks
     * Boolean flag indicating that the member's noexcept specification
     * includes a conditional expression that determines exception safety
     * at compile time based on template parameters or other conditions.
     */
    noexceptexpression;
    /**
     * Indicates whether the member is declared as nodiscard.
     *
     * @remarks
     * Boolean flag indicating that the member's return value should not
     * be ignored by callers. This C++17 attribute helps prevent common
     * programming errors where important return values are discarded.
     */
    nodiscard;
    /**
     * Indicates whether the member is declared as constexpr.
     *
     * @remarks
     * Boolean flag indicating that the member can be evaluated at compile
     * time when given constant expressions as arguments. This C++11 feature
     * enables compile-time computation and optimization.
     */
    constexpr;
    /**
     * Indicates whether the member is declared as consteval.
     *
     * @remarks
     * Boolean flag indicating that the member must be evaluated at compile
     * time. This C++20 feature is stronger than constexpr, requiring
     * immediate evaluation during compilation.
     */
    consteval;
    /**
     * Indicates whether the member is declared as constinit.
     *
     * @remarks
     * Boolean flag indicating that the member must be initialized with
     * a constant expression during static initialization. This C++20
     * feature helps prevent initialization order issues.
     */
    constinit;
    /**
     * Indicates whether the member is declared as final.
     *
     * @remarks
     * Boolean flag indicating that virtual members cannot be overridden
     * in derived classes. This provides explicit control over inheritance
     * hierarchies and enables compiler optimizations.
     */
    final;
    // TODO: add more...
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
    constructor(xml, element, elementName) {
        super(elementName);
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        // ------------------------------------------------------------------------
        // Process elements.
        const innerElements = xml.getInnerElements(element, elementName);
        assert(innerElements.length > 0);
        for (const innerElement of innerElements) {
            if (xml.hasInnerText(innerElement)) {
                // Ignore texts.
            }
            else if (xml.isInnerElementText(innerElement, 'name')) {
                this.name = xml.getInnerElementText(innerElement, 'name');
            }
            else if (xml.hasInnerElement(innerElement, 'location')) {
                this.location = new LocationDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'templateparamlist')) {
                this.templateparamlist = new TemplateParamListDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'type')) {
                this.type = new TypeDataModel(xml, innerElement);
            }
            else if (xml.isInnerElementText(innerElement, 'definition')) {
                this.definition = xml.getInnerElementText(innerElement, 'definition');
            }
            else if (xml.isInnerElementText(innerElement, 'argsstring')) {
                this.argsstring = xml.getInnerElementText(innerElement, 'argsstring');
            }
            else if (xml.isInnerElementText(innerElement, 'bitfield')) {
                this.bitfield = xml.getInnerElementText(innerElement, 'bitfield');
            }
            else if (xml.isInnerElementText(innerElement, 'qualifiedname')) {
                this.qualifiedName = xml.getInnerElementText(innerElement, 'qualifiedname');
            }
            else if (xml.hasInnerElement(innerElement, 'reimplements')) {
                this.reimplements ??= [];
                this.reimplements.push(new ReimplementDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'reimplementedby')) {
                this.reimplementedBys ??= [];
                this.reimplementedBys.push(new ReimplementedByDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'param')) {
                this.params ??= [];
                this.params.push(new ParamDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'enumvalue')) {
                this.enumvalues ??= [];
                this.enumvalues.push(new EnumValueDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'initializer')) {
                this.initializer = new InitializerDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'briefdescription')) {
                this.briefDescription = new BriefDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'detaileddescription')) {
                this.detailedDescription = new DetailedDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'inbodydescription')) {
                this.inbodyDescription = new InbodyDescriptionDataModel(xml, innerElement);
            }
            else if (xml.hasInnerElement(innerElement, 'references')) {
                this.references ??= [];
                this.references.push(new ReferenceDataModel(xml, innerElement));
            }
            else if (xml.hasInnerElement(innerElement, 'referencedby')) {
                this.referencedBy ??= [];
                this.referencedBy.push(new ReferencedByDataModel(xml, innerElement));
            }
            else {
                console.error(util.inspect(innerElement));
                console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet in', this.constructor.name);
            }
        }
        // WARNING it may be empty.
        // assert(this.name.length > 0)
        assert(this.location !== undefined);
        // ------------------------------------------------------------------------
        // Process attributes.
        assert(xml.hasAttributes(element));
        const attributesNames = xml.getAttributesNames(element);
        // console.log(attributesNames)
        for (const attributeName of attributesNames) {
            // console.log(attributeName)
            if (attributeName === '@_kind') {
                this.kind = xml.getAttributeStringValue(element, '@_kind');
            }
            else if (attributeName === '@_id') {
                this.id = xml.getAttributeStringValue(element, '@_id');
            }
            else if (attributeName === '@_prot') {
                this.prot = xml.getAttributeStringValue(element, '@_prot');
            }
            else if (attributeName === '@_static') {
                this.staticc = xml.getAttributeBooleanValue(element, '@_static');
            }
            else if (attributeName === '@_extern') {
                this.extern = Boolean(xml.getAttributeBooleanValue(element, '@_extern'));
            }
            else if (attributeName === '@_strong') {
                this.strong = Boolean(xml.getAttributeBooleanValue(element, '@_strong'));
            }
            else if (attributeName === '@_const') {
                this.constt = Boolean(xml.getAttributeBooleanValue(element, '@_const'));
            }
            else if (attributeName === '@_explicit') {
                this.explicit = Boolean(xml.getAttributeBooleanValue(element, '@_explicit'));
            }
            else if (attributeName === '@_inline') {
                this.inline = Boolean(xml.getAttributeBooleanValue(element, '@_inline'));
            }
            else if (attributeName === '@_refqual') {
                this.refqual = Boolean(xml.getAttributeBooleanValue(element, '@_refqual'));
            }
            else if (attributeName === '@_virt') {
                this.virt = xml.getAttributeStringValue(element, '@_virt');
            }
            else if (attributeName === '@_volatile') {
                this.volatile = xml.getAttributeBooleanValue(element, '@_volatile');
            }
            else if (attributeName === '@_mutable') {
                this.mutable = Boolean(xml.getAttributeBooleanValue(element, '@_mutable'));
            }
            else if (attributeName === '@_noexcept') {
                this.noexcept = Boolean(xml.getAttributeBooleanValue(element, '@_noexcept'));
            }
            else if (attributeName === '@_noexceptexpression') {
                this.noexceptexpression = Boolean(xml.getAttributeBooleanValue(element, '@_noexceptexpression'));
            }
            else if (attributeName === '@_nodiscard') {
                this.nodiscard = Boolean(xml.getAttributeBooleanValue(element, '@_nodiscard'));
            }
            else if (attributeName === '@_constexpr') {
                this.constexpr = Boolean(xml.getAttributeBooleanValue(element, '@_constexpr'));
            }
            else if (attributeName === '@_consteval') {
                this.consteval = Boolean(xml.getAttributeBooleanValue(element, '@_consteval'));
            }
            else if (attributeName === '@_constinit') {
                this.constinit = Boolean(xml.getAttributeBooleanValue(element, '@_constinit'));
            }
            else if (attributeName === '@_final') {
                this.final = Boolean(xml.getAttributeBooleanValue(element, '@_final'));
            }
            else {
                console.error(util.inspect(element, { compact: false, depth: 999 }));
                console.error(`${elementName} attribute:`, attributeName, 'not implemented yet in', this.constructor.name);
            }
        }
        assert(this.kind);
        assert(this.id);
        assert(this.prot);
        // ------------------------------------------------------------------------
        // console.log(util.inspect(this, { compact: false, depth: 999 }))
    }
}
// ----------------------------------------------------------------------------
// <xsd:element name="memberdef" type="memberdefType" minOccurs="0" maxOccurs="unbounded" />
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
export class MemberDefDataModel extends AbstractMemberDefType {
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
    constructor(xml, element) {
        // console.log(elementName, util.inspect(element, { compact: false, depth: 999 }))
        super(xml, element, 'memberdef');
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=memberdeftype-dm.js.map