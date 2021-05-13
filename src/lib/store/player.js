
import { getStore } from "./rvxProviders";
import { getAllStates, setAllState } from "./rvxUtils"
import { RECORDER_ACTIONS } from "./recorder";
import utils from "@priolo/jon-utils";



let lastState = null
let options = {}

export async function playerStart(actions) {

	const log = []

	for (let i = 0; i < actions.length; i++) {
		let action = actions[i];
		const { type, storeName, propName, payload } = action

		switch (type) {

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


			case RECORDER_ACTIONS.CHECK_DIFF:
				{
					const currentState = getAllStates(options)
					const deltaState = utils.diff(lastState, currentState)
					if (utils.isEqualDeep(deltaState, action.payload) == false) {
						log.push({
							type: PLAY_LOG_TYPE.CHECK_DIFF_FAIL,
							index: i,
							diff: deltaState,
						})
					}
				}
				break

			case RECORDER_ACTIONS.CHECK_HASH:
				{
					const currentState = getAllStates(options)
					const hashState = utils.hashCode(utils.jsonStream(currentState))
					if (hashState != action.payload ) {
						log.push({
							type: PLAY_LOG_TYPE.CHECK_HASH_FAIL,
							index: i,
							diff: hashState,
						})
					}
				}
				break
		}
	}

	return log
}


const PLAY_LOG_TYPE = {
	CHECK_DIFF_FAIL: 0,
	CHECK_HASH_FAIL: 1,
}