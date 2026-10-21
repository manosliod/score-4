import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockWindowClass } from '@/testing/window'

const aDownload = () => ({ ...Promise.withResolvers<undefined>(), failed: false })

let download = aDownload()

const renderButton = async () => {
	const { SnackbarProvider } = await import('@/forest/components/snackbar')
	const { ThemeButton } = await import('./theme-button')
	const { ThemePanelHost } = await import('./theme-panel-host')
	render(
		<SnackbarProvider>
			<ThemeButton />
			<ThemePanelHost />
		</SnackbarProvider>
	)
	return screen.getByRole('button', { name: 'Theme' })
}

const press = async (button: HTMLElement) => {
	await act(async () => {
		fireEvent.click(button)
		await Promise.resolve()
	})
}

const arrive = async () => {
	await act(async () => {
		download.resolve(undefined)
		await import('./theme-panel').catch(() => null)
	})
}

describe('theme panel while it downloads', () => {
	beforeEach(() => {
		vi.resetModules()
		download = aDownload()
		vi.doMock('./theme-panel', async (importOriginal) => {
			await download.promise
			if (download.failed) {
				throw new TypeError('Failed to fetch dynamically imported module')
			}
			return importOriginal()
		})
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.doUnmock('./theme-panel')
		vi.restoreAllMocks()
		Reflect.deleteProperty(Element.prototype, 'getAnimations')
	})

	it('opens the dialog at once in its loading state, then shows the picker in the same dialog', async () => {
		mockWindowClass(false)
		await press(await renderButton())
		const dialog = screen.getByRole('dialog', { name: 'Theme' })
		expect(within(dialog).getByRole('progressbar', { name: 'Loading Theme' })).toBeInTheDocument()
		const done = within(dialog).getByRole('button', { name: 'Done' })
		await waitFor(() => {
			expect(done).toHaveFocus()
		})
		await arrive()
		expect(await within(dialog).findByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
		expect(within(dialog).queryByRole('progressbar')).not.toBeInTheDocument()
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBe(dialog)
		expect(done).toHaveFocus()
	})

	it('opens the sheet at once in its loading state on compact, with no Done', async () => {
		mockWindowClass(true)
		await press(await renderButton())
		const sheet = screen.getByRole('dialog', { name: 'Theme' })
		expect(within(sheet).getByRole('progressbar', { name: 'Loading Theme' })).toBeInTheDocument()
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		await arrive()
		expect(await within(sheet).findByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})

	it('closes with Done while loading and stays closed when the download arrives', async () => {
		mockWindowClass(false)
		await press(await renderButton())
		fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }))
		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
		await arrive()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
	})

	it('closes the loading dialog and says so when the download fails', async () => {
		mockWindowClass(false)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		download.failed = true
		const button = await renderButton()
		await press(button)
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBeInTheDocument()
		await arrive()
		expect(await screen.findByText('Couldn’t open Theme. Try again.')).toBeInTheDocument()
		expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
	})

	it('handles a failure while open once, through the exit and after it', async () => {
		mockWindowClass(false)
		const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		download.failed = true
		await press(await renderButton())
		await arrive()
		expect(await screen.findByText('Couldn’t open Theme. Try again.')).toBeInTheDocument()
		await waitFor(() => {
			expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
		})
		const caught = logged.mock.calls.filter((call) =>
			call.some((part) => typeof part === 'string' && part.includes('error occurred in the <LazyThemePanel>'))
		)
		expect(caught).toHaveLength(1)
	})

	it('says nothing and leaves focus alone when the download fails after the player closed it', async () => {
		mockWindowClass(false)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const exit = Promise.withResolvers<undefined>()
		const exitAnimation = {
			effect: { getTiming: () => ({ duration: 200, iterations: 1 }) },
			finished: exit.promise
		}
		download.failed = true
		const button = await renderButton()
		vi.spyOn(button, 'getClientRects').mockReturnValue(Object.assign([new DOMRect()], { item: () => null }))
		await press(button)
		Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [exitAnimation] })
		fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }))
		const focused = document.activeElement
		await arrive()
		expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-ending-style')
		expect(screen.queryByText('Couldn’t open Theme. Try again.')).not.toBeInTheDocument()
		expect(document.activeElement).toBe(focused)
		await act(async () => {
			exit.resolve(undefined)
			await exitAnimation.finished
		})
		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
		expect(screen.queryByText('Couldn’t open Theme. Try again.')).not.toBeInTheDocument()
	})
})
