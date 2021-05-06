import { merge, isObject } from "../lib/object/ref";


test('merge', async () => {
	const obj1 = { par1: -1, par2: { par2_1: -21, par2_5: -25 }, arr: [0, 1, 2] }
	const obj2 = { par1: 1, par2: { par2_1: 21 }, par3: 3, arr: [3, 4, 5] }
	const obj3 = merge(obj1, obj2)
	expect(obj3).toEqual(
		{ par1: -1, par2: { par2_1: -21, par2_5: -25 }, par3: 3, arr: [0, 1, 2] }
	)
})

test('isObject', async () => {
	expect(isObject("23")).toBeFalsy()
	expect(isObject(23)).toBeFalsy()
	expect(isObject(null)).toBeFalsy()
	expect(isObject([1, 2, 3])).toBeFalsy()
	expect(isObject({ name: "pippo" })).toBeTruthy()
})