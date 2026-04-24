# README

A place to experiment and reverse engineer different commands, to see
what they generate in html and xml.

The Doxygen commands are:

- // https://www.doxygen.nl/manual/commands.html

## Namespaces examples

```cpp
/** @brief Concept to check if a type has a `value` member. */
template <class T>
concept top_has_value = requires (const T& t) { t.value; };

void
top_function (void);
int top_variable;
using top_alias = int;
class top_class
{
};

namespace
{
  /** @brief Concept to check if a type has a `value` member. */
  template <class T>
  concept anon_has_value = requires (const T& t) { t.value; };

  void
  anon_function (void);
  int anon_variable;
  using anon_alias = int;
  class anon_class
  {
  };

  namespace xyz
  {
    /** @brief Concept to check if a type has a `value` member. */
    template <class T>
    concept anon_xyz_has_value = requires (const T& t) { t.value; };

    void
    anon_xyz_function (void);
    int anon_xyz_variable;
    using anon_xyz_alias = int;
    class anon_xyz_class
    {
    };

  } // namespace xyz
} // namespace
```
