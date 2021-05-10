import { setAllState, getStore, getAllStates } from "./rvxProviders";
import { RECORDER_ACTIONS } from "./recorder";
import utils from "@priolo/jon-utils";



let lastStoreState = null

export async function playerStart(actions) {

	const log = []

	for (let i = 0; i < actions.length; i++) {
		let action = actions[i];
		const { type, storeName, propName, payload } = action

		switch (type) {

			// setta lo stato
			case RECORDER_ACTIONS.SET_STATE:
				{
					setAllState(action.payload)
					lastStoreState = action.payload
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


			case RECORDER_ACTIONS.CHECK:
				{
					const cloneState = getAllStates();
				debugger
					const check = utils.ref.diff(lastStoreState, cloneState)
					if (utils.ref.isEqualDeep(check, action.payload) == false) {
						log.push ({
							type: PLAY_LOG_TYPE.FAIL,
							index: i,
							diff: check,
						})
					}
				}
				break
		}
	}

	return log
}


const PLAY_LOG_TYPE = {
	FAIL: 0
}