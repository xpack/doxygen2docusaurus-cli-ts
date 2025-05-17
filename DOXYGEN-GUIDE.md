# Doxygen Guide

## Comments style

### Block comments

```cpp
/**
 * @brief ...
 *
 * @details
 * ...
 */
```

Use an empty line as separator.

### Line comments

```cpp
/**< @brief ... */
```

Prefer block comments.

## File metadata

Use an explicit `@file`:

```cpp
/**
 * @file detail.h
 * @brief Internal implementation details for the µTest++ framework.
 *
 * @details
 * ...
 */
```

## Namespace metadata

Use an explicit `@namespace`:

```cpp
namespace micro_os_plus::micro_test_plus
{
  // --------------------------------------------------------------------------

  /**
   * @namespace micro_os_plus::micro_test_plus::detail
   * @brief Internal implementation details for the µTest++ framework.
   *
   * @details
   * ...
   */
  namespace detail
  {

  }
} // namespace micro_os_plus::micro_test_plus
```

## Declaration vs definitions

In the header file document the declaration

```cpp
    /**
     * @brief Output operator for types with a getter.
     * @tparam T The type with a getter method.
     * @param t The object to output.
     * @return Reference to the current test_reporter instance.
     */
    template <class T>
    test_reporter&
    operator<< (const T& t);
```

In the source file (or inline file) document the definition:

```cpp
  /**
   * @details
   * This operator overload appends the contents of the provided C-style string
   * to the internal output buffer of the `test_reporter`. It enables efficient
   * streaming of string literals and character arrays into the reporter,
   * supporting clear and flexible formatting of test output across all test
   * cases and folders.
   */
  test_reporter&
  test_reporter::operator<< (const char* s)
  {
    out_.append (s);
    return *this;
  }
```

## @headerfile

For class, struct, or union documentation, define the header where they are defined.
It is displayed in the Included Headers

```cpp
/**
 * ...
 * @headerfile micro-test-plus.h <micro-os-plus/micro-test-plus.h>
 */
```

## @ingroup

Include all public declarations in a group.

```
  /**
   * @ingroup micro-test-plus-literals
   * @brief Generic strongly-typed wrapper for explicit type conversion.
   * ...
   */
```

## @param

For parameters, define the input/output type:

```cpp
 * @param [in] name Description
```

## @code

Define the code sections with @code, not markdown:

```cpp
   * @code{.cpp}
   *   namespace mt = micro_os_plus::micro_test_plus;
   *
   *   mt::test_case ("Check answer with comparator", [] {
   *     mt::expect (mt::eq (compute_answer (), 42)) << "answer is 42";
   *   });
   * @endcode
```

## @par Example

To make this just a bold header, add an empty line after `@par Example` to
terminate the line sequence.

Otherwise the code will be indented.

## @par Returns

For void functions, to make the return type explicit, use

```cpp
   * @par Returns
   *   Nothing.
```

## @par Parameters

For functions without parameters, to make this explicit, use:

```cpp
   * @par Parameters
   *	 None.
```
