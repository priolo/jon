/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off" */
import { useState, useRef, useEffect, MutableRefObject } from "react";
import { ValidationRule } from "./rules";

export interface ValidationError {
	error: string | null;
	ref: MutableRefObject<HTMLElement | null>;
}

export interface ValidationListener {
	validate: () => ValidationError;
	reset: () => void;
}

/**
 * listeners created for programmatic testing (validateAll)
 */
let Listeners: ValidationListener[] = []


/**
 * Calls the "validate" of all the listeners and returns the errors (if any)
 */
export function validateAll(): ValidationError[] {

	// loop and run all validators
	return Listeners.reduce<ValidationError[]>((errors, listener) => {
		const { error, ref } = listener.validate()
		if (error != null) {
			errors.push({ error, ref })
			if (errors.length == 1 && ref && ref.current != null) ref.current.focus()
		}
		return errors
	}, [])
}

/**
 * Reset all listeners
 */
export function resetAll() {
	Listeners.forEach(listener => listener.reset())
}

/**
 * HOOK which returns the "...props" to be attached to the TestField (https://v4.mui.com/components/text-fields/)
 * @param value the changed value which must be analyzed to determine if there is an error
 * @param rules the rules to which you pass the value and determine if there is an error
 */
export function useValidator(value: any, rules: Record<string, ValidationRule>, refName: string = "inputRef") {

	const [error, setError] = useState<string | null>(null)
	// component ref (optional)
	// essentially serves to give focus to the HTML component
	const ref = useRef<HTMLElement | null>(null)
	// I have to store the inserted value in the ref because otherwise I lose it if I call the validate externally
	const refValue = useRef(value)
	// indicates if there has been an interaction before
	const refInteraction = useRef(false)

	// register the validators. to use "validateAll"
	useEffect(() => {
		// I eventually delete a previous listener and add this one
		const listeners = Listeners.filter(l => l.validate != validate)
		listeners.push({ validate, reset })
		Listeners = listeners

		// on unmounth
		return () => {
			// ... I delete this listener (unless otherwise specified)
			Listeners = Listeners.filter(listener => listener.validate != validate)
		}
	}, []);

	// if the "value" changes but I haven't done any validation yet then do nothing
	// instead if there was a "refInteraction" then validate the "value" change
	// here to avoid getting error as soon as the page is opened but only after trying to validate the first time (validateAll)
	useEffect(() => {
		refValue.current = value
		if (refInteraction.current == false && checkRules() != null) return
		validate()
	}, [value])

	// validate all the rules and return if they are valid (true) or not (false)
	// store the error string
	function validate(): ValidationError {
		refInteraction.current = true
		const err = checkRules()
		setError(err)
		return { error:err, ref }
	}

	// reset validations
	function reset() {
		refInteraction.current = false
		setError(null)
	}

	function checkRules() {
		let err: string | undefined | null = null;
		Object.keys(rules).some(k => err = rules[k](refValue.current))
		return err || null
	}

	return { helperText: error, error: error != null, [refName]: ref }
}