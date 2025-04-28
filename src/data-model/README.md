# data-model

The Doxygen data from the XML files is parsed and stored in the data
model objects, which try to stay close to the definitions in the DTDs.

The type definitions from the DTD are implemented as abstract classes.

The actual objects are derived from the abstract objects.

If necessary, object types should be differentiated via `instanceof`.

The `elementName` is stored for debugging purposes and may be removed
in the final release, therefore is should not be used.

The parsing is initiated from `doxygen-xml-parser/index.ts` by
creating the top objects from each category. These objects
recursively create the children objects.
