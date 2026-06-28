import { renderOnChange, equalsSome, equalsIgnore } from '../lib/store/utils'

describe('equalsSome', () => {
	it('true when all listed props are equal (ignores the others)', () => {
		expect(equalsSome({ a: 1, b: 2 }, { a: 1, b: 99 }, ['a'])).toBe(true)
	})
	it('false when a listed prop differs', () => {
		expect(equalsSome({ a: 1, b: 2 }, { a: 2, b: 2 }, ['a'])).toBe(false)
	})
	it('true with an empty property list', () => {
		expect(equalsSome({ a: 1 }, { a: 2 }, [])).toBe(true)
	})
	it('false if either object is missing', () => {
		expect(equalsSome(null as any, { a: 1 }, ['a'])).toBe(false)
		expect(equalsSome({ a: 1 }, null as any, ['a'])).toBe(false)
	})
})

describe('renderOnChange', () => {
	it('builds a predicate that is true only when a watched prop changes', () => {
		const pred = renderOnChange(['a'])
		// "a" unchanged -> no re-render
		expect(pred({ a: 1, b: 1 }, { a: 1, b: 2 })).toBe(false)
		// "a" changed -> re-render
		expect(pred({ a: 2, b: 1 }, { a: 1, b: 1 })).toBe(true)
	})
})

describe('equalsIgnore', () => {
	it('true when all props are equal and nothing is ignored', () => {
		expect(equalsIgnore({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
	})
	it('ignores the listed props', () => {
		expect(equalsIgnore({ a: 1, b: 2 }, { a: 1, b: 999 }, ['b'])).toBe(true)
	})
	it('false when a non-ignored prop differs', () => {
		expect(equalsIgnore({ a: 1, b: 2 }, { a: 5, b: 2 }, ['b'])).toBe(false)
	})
	it('false when a key exists only on one side', () => {
		expect(equalsIgnore({ a: 1 }, { a: 1, c: 3 } as any)).toBe(false)
	})
	it('compares by identity when one side is nullish', () => {
		expect(equalsIgnore(null as any, null as any)).toBe(true)
		expect(equalsIgnore(null as any, { a: 1 })).toBe(false)
	})
})
