import type { Colour, MatchSetup, PlayerNumber } from './game'

export const colourNames = { red: 'Red', yellow: 'Yellow' } as const satisfies Record<Colour, string>

export const otherColour = (colour: Colour): Colour => (colour === 'red' ? 'yellow' : 'red')

export const otherPlayer = (player: PlayerNumber): PlayerNumber => (player === 1 ? 2 : 1)

export const playerName = (player: PlayerNumber) => `Player ${String(player)}`

export const matchSetupFor = (starter: PlayerNumber, starterColour: Colour): MatchSetup => {
	const other = otherColour(starterColour)
	return { starter, colours: starter === 1 ? { 1: starterColour, 2: other } : { 1: other, 2: starterColour } }
}
