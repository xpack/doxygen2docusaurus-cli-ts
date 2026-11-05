# Website

This website is built using [Docusaurus](https://docusaurus.io/),
a modern static website generator.

The folder was created with:

```sh
npx create-docusaurus website classic --typescript
```

## docusaurus-plugin-typedoc

This plugin uses [TypeDoc](https://typedoc.org) to generate
the reference as markdown pages in `docs/api`.

- https://typedoc-plugin-markdown.org/plugins/docusaurus

```sh
cd website
npm install typedoc typedoc-plugin-markdown docusaurus-plugin-typedoc --save-dev
```

> [!NOTE]
> There is a newer specification ([TSDoc](https://tsdoc.org)), from
> Microsoft, which is slightly different; for example, it has no
> categories or groups.

> [!NOTE]
> There is also another plugin, `docusaurus-plugin-typedoc-api`, but
> it is no longer maintained.
