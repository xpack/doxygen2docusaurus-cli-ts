# doxygen2docusaurus

**doxygen2docusaurus** is a Node.js CLI utility for converting [Doxygen](https://www.doxygen.nl) XML reference pages into Docusaurus documentation.

This project leverages Doxygen’s capability to generate XML output. The converter parses these XML files and produces Markdown files in the `/docs/api/` directory. For precise control over presentation, the generated content is primarily HTML. As Docusaurus only parses Markdown section headers to automatically generate the Table of Contents, the converter outputs these headers in Markdown.

## Doxygen Configuration

To enable Doxygen to generate XML files, set the following in your Doxygen configuration file:

```txt
GENERATE_XML= YES
```

By default, the XML output is placed in an `xml` subdirectory within the Doxygen folder. For example, if the Doxygen folder resides in your website directory, the XML files will be generated in `website/doxygen/xml`.

## Installing the Converter

To install the converter in your project’s website directory, run:

```sh
(cd website; npm install xpack/doxygen2docusaurus-ts --save-dev)
```

This is a temporary solution, installing from GitHub. When the publish will
be published on npm, the install command will be:

```sh
(cd website; npm install @xpack/doxygen2docusaurus --save-dev)
```

Alternatively, during development:

```sh
(cd website; npm link @xpack/doxygen2docusaurus)
```

## Converter Configuration

By default, the converter attempts to retrieve its configuration from the
following places:

- the `config/doxygen2docusaurus.json` file
- the `doxygen2docusaurus.json` file
- the `config.doxygen2docusaurus` object in `package.json`
- the `doxygen2docusaurus` object in `package.json`

For example the separate file `config/doxygen2docusaurus.json` can look like:

```json
{
  "doxygenXmlInputFolderPath": "doxygen/xml",
  "verbose": false
}
```

or, when part of `package.json`:

```json
{
  ...
  "config": {
    "doxygen2docusaurus": {
      "doxygenXmlInputFolderPath": "doxygen/xml",
      "verbose": false
    }
  }
}
```

(the `config` intermediate level is optional)

If your Doxygen folder is located elsewhere, update the `doxygenXmlInputFolderPath` property accordingly.

To simplify running the conversion, add an npm script to your `package.json`:

```json
  "scripts": {
    "docusaurus": "docusaurus",
    "convert-doxygen": "doxygen2docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    ...
  }
```

To execute the conversion, use:

```sh
npm run convert-doxygen
```

## Common Markdown

As MDX syntax is particularly strict and does not support all HTML content, the output is Common Markdown.

To configure Docusaurus to parse `.md` files as Common Markdown, add the following to your `docusaurus-config.ts` file:

```ts
  markdown: {
    format: 'detect'
  },
```

## CSS

The converter generates a file containing custom CSS definitions.

To include this in Docusaurus, edit your `docusaurus-config.ts` file and add the following line to the theme configuration:

```ts
  theme: {
    customCss: [
      './src/css/custom.css',
      './src/css/custom-doxygen2docusaurus.css'
    ],
  },
```

## Sidebar

The converter generates a dedicated sidebar for the Doxygen pages.

To integrate this into Docusaurus, edit your `sidebars.ts` file and add the following import at the top:

```ts
import doxygenSidebarItems from './sidebar-category-doxygen2docusaurus.json';
```

Then, add a new property to the `sidebars` object:

```ts
const sidebars: SidebarsConfig = {

  docsSidebar: [
    // ...
  ],

  doxygenSidebar: [
    doxygenSidebarItems,
  ],
};
```

## Top Menu

The converter also generates a dropdown menu for use in the top navigation bar.

To include this in Docusaurus, edit your `docusaurus-config.ts` file and add the following import at the top:

```ts
import doxygenApiMenu from './docusaurus-config-menu-doxygen2docusaurus.json'
```

Add `doxygenApiMenu` to the `navbar.items` array.

## Memory Usage

For particularly large sites, the `node` process may exhaust available memory.

To increase the heap and/or stack size, invoke Docusaurus with a command such as:

```sh
node --max-old-space-size=8192 --stack-size=2048 ./node_modules/.bin/doxygen2docusaurus
```

Apply the same approach to the `start` and `build` commands if necessary.

## Caveats

Some reference sites may be extremely large, comprising tens of thousands of pages. While Docusaurus is capable of handling relatively large sites, it requires substantial memory and the build process may be time-consuming.
