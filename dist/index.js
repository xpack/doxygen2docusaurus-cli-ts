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
/**
 * A CLI application to convert Doxygen XML files into Docusaurus
 * documentation.
 *
 * @remarks
 * This tool facilitates the integration of Doxygen reference pages into
 * Docusaurus documentation sites. It parses Doxygen-generated XML files and
 * produces Docusaurus `.md` documents, along with the corresponding sidebars
 * and menu entries.
 *
 * @packageDocumentation
 */
// ----------------------------------------------------------------------------
// The top entry point into the plugin, mentioned in `package.json`.
import { AbstractCompoundDefType, CompoundDefDataModel, } from './doxygen/data-model/compounds/compounddef-dm.js';
import { AbstractDataModelBase, } from './doxygen/data-model/types.js';
import { CliOptions } from './docusaurus/options.js';
import { DoxygenXmlParser } from './doxygen/doxygen-xml-parser.js';
import { DoxygenFileDataModel, AbstractDoxygenFileType, } from './doxygen/data-model/doxyfile/doxyfiletype-dm.js';
import { DoxygenIndexDataModel, AbstractIndexDoxygenType, } from './doxygen/data-model/index/indexdoxygentype-dm.js';
import { AbstractDocImageType, AbstractListingType, AbstractDescriptionType, AbstractListingTypeBase, CodeLineDataModel, DescriptionDataModel, AbstractCodeLineType, HighlightDataModel, InbodyDescriptionDataModel, AbstractHighlightType, } from './doxygen/data-model/compounds/descriptiontype-dm.js';
import { BriefDescriptionDataModel, DetailedDescriptionDataModel, ProgramListingDataModel, } from './doxygen/data-model/compounds/descriptiontype-dm.js';
import { BaseCompoundRefDataModel, DerivedCompoundRefDataModel, AbstractCompoundRefType, } from './doxygen/data-model/compounds/compoundreftype-dm.js';
import { IncludesDataModel, IncludedByDataModel, AbstractIncType, } from './doxygen/data-model/compounds/inctype-dm.js';
import { AbstractRefType, InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel, } from './doxygen/data-model/compounds/reftype-dm.js';
import { AbstractLocationType, LocationDataModel, } from './doxygen/data-model/compounds/locationtype-dm.js';
import { AbstractSectionDefType, SectionDefDataModel, AbstractSectionDefTypeBase, } from './doxygen/data-model/compounds/sectiondeftype-dm.js';
import { AbstractTemplateParamListType, TemplateParamListDataModel, } from './doxygen/data-model/compounds/templateparamlisttype-dm.js';
import { AbstractListOfAllMembersType, ListOfAllMembersDataModel, } from './doxygen/data-model/compounds/listofallmemberstype-dm.js';
import { AbstractTableOfContentsType, TableOfContentsDataModel, TocSectDataModel, AbstractTableOfContentsKindType, } from './doxygen/data-model/compounds/tableofcontentstype-dm.js';
import { AbstractIndexCompoundType, IndexCompoundDataModel, } from './doxygen/data-model/index/indexcompoundtype-dm.js';
import { DoxygenFileOptionDataModel, AbstractDoxygenFileOptionType, } from './doxygen/data-model/doxyfile/doxyfileoptiontype-dm.js';
import { IndexMemberDataModel, AbstractIndexMemberType, } from './doxygen/data-model/index/indexmembertype-dm.js';
import { MemberRefDataModel, AbstractMemberRefType, } from './doxygen/data-model/compounds/memberreftype-dm.js';
import { ParamDataModel, AbstractParamType, } from './doxygen/data-model/compounds/paramtype-dm.js';
import { MemberDataModel, AbstractMemberType, } from './doxygen/data-model/compounds/membertype-dm.js';
import { MemberDefDataModel, AbstractMemberDefType, AbstractMemberBaseType, } from './doxygen/data-model/compounds/memberdeftype-dm.js';
import { TypeDataModel, DefValDataModel, TypeConstraintDataModel, AbstractLinkedTextType, InitializerDataModel, } from './doxygen/data-model/compounds/linkedtexttype-dm.js';
import { ReferenceDataModel, ReferencedByDataModel, AbstractReferenceType, } from './doxygen/data-model/compounds/referencetype-dm.js';
import { ReimplementDataModel, AbstractReimplementType, } from './doxygen/data-model/compounds/reimplementtype-dm.js';
import { EnumValueDataModel, AbstractEnumValueType, } from './doxygen/data-model/compounds/enumvaluetype-dm.js';
export * from './cli/main.js';
export { 
// Core classes
CompoundDefDataModel, AbstractCompoundDefType, CliOptions, DoxygenXmlParser, DoxygenFileDataModel, DoxygenIndexDataModel, AbstractIncType, AbstractIndexCompoundType, AbstractDocImageType, AbstractDoxygenFileType, AbstractIndexDoxygenType, AbstractDataModelBase, AbstractListingType, AbstractListOfAllMembersType, AbstractLocationType, AbstractRefType, AbstractSectionDefType, AbstractTableOfContentsType, AbstractTemplateParamListType, 
// Missing symbols for API Extractor
IndexMemberDataModel, AbstractListingTypeBase, MemberRefDataModel, AbstractSectionDefTypeBase, TocSectDataModel, ParamDataModel, AbstractCompoundRefType, AbstractDescriptionType, AbstractDoxygenFileOptionType, AbstractTableOfContentsKindType, CodeLineDataModel, DescriptionDataModel, MemberDefDataModel, MemberDataModel, AbstractIndexMemberType, AbstractMemberRefType, AbstractParamType, DefValDataModel, TypeDataModel, TypeConstraintDataModel, AbstractCodeLineType, AbstractMemberType, AbstractMemberDefType, HighlightDataModel, AbstractMemberBaseType, EnumValueDataModel, InbodyDescriptionDataModel, InitializerDataModel, ReferencedByDataModel, ReferenceDataModel, ReimplementDataModel, AbstractLinkedTextType, AbstractEnumValueType, AbstractHighlightType, AbstractReferenceType, AbstractReimplementType, 
// Description types
BriefDescriptionDataModel, DetailedDescriptionDataModel, ProgramListingDataModel, 
// Compound references
BaseCompoundRefDataModel, DerivedCompoundRefDataModel, 
// Include types
IncludesDataModel, IncludedByDataModel, 
// Inner types
InnerClassDataModel, InnerDirDataModel, InnerFileDataModel, InnerGroupDataModel, InnerNamespaceDataModel, InnerPageDataModel, 
// Other data models
LocationDataModel, SectionDefDataModel, TemplateParamListDataModel, ListOfAllMembersDataModel, TableOfContentsDataModel, IndexCompoundDataModel, DoxygenFileOptionDataModel, };
//# sourceMappingURL=index.js.map