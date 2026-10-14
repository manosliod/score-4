import { colourNames, playerName } from '@/shared/types/players'

import {
	useGameSetup,
	useGameStatus,
	useMoves,
	useRefusedColumn,
	useTurn,
	useWinner
} from '../stores/game-store-provider'

export function useStatusText() {
	const setup = useGameSetup()
	const status = useGameStatus()
	const turn = useTurn()
	const winner = useWinner() ?? turn
	const moves = useMoves()
	const refused = useRefusedColumn()

	switch (status) {
		case 'won':
			return {
				headline: `${playerName(winner)} wins!`,
				supporting: `Four in a row for ${colourNames[setup.colours[winner]]}, in ${String(moves)} moves.`
			}
		case 'tie':
			return { headline: 'It’s a tie', supporting: 'The board is full and nobody made four in a row.' }
		case 'playing': {
			const colour = colourNames[setup.colours[turn]]
			return {
				headline: `${playerName(turn)}’s turn`,
				supporting:
					refused === null
						? `${colour} · tap a column to drop a coin`
						: `${colour} · column ${String(refused)} is full`
			}
		}
		default: {
			const unreachable: never = status
			return unreachable
		}
	}
}
