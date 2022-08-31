import { getAllStates } from "../store/rvxUtils"
import utils from "@priolo/jon-utils";
import { EVENTS_TYPES, addWatch, removeWatch } from "../store/rvxPlugin";



//#region TYPEDEF

/**
 * @typedef { import("../store/rvxPlugin").Listener } Listener
 * @typedef { {include:?string[], exclude:?string[], initState:?boolean} } RecOption
 * **include**: string[] ONLY the data relating to these paths will be taken
 * **exclude**: string[] the data relating to these paths are eliminated
 * @typedef { {type:RECORDER_ACTIONS, payload:Obect} } Action
 * @typedef { import("../store/rvx").Store[] } Store
 */

/**
 * Possible states of the RECORDER
 * @readonly
 * @enum {number}
 */
export const RECORDER_STATE = {
	STOP: 0,
	PAUSE: 1,
	REC: 2
}

/**
 * The type of ACTION
 * @readonly
 * @enum {number}
 */
export const RECORDER_ACTIONS = {
	OPTIONS: 0,
	SET_STATE: 1,
	ACTION: 2,
	ACTION_SYNC: 3,
	MUTATION: 4,
	CHECK_DIFF: 5,
	CHECK_HASH: 6,
	STORE_ADD: 7,
	STORE_REMOVE: 8,

}

/**
 * The default OPTIONS of the RECORDER
 * @type {RecOption} 
 */
const optionsDefault = {
	include: [],		// the properties of the STORE that must be included (and therefore the others will be excluded)
	exclude: [],		// the properties of the store that will have to be excluded (and therefore the others will be included)
	initState: true,	// at the beginning of the REC there is a snapshot of the STATE
}

//#endregion


//#region PROPS

/**
 * Stores involved in the registration 
 * @type {Store[]}
 */
let stores = []

function storeAdd ( store, rules ) {
	
}

/**
 * the actions I'm recording now
 * @type {Action[]} 
 */
let actions = []

/**
 * The last analyzed STATE used to make the DIFF
 * @type {Object}
 */
let lastStoreState = null

// are all subscriptions performed
/**
 * All the listeners inserted in JON (... poor thing!)
 * @type {Listener}
 */
let listener

/** 
 * the current OPTIONS of the RECORDER
 * @type {RecOption}
 */
let options = optionsDefault

/**
 * status of the "recorder"
 * @type {RECORDER_STATE}
 */
let state = RECORDER_STATE.STOP
/**
 * Get the STATE of RECORDER
 * @returns {RECORDER_STATE}
 */
function getState() {
	return state
}

//#endregion



/**
 * Start listening to the store and recording in actions
 * @param {RecOption} opt see optionsDefault
 */
function start(opt) {
	if (state == RECORDER_STATE.REC) return
	state = RECORDER_STATE.REC
	actions = []
	options = utils.merge(opt, optionsDefault)

	add({ type: RECORDER_ACTIONS.OPTIONS, payload: options })
	if (options.initState) addCurrentState()
	startStoreSubscribe()
}

/**
 * Finish the registration
 * returns the registered actions
 * @returns {Action[]}
 */
function stop() {
	if (state == RECORDER_STATE.STOP) return

	checkHash()
	state = RECORDER_STATE.STOP
	stopStoreSubscribe()
	return actions
}

/**
 * add an action to the registered actions
 * @param {object} action 
 */
 function add(action) {
	if (state != RECORDER_STATE.REC) return;
	actions.push(action)
}

/**
 * adds to the actions a CHECK with payload the difference with the last stored state (lastStoreState)
 * @param {boolean} shot if true it recaptures the state of the store for the next CHECK
 */
function checkDiff() {
	const current = getAllStates(options)
	add({
		type: RECORDER_ACTIONS.CHECK_DIFF,
		payload: utils.diff(lastStoreState, current)
	});
	lastStoreState = current
}

function checkHash() {
	const current = getAllStates(options)
	const hash = utils.hashCode(utils.jsonStream(current))
	add({
		type: RECORDER_ACTIONS.CHECK_HASH,
		payload: hash
	});
	lastStoreState = current
}

/**
 * Set the current state.
 * Done at the beginning of the recording
 * to initialize the store when it goes into play
 */
function addCurrentState() {
	lastStoreState = getAllStates(options)
	add({
		type: RECORDER_ACTIONS.SET_STATE,
		payload: lastStoreState,
	})
}

/**
 * Activate subscribers to monitor the store's action and mutation
 */
function startStoreSubscribe() {
	const recAction = {
		[EVENTS_TYPES.ACTION]: RECORDER_ACTIONS.ACTION,
		[EVENTS_TYPES.ACTION_SYNC]: RECORDER_ACTIONS.ACTION_SYNC,
		[EVENTS_TYPES.MUTATION]: RECORDER_ACTIONS.MUTATION,
	}
	listener = {
		storeName: "*",
		actionName: "*",
		callback: ({ type, storeName, key, payload, subcall }) => {
			if (subcall) return
			if (options.include) {

			}
			if (options.exclude) {

			}
			add({
				type: recAction[type],
				storeName,
				propName: key,
				payload: utils.cloneDeep(payload),
			})
		}
	}
	addWatch(listener)
}

/**
 * Delete all subscribers created (if any)
 */
function stopStoreSubscribe() {
	removeWatch(listener)
	listener = null
}




export default {
	getState,
	start,
	stop,
	checkDiff,
	checkHash,
}
