import React from 'react'
import { render } from '@testing-library/react'

import { getAllStates, getStructureStoreFromPaths } from "../lib/store/rvxUtils"
import { MultiStoreProvider } from '../lib/store/rvxProviders'



const setups = {
	store1: {
		state: {
			users: [
				{ id: 1, name: "ivano" },
				{ id: 2, name: "marina" },
				{ id: 3, name: "mattia" }
			],
			par1: "item1",
		}
	},
	store2: {
		state: {
			par1: { par1_1: "item1.1", par1_2: "item1.2" },
			par2: { par2_1: "item2.1", par2_2: "item2.2" },
			par3: "item3",
		}
	},
	store3: {
		state: {
			par1: "item1"
		}
	}
}

test('getStructureStoreFromPaths', async () => {
	const paths = [
		"path1.name.initial",
		"path1.surname",
		"path2.single",
		null,
		"path3",
	]

	const struct = getStructureStoreFromPaths(paths)

	expect(struct).toEqual({
		"path1": ["name.initial", "surname"],
		"path2": ["single"],
		"path3": []
	})

})

test('getAllStates exclude', async () => {
	render(<MultiStoreProvider setups={setups}/>)

	const states = getAllStates({
		exclude: [
			"store1.undefined",
			"store1.users.id",
			"store1.users.name",
			"store2.par1.par1_2",
			"store3",
			"undefined",
			null,
		]
	})

	expect(states).toEqual({
		store1: { users: [{}, {}, {}], par1: 'item1' },
		store2: {
			par1: { par1_1: 'item1.1' },
			par2: { par2_1: 'item2.1', par2_2: 'item2.2' },
			par3: 'item3'
		}
	})
})

test('getAllStates include', async () => {
	render(<MultiStoreProvider setups={setups}/>)

	const states = getAllStates({
		include: [
			"store1.users.id",
			"store3",
			"undefined",
			null,
		]
	})

	expect(states).toEqual({
		"store1": {
			"users": [{ "id": 1 }, { "id": 2 }, { "id": 3 }]
		},
		"store3": { "par1": "item1" }
	})
})