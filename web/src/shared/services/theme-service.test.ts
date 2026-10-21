import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { aStorage } from '@/testing/window'

import { createThemeService } from './theme-service'

const blocked = () => {
	throw new DOMException('denied', 'SecurityError')
}

const aThemeService = (storage: Parameters<typeof createThemeService>[0]['storage']) =>
	createThemeService({ storage, root: () => document, events: () => window })

const metas = () =>
	[...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) =>
		meta.getAttribute('media')
	)

describe('theme service', () => {
	beforeEach(() => {
		document.head.innerHTML = `
			<meta name="theme-color" media="(prefers-color-scheme: light)" data-scheme="light" />
			<meta name="theme-color" media="(prefers-color-scheme: dark)" data-scheme="dark" />`
	})

	afterEach(() => {
		document.head.innerHTML = ''
		delete document.documentElement.dataset['theme']
	})

	it('reads System when nothing is stored', () => {
		const service = aThemeService(() => aStorage())
		expect(service.read()).toBe('system')
	})

	it('reads a stored choice and ignores anything else', () => {
		expect(aThemeService(() => aStorage('dark')).read()).toBe('dark')
		expect(aThemeService(() => aStorage('sepia')).read()).toBe('system')
	})

	it('falls back to System when storage cannot be read', () => {
		const service = aThemeService(blocked)
		expect(service.read()).toBe('system')
		const throwing = aThemeService(() => aStorage(null, { getItem: blocked }))
		expect(throwing.read()).toBe('system')
	})

	it('saves the choice under "theme" and survives a storage that refuses it', () => {
		const storage = aStorage()
		aThemeService(() => storage).save('light')
		expect(storage.setItem).toHaveBeenCalledWith('theme', 'light')
		const full = aThemeService(() => aStorage(null, { setItem: blocked }))
		expect(() => {
			full.save('dark')
		}).not.toThrow()
	})

	it('pins data-theme and the theme-color meta to a chosen theme', () => {
		const service = aThemeService(() => aStorage())
		service.apply('dark')
		expect(document.documentElement.dataset['theme']).toBe('dark')
		expect(metas()).toEqual(['not all', 'all'])
	})

	it('hands both back to the system on System, so a system change needs no script', () => {
		const service = aThemeService(() => aStorage())
		service.apply('light')
		service.apply('system')
		expect(document.documentElement.dataset['theme']).toBe('system')
		expect(metas()).toEqual(['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)'])
	})

	it('reports a change of "theme" in this storage from another tab until unsubscribed', () => {
		const service = aThemeService(() => localStorage)
		const onChange = vi.fn()
		const stop = service.subscribe(onChange)
		const change = (init: StorageEventInit) => {
			window.dispatchEvent(new StorageEvent('storage', init))
		}
		change({ key: 'theme', newValue: 'dark', storageArea: localStorage })
		change({ key: 'theme', newValue: 'light', storageArea: sessionStorage })
		change({ key: 'other', newValue: 'light', storageArea: localStorage })
		change({ key: 'theme', newValue: 'sepia', storageArea: localStorage })
		change({ key: null, newValue: null, storageArea: localStorage })
		expect(onChange.mock.calls).toEqual([['dark'], ['system'], ['system']])
		stop()
		change({ key: 'theme', newValue: 'dark', storageArea: localStorage })
		expect(onChange).toHaveBeenCalledTimes(3)
	})

	it('re-reads storage when the page comes back from the back-forward cache', () => {
		let stored = 'system'
		const service = aThemeService(() => aStorage(stored))
		const onChange = vi.fn()
		const stop = service.subscribe(onChange)
		stored = 'dark'
		window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }))
		expect(onChange).not.toHaveBeenCalled()
		window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
		expect(onChange).toHaveBeenCalledWith('dark')
		stop()
		window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
		expect(onChange).toHaveBeenCalledTimes(1)
	})
})
