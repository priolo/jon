import { setAllState, getStore, getAllStates } from "./rvxProviders";
import { RECORDER_ACTIONS } from "./recorder";
import { diff, isEqualDeep } from "../object/ref";

let lastStoreState = null

export async function playerStart(actions) {
	for (let i = 0; i < actions.length; i++) {
		let action = actions[i];
		let check;
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
					check = diff(lastStoreState, cloneState)
					if (isEqualDeep(check, action.payload) == false) {
						return false
					}
				}
				break
		}
	};
	return true
}
