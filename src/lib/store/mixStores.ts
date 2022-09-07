import { StoreSetup } from "./global";
import { finalizeState } from "./rvx";


/**
 * Merges the parameters and returns a derived store
 */
export default function mixStores(...stores: StoreSetup[]): StoreSetup | null {
	return stores.reduce<StoreSetup|null>((acc, store) => {
		if (acc == null) return store;
		return mix(acc, store);
	}, null);
}

/**
 * Combines two stores
 */
function mix(store1:StoreSetup, store2:StoreSetup): StoreSetup | null {
	if (!store1 && !store2) return null;
	if (!store1) return store2;
	if (!store2) return store1;

	const state = (typeof store1.state == "function" || typeof store2.state == "function")
		? () => {
			const state1 = finalizeState(store1.state);
			const state2 = finalizeState(store2.state);
			return { ...state1, ...state2 };
		} : { ...store1.state, ...store2.state }

	return {
		state,
		mutators: {
			...store1.mutators,
			...store2.mutators,
		},
		getters: {
			...store1.getters,
			...store2.getters,
		},
		actions: {
			...store1.actions,
			...store2.actions,
		},
		actionsSync: {
			...store1.actionsSync,
			...store2.actionsSync,
		},
	};
}
