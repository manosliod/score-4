import { useState } from 'react'
import type { ReactNode } from 'react'

import type { EngineService } from '@/shared/services/engine-service'
import type { PlayerNumber } from '@/shared/types/game'
import { matchSetupFor } from '@/shared/types/players'
import { createStoreContext } from '@/shared/utils/create-store-context'

import { createSetupStore } from './setup-store'
import type { SetupState } from './setup-store'

const { StoreContext: SetupStoreContext, useStoreSelector: useSetupStore } =
	createStoreContext<SetupState>('SetupStoreProvider')

type SetupStoreProviderProps = { engine: EngineService; children: ReactNode }

export function SetupStoreProvider({ engine, children }: SetupStoreProviderProps) {
	const [store] = useState(() => createSetupStore(engine))
	return <SetupStoreContext value={store}>{children}</SetupStoreContext>
}

export const useStep = () => useSetupStore((state) => state.step)
export const useAge = (player: PlayerNumber) => useSetupStore((state) => state.ages[player])
export const useAgeError = (player: PlayerNumber) => useSetupStore((state) => state.errors[player])
export const useBothAgesEntered = () =>
	useSetupStore((state) => state.ages[1].trim() !== '' && state.ages[2].trim() !== '')
export const useStarter = () => useSetupStore((state) => state.starter)
export const useSameAge = () => useSetupStore((state) => state.sameAge)
export const useStarterColour = () => useSetupStore((state) => state.starterColour)
export const usePreviewSetup = () => {
	const starter = useStarter()
	const colour = useStarterColour()
	return matchSetupFor(starter, colour)
}
export const useSetupActions = () => useSetupStore((state) => state.actions)
