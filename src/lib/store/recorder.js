import { cloneDeep, diff } from "../object/ref"
import { getAllStates, getAllStores } from "./rvxProviders"
import { EVENT_TYPE } from "./rvx"



export const RECORDER_STATE = {
	STOP: 0, PAUSE: 1, PLAY: 2
}

export const RECORDER_ACTIONS = {
	SET_STATE: 0, ACTION: 1, ACTION_SYNC: 2, MUTATION: 3, CHECK: 4
}


// le action che sto registrando ora
let actions = []
// l'ultima store analizzata
let lastStoreState = null
// stato del "recorder"
let _state = RECORDER_STATE.STOP

let _unsubMutations = null
let _unsubActions = null

const options = {
	ignoreModules: [],
	mouseEventsNull: true,
}


/**
 * Avvia l'ascolto dello store e la registrazione in actions
 * @param {boolean} initialState 
 */
export function recorderStart(initialState = true) {
	if (_state == RECORDER_STATE.PLAY) return
	_state = RECORDER_STATE.PLAY
	actions = []

	if (initialState) _addCurrentState()
	_shotStoreState()
	_startStoreSubscribe()
}

/**
 * Termina la registrazione
 * restituisce le actions registrate
 */
export function recorderStop() {
	if (_state == RECORDER_STATE.STOP) return
	_state = RECORDER_STATE.STOP
	_stopStoreSubscribe()
	recorderCheck(false)
	return actions
}

/**
 * Cambia lo stato in PAUSE in questo stato non registra nulla
 * Richiamare play() per riavviare la registrazione
 */
// function pause() {
// 	if (_state == RECORDER_STATE.PAUSE) return
// 	_state = RECORDER_STATE.PAUSE
// 	_stopStoreSubscribe()
// }

/**
 * aggiunge alle action un CHECK con payload la differenza con l'ultimo stato memorizzato (lastStoreState)
 * @param {boolean} shot se true ricattura lo stato dello store per il prossimo CHECK
 */
export function recorderCheck(shot = true) {
	const current = getAllStates(options.ignoreModules);
	add({
		type: RECORDER_ACTIONS.CHECK,
		payload: diff(lastStoreState, current)
	});
	if (shot) {
		lastStoreState = current;
		//_shotStoreState();
	}
}


/**
 * Setta lo stato corrente. Usato all'inizio per inizializzare lo store 
 */
function _addCurrentState() {
	const states = getAllStates(options.ignoreModules)
	add({
		type: RECORDER_ACTIONS.SET_STATE,
		payload: states,
	})
}

/**
 * Aggiungo un action alle actions registrate
 * @param {object} action 
 */
function add(action) {
	//if (state != RECORDER_STATE.PLAY) return;
	// for (let ig of options.ignoreModules) {
	// 	if (action.path.startsWith(`${ig}/`)) return;
	// }
	// if (options.mouseEventsNull) {
	// 	const cn = action.payload && action.payload.constructor && action.payload.constructor.name;
	// 	if (cn == "MouseEvent") action.payload = null;
	// }
	actions.push(action)
}


/**
 * Prelevo lo stato dello store e lo metto come "ultimo controllato" (lastStoreState)
 */
function _shotStoreState() {
	lastStoreState = getAllStates(options.ignoreModules)
}


let callbacks = {}

/**
 * Attiva i subscribe per monitorare action e mutation dello store
 */
function _startStoreSubscribe() {
	_stopStoreSubscribe();
	debugger
	const stores = getAllStores(options.ignoreModules)

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
				propName, 						// nome della funzione richiamata
				payload: cloneDeep(payload),
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
function _stopStoreSubscribe() {
	const stores = getAllStores(options.ignoreModules)
	Object.keys(stores).forEach(key => {
		const callback = callbacks[key]
		stores[key].unsubscribe(callback)
	})
	callbacks = {}
}
