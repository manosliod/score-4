import { z } from 'zod'
import { createStore } from 'zustand/vanilla'

import type { EngineService } from '@/shared/services/engine-service'
import type { Colour, MatchSetup, PlayerNumber } from '@/shared/types/game'
import { matchSetupFor } from '@/shared/types/players'

export const ageError = 'Enter a whole number, like 12'

const age = z
	.string()
	.trim()
	.regex(/^\d{1,3}$/)
	.transform(Number)

export type SetupStep = 'ages' | 'colour'

export type AgesResult = 'colour' | 'invalid' | 'engineError'

type Ages = Readonly<Record<PlayerNumber, string>>

type Errors = Readonly<Record<PlayerNumber, string | null>>

export type SetupState = Readonly<{
	step: SetupStep
	ages: Ages
	errors: Errors
	starter: PlayerNumber
	sameAge: boolean
	starterColour: Colour
	actions: Readonly<{
		editAge: (player: PlayerNumber, value: string) => void
		submitAges: () => Promise<AgesResult>
		pickColour: (colour: Colour) => void
		changeAges: () => void
		matchSetup: () => MatchSetup
	}>
}>

export function createSetupStore(engine: EngineService) {
	return createStore<SetupState>()((set, get) => ({
		step: 'ages',
		ages: { 1: '', 2: '' },
		errors: { 1: null, 2: null },
		starter: 1,
		sameAge: false,
		starterColour: 'red',
		actions: {
			editAge: (player, value) => {
				const { ages, errors } = get()
				set({ ages: { ...ages, [player]: value }, errors: { ...errors, [player]: null } })
			},
			submitAges: async () => {
				const { ages } = get()
				const one = age.safeParse(ages[1])
				const two = age.safeParse(ages[2])
				if (!one.success || !two.success) {
					set({ errors: { 1: one.success ? null : ageError, 2: two.success ? null : ageError } })
					return 'invalid'
				}
				try {
					const loaded = await engine.load()
					set({
						starter: loaded.startingPlayer(one.data, two.data),
						sameAge: one.data === two.data,
						step: 'colour'
					})
					return 'colour'
				} catch {
					return 'engineError'
				}
			},
			pickColour: (colour) => {
				set({ starterColour: colour })
			},
			changeAges: () => {
				set({ step: 'ages' })
			},
			matchSetup: () => {
				const { starter, starterColour } = get()
				return matchSetupFor(starter, starterColour)
			}
		}
	}))
}

export type SetupStore = ReturnType<typeof createSetupStore>
