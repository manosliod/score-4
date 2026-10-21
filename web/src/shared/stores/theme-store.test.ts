import { describe, expect, it, vi } from 'vitest'

import type { ThemeChoice } from '@/forest/theme'
import type { ThemeService } from '@/shared/services/theme-service'

import { createThemeStore } from './theme-store'

const aThemeService = (stored: ThemeChoice = 'system') => {
	const listeners = new Set<(theme: ThemeChoice) => void>()
	const service = {
		read: vi.fn(() => stored),
		save: vi.fn(),
		apply: vi.fn(),
		subscribe: (onChange: (theme: ThemeChoice) => void) => {
			listeners.add(onChange)
			return () => listeners.delete(onChange)
		}
	} satisfies ThemeService
	const otherTab = (theme: ThemeChoice) => {
		for (const listener of listeners) {
			listener(theme)
		}
	}
	return { service, otherTab }
}

describe('theme store', () => {
	it('starts on System by default', () => {
		expect(createThemeStore(aThemeService().service).getState().theme).toBe('system')
	})

	it('starts on the stored choice', () => {
		expect(createThemeStore(aThemeService('light').service).getState().theme).toBe('light')
	})

	it('saves and applies a choice at once', () => {
		const { service } = aThemeService()
		const store = createThemeStore(service)
		store.getState().actions.choose('dark')
		expect(store.getState().theme).toBe('dark')
		expect(service.save).toHaveBeenCalledWith('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
	})

	it('follows another tab while listening and applies without saving again', () => {
		const { service, otherTab } = aThemeService()
		const store = createThemeStore(service)
		const stop = store.getState().actions.listen()
		otherTab('dark')
		expect(store.getState().theme).toBe('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
		expect(service.save).not.toHaveBeenCalled()
		stop()
		otherTab('light')
		expect(store.getState().theme).toBe('dark')
	})

	it('re-reads storage each time it starts listening', () => {
		const { service } = aThemeService()
		const store = createThemeStore(service)
		service.read.mockReturnValue('light')
		const stop = store.getState().actions.listen()
		expect(store.getState().theme).toBe('light')
		expect(service.apply).toHaveBeenCalledWith('light')
		stop()
	})
})
