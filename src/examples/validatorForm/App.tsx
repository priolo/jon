// jon · form with validator
// https://codesandbox.io/p/sandbox/validator-form-3v8lzc

import { MutableRefObject } from "react"
import { resetAll, useValidator, validateAll } from "../../lib/input/validator"
import { createStore, useStore } from "../../lib/store/rvx_juice"



/** the store holds the form values; the validator observes them */
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

const nameRules = {
  required: (v: string) => !v ? "the name is required" : null,
  min: (v: string) => v.length < 3 ? "minimum 3 characters" : null,
}
const emailRules = {
  format: (v: string) => !/^\S+@\S+\.\S+$/.test(v) ? "invalid email" : null,
}

/**
 * useValidator returns props designed to be spread onto a MUI TextField
 * (`helperText`, `error`, `inputRef`); with a native input we use them by hand.
 */
type ValidatorProps = {
  helperText: string | null
  error: boolean
  inputRef: MutableRefObject<any>
}

function Field({ label, value, onChange, validator }: {
  label: string
  value: string
  onChange: (value: string) => void
  validator: ValidatorProps
}) {
  return (
    <label style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ width: 60 }}>{label}</span>
      <input
        ref={validator.inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ borderColor: validator.error ? "crimson" : undefined }}
      />
      {validator.helperText && <span style={{ color: "crimson" }}>{validator.helperText}</span>}
    </label>
  )
}

export default function App() {

  const { name, email, saved } = useStore(formStore)
  const nameValidator = useValidator(name, nameRules) as ValidatorProps
  const emailValidator = useValidator(email, emailRules) as ValidatorProps

  function submit() {
    // validates all registered fields and focuses the first one in error
    const errors = validateAll()
    if (errors.length == 0) formStore.setSaved(true)
  }

  function reset() {
    resetAll()
    formStore.setName("")
    formStore.setEmail("")
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>jon · form with validator</h1>

      <Field label="name" value={name} onChange={v => formStore.setName(v)} validator={nameValidator} />
      <Field label="email" value={email} onChange={v => formStore.setEmail(v)} validator={emailValidator} />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit}>save</button>
        <button onClick={reset}>reset</button>
      </div>

      {saved && <p style={{ color: "green" }}>saved!</p>}
    </div>
  );
}
