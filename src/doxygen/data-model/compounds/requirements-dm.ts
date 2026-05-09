/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2026 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can be
 * obtained from https://opensource.org/licenses/mit.
 */

// ----------------------------------------------------------------------------

// <xsd:complexType name="requirementslistType">
//   <xsd:sequence>
//     <xsd:element name="requirement" type="requirementType" minOccurs="1" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="requirementType">
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" />
//     <xsd:element name="location" type="locationType" />
//     <xsd:element name="satisfiedby" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="verifiedby" type="compoundRefType" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="tagfile" type="xsd:string" use="optional" />
//   <xsd:attribute name="page" type="xsd:string" use="optional" />
// </xsd:complexType>

// <xsd:complexType name="requirementRefsType">
//   <xsd:sequence>
//     <xsd:element name="requirement" type="requirementRefType" minOccurs="1" maxOccurs="unbounded"/>
//   </xsd:sequence>
// </xsd:complexType>

// <xsd:complexType name="requirementRefType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="refid" type="xsd:string" use="required"/>
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

// ----------------------------------------------------------------------------

// TODO: add content.

// ----------------------------------------------------------------------------
