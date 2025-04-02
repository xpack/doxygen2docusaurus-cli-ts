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

import assert from 'assert'
import * as util from 'node:util'

import { xml } from './xml.js'

// ----------------------------------------------------------------------------

// <xsd:complexType name="descriptionType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="xsd:string" minOccurs="0"/>
//     <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="internal" type="docInternalType" minOccurs="0" maxOccurs="unbounded"/>
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class DescriptionType {
  // Optional elements.
  title?: string | undefined // Only one.

  // Any sequence of them.
  children: Array<string | DocParaType | DocInternalType | DocSect1Type> = []

  constructor (element: Object, elementName: string = 'description') {
    // console.log(elementName, util.inspect(element))

    // ------------------------------------------------------------------------
    // Process elements.

    const innerElements = xml.getInnerElements(element, elementName)
    assert(innerElements.length > 0)

    for (const innerElement of innerElements) {
      if (xml.hasInnerText(innerElement)) {
        // Ignore texts.
      } else if (xml.isInnerElementText(innerElement, 'title')) {
        assert(this.title === undefined)
        this.title = xml.getInnerElementText(innerElement, 'title')
      } else if (xml.hasInnerElement(innerElement, 'para')) {
        this.children.push(new DocParaType(innerElement, 'para'))
      } else if (xml.hasInnerElement(innerElement, 'internal')) {
        this.children.push(new DocInternalType(innerElement, 'internal'))
      } else if (xml.hasInnerElement(innerElement, 'sect1')) {
        this.children.push(new DocSect1Type(innerElement, 'sect1'))
      } else {
        console.error(util.inspect(innerElement))
        console.error(`${elementName} element:`, Object.keys(innerElement), 'not implemented yet')
      }
    }

    // ------------------------------------------------------------------------
    // Process attributes.

    assert(!xml.hasAttributes(element))

    // ------------------------------------------------------------------------

    // console.log(this)
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docInternalType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="para"  type="docParaType"  minOccurs="0" maxOccurs="unbounded" />
//     <xsd:element name="sect1" type="docSect1Type" minOccurs="0" maxOccurs="unbounded" />
//   </xsd:sequence>
// </xsd:complexType>

export class DocInternalType {
  constructor (element: Object, elementName: string = 'internal') {
    // console.log(elementName, util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docParaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export class DocParaType {
  constructor (element: Object, elementName: string = 'para') {
    // console.log(elementName, util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docSect1Type" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:sequence>
//     <xsd:element name="title" type="docTitleType" minOccurs="0" />
//     <xsd:choice maxOccurs="unbounded">
//       <xsd:element name="para" type="docParaType" minOccurs="0" maxOccurs="unbounded" />
//       <xsd:element name="internal" type="docInternalS1Type" minOccurs="0"  maxOccurs="unbounded" />
//       <xsd:element name="sect2" type="docSect2Type" minOccurs="0" maxOccurs="unbounded" />
//     </xsd:choice>
//   </xsd:sequence>
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

export class DocSect1Type {
  title?: DocTitleType | undefined

  constructor (element: Object, elementName: string = 'sect1') {
    // console.log(elementName, util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:complexType name="docTitleType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export class DocTitleType {
  xxx?: DocTitleCmdGroup

  constructor (element: Object, elementName: string = 'title') {
    // console.log(elementName, util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:group name="docCmdGroup">
//   <xsd:choice>
//     <!-- start workaround for xsd.exe
//       <xsd:group ref="docTitleCmdGroup"/>
//     -->
//     <xsd:element name="ulink" type="docURLLink" />
//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />
//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />
//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />
//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />
//     <xsd:element name="emoji" type="docEmojiType" />
//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//     <!-- end workaround for xsd.exe -->
//     <xsd:element name="hruler" type="docEmptyType" />
//     <xsd:element name="preformatted" type="docMarkupType" />
//     <xsd:element name="programlisting" type="listingType" />
//     <xsd:element name="verbatim" type="xsd:string" />
//     <xsd:element name="javadocliteral" type="xsd:string" />
//     <xsd:element name="javadoccode" type="xsd:string" />
//     <xsd:element name="indexentry" type="docIndexEntryType" />
//     <xsd:element name="orderedlist" type="docListType" />
//     <xsd:element name="itemizedlist" type="docListType" />
//     <xsd:element name="simplesect" type="docSimpleSectType" />
//     <xsd:element name="title" type="docTitleType" />
//     <xsd:element name="variablelist" type="docVariableListType" />
//     <xsd:element name="table" type="docTableType" />
//     <xsd:element name="heading" type="docHeadingType" />
//     <xsd:element name="dotfile" type="docImageFileType" />
//     <xsd:element name="mscfile" type="docImageFileType" />
//     <xsd:element name="diafile" type="docImageFileType" />
//     <xsd:element name="plantumlfile" type="docImageFileType" />
//     <xsd:element name="toclist" type="docTocListType" />
//     <xsd:element name="language" type="docLanguageType" />
//     <xsd:element name="parameterlist" type="docParamListType" />
//     <xsd:element name="xrefsect" type="docXRefSectType" />
//     <xsd:element name="copydoc" type="docCopyType" />
//     <xsd:element name="details" type="docDetailsType" />
//     <xsd:element name="blockquote" type="docBlockQuoteType" />
//     <xsd:element name="parblock" type="docParBlockType" />
//   </xsd:choice>
// </xsd:group>

export class DocCmdGroup {
  constructor (element: Object, elementName: string = 'xxx') {
    // console.log(elementName, util.inspect(element))
  }
}

// ----------------------------------------------------------------------------

// <xsd:group name="docTitleCmdGroup">
//   <xsd:choice>
//     <xsd:element name="ulink" type="docURLLink" />
//     <xsd:element name="bold" type="docMarkupType" />
//     <xsd:element name="s" type="docMarkupType" />
//     <xsd:element name="strike" type="docMarkupType" />
//     <xsd:element name="underline" type="docMarkupType" />
//     <xsd:element name="emphasis" type="docMarkupType" />
//     <xsd:element name="computeroutput" type="docMarkupType" />
//     <xsd:element name="subscript" type="docMarkupType" />
//     <xsd:element name="superscript" type="docMarkupType" />
//     <xsd:element name="center" type="docMarkupType" />
//     <xsd:element name="small" type="docMarkupType" />
//     <xsd:element name="cite" type="docMarkupType" />
//     <xsd:element name="del" type="docMarkupType" />
//     <xsd:element name="ins" type="docMarkupType" />
//     <xsd:element name="htmlonly" type="docHtmlOnlyType" />
//     <xsd:element name="manonly" type="xsd:string" />
//     <xsd:element name="xmlonly" type="xsd:string" />
//     <xsd:element name="rtfonly" type="xsd:string" />
//     <xsd:element name="latexonly" type="xsd:string" />
//     <xsd:element name="docbookonly" type="xsd:string" />
//     <xsd:element name="image" type="docImageType" />
//     <xsd:element name="dot" type="docDotMscType" />
//     <xsd:element name="msc" type="docDotMscType" />
//     <xsd:element name="plantuml" type="docPlantumlType" />
//     <xsd:element name="anchor" type="docAnchorType" />
//     <xsd:element name="formula" type="docFormulaType" />
//     <xsd:element name="ref" type="docRefTextType" />
//     <xsd:element name="emoji" type="docEmojiType" />
//     <xsd:element name="linebreak" type="docEmptyType" />
//     <xsd:element name="nonbreakablespace" type="docEmptyType" />
//     <xsd:element name="iexcl" type="docEmptyType" />
//     <xsd:element name="cent" type="docEmptyType" />
//     <xsd:element name="pound" type="docEmptyType" />
//     <xsd:element name="curren" type="docEmptyType" />
//     <xsd:element name="yen" type="docEmptyType" />
//     <xsd:element name="brvbar" type="docEmptyType" />
//     <xsd:element name="sect" type="docEmptyType" />
//     <xsd:element name="umlaut" type="docEmptyType" />
//     <xsd:element name="copy" type="docEmptyType" />
//     <xsd:element name="ordf" type="docEmptyType" />
//     <xsd:element name="laquo" type="docEmptyType" />
//     <xsd:element name="not" type="docEmptyType" />
//     <xsd:element name="shy" type="docEmptyType" />
//     <xsd:element name="registered" type="docEmptyType" />
//     <xsd:element name="macr" type="docEmptyType" />
//     <xsd:element name="deg" type="docEmptyType" />
//     <xsd:element name="plusmn" type="docEmptyType" />
//     <xsd:element name="sup2" type="docEmptyType" />
//     <xsd:element name="sup3" type="docEmptyType" />
//     <xsd:element name="acute" type="docEmptyType" />
//     <xsd:element name="micro" type="docEmptyType" />
//     <xsd:element name="para" type="docEmptyType" />
//     <xsd:element name="middot" type="docEmptyType" />
//     <xsd:element name="cedil" type="docEmptyType" />
//     <xsd:element name="sup1" type="docEmptyType" />
//     <xsd:element name="ordm" type="docEmptyType" />
//     <xsd:element name="raquo" type="docEmptyType" />
//     <xsd:element name="frac14" type="docEmptyType" />
//     <xsd:element name="frac12" type="docEmptyType" />
//     <xsd:element name="frac34" type="docEmptyType" />
//     <xsd:element name="iquest" type="docEmptyType" />
//     <xsd:element name="Agrave" type="docEmptyType" />
//     <xsd:element name="Aacute" type="docEmptyType" />
//     <xsd:element name="Acirc" type="docEmptyType" />
//     <xsd:element name="Atilde" type="docEmptyType" />
//     <xsd:element name="Aumlaut" type="docEmptyType" />
//     <xsd:element name="Aring" type="docEmptyType" />
//     <xsd:element name="AElig" type="docEmptyType" />
//     <xsd:element name="Ccedil" type="docEmptyType" />
//     <xsd:element name="Egrave" type="docEmptyType" />
//     <xsd:element name="Eacute" type="docEmptyType" />
//     <xsd:element name="Ecirc" type="docEmptyType" />
//     <xsd:element name="Eumlaut" type="docEmptyType" />
//     <xsd:element name="Igrave" type="docEmptyType" />
//     <xsd:element name="Iacute" type="docEmptyType" />
//     <xsd:element name="Icirc" type="docEmptyType" />
//     <xsd:element name="Iumlaut" type="docEmptyType" />
//     <xsd:element name="ETH" type="docEmptyType" />
//     <xsd:element name="Ntilde" type="docEmptyType" />
//     <xsd:element name="Ograve" type="docEmptyType" />
//     <xsd:element name="Oacute" type="docEmptyType" />
//     <xsd:element name="Ocirc" type="docEmptyType" />
//     <xsd:element name="Otilde" type="docEmptyType" />
//     <xsd:element name="Oumlaut" type="docEmptyType" />
//     <xsd:element name="times" type="docEmptyType" />
//     <xsd:element name="Oslash" type="docEmptyType" />
//     <xsd:element name="Ugrave" type="docEmptyType" />
//     <xsd:element name="Uacute" type="docEmptyType" />
//     <xsd:element name="Ucirc" type="docEmptyType" />
//     <xsd:element name="Uumlaut" type="docEmptyType" />
//     <xsd:element name="Yacute" type="docEmptyType" />
//     <xsd:element name="THORN" type="docEmptyType" />
//     <xsd:element name="szlig" type="docEmptyType" />
//     <xsd:element name="agrave" type="docEmptyType" />
//     <xsd:element name="aacute" type="docEmptyType" />
//     <xsd:element name="acirc" type="docEmptyType" />
//     <xsd:element name="atilde" type="docEmptyType" />
//     <xsd:element name="aumlaut" type="docEmptyType" />
//     <xsd:element name="aring" type="docEmptyType" />
//     <xsd:element name="aelig" type="docEmptyType" />
//     <xsd:element name="ccedil" type="docEmptyType" />
//     <xsd:element name="egrave" type="docEmptyType" />
//     <xsd:element name="eacute" type="docEmptyType" />
//     <xsd:element name="ecirc" type="docEmptyType" />
//     <xsd:element name="eumlaut" type="docEmptyType" />
//     <xsd:element name="igrave" type="docEmptyType" />
//     <xsd:element name="iacute" type="docEmptyType" />
//     <xsd:element name="icirc" type="docEmptyType" />
//     <xsd:element name="iumlaut" type="docEmptyType" />
//     <xsd:element name="eth" type="docEmptyType" />
//     <xsd:element name="ntilde" type="docEmptyType" />
//     <xsd:element name="ograve" type="docEmptyType" />
//     <xsd:element name="oacute" type="docEmptyType" />
//     <xsd:element name="ocirc" type="docEmptyType" />
//     <xsd:element name="otilde" type="docEmptyType" />
//     <xsd:element name="oumlaut" type="docEmptyType" />
//     <xsd:element name="divide" type="docEmptyType" />
//     <xsd:element name="oslash" type="docEmptyType" />
//     <xsd:element name="ugrave" type="docEmptyType" />
//     <xsd:element name="uacute" type="docEmptyType" />
//     <xsd:element name="ucirc" type="docEmptyType" />
//     <xsd:element name="uumlaut" type="docEmptyType" />
//     <xsd:element name="yacute" type="docEmptyType" />
//     <xsd:element name="thorn" type="docEmptyType" />
//     <xsd:element name="yumlaut" type="docEmptyType" />
//     <xsd:element name="fnof" type="docEmptyType" />
//     <xsd:element name="Alpha" type="docEmptyType" />
//     <xsd:element name="Beta" type="docEmptyType" />
//     <xsd:element name="Gamma" type="docEmptyType" />
//     <xsd:element name="Delta" type="docEmptyType" />
//     <xsd:element name="Epsilon" type="docEmptyType" />
//     <xsd:element name="Zeta" type="docEmptyType" />
//     <xsd:element name="Eta" type="docEmptyType" />
//     <xsd:element name="Theta" type="docEmptyType" />
//     <xsd:element name="Iota" type="docEmptyType" />
//     <xsd:element name="Kappa" type="docEmptyType" />
//     <xsd:element name="Lambda" type="docEmptyType" />
//     <xsd:element name="Mu" type="docEmptyType" />
//     <xsd:element name="Nu" type="docEmptyType" />
//     <xsd:element name="Xi" type="docEmptyType" />
//     <xsd:element name="Omicron" type="docEmptyType" />
//     <xsd:element name="Pi" type="docEmptyType" />
//     <xsd:element name="Rho" type="docEmptyType" />
//     <xsd:element name="Sigma" type="docEmptyType" />
//     <xsd:element name="Tau" type="docEmptyType" />
//     <xsd:element name="Upsilon" type="docEmptyType" />
//     <xsd:element name="Phi" type="docEmptyType" />
//     <xsd:element name="Chi" type="docEmptyType" />
//     <xsd:element name="Psi" type="docEmptyType" />
//     <xsd:element name="Omega" type="docEmptyType" />
//     <xsd:element name="alpha" type="docEmptyType" />
//     <xsd:element name="beta" type="docEmptyType" />
//     <xsd:element name="gamma" type="docEmptyType" />
//     <xsd:element name="delta" type="docEmptyType" />
//     <xsd:element name="epsilon" type="docEmptyType" />
//     <xsd:element name="zeta" type="docEmptyType" />
//     <xsd:element name="eta" type="docEmptyType" />
//     <xsd:element name="theta" type="docEmptyType" />
//     <xsd:element name="iota" type="docEmptyType" />
//     <xsd:element name="kappa" type="docEmptyType" />
//     <xsd:element name="lambda" type="docEmptyType" />
//     <xsd:element name="mu" type="docEmptyType" />
//     <xsd:element name="nu" type="docEmptyType" />
//     <xsd:element name="xi" type="docEmptyType" />
//     <xsd:element name="omicron" type="docEmptyType" />
//     <xsd:element name="pi" type="docEmptyType" />
//     <xsd:element name="rho" type="docEmptyType" />
//     <xsd:element name="sigmaf" type="docEmptyType" />
//     <xsd:element name="sigma" type="docEmptyType" />
//     <xsd:element name="tau" type="docEmptyType" />
//     <xsd:element name="upsilon" type="docEmptyType" />
//     <xsd:element name="phi" type="docEmptyType" />
//     <xsd:element name="chi" type="docEmptyType" />
//     <xsd:element name="psi" type="docEmptyType" />
//     <xsd:element name="omega" type="docEmptyType" />
//     <xsd:element name="thetasym" type="docEmptyType" />
//     <xsd:element name="upsih" type="docEmptyType" />
//     <xsd:element name="piv" type="docEmptyType" />
//     <xsd:element name="bull" type="docEmptyType" />
//     <xsd:element name="hellip" type="docEmptyType" />
//     <xsd:element name="prime" type="docEmptyType" />
//     <xsd:element name="Prime" type="docEmptyType" />
//     <xsd:element name="oline" type="docEmptyType" />
//     <xsd:element name="frasl" type="docEmptyType" />
//     <xsd:element name="weierp" type="docEmptyType" />
//     <xsd:element name="imaginary" type="docEmptyType" />
//     <xsd:element name="real" type="docEmptyType" />
//     <xsd:element name="trademark" type="docEmptyType" />
//     <xsd:element name="alefsym" type="docEmptyType" />
//     <xsd:element name="larr" type="docEmptyType" />
//     <xsd:element name="uarr" type="docEmptyType" />
//     <xsd:element name="rarr" type="docEmptyType" />
//     <xsd:element name="darr" type="docEmptyType" />
//     <xsd:element name="harr" type="docEmptyType" />
//     <xsd:element name="crarr" type="docEmptyType" />
//     <xsd:element name="lArr" type="docEmptyType" />
//     <xsd:element name="uArr" type="docEmptyType" />
//     <xsd:element name="rArr" type="docEmptyType" />
//     <xsd:element name="dArr" type="docEmptyType" />
//     <xsd:element name="hArr" type="docEmptyType" />
//     <xsd:element name="forall" type="docEmptyType" />
//     <xsd:element name="part" type="docEmptyType" />
//     <xsd:element name="exist" type="docEmptyType" />
//     <xsd:element name="empty" type="docEmptyType" />
//     <xsd:element name="nabla" type="docEmptyType" />
//     <xsd:element name="isin" type="docEmptyType" />
//     <xsd:element name="notin" type="docEmptyType" />
//     <xsd:element name="ni" type="docEmptyType" />
//     <xsd:element name="prod" type="docEmptyType" />
//     <xsd:element name="sum" type="docEmptyType" />
//     <xsd:element name="minus" type="docEmptyType" />
//     <xsd:element name="lowast" type="docEmptyType" />
//     <xsd:element name="radic" type="docEmptyType" />
//     <xsd:element name="prop" type="docEmptyType" />
//     <xsd:element name="infin" type="docEmptyType" />
//     <xsd:element name="ang" type="docEmptyType" />
//     <xsd:element name="and" type="docEmptyType" />
//     <xsd:element name="or" type="docEmptyType" />
//     <xsd:element name="cap" type="docEmptyType" />
//     <xsd:element name="cup" type="docEmptyType" />
//     <xsd:element name="int" type="docEmptyType" />
//     <xsd:element name="there4" type="docEmptyType" />
//     <xsd:element name="sim" type="docEmptyType" />
//     <xsd:element name="cong" type="docEmptyType" />
//     <xsd:element name="asymp" type="docEmptyType" />
//     <xsd:element name="ne" type="docEmptyType" />
//     <xsd:element name="equiv" type="docEmptyType" />
//     <xsd:element name="le" type="docEmptyType" />
//     <xsd:element name="ge" type="docEmptyType" />
//     <xsd:element name="sub" type="docEmptyType" />
//     <xsd:element name="sup" type="docEmptyType" />
//     <xsd:element name="nsub" type="docEmptyType" />
//     <xsd:element name="sube" type="docEmptyType" />
//     <xsd:element name="supe" type="docEmptyType" />
//     <xsd:element name="oplus" type="docEmptyType" />
//     <xsd:element name="otimes" type="docEmptyType" />
//     <xsd:element name="perp" type="docEmptyType" />
//     <xsd:element name="sdot" type="docEmptyType" />
//     <xsd:element name="lceil" type="docEmptyType" />
//     <xsd:element name="rceil" type="docEmptyType" />
//     <xsd:element name="lfloor" type="docEmptyType" />
//     <xsd:element name="rfloor" type="docEmptyType" />
//     <xsd:element name="lang" type="docEmptyType" />
//     <xsd:element name="rang" type="docEmptyType" />
//     <xsd:element name="loz" type="docEmptyType" />
//     <xsd:element name="spades" type="docEmptyType" />
//     <xsd:element name="clubs" type="docEmptyType" />
//     <xsd:element name="hearts" type="docEmptyType" />
//     <xsd:element name="diams" type="docEmptyType" />
//     <xsd:element name="OElig" type="docEmptyType" />
//     <xsd:element name="oelig" type="docEmptyType" />
//     <xsd:element name="Scaron" type="docEmptyType" />
//     <xsd:element name="scaron" type="docEmptyType" />
//     <xsd:element name="Yumlaut" type="docEmptyType" />
//     <xsd:element name="circ" type="docEmptyType" />
//     <xsd:element name="tilde" type="docEmptyType" />
//     <xsd:element name="ensp" type="docEmptyType" />
//     <xsd:element name="emsp" type="docEmptyType" />
//     <xsd:element name="thinsp" type="docEmptyType" />
//     <xsd:element name="zwnj" type="docEmptyType" />
//     <xsd:element name="zwj" type="docEmptyType" />
//     <xsd:element name="lrm" type="docEmptyType" />
//     <xsd:element name="rlm" type="docEmptyType" />
//     <xsd:element name="ndash" type="docEmptyType" />
//     <xsd:element name="mdash" type="docEmptyType" />
//     <xsd:element name="lsquo" type="docEmptyType" />
//     <xsd:element name="rsquo" type="docEmptyType" />
//     <xsd:element name="sbquo" type="docEmptyType" />
//     <xsd:element name="ldquo" type="docEmptyType" />
//     <xsd:element name="rdquo" type="docEmptyType" />
//     <xsd:element name="bdquo" type="docEmptyType" />
//     <xsd:element name="dagger" type="docEmptyType" />
//     <xsd:element name="Dagger" type="docEmptyType" />
//     <xsd:element name="permil" type="docEmptyType" />
//     <xsd:element name="lsaquo" type="docEmptyType" />
//     <xsd:element name="rsaquo" type="docEmptyType" />
//     <xsd:element name="euro" type="docEmptyType" />
//     <xsd:element name="tm" type="docEmptyType" />
//   </xsd:choice>
// </xsd:group>

export class DocTitleCmdGroup {
  constructor (element: Object, elementName: string = 'xxx') {
    // console.log(elementName, util.inspect(element))
  }
}

// <xsd:complexType name="docURLLink" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="url" type="xsd:string" />
// </xsd:complexType>

export class DocURLLink {
  constructor (element: Object, elementName: string = 'xxx') {
    // console.log(elementName, util.inspect(element))
  }
}

// <xsd:complexType name="docMarkupType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docCmdGroup" minOccurs="0" maxOccurs="unbounded" />
// </xsd:complexType>

export class DocMarkupType {
  constructor (element: Object, elementName: string = 'xxx') {
    // console.log(elementName, util.inspect(element))
  }
}

// <xsd:complexType name="docEmptyType"/>

export interface DocEmptyType { }

// <xsd:complexType name="docHtmlOnlyType">
//   <xsd:simpleContent>
//     <xsd:extension base="xsd:string">
//       <xsd:attribute name="block" type="xsd:string" />
//     </xsd:extension>
//   </xsd:simpleContent>
// </xsd:complexType>

// TODO

// <xsd:complexType name="docImageType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="type" type="DoxImageKind" use="optional"/>
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="alt" type="xsd:string" use="optional"/>
//   <xsd:attribute name="inline" type="DoxBool" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// TODO

// <xsd:complexType name="docDotMscType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
// </xsd:complexType>

// TODO

// <xsd:complexType name="docPlantumlType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="name" type="xsd:string" use="optional"/>
//   <xsd:attribute name="width" type="xsd:string" use="optional"/>
//   <xsd:attribute name="height" type="xsd:string" use="optional"/>
//   <xsd:attribute name="caption" type="xsd:string" use="optional"/>
//   <xsd:attribute name="engine" type="DoxPlantumlEngine" use="optional"/>
// </xsd:complexType>

// TODO

// <xsd:complexType name="docAnchorType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// TODO

// <xsd:complexType name="docFormulaType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:attribute name="id" type="xsd:string" />
// </xsd:complexType>

// TODO

// <xsd:complexType name="docRefTextType" mixed="true">   <-- Character data is allowed to appear between the child elements!
//   <xsd:group ref="docTitleCmdGroup" minOccurs="0" maxOccurs="unbounded" />
//   <xsd:attribute name="refid" type="xsd:string" />
//   <xsd:attribute name="kindref" type="DoxRefKind" />
//   <xsd:attribute name="external" type="xsd:string" />
// </xsd:complexType>

// TODO

// <xsd:complexType name="docEmojiType">
//   <xsd:attribute name="name" type="xsd:string"/>
//   <xsd:attribute name="unicode" type="xsd:string"/>
// </xsd:complexType>

// TODO
