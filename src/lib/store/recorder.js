import { getAllStores } from "./rvxProviders"
import { getAllStates, STORE_EVENTS } from "./rvxUtils"
import utils from "@priolo/jon-utils";



export const RECORDER_STATE = {
	STOP: 0,
	PAUSE: 1,
	PLAY: 2
}

export const RECORDER_ACTIONS = {
	OPTIONS: 0,
	SET_STATE: 1,
	ACTION: 2,
	ACTION_SYNC: 3,
	MUTATION: 4,
	CHECK_DIFF: 5,
	CHECK_HASH: 6
}

// le action che sto registrando ora
let actions = []
// l'ultima store analizzata
let lastStoreState = null
// stato del "recorder"
let state = RECORDER_STATE.STOP
// sono tutte le subscription eseguite
let callbacks = {}

/** Le OPTIONS di defualt del RECORDER */
const optionsDefault = {
	include: [],			// gli 
	exclude: [],
	initState: true,	// all'inizio della REC c'e' uno snapshot dello STATE
}
/** le OPTIONS attuali del RECORDER */
let options = optionsDefault

/**
 * Get the STATE of RECORDER
 * @returns 
 */
function getState() {
	return state
}

/**
 * Avvia l'ascolto dello store e la registrazione in actions
 * @param {JSON} opt vedi optionsDefault
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
	lastStoreState = getAllStates()
	add({
		type: RECORDER_ACTIONS.SET_STATE,
		payload: lastStoreState,
	})
}

/**
 * Attiva i subscribe per monitorare action e mutation dello store
 */
function startStoreSubscribe() {
	stopStoreSubscribe();

	const stores = getAllStores(options)

	const recAction = {
		[STORE_EVENTS.ACTION]: RECORDER_ACTIONS.ACTION,
		[STORE_EVENTS.ACTION_SYNC]: RECORDER_ACTIONS.ACTIONA_SYNC,
		[STORE_EVENTS.MUTATION]: RECORDER_ACTIONS.MUTATION,
	}

	callbacks = Object.keys(stores).reduce((callbacks, storeName) => {

		const callback = ({ event, payload }) => {
			const { key: propName, payload: data, subcall } = payload
			if (subcall) return
			add({
				type: recAction[event],		// tipo di intervento (action, mutation)
				storeName,
				propName, 					// nome della funzione richiamata
				payload: utils.cloneDeep(data),
			})
		}

		const storeEmitter = stores[storeName].emitter
		storeEmitter.on("*", callback)
		callbacks[storeName] = callback
		return callbacks
	}, {})
}

/**
 * Elimina tutti i subscribe creati (se ci sono)
 */
function stopStoreSubscribe() {
	const stores = getAllStores(options)
	Object.keys(stores).forEach(key => {
		const callback = callbacks[key]
		const storeEmitter = stores[key].emitter
		storeEmitter.off("*", callback)
	})
	callbacks = {}
}




export default {
	getState,
	start,
	stop,
	checkDiff,
	checkHash,
}
