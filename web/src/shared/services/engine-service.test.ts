import { describe, expect, it } from 'vitest'

import { aMatchSetup } from '@/testing/factories'

import { createEngineService, engineService } from './engine-service'

describe('engine service', () => {
	it('loads the engine once and shares it', async () => {
		const [first, second] = await Promise.all([engineService.load(), engineService.load()])
		expect(first).toBe(second)
	})

	it('lets the younger player start, and Player 1 on equal ages', async () => {
		const engine = await engineService.load()
		expect(engine.startingPlayer(30, 20)).toBe(2)
		expect(engine.startingPlayer(20, 30)).toBe(1)
		expect(engine.startingPlayer(25, 25)).toBe(1)
	})

	it('plays a match column by column and reports the winning line', async () => {
		const engine = await engineService.load()
		const match = engine.createMatch(aMatchSetup())
		const results = [1, 2, 1, 2, 1, 2, 1].map((column) => match.drop(column))
		expect(results.at(-1)).toBe('won')
		expect(match.winner()).toBe(2)
		expect(match.winningLine()).toEqual([
			{ row: 5, column: 0 },
			{ row: 4, column: 0 },
			{ row: 3, column: 0 },
			{ row: 2, column: 0 }
		])
		expect(match.columns()[0]).toEqual([null, null, 'red', 'red', 'red', 'red'])
		expect(match.drop(3)).toBe('gameOver')
	})

	it('tries again after a failed load when asked to', async () => {
		let attempts = 0
		const service = createEngineService(() => {
			attempts += 1
			return Promise.reject(new Error('offline'))
		})
		await expect(service.load()).rejects.toThrow('offline')
		service.retry()
		await expect(service.load()).rejects.toThrow('offline')
		expect(attempts).toBe(2)
	})
})
