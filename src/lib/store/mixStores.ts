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
function mix(setup1:StoreSetup, setup2:StoreSetup): StoreSetup | null {
	if (!setup1 && !setup2) return null;
	if (!setup1) return setup2;
	if (!setup2) return setup1;

	const state = (typeof setup1.state == "function" || typeof setup2.state == "function")
		? () => {
			const state1 = finalizeState(setup1.state);
			const state2 = finalizeState(setup2.state);
			return { ...state1, ...state2 };
		} : { ...setup1.state, ...setup2.state }

	return {
		state,
		mutators: {
			...setup1.mutators,
			...setup2.mutators,
		},
		getters: {
			...setup1.getters,
			...setup2.getters,
		},
		actions: {
			...setup1.actions,
			...setup2.actions,
		},
		actionsSync: {
			...setup1.actionsSync,
			...setup2.actionsSync,
		},
	};
}
