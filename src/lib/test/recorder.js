import { getAllStates } from "../store/rvxUtils"
import utils from "@priolo/jon-utils";
import { EVENTS_TYPES, addWatch, removeWatch } from "../store/rvxPlugin";



//#region TYPEDEF

/**
 * @typedef { import("../store/rvxPlugin").Listener } Listener
 * @typedef { {include:?string[], exclude:?string[], initState:?boolean} } RecOption
 * **include**: string[] verranno presi SOLO i dati relativi a queste path  
 * **exclude**: string[] i dati relativi a queste path sono eliminati
  * @typedef { {type:RECORDER_ACTIONS, payload:Obect} } Action
 */

/**
 * Possibili stati del RECORDER
 * @readonly
 * @enum {number}
 */
export const RECORDER_STATE = {
	STOP: 0,
	PAUSE: 1,
	PLAY: 2
}

/**
 * Il tipo di ACTION
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
 * Le OPTIONS di defualt del RECORDER
 * @type {RecOption} 
 */
const optionsDefault = {
	include: [],		// le propietà dello STORE che devono essere incluese (e quindi le altre saranno escluse)
	exclude: [],		// le proprietà dello store che dovranno essere escluse (e quindi le altre saranno incluse)
	initState: true,	// all'inizio della REC c'e' uno snapshot dello STATE
}

//#endregion


//#region PROPS

/**
 * le action che sto registrando ora
 * @type {Action[]} 
 */
let actions = []

/**
 * L'ultimo STATE analizzato usato per fare il DIFF
 * @type {Object}
 */
let lastStoreState = null

// sono tutte le subscription eseguite
/**
 * Tutti i listener inseriti in JON (...poverino!)
 * @type {Listener}
 */
let listener

/** 
 * le OPTIONS attuali del RECORDER 
 * @type {RecOption}
 */
let options = optionsDefault

/**
 * stato del "recorder"
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
 * Avvia l'ascolto dello store e la registrazione in actions
 * @param {RecOption} opt vedi optionsDefault
 */
function start(opt) {
	if (state == RECORDER_STATE.PLAY) return
	state = RECORDER_STATE.PLAY
	actions = []
	options = utils.merge(opt, optionsDefault)

	add({ type: RECORDER_ACTIONS.OPTIONS, payload: options })
	if (options.initState) addCurrentState()
	startStoreSubscribe()
}

/**
 * Termina la registrazione
 * restituisce le actions registrate
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
 * aggiunge alle action un CHECK con payload la differenza con l'ultimo stato memorizzato (lastStoreState)
 * @param {boolean} shot se true ricattura lo stato dello store per il prossimo CHECK
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
 * Aggiungo un action alle actions registrate
 * @param {object} action 
 */
function add(action) {
	if (state != RECORDER_STATE.PLAY) return;
	actions.push(action)
}

/**
 * Setta lo stato corrente. 
 * Effettuato all'inizio della registrazione 
 * per inizializzare lo store quando andrà in play
 */
function addCurrentState() {
	lastStoreState = getAllStates(options)
	add({
		type: RECORDER_ACTIONS.SET_STATE,
		payload: lastStoreState,
	})
}

/**
 * Attiva i subscribe per monitorare action e mutation dello store
 */
function startStoreSubscribe() {
	const recAction = {
		[EVENTS_TYPES.ACTION]: RECORDER_ACTIONS.ACTION,
		[EVENTS_TYPES.ACTION_SYNC]: RECORDER_ACTIONS.ACTIONA_SYNC,
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
 * Elimina tutti i subscribe creati (se ci sono)
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
