# NOTES

## Inspiration

This plugin is inspired by [`docusaurus-plugin-typedoc-api`](https://github.com/milesj/docusaurus-plugin-typedoc-api/).

The preliminary plan is to use `loadContent()` to parse the input files into some internal structures,
then on `contentLoaded()` do some magic, possibly with `createData()`, create a lot of internal routes
for all API pages and finally `addRoute({path: 'api', component: '@thee/DocsRoot', routes:... })`.

As aspect, it'll stay close to the [Doxygen Awesome](https://jothepro.github.io/doxygen-awesome-css/).

## Discussions

- https://github.com/xpack/docusaurus-plugin-doxygen/discussions/1
- https://github.com/facebook/docusaurus/discussions/10637#discussioncomment-11139802
- https://github.com/typedoc2md/typedoc-plugin-markdown/discussions/710#discussioncomment-11130976
- https://github.com/jothepro/doxygen-awesome-css/discussions/165
- https://github.com/doxygen/doxygen/discussions/11215
- https://github.com/milesj/docusaurus-plugin-typedoc-api/issues/157

## Links

- https://www.doxygen.nl
- https://github.com/doxygen/doxygen
- https://github.com/facebook/docusaurus
- https://docusaurus.io
- https://github.com/milesj/docusaurus-plugin-typedoc-api
- https://github.com/typedoc2md/typedoc-plugin-markdown
- https://github.com/microsoft/react-native-windows/tree/main/packages/%40rnw-scripts/doxysaurus
- https://github.com/sourcey/moxygen
- https://github.com/matusnovak/doxybook2 (archived)
