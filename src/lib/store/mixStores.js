
/**
 * @typedef {import("./rvx").StoreSetup} StoreSetup
 * @typedef {import("./rvx").Store} Store
 */



/**
 * Merges the parameters and returns a derived store
 * @param  {...StoreSetup} stores 
 * @returns {StoreSetup}
 */
export default function mixStores ( ...stores ) {
	return stores.reduce ( (acc, store) => {
		if ( acc==null ) return store
		return mix( acc, store );
	},null);
}

/**
 * combines two stores
 * @param {StoreSetup} store1 
 * @param {StoreSetup} store2 
 * @returns {StoreSetup}
 */
function mix ( store1, store2 ) {
	if ( !store1 && !store2 ) return {};
	if ( !store1 ) return store2;
	if ( !store2 ) return store1;

	return {
		
		state: {
			...store1.state,
			...store2.state,
		},
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

	}
}