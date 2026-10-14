export const boardSize = { rows: 6, columns: 7 } as const

export const colours = ['red', 'yellow'] as const

export type Colour = (typeof colours)[number]

export type PlayerNumber = 1 | 2

export type CellContent = Colour | null

export type Column = readonly CellContent[]

export type BoardPosition = Readonly<{ row: number; column: number }>

export type DropResult = 'playing' | 'won' | 'tie' | 'columnFull' | 'columnOutOfRange'

export type MatchSetup = Readonly<{
	colours: Readonly<Record<PlayerNumber, Colour>>
	starter: PlayerNumber
}>

export type EngineMatch = {
	drop(columnNumber: number): DropResult
	columns(): readonly Column[]
	turn(): PlayerNumber
	winner(): PlayerNumber | null
	winningLine(): readonly BoardPosition[]
	dispose(): void
}

export type Engine = {
	startingPlayer(playerOneAge: number, playerTwoAge: number): PlayerNumber
	createMatch(setup: MatchSetup): EngineMatch
}
