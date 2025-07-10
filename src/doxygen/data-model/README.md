# data-model

The Doxygen data extracted from the XML files is parsed and stored in data model objects, which are designed to closely follow the definitions in the DTDs.

The type definitions from the DTD are implemented as abstract classes.

Concrete objects are derived from these abstract classes.

Where necessary, object types should be distinguished using `instanceof`.

The `elementName` property is retained for debugging purposes and may be removed in the final release; it should therefore not be relied upon.

Parsing is initiated from `doxygen-xml-parser.ts` by creating the top-level objects for each category. These objects then recursively instantiate their respective child objects.
