/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off" */
import { useState, useRef, useEffect } from "react";



/**
 * @typedef { {error:string, ref:HTMLElement} } Error
 * Error string (or null if there is no error) and reference HTML-NODE
 * 
 * @typedef { Object } Listener
 * the functions called during validation
 * @property { ()=>Error } validate
 * Returns a string if there is an error or null if there isn't
 * @property { ()=>void } reset
 * reset errors and interaction
 * 
 * @typedef { (value:Object)=>?string } Rule 
 * on a value it returns an identifying string of the error or null
 */

 /**
  * listeners created for programmatic testing (validateAll)
  * @type { Listener[] }
  */
let Listeners = []




/**
 * Calls the "validate" of all the listeners and returns the errors (if any)
 * @returns { Error[] }
 */
export function validateAll() {

	// loop and run all validators
	return Listeners.reduce((errors, listener) => {
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
 * @param { Object } value the changed value which must be analyzed to determine if there is an error
 * @param { Rule[] } rules the rules to which you pass the value and determine if there is an error
 */
export function useValidator(value, rules, refName="inputRef") {

	/** @type {[string,(error:string)=>void]} string containing the error */
	const [error, setError] = useState(null)
	// component ref (optional)
	const ref = useRef(null)
	// I have to store the inserted value in the ref because otherwise I lose it if I call the validate externally
	const refValue = useRef(value)
	// indicates if there has been an interaction before
	const refInteraction = useRef(false)

	// register the validators. to use "validateAll"
	useEffect(() => {
		// I eventually delete a previous listener and add this one
		const listeners = Listeners.filter(l => l != validate)
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
	function validate() {
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
		let err = null;
		Object.keys(rules).some(k => err = rules[k](refValue.current))
		return err
	}

	return { helperText: error, error: error != null, [refName]: ref }
}