
import { getStore } from "../store/rvxProviders";
import { getAllStates, setAllState } from "../store/rvxUtils"
import { RECORDER_ACTIONS } from "./recorder";
import utils from "@priolo/jon-utils";



//#region TYPEDEF

/**
 * @typedef {import("./recorder").Action} Action
 * @typedef {import("./recorder").RecOption} RecOption
 * @typedef {type:PLAY_LOG_TYPE, diff:Object} Log
 */

/**
 * Indica se usare il DIFF o HASH per il check
 * @readonly
 * @enum {number}
 */
const PLAY_LOG_TYPE = {
	CHECK_DIFF_FAIL: 0,
	CHECK_HASH_FAIL: 1,
}

//#endregion



//#region PROPS

/**
 * La situazione dell'ultimo STATE di JON
 * @type {Object}
 */
let lastState = null

/**
 * Le opzioni attivate
 * @type {RecOption}
 */
let options = {}

//#endregion



/**
 * Esegue un array di ACTIONS una dopo l'altra per ogni richiamo di questa funzione
 * @param {Action[]} actions 
 * @returns {Log}
 */
async function* stepByStep(actions) {
	for (let i = 0; i < actions.length; i++) {
		const action = actions[i]
		yield await exe(action)
	}
}

/**
 * Esegue le ACTIONS tutte in una BOTTA
 * @param {Action[]} actions 
 * @returns {Log[]}
 */
async function all(actions) {
	const log = []
	for (let i = 0; i < actions.length; i++) {
		let action = actions[i]
		log.concat(await exe(action))
	}
	return log
}

/**
 * esegue una ACTION
 * @param {Action} action 
 * @returns {Log}
 */
async function exe(action) {
	const { type, storeName, propName, payload } = action
	const log = []

	switch (type) {

		// memorizza le opzioni da utilizzare
		case RECORDER_ACTIONS.OPTIONS:
			options = payload
			break

		// setta lo stato
		case RECORDER_ACTIONS.SET_STATE:
			{
				setAllState(action.payload)
				lastState = action.payload
			}
			break

		// esegui un action (promise)
		case RECORDER_ACTIONS.ACTION:
			{
				const store = getStore(storeName)
				await store[propName](payload)
			}
			break

		// esegui un action sync
		case RECORDER_ACTIONS.ACTION_SYNC:
			{
				const store = getStore(storeName)
				store[propName](payload)
			}
			break

		// esegui una mutation
		case RECORDER_ACTIONS.MUTATION:
			{
				const store = getStore(storeName)
				store[propName](payload)
			}
			break

		// controlla se ci sono differenze con l'ultimo stato memorizzato
		case RECORDER_ACTIONS.CHECK_DIFF:
			{
				const currentState = getAllStates(options)
				const deltaState = utils.diff(lastState, currentState)
				if (utils.isEqualDeep(deltaState, action.payload) == false) {
					log.push({
						type: PLAY_LOG_TYPE.CHECK_DIFF_FAIL,
						//index: i,
						diff: deltaState,
					})
				}
			}
			break

		// controlla se ci sono differenze con l'ultimo stato memorizzato (metodo HASH)
		case RECORDER_ACTIONS.CHECK_HASH:
			{
				const currentState = getAllStates(options)
				const hashState = utils.hashCode(utils.jsonStream(currentState))
				if (hashState != action.payload) {
					log.push({
						type: PLAY_LOG_TYPE.CHECK_HASH_FAIL,
						//index: i,
						diff: hashState,
					})
				}
			}
			break
	}

	return log
}


export default {
	stepByStep,
	all
}