# Inspiration

- https://github.com/typedoc2md/typedoc-plugin-markdown
- https://typedoc-plugin-markdown.org/plugins/docusaurus
- https://github.com/milesj/docusaurus-plugin-typedoc-api (no longer actively maintained) (*)
- https://github.com/milesj/docusaurus-plugin-typedoc-api/blob/master/packages/plugin/README.md
- https://github.com/jothepro/doxygen-awesome-css

Discussions:

- https://github.com/facebook/docusaurus/discussions/10637
- https://github.com/doxygen/doxygen/discussions/11215
- https://github.com/typedoc2md/typedoc-plugin-markdown/discussions/710#discussioncomment-11130976
- https://github.com/jothepro/doxygen-awesome-css/discussions/165

Other links:

- https://github.com/facebook/docusaurus
- https://docusaurus.io
- https://github.com/doxygen/doxygen
- https://www.doxygen.nl

From typedoc-plugin-markdown

```
module.exports = {
  // Add option types
  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Options
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
      },
    ],
  ],
};
```

