import '@testing-library/jest-dom/extend-expect'
import { rules } from '../lib/input/rules'


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


