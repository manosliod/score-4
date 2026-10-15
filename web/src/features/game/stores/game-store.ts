import { createStore } from 'zustand/vanilla'

import { hideSnackbar, showSnackbar } from '@/forest/components/snackbar'
import { emptyColumns } from '@/shared/types/game'
import type { BoardPosition, Column, Engine, MatchSetup, PlayerNumber } from '@/shared/types/game'
import { colourNames, playerName } from '@/shared/types/players'

export type GameStatus = 'playing' | 'won' | 'tie'

export type GameState = Readonly<{
	setup: MatchSetup
	status: GameStatus
	columns: readonly Column[]
	turn: PlayerNumber
	winner: PlayerNumber | null
	winningLine: readonly BoardPosition[]
	moves: number
	lastDrop: BoardPosition | null
	refusedColumn: number | null
	announcement: string
	actions: Readonly<{ dropCoin: (column: number) => void }>
}>

export function createGameStore(engine: Engine, setup: MatchSetup) {
	const match = engine.createMatch(setup)

	return createStore<GameState>()((set, get) => ({
		setup,
		status: 'playing',
		columns: emptyColumns,
		turn: setup.starter,
		winner: null,
		winningLine: [],
		moves: 0,
		lastDrop: null,
		refusedColumn: null,
		announcement: '',
		actions: {
			dropCoin: (column) => {
				const state = get()
				if (state.status !== 'playing') {
					return
				}
				const result = match.drop(column)
				if (result === 'columnOutOfRange' || result === 'gameOver') {
					return
				}
				if (result === 'columnFull') {
					showSnackbar(`Column ${String(column)} is full. Pick another column.`)
					set({ refusedColumn: column, announcement: `Column ${String(column)} is full.` })
					return
				}
				hideSnackbar()
				const player = state.turn
				const dropped = match.column(column - 1)
				const columns = state.columns.with(column - 1, dropped)
				const row = dropped.findIndex((cell) => cell !== null)
				const turn = match.turn()
				const base = {
					columns,
					turn,
					moves: state.moves + 1,
					lastDrop: { row, column: column - 1 },
					refusedColumn: null
				}
				if (result === 'won') {
					set({
						...base,
						status: 'won',
						winner: match.winner(),
						winningLine: match.winningLine(),
						announcement: `${playerName(player)} wins with four in a row.`
					})
					return
				}
				if (result === 'tie') {
					set({ ...base, status: 'tie', announcement: 'It’s a tie.' })
					return
				}
				set({
					...base,
					announcement: `${colourNames[setup.colours[player]]} dropped in column ${String(column)}. ${playerName(turn)}’s turn.`
				})
			}
		}
	}))
}

export type GameStore = ReturnType<typeof createGameStore>
