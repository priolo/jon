import React from 'react'
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { getStore, MultiStoreProvider, setupStore, useStore } from '../lib/store/rvxProviders'
import { useValidator, validateAll } from '../lib/input/validator'
import { rules } from '../lib/input/rules'


// beforeEach(() => {
// 	// create CONTEXT and STORE
// 	setupStore({ myStore: setupMyStore })
// })

test('rule obbligatory', async () => { 
	let resp = rules.obligatory ( "" )
	expect(resp).toBe("string.obligatory")
	resp = rules.obligatory ( null )
	expect(resp).toBe("string.obligatory")
	resp = rules.obligatory ( "pippo" )
	expect(resp).toBeUndefined()
})

test('rule email', async () => { 
	let resp = rules.email ( "" )
	expect(resp).toBe("email.syntax")
	resp = rules.email ( null )
	expect(resp).toBe("email.syntax")

	resp = rules.email ( "ivano@iorio.com" )
	expect(resp).toBeUndefined()
	resp = rules.email ( "ivano@" )
	expect(resp).toBe("email.syntax")
})

test('rule obbligatory', async () => { 
	let resp = rules.obligatoryArray ( "" )
	expect(resp).toBe("array.obligatory")
	resp = rules.obligatoryArray ( null )
	expect(resp).toBe("array.obligatory")
	resp = rules.obligatoryArray ( [] )
	expect(resp).toBe("array.obligatory")
	resp = rules.obligatoryArray ( [1,2,3] )
	expect(resp).toBeUndefined()
})


// test('validate all', async () => {

// 	render(<MultiStoreProvider><TestView /></MultiStoreProvider>)

// 	validateAll()

// 	// // get myStore with reducer
// 	// const myStoreWithReducer = getStore("myStore")
// 	// expect(myStoreWithReducer.state.value).toBe("init value")

// 	// // change state value with reducer
// 	// await act(async () => myStoreWithReducer.fetch())

// 	// expect(screen.getByTestId('view')).toHaveTextContent("new value")
// })


const setupMyStore = {
	state: {
		value: "",
	},
	actions: {
		fetch: async (state, payload, store) => {
			// simulate http response
			await new Promise((res)=>setTimeout(res,1000))
			store.setValue("new value")
		}
	},
	mutators: {
		setValue: (state, value) => {
			return { value }
		},
	},
}

function TestView() {

	const { state, setValue } = useStore("myStore")
	const props = useValidator(state.value, [rules.obligatory])

	return (<div>
		<button onClick={() => fetch()}>click</button>
		<div data-testid="view">{state.value}</div>
	</div>)
}
