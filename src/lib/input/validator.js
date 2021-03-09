/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off" */
import { useState, useRef, useEffect } from "react";

// un hook che permette di validare una input-text
let Listeners = []

export function validateAll() {

	// ciclo ed eseguo tutti i validator
	return Listeners.reduce((errors, validate) => {
		const { error, ref } = validate()
		if (error != null) {
			errors.push({ error, ref })
			if (errors.length == 1 && ref && ref.current != null) ref.current.focus()
		}
		return errors
	}, [])
}

/**
 * Validatore riferito ad un componente
 * @param {Array<rule>} rules 
 */
export function useValidator(value, rules) {

	// stringa contenente l'errore
	const [error, setError] = useState()
	// ref del componente (opzionale)
	const ref = useRef(null)
	// il valore inserito lo devo memorizzare nel ref perche' altrimenti me lo perdo se chiamo il validate esternamente
	const refValue = useRef(value)
	// indica se c'e' stata un interazione prima d'ora
	const refInteraction = useRef(false)


	// registra i validator. per usare "validateAll"
	useEffect(() => {
		// elimino eventualmente un listener precedente e aggiungo questo
		const listeners = Listeners.filter(l => l != validate)
		listeners.push(validate)
		Listeners = listeners

		// su unmounth
		return () => {
			// ... elimino questo listener (se non è specificato altrimenti) 
			Listeners = Listeners.filter(l => l != validate)
		}
	}, []);

	useEffect(() => {
		refValue.current = value
		if (refInteraction.current == false && checkRules() != null) return
		validate()
	}, [value])

	// valida tutte le rule e restituisce se sono valide (true) o no (false)
	// memorizza la stringa dell'errore
	function validate() {
		refInteraction.current = true
		const err = checkRules()
		setError(err)
		return { error:err, ref }
	}

	function checkRules() {
		let err = null;
		Object.keys(rules).some(k => err = rules[k](refValue.current))
		return err
	}

	return { helperText: error, error: error != null, inputRef: ref }
}