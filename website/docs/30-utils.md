---
id: "utils"
title: 'Utils'
sidebar_label: 'Utils'
sidebar_position: 30
---

Jon provides some utility functions to help with common tasks.

## Validation
A simple validation system for React components.

### useValidator
Hook to manage validation state for a single input.

```js
import { useValidator, rules } from "@priolo/jon"

const [error, ref] = useValidator(value, [rules.obligatory, rules.email])
```

- **value**: The value to validate.
- **rules**: An array of validation rules.
- **refName**: (Optional) The name of the ref property to return (default: "inputRef").

Returns an array with:
- **error**: The error message if validation fails, or null.
- **ref**: A ref object to attach to the input element (for focus on error).

### validateAll
Validates all registered validators (created with `useValidator`).
Returns an array of errors.

```js
import { validateAll } from "@priolo/jon"

const errors = validateAll()
if (errors.length > 0) {
    console.log("Validation failed", errors)
}
```

### resetAll
Resets the state of all registered validators.

```js
import { resetAll } from "@priolo/jon"

resetAll()
```

### rules
A collection of common validation rules.

```js
import { rules } from "@priolo/jon"
```

- **obligatory**: Checks if the value is not empty.
- **email**: Checks if the value is a valid email.
- **url**: Checks if the value is a valid URL.
- **obligatoryArray**: Checks if the array is not empty.

## Store Utils
Utilities for optimizing store updates and rendering.

### renderOnChange
A helper for `useStoreNext` to only re-render when specific properties change.

```js
import { useStoreNext, renderOnChange } from "@priolo/jon"

const state = useStoreNext(myStore, renderOnChange(['prop1', 'prop2']))
```

### equalsSome
Compares specific properties of two objects.

```js
import { equalsSome } from "@priolo/jon"

const isEqual = equalsSome(obj1, obj2, ['prop1', 'prop2'])
```

### equalsIgnore
Compares two objects ignoring specific properties.

```js
import { equalsIgnore } from "@priolo/jon"

const isEqual = equalsIgnore(obj1, obj2, ['ignoredProp'])
```
