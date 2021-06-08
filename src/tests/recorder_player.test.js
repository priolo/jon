import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'
import rec from '../lib/store/recorder'
import player from '../lib/store/player'


beforeEach(() => {
	// create CONTEXT and STORE
	setupStore({ myStore: setupMyStore })
})

it('autotest simple', async () => {
	render(<MultiStoreProvider><TestView /><TestCommand /></MultiStoreProvider>)
	const myStore = getStore("myStore")

	// rec start
	rec.start()
	// change state value with JON
	await act(() => {
		myStore.setValue("new value by store")
	})
	// change state value with event
	await fireEvent.click(screen.getByText('set value'))
	// rec stop
	const actions = rec.stop()

	// player start
	let problems
	await act(async () => {
		problems = await player.all(actions)
	})

	// expect no problems
	expect(problems).toHaveLength(0)
})

it('autotest exclude play stepBystep', async () => {
	render(<MultiStoreProvider><TestView /><TestCommand /></MultiStoreProvider>)
	const myStore = getStore("myStore")

	// rec start
	rec.start({
		exclude: [ "myStore.users.id" ]
	})
	// change state value with JON
	await act(() => {
		myStore.setValue("new value by store")
	})
	// change state value with event
 	await fireEvent.click(screen.getByText('set value'))
	await fireEvent.click(screen.getByText('load users'))
	// rec stop
	const actions = rec.stop()

	// player start step by step
	let problems = []
	await act(async () => {
		for await (let log of player.stepByStep(actions)) {
			problems = problems.concat (log)
		}
	})

	// expect no problems
	expect(problems).toHaveLength(0)
})




// -------------------------------------------

const setupMyStore = {
	state: {
		value: "init value",
		users: [],
	},
	getters: {
		getUppercase: (state) => state.value.toUpperCase(),
	},
	actions: {
		changeValue: (state, value, store) => {
			store.setValue(`${value}... from action!`)
		},
		featchUsers:  (state, value, store) => {
			store.setUsers([
				{ id: randomId(), name: "Ivano" },
				{ id: randomId(), name: "Marina", desc: "l'amore mio!" },
				{ id: randomId(), name: "Mattia" },
			])
		},
	},
	mutators: {
		setValue: (state, value) => ({ value }),
		setUsers: (state, users) => ({ users }),
	},
}

const randomId = () => Math.round(Math.random() * 999)

function TestView() {
	const { state } = useStore("myStore")
	return <div data-testid="view">{state.value}</div>
}

function TestCommand() {
	const { changeValue, featchUsers } = useStore("myStore")
	return <div>
		<button onClick={() => changeValue("new value by click")}>set value</button>
		<button onClick={() => featchUsers()}>load users</button>
	</div>
}
