import type { Engine, MatchSetup } from '@/shared/types/game'

import { GameStoreProvider } from '../stores/game-store-provider'

import { GameView } from './game-view'

type GameRoundProps = { engine: Engine; setup: MatchSetup; onPlayAgain: () => void; onNewPlayers: () => void }

export function GameRound({ engine, setup, onPlayAgain, onNewPlayers }: GameRoundProps) {
	return (
		<GameStoreProvider engine={engine} setup={setup}>
			<GameView onPlayAgain={onPlayAgain} onNewPlayers={onNewPlayers} />
		</GameStoreProvider>
	)
}
