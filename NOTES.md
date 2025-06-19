# NOTES

## Inspiration

This project is inspired by
[`docusaurus-plugin-typedoc-api`](https://github.com/milesj/docusaurus-plugin-typedoc-api/),
but does not go that far to reimplement the `content-docs` functionality of
processing the MD files.

The initial plan was to use `loadContent()` to parse the input XML files,
and generate the MD files, but this proved not realistic with the current
Docusaurus policy
to run all plugins initialisation code in parallel, since this plugin must run
before the `content-docs` plugin, that parses the MD files.

Therefore, for now, it is recommended to invoke the plugin via the CLI command.

As aspect, the output will remain close to the
[Doxygen Awesome](https://jothepro.github.io/doxygen-awesome-css/).

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

## Issues

- https://github.com/doxygen/doxygen/issues/11613 - case-insensitive file names (not a bug; use CASE_SENSE_NAMES = SYSTEM)
- https://github.com/doxygen/doxygen/issues/11614 - duplicate IDs
