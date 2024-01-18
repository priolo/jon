import { RenderOptions, RenderResult, cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

function customRender(ui: React.ReactElement, options: Omit<RenderOptions, 'queries'> = {}): RenderResult {
  return render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
// override render export
export { customRender as render }
