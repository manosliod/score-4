import { describe, expect, it, vi } from 'vitest'

import { engineService } from '@/shared/services/engine-service'
import { aMatchSetup, tieMoves } from '@/testing/factories'

import { createGameStore } from './game-store'

vi.mock('@/forest/components/snackbar', () => ({ showSnackbar: vi.fn() }))

const aGame = async (setup = aMatchSetup()) => createGameStore(await engineService.load(), setup)

const play = (store: Awaited<ReturnType<typeof aGame>>, columns: readonly number[]) => {
	columns.forEach((column) => {
		store.getState().actions.dropCoin(column)
	})
}

describe('game store', () => {
	it('starts with an empty board and the starter to move', async () => {
		const state = (await aGame()).getState()
		expect(state.status).toBe('playing')
		expect(state.turn).toBe(2)
		expect(state.columns.flat().every((cell) => cell === null)).toBe(true)
	})

	it('drops a coin, passes the turn and announces it', async () => {
		const store = await aGame()
		play(store, [3])
		const state = store.getState()
		expect(state.columns[2]?.[5]).toBe('red')
		expect(state.lastDrop).toEqual({ row: 5, column: 2 })
		expect(state.turn).toBe(1)
		expect(state.announcement).toBe('Red dropped in column 3. Player 1’s turn.')
	})

	it('keeps the columns that did not change, so only one column re-renders', async () => {
		const store = await aGame()
		const before = store.getState().columns
		play(store, [3])
		const after = store.getState().columns
		expect(after[0]).toBe(before[0])
		expect(after[2]).not.toBe(before[2])
	})

	it('refuses a full column and keeps the same player', async () => {
		const store = await aGame()
		play(store, [4, 4, 4, 4, 4, 4, 4])
		const state = store.getState()
		expect(state.refusedColumn).toBe(4)
		expect(state.turn).toBe(2)
		expect(state.moves).toBe(6)
		expect(state.announcement).toBe('Column 4 is full.')
	})

	it('ends with a win, the winning line and the move count, then ignores moves', async () => {
		const store = await aGame()
		play(store, [2, 2, 3, 3, 4, 4, 5, 6])
		const state = store.getState()
		expect(state.status).toBe('won')
		expect(state.winner).toBe(2)
		expect(state.moves).toBe(7)
		expect(state.winningLine).toHaveLength(4)
		expect(state.announcement).toBe('Player 2 wins with four in a row.')
	})

	it('ends in a tie when the board fills with no line', async () => {
		const store = await aGame(aMatchSetup({ starter: 1, colours: { 1: 'red', 2: 'yellow' } }))
		play(store, tieMoves)
		expect(store.getState().status).toBe('tie')
		expect(store.getState().announcement).toBe('It’s a tie.')
	})
})
