import type { MainModule, Match } from '@engine/score4_engine.js'
import { z } from 'zod'

import { boardSize } from '@/shared/types/game'
import type {
	BoardPosition,
	CellContent,
	Colour,
	DropResult,
	Engine,
	EngineMatch,
	MatchSetup,
	PlayerNumber
} from '@/shared/types/game'

import { loadOnce } from './load-once'
import type { Loader } from './load-once'

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

const enumOf = <T>(names: ReadonlyMap<number, T>) =>
	z.object({ value: z.number().int() }).transform(({ value }, context) => {
		const name = names.get(value)
		if (name === undefined) {
			context.addIssue({ code: 'custom', message: `Unknown engine value ${String(value)}`, input: value })
			return z.NEVER
		}
		return name
	})

const valuesOf = <T>(entries: readonly (readonly [{ value: number }, T])[]) =>
	new Map(entries.map(([entry, name]) => [entry.value, name]))

const position = z.object({
	row: z
		.number()
		.int()
		.min(0)
		.max(boardSize.rows - 1),
	column: z
		.number()
		.int()
		.min(0)
		.max(boardSize.columns - 1)
})

function schemasFor(module: MainModule) {
	const player = enumOf(
		valuesOf<PlayerNumber>([
			[module.Player.One, 1],
			[module.Player.Two, 2]
		])
	)
	const cell = enumOf(
		valuesOf<CellContent>([
			[module.Cell.Empty, null],
			[module.Cell.Red, 'red'],
			[module.Cell.Yellow, 'yellow']
		])
	)
	return {
		player,
		winner: player.optional().transform((winner) => winner ?? null),
		column: z.array(cell).length(boardSize.rows),
		winningLine: z
			.array(position)
			.length(4)
			.optional()
			.transform((line): readonly BoardPosition[] => line ?? []),
		result: enumOf(
			valuesOf<DropResult>([
				[module.MoveResult.Playing, 'playing'],
				[module.MoveResult.Won, 'won'],
				[module.MoveResult.Tie, 'tie'],
				[module.MoveResult.ColumnFull, 'columnFull'],
				[module.MoveResult.ColumnOutOfRange, 'columnOutOfRange'],
				[module.MoveResult.GameOver, 'gameOver']
			])
		)
	}
}

function adapt(module: MainModule): Engine {
	const schemas = schemasFor(module)
	const toPlayer = (player: PlayerNumber) => (player === 1 ? module.Player.One : module.Player.Two)
	const toDisc = (colour: Colour) => (colour === 'red' ? module.Disc.Red : module.Disc.Yellow)

	const wrap = (match: Match): EngineMatch => {
		const column = (index: number) => schemas.column.parse(match.column(index))
		const wrapped: EngineMatch = {
			drop: (columnNumber) => schemas.result.parse(match.drop(columnNumber)),
			column,
			columns: () => Array.from({ length: boardSize.columns }, (_, index) => column(index)),
			turn: () => schemas.player.parse(match.turn()),
			winner: () => schemas.winner.parse(match.winner()),
			winningLine: () => schemas.winningLine.parse(match.winningLine())
		}
		releaseOnCollect.register(wrapped, match)
		return wrapped
	}

	return {
		startingPlayer: (playerOneAge, playerTwoAge) =>
			schemas.player.parse(module.startingPlayer(playerOneAge, playerTwoAge)),
		createMatch: ({ colours, starter }: MatchSetup) =>
			wrap(new module.Match(toDisc(colours[1]), toDisc(colours[2]), toPlayer(starter)))
	}
}

export type EngineService = Loader<Engine>

export function createEngineService(loader: ModuleLoader = loadModule): EngineService {
	return loadOnce(async () => adapt(await loader()))
}

export const engineService = createEngineService()
