import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import brightnessAuto from '@/forest/assets/icons/brightness_auto.svg'
import darkMode from '@/forest/assets/icons/dark_mode.svg'
import { mockWindowClass } from '@/testing/window'

const renderButton = async () => {
	const { ThemeButton } = await import('./theme-button')
	const { ThemePanelHost } = await import('./theme-panel-host')
	render(
		<>
			<ThemeButton />
			<ThemePanelHost />
		</>
	)
	return screen.getByRole('button', { name: 'Theme' })
}

const icon = (button: HTMLElement) => button.querySelector('.icon')?.getAttribute('style') ?? ''

const open = async (button: HTMLElement) => {
	await act(async () => {
		fireEvent.click(button)
		await import('./theme-panel')
	})
	return screen.findByRole('dialog')
}

describe('theme button', () => {
	beforeEach(() => {
		vi.resetModules()
		localStorage.clear()
		delete document.documentElement.dataset['theme']
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.doUnmock('./theme-panel')
		vi.doUnmock('@/forest/components/snackbar')
		vi.doUnmock('@/forest/components/basic-dialog')
		vi.restoreAllMocks()
		Reflect.deleteProperty(Element.prototype, 'getAnimations')
	})

	it('opens a sheet without Done on compact', async () => {
		mockWindowClass(true)
		const button = await renderButton()
		const sheet = await open(button)
		expect(within(sheet).getByRole('heading', { name: 'Theme' })).toBeInTheDocument()
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		expect(within(sheet).getByRole('radio', { name: 'System' })).toBeChecked()
	})

	it('opens a dialog with Done from medium up', async () => {
		mockWindowClass(false)
		const dialog = await open(await renderButton())
		expect(within(dialog).getByRole('button', { name: 'Done' })).toBeInTheDocument()
		expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})

	it('applies and stores a choice at once and stays open', async () => {
		mockWindowClass(false)
		const button = await renderButton()
		expect(icon(button)).toContain(brightnessAuto)
		const dialog = await open(button)
		fireEvent.click(within(dialog).getByRole('radio', { name: 'Dark' }))
		expect(icon(button)).toContain(darkMode)
		expect(within(dialog).getByRole('radio', { name: 'Dark' })).toBeChecked()
		expect(document.documentElement.dataset['theme']).toBe('dark')
		expect(localStorage.getItem('theme')).toBe('dark')
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	it('starts from the stored choice', async () => {
		mockWindowClass(false)
		localStorage.setItem('theme', 'light')
		const dialog = await open(await renderButton())
		expect(within(dialog).getByRole('radio', { name: 'Light' })).toBeChecked()
	})

	it('picks the surface from the window class at each press and returns focus to the button on close', async () => {
		const viewport = mockWindowClass(true)
		const button = await renderButton()
		button.focus()
		const sheet = await open(button)
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		fireEvent.keyDown(within(sheet).getByRole('radio', { name: 'System' }), { key: 'Escape' })
		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
		expect(button).toHaveFocus()
		viewport.resize(false)
		const dialog = await open(button)
		expect(within(dialog).getByRole('button', { name: 'Done' })).toBeInTheDocument()
	})

	it('reopens the same sheet, with no Done, when Theme is pressed during its exit on a widened window', async () => {
		const viewport = mockWindowClass(true)
		const button = await renderButton()
		const sheet = await open(button)
		const exit = Promise.withResolvers<undefined>()
		const exitAnimation = {
			effect: { getTiming: () => ({ duration: 200, iterations: 1 }) },
			finished: exit.promise
		}
		Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [exitAnimation] })
		fireEvent.keyDown(within(sheet).getByRole('radio', { name: 'System' }), { key: 'Escape' })
		expect(sheet).toHaveAttribute('data-ending-style')
		viewport.resize(false)
		act(() => {
			fireEvent.click(button)
		})
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBe(sheet)
		await waitFor(() => {
			expect(sheet).not.toHaveAttribute('data-ending-style')
		})
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		expect(within(sheet).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
		await act(async () => {
			exit.resolve(undefined)
			await exitAnimation.finished
		})
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBe(sheet)
	})

	it('tells the player when the panel cannot be downloaded, and opens on the next try', async () => {
		mockWindowClass(false)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		vi.doMock('./theme-panel', () => {
			throw new Error('offline')
		})
		const showSnackbar = vi.fn()
		vi.doMock('@/forest/components/snackbar', () => ({ showSnackbar }))
		const button = await renderButton()
		await act(async () => {
			fireEvent.click(button)
			await import('./theme-panel').catch(() => null)
		})
		await waitFor(() => {
			expect(showSnackbar).toHaveBeenCalledWith('Couldn’t open Theme. Try again.')
		})
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		vi.doUnmock('./theme-panel')
		const dialog = await open(button)
		expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})

	it('keeps the rest of the app when the Theme surface fails to render', async () => {
		mockWindowClass(false)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		vi.doMock('@/forest/components/basic-dialog', () => ({
			BasicDialog: ({ open }: Readonly<{ open: boolean }>) => {
				if (open) {
					throw new Error('broken surface')
				}
				return null
			}
		}))
		const { ThemeButton } = await import('./theme-button')
		const { ThemePanelHost } = await import('./theme-panel-host')
		render(
			<main>
				<h1>Player 1’s turn</h1>
				<ThemeButton />
				<ThemePanelHost />
			</main>
		)
		act(() => {
			fireEvent.click(screen.getByRole('button', { name: 'Theme' }))
		})
		expect(screen.getByRole('heading', { name: 'Player 1’s turn' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('reuses the loaded panel when it is opened again, with no loading state', async () => {
		mockWindowClass(false)
		const button = await renderButton()
		await open(button)
		await screen.findByRole('radiogroup', { name: 'Theme' })
		fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Done' }))
		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
		act(() => {
			fireEvent.click(button)
		})
		expect(within(screen.getByRole('dialog')).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
	})
})
