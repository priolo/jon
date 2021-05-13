import { getAllStores } from "./rvxProviders"
import { getAllStates } from "./rvxUtils"
import { EVENT_TYPE } from "./rvx"
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

const optionsDefault = {
	include:[],
	exclude: [],
	initState: true,	// all'inizio della REC c'e' uno snapshot dello STATE
}
let options = optionsDefault


export function recorderState() {
	return state
}

/**
 * Avvia l'ascolto dello store e la registrazione in actions
 * @param {boolean} initialState 
 */
export function recorderStart(opt) {
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
export function recorderStop() {
	if (state == RECORDER_STATE.STOP) return

	recorderCheckHash()
	state = RECORDER_STATE.STOP
	stopStoreSubscribe()
	return actions
}

/**
 * aggiunge alle action un CHECK con payload la differenza con l'ultimo stato memorizzato (lastStoreState)
 * @param {boolean} shot se true ricattura lo stato dello store per il prossimo CHECK
 */
export function recorderCheckDiff() {
	const current = getAllStates(options)
	add({
		type: RECORDER_ACTIONS.CHECK_DIFF,
		payload: utils.diff(lastStoreState, current)
	});
	lastStoreState = current
}

export function recorderCheckHash() {
	const current = getAllStates(options)
console.log(current)
debugger
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
		[EVENT_TYPE.ACTION]: RECORDER_ACTIONS.ACTION,
		[EVENT_TYPE.ACTION_SYNC]: RECORDER_ACTIONS.ACTIONA_SYNC,
		[EVENT_TYPE.MUTATION]: RECORDER_ACTIONS.MUTATION,
	}

	callbacks = Object.keys(stores).reduce((callbacks, storeName) => {
		const callback = (type, propName, payload) => {
			add({
				type: recAction[type],		// tipo di intervento (action, mutation)
				storeName,
				propName, 					// nome della funzione richiamata
				payload: utils.cloneDeep(payload),
			})
		}
		stores[storeName].subscribe(callback)
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
		stores[key].unsubscribe(callback)
	})
	callbacks = {}
}
