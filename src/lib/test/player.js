
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
 * Indicates whether to use DIFF or HASH for the check
 * @readonly
 */
const PLAY_LOG_TYPE = {
	CHECK_DIFF_FAIL: 0,
	CHECK_HASH_FAIL: 1,
}

//#endregion



//#region PROPS

/**
 * the last STATE stored in JON
 * @type {Object}
 */
let lastState = null

/**
 * The current activated options
 * @type {RecOption}
 */
let options = {}

//#endregion



/**
 * Executes an array of ACTIONS one after the other for each call of this function
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
 * Performs the ACTIONS all in one SHOT
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
 * performs an ACTION
 * @returns {Log}
 */
async function exe(action) {
	const { type, storeName, propName, payload } = action
	const log = []

	switch (type) {

		// stores the options to use
		case RECORDER_ACTIONS.OPTIONS:
			options = payload
			break

		// set the state
		case RECORDER_ACTIONS.SET_STATE:
			{
				setAllState(action.payload)
				lastState = action.payload
			}
			break

		// perform an action (promise)
		case RECORDER_ACTIONS.ACTION:
			{
				const store = getStore(storeName)
				await store[propName](payload)
			}
			break

		// perform an action sync
		case RECORDER_ACTIONS.ACTION_SYNC:
			{
				const store = getStore(storeName)
				store[propName](payload)
			}
			break

		// perform an mutation
		case RECORDER_ACTIONS.MUTATION:
			{
				const store = getStore(storeName)
				store[propName](payload)
			}
			break

		// check if there are any differences with the last stored state
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

		// check if there are any differences with the last stored state (metodo HASH)
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