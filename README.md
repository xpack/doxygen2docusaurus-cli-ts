# docusaurus-plugin-doxygen

A Docusaurus plugin to integrate the Doxygen reference pages into Docusaurus documentation sites.

This project relies on the ability of Doxygen to also generate the output in XML.
The plugin parses these XML files and generates MDX files
in the `/docs/api/` folder.

## Doxygen configuration

To enable Doxygen to generate the XML files, enable it in the Doxygen
configuration file:

```txt
GENERATE_XML= YES
```

By default, the output is generated in the Doxygen folder, in an `xml`
sub-folder, for example, if the Doxygen folder is located in the
website folder, the XML files will be generated in `website/doxygen/xml`.

## Plugin install

To install the plugin in the project website folder:

```sh
(cd website; npm install @xpack/docusaurus-plugin-doxygen react-markdown --save-dev)
```

or, during development:

```sh
(cd website; npm link @xpack/docusaurus-plugin-doxygen)
```

## Docusaurus configuration

For Docusaurus to use the plugin, it must be added to `docusaurus.config.js`

```js
const config: Config = {
  // ...
  plugins: [
    [
      '@xpack/docusaurus-plugin-doxygen',
      {
        doxygenXmlInputFolderPath: 'doxygen/xml',
        verbose: false,
        suggestToDoDescriptions: false
      },
    ],
  ],
};
```

If the Doxygen folder is located in a different location, update the
`doxygenXmlInputFolderPath` property.

To ease running the conversion, add a npm script to `package.json`:

```json
  "scripts": {
    "docusaurus": "docusaurus",
    "generate-doxygen": "docusaurus generate-doxygen",
    "start": "docusaurus start",
    ...
  }
```

To run the conversion, use:

```sh
npm run generate-doxygen
```

## CSS

The plugin generates a file with custom CSS definitions.

To add it to Docusaurus, edit the `docusaurus-config.ts` file; add the
second line to the theme configuration:

```ts
  theme: {
    customCss: [
      './src/css/custom.css',
      './src/css/custom-docusaurus-plugin-doxygen.css'
    ],
  },
```

## Sidebar

The plugin generates a separate sidebar for the Doxygen pages.

To add it to Docusaurus, edit the `sidebars.ts` file; add the
following line in the header part to import the generated file:

```ts
import doxygenSidebarItems from './sidebar-category-docusaurus-plugin-doxygen.json';
```

Add a new property in the `sidebars` object:

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

## Top menu

The plugin also generates a dropdown menu to be used in the top bar.

To add it to Docusaurus, edit the `docusaurus-config.ts` file; add the
following line in the header part to import the generated file:

```ts
import doxygenApiMenu from './docusaurus-config-menu-docusaurus-plugin-doxygen.json'
```

Add the `doxygenApiMenu` to the `navbar.items`.

## Memory usage

For very large sites, it is possible that the `node` process runs out of memory.

To increase the heap and/or the stack, invoke docusaurus via a command like:

```sh
node --max-old-space-size=8192 --stack-size=2048 ./node_modules/.bin/docusaurus generate-doxygen
```
