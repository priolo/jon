/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off" */
import { useState, useRef, useEffect } from "react";

// un hook che permette di validare una input-text
let Listeners = []

export function validateAll(callback = null, extras = []) {
	let errors = false
	Listeners.forEach(v => {
		const [ref, valid] = v()
		if (ref.current!=null && errors == false && valid == false) {
			errors = true
			ref.current.focus()
		}
	})
	extras.forEach(v => {
		if (v() == false) errors = true
	})
	if (errors) return
	if (callback) callback()
}


export function useValidator(rules) {

	const [error, setError] = useState()
	const ref = useRef(null)

	// restituisce semplicemente se c'e' un errore o no
	const haveError = () => error != null

	// registra i validator. per usare "validateAll"
	useEffect(() => {
		Listeners.push(validateRef)
		return () => Listeners = []
	}, [ref]);

	// chiamato sul cambio valore effettua una validazione. Restituisce il valore validato (senza modifiche)
	function handleChange(evn) {
		const value = evn.target.value
		validate(value)
		return value
	}

	// valida il corrente stato del componente input
	function validateRef() {
		// se non c'e' il componente allora è sempre valido
		return [ref, ref.current ? validate(ref.current.value) : true]
	}

	// valida tuttele rule e restituisce se sono ttte valide (true) o no (false)
	function validate(value) {
		let error = null;
		Object.keys(rules).find(k => error = rules[k](value))
		setError(error)
		return error == null
	}

	// per la validazione extra che necessita di un dato correlato con un altro componente
	// [II] eliminare codice duplicato!!!
	function extra(rule) {
		// se il componente non esiste allora restituisce sempre false
		if ( ref.current==null) return ()=>true
		const error = rule(ref.current.value)
		return () => {
			setError(error)
			ref.current.focus()
			return error == null
		}
	}

	return [error, haveError, handleChange, ref, extra]
}