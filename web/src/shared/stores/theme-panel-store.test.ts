import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockWindowClass } from '@/testing/window'

import { createThemePanelStore } from './theme-panel-store'

describe('theme panel store', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('starts with no panel', () => {
		expect(createThemePanelStore().getState().panel).toBeNull()
	})

	it('opens a sheet on compact and a dialog from medium up', () => {
		const viewport = mockWindowClass(true)
		const store = createThemePanelStore()
		store.getState().actions.open()
		expect(store.getState().panel).toEqual({ variant: 'sheet', open: true })
		store.getState().actions.close()
		store.getState().actions.exited()
		viewport.resize(false)
		store.getState().actions.open()
		expect(store.getState().panel).toEqual({ variant: 'dialog', open: true })
	})

	it('keeps the panel mounted until its exit has finished', () => {
		mockWindowClass(false)
		const store = createThemePanelStore()
		store.getState().actions.open()
		store.getState().actions.close()
		expect(store.getState().panel).toEqual({ variant: 'dialog', open: false })
		store.getState().actions.exited()
		expect(store.getState().panel).toBeNull()
	})

	it('keeps the variant a panel has while it is open or closing, whatever the window class', () => {
		const viewport = mockWindowClass(true)
		const store = createThemePanelStore()
		store.getState().actions.open()
		viewport.resize(false)
		store.getState().actions.open()
		expect(store.getState().panel).toEqual({ variant: 'sheet', open: true })
		store.getState().actions.close()
		store.getState().actions.open()
		expect(store.getState().panel).toEqual({ variant: 'sheet', open: true })
		store.getState().actions.exited()
		expect(store.getState().panel).toEqual({ variant: 'sheet', open: true })
	})
	it('counts each open, including one during the exit, and not a press while open', () => {
		mockWindowClass(false)
		const store = createThemePanelStore()
		store.getState().actions.open()
		store.getState().actions.open()
		expect(store.getState().opens).toBe(1)
		store.getState().actions.close()
		store.getState().actions.open()
		expect(store.getState().opens).toBe(2)
		store.getState().actions.close()
		store.getState().actions.exited()
		store.getState().actions.open()
		expect(store.getState().opens).toBe(3)
	})
})
