---
title: 'Validator form'
sidebar_label: 'Validator form'
sidebar_position: 10
---

# Validator form

Form validation without a form library: the store holds the values, `useValidator` watches them against a set of rules, `validateAll()` runs everything on submit and focuses the first invalid field.

:::info full library required
`useValidator`, `validateAll` and `resetAll` ship with the [installed package](/docs/import) — they're not part of the copy-paste juice file.
:::

```tsx
import { createStore, useStore, useValidator, validateAll, resetAll } from "@priolo/jon"

// the store holds the form values; the validator watches them
const formStore = createStore({

  state: {
    name: "",
    email: "",
    saved: false,
  },

  mutators: {
    setName: (name: string) => ({ name, saved: false }),
    setEmail: (email: string) => ({ email, saved: false }),
    setSaved: (saved: boolean) => ({ saved }),
  },

})

// each rule returns an error message, or null if the value is fine
const nameRules = {
  required: (v: string) => !v ? "name is required" : null,
  min: (v: string) => v.length < 3 ? "at least 3 characters" : null,
}
const emailRules = {
  format: (v: string) => !/^\S+@\S+\.\S+$/.test(v) ? "invalid email" : null,
}

export default function App() {
  const { name, email, saved } = useStore(formStore)

  // { helperText, error, inputRef } — spread-ready for a MUI TextField
  const nameValidator = useValidator(name, nameRules)
  const emailValidator = useValidator(email, emailRules)

  function submit() {
    // validates every registered field and focuses the first invalid one
    const errors = validateAll()
    if (errors.length == 0) formStore.setSaved(true)
  }

  return (
    <div>
      <input
        ref={nameValidator.inputRef}
        value={name}
        onChange={e => formStore.setName(e.target.value)}
      />
      {nameValidator.helperText && <span>{nameValidator.helperText}</span>}

      <input
        ref={emailValidator.inputRef}
        value={email}
        onChange={e => formStore.setEmail(e.target.value)}
      />
      {emailValidator.helperText && <span>{emailValidator.helperText}</span>}

      <button onClick={submit}>save</button>
      <button onClick={() => { resetAll(); formStore.setName(""); formStore.setEmail("") }}>reset</button>

      {saved && <p>saved!</p>}
    </div>
  )
}
```

## What's going on

- Rules are just functions `value => errorMessage | null` — no schema DSL to learn, compose them freely.
- `useValidator(value, rules)` returns `{ helperText, error, inputRef }`, designed to be spread straight onto a MUI `TextField`; with native inputs you wire them by hand as above.
- `validateAll()` validates *every* registered field, returns the errors, and focuses the first failing input — so the submit handler is two lines.
- Store and validator are independent: the validator only sees the values you pass it.

Full source: [src/examples/validatorForm](https://github.com/priolo/jon/blob/master/src/examples/validatorForm/App.tsx)  
Live demo: [open on CodeSandbox](https://codesandbox.io/p/sandbox/validator-form-3v8lzc)
