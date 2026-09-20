import { StoreSetup } from "./global";
import { finalizeState } from "./rvx";

type Setup = StoreSetup<any>
type StateOf<S> = S extends { state?: infer State }
	? State extends () => infer Result ? Result : State
	: {}
type MembersOf<S, K extends "getters" | "actions" | "mutators"> = S extends Record<K, infer Members> ? Members : {}
type MergeObjects<A, B> = Omit<A, keyof B> & B
type MergeSetups<A, B> = Omit<A, "state" | "getters" | "actions" | "mutators"> & {
	state: MergeObjects<StateOf<A>, StateOf<B>>
	getters: MergeObjects<MembersOf<A, "getters">, MembersOf<B, "getters">>
	actions: MergeObjects<MembersOf<A, "actions">, MembersOf<B, "actions">>
	mutators: MergeObjects<MembersOf<A, "mutators">, MembersOf<B, "mutators">>
}
type MergedSetups<T extends readonly unknown[]> =
	T extends readonly [infer First, ...infer Rest]
		? Rest extends readonly [] ? First : MergeSetups<First, MergedSetups<Rest>>
		: {}


/**
 * Merges the parameters and returns a derived SETUP-STORE
 * @example
 * const mixedSetup = mixStores(setup1, setup2, setup3);
 */
export default function mixStores<const T extends readonly [object, ...object[]]>(...stores: T): MergedSetups<T>
export default function mixStores(...stores: Setup[]): Setup | null
export default function mixStores(...stores: Setup[]): Setup | null {
	return stores.reduce<StoreSetup<any>|null>((acc, store) => {
		if (acc == null) return store;
		return mix(acc, store);
	}, null) as Setup | null;
}

/**
 * Combines two SETUP-STORE
 * @example
 * const mixedSetup = mix(setup1, setup2);
 */
function mix<T>(setup1:StoreSetup<T>, setup2:StoreSetup<T>): StoreSetup<T> | null {
	if (!setup1 && !setup2) return null;
	if (!setup1) return setup2;
	if (!setup2) return setup1;

	const state: StoreSetup<T>["state"] = (typeof setup1.state == "function" || typeof setup2.state == "function")
		? () => {
			const state1 = finalizeState(setup1.state);
			const state2 = finalizeState(setup2.state);
			return { ...state1, ...state2 } as T;
		} : { ...setup1.state, ...setup2.state } as T

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
		onListenerChange: setup2.onListenerChange ?? setup1.onListenerChange,
		onStateChange: setup2.onStateChange ?? setup1.onStateChange,
	};
}
