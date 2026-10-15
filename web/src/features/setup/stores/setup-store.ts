import { z } from 'zod'
import { createStore } from 'zustand/vanilla'

import type { EngineService } from '@/shared/services/engine-service'
import type { Colour, Engine, PlayerNumber } from '@/shared/types/game'

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
	}>
}>

export function createSetupStore(engine: EngineService) {
	return createStore<SetupState>()((set, get) => {
		const parseAges = (): readonly [number, number] | null => {
			const { ages } = get()
			const one = age.safeParse(ages[1])
			const two = age.safeParse(ages[2])
			if (!one.success || !two.success) {
				set({ errors: { 1: one.success ? null : ageError, 2: two.success ? null : ageError } })
				return null
			}
			return [one.data, two.data]
		}

		return {
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
					if (!parseAges()) {
						return 'invalid'
					}
					let loaded: Engine
					try {
						engine.retry()
						loaded = await engine.load()
					} catch {
						return 'engineError'
					}
					const parsed = parseAges()
					if (!parsed) {
						return 'invalid'
					}
					const [one, two] = parsed
					set({ starter: loaded.startingPlayer(one, two), sameAge: one === two, step: 'colour' })
					return 'colour'
				},
				pickColour: (colour) => {
					set({ starterColour: colour })
				},
				changeAges: () => {
					set({ step: 'ages' })
				}
			}
		}
	})
}

export type SetupStore = ReturnType<typeof createSetupStore>
