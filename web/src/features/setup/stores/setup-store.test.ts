import { describe, expect, it } from 'vitest'

import { createEngineService, engineService } from '@/shared/services/engine-service'

import { ageError, createSetupStore } from './setup-store'

const withAges = (one: string, two: string, engine = engineService) => {
	const store = createSetupStore(engine)
	store.getState().actions.editAge(1, one)
	store.getState().actions.editAge(2, two)
	return store
}

describe('setup store', () => {
	it('flags an age that is not a whole number and stays on the step', async () => {
		const store = withAges('20', 'ten')
		expect(await store.getState().actions.submitAges()).toBe('invalid')
		expect(store.getState().errors).toEqual({ 1: null, 2: ageError })
		expect(store.getState().step).toBe('ages')
	})

	it('clears a field’s error when that field is edited', async () => {
		const store = withAges('20', 'ten')
		await store.getState().actions.submitAges()
		store.getState().actions.editAge(2, '1')
		expect(store.getState().errors[2]).toBeNull()
	})

	it('moves on with the younger player starting and the other colour for the other player', async () => {
		const store = withAges(' 30 ', '20')
		expect(await store.getState().actions.submitAges()).toBe('colour')
		store.getState().actions.pickColour('yellow')
		expect(store.getState().actions.matchSetup()).toEqual({ starter: 2, colours: { 1: 'red', 2: 'yellow' } })
	})

	it('marks equal ages so the colour step can say why Player 1 starts', async () => {
		const store = withAges('25', '25')
		await store.getState().actions.submitAges()
		expect(store.getState().starter).toBe(1)
		expect(store.getState().sameAge).toBe(true)
	})

	it('reports an engine that fails to load', async () => {
		const offline = createEngineService(() => Promise.reject(new Error('offline')))
		const store = withAges('30', '20', offline)
		expect(await store.getState().actions.submitAges()).toBe('engineError')
		expect(store.getState().step).toBe('ages')
	})
})
