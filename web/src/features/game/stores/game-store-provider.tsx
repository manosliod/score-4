import { createContext, use, useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from 'zustand'

import type { Engine, MatchSetup } from '@/shared/types/game'

import { createGameStore } from './game-store'
import type { GameState, GameStore } from './game-store'

const GameStoreContext = createContext<GameStore | null>(null)

type GameStoreProviderProps = { engine: Engine; setup: MatchSetup; children: ReactNode }

export function GameStoreProvider({ engine, setup, children }: GameStoreProviderProps) {
	const [store] = useState(() => createGameStore(engine, setup))
	return <GameStoreContext value={store}>{children}</GameStoreContext>
}

function useGameStore<T>(selector: (state: GameState) => T): T {
	const store = use(GameStoreContext)
	if (!store) {
		throw new Error('GameStoreProvider is missing')
	}
	return useStore(store, selector)
}

export const useGameSetup = () => useGameStore((state) => state.setup)
export const useGameStatus = () => useGameStore((state) => state.status)
export const useColumns = () => useGameStore((state) => state.columns)
export const useTurn = () => useGameStore((state) => state.turn)
export const useWinner = () => useGameStore((state) => state.winner)
export const useWinningLine = () => useGameStore((state) => state.winningLine)
export const useMoves = () => useGameStore((state) => state.moves)
export const useLastDrop = () => useGameStore((state) => state.lastDrop)
export const useRefusedColumn = () => useGameStore((state) => state.refusedColumn)
export const useAnnouncement = () => useGameStore((state) => state.announcement)
export const useGameActions = () => useGameStore((state) => state.actions)
