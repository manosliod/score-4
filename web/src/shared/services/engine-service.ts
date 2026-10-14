import type { MainModule, Match } from '@engine/score4_engine.js'

import { boardSize } from '@/shared/types/game'
import type {
	CellContent,
	Colour,
	DropResult,
	Engine,
	EngineMatch,
	MatchSetup,
	PlayerNumber
} from '@/shared/types/game'

type ModuleLoader = () => Promise<MainModule>

const loadModule: ModuleLoader = async () => {
	const { default: createEngine } = await import('@engine/score4_engine.js')
	return createEngine()
}

const releaseOnCollect = new FinalizationRegistry<Match>((match) => {
	if (!match.isDeleted()) {
		match.delete()
	}
})

function adapt(module: MainModule): Engine {
	const toPlayer = (player: PlayerNumber) => (player === 1 ? module.Player.One : module.Player.Two)
	const fromPlayer = (player: MainModule['Player'][keyof MainModule['Player']]): PlayerNumber =>
		player === module.Player.One ? 1 : 2
	const toDisc = (colour: Colour) => (colour === 'red' ? module.Disc.Red : module.Disc.Yellow)
	const cells = new Map<unknown, CellContent>([
		[module.Cell.Empty, null],
		[module.Cell.Red, 'red'],
		[module.Cell.Yellow, 'yellow']
	])
	const results = new Map<unknown, DropResult>([
		[module.MoveResult.Playing, 'playing'],
		[module.MoveResult.Won, 'won'],
		[module.MoveResult.Tie, 'tie'],
		[module.MoveResult.ColumnFull, 'columnFull'],
		[module.MoveResult.ColumnOutOfRange, 'columnOutOfRange']
	])

	const wrap = (match: Match): EngineMatch => {
		const wrapped: EngineMatch = {
			drop: (columnNumber) => results.get(match.drop(columnNumber)) ?? 'columnOutOfRange',
			columns: () =>
				Array.from({ length: boardSize.columns }, (_, column) =>
					Array.from({ length: boardSize.rows }, (_, row) => cells.get(match.cellAt(row, column)) ?? null)
				),
			turn: () => fromPlayer(match.turn()),
			winner: () => {
				const winner = match.winner()
				return winner === undefined ? null : fromPlayer(winner)
			},
			winningLine: () => match.winningLine() ?? [],
			dispose: () => {
				releaseOnCollect.unregister(wrapped)
				if (!match.isDeleted()) {
					match.delete()
				}
			}
		}
		releaseOnCollect.register(wrapped, match, wrapped)
		return wrapped
	}

	return {
		startingPlayer: (playerOneAge, playerTwoAge) => fromPlayer(module.startingPlayer(playerOneAge, playerTwoAge)),
		createMatch: ({ colours, starter }: MatchSetup) =>
			wrap(new module.Match(toDisc(colours[1]), toDisc(colours[2]), toPlayer(starter)))
	}
}

export type EngineService = { load(): Promise<Engine> }

export function createEngineService(loader: ModuleLoader = loadModule): EngineService {
	let pending: Promise<Engine> | null = null

	return {
		load() {
			pending ??= loader()
				.then(adapt)
				.catch((error: unknown) => {
					pending = null
					throw error
				})
			return pending
		}
	}
}

export const engineService = createEngineService()
