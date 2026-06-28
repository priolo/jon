import { act, renderHook } from '@testing-library/react'
import { useValidator, validateAll, resetAll } from '../lib/input/validator'

/**
 * TEST sull'API reale del validator. Il vecchio modulo esterno `rules`
 * (basato su @priolo/jon-utils) non esiste piu', quindi qui si definiscono
 * un paio di regole banali e si verifica l'hook + le funzioni globali.
 */

const required = (v: any) => (!v ? 'required' : undefined)
const min3 = (v: any) => ((v?.length ?? 0) < 3 ? 'too short' : undefined)

describe('useValidator + validateAll', () => {

	it('does not flag an error before any interaction', () => {
		const { result } = renderHook(() => useValidator('', { required }))
		expect(result.current.error).toBe(false)
		expect(result.current.helperText).toBeNull()
	})

	it('validateAll collects the first failing rule and sets the field error', () => {
		const { result } = renderHook(() => useValidator('', { required, min3 }))

		let errors: ReturnType<typeof validateAll> = []
		act(() => { errors = validateAll() })

		expect(errors).toHaveLength(1)
		expect(errors[0].error).toBe('required')
		expect(result.current.error).toBe(true)
		expect(result.current.helperText).toBe('required')
	})

	it('reports no error for a valid value', () => {
		const { result } = renderHook(() => useValidator('hello', { required, min3 }))

		let errors: ReturnType<typeof validateAll> = []
		act(() => { errors = validateAll() })

		expect(errors).toHaveLength(0)
		expect(result.current.error).toBe(false)
	})

	it('resetAll clears a previously raised error', () => {
		const { result } = renderHook(() => useValidator('', { required }))

		act(() => { validateAll() })
		expect(result.current.error).toBe(true)

		act(() => { resetAll() })
		expect(result.current.error).toBe(false)
		expect(result.current.helperText).toBeNull()
	})

	it('validates several fields independently', () => {
		const a = renderHook(() => useValidator('', { required }))
		const b = renderHook(() => useValidator('ok', { required }))

		let errors: ReturnType<typeof validateAll> = []
		act(() => { errors = validateAll() })

		expect(errors).toHaveLength(1)
		expect(a.result.current.error).toBe(true)
		expect(b.result.current.error).toBe(false)
	})
})
