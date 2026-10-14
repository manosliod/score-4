import { Suspense, use, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AppBar } from '@/forest/components/app-bar'
import { Dialog } from '@/forest/components/dialog'
import { IconButton } from '@/forest/components/icon-button'
import { engineService } from '@/shared/services/engine-service'
import type { MatchSetup } from '@/shared/types/game'

import { GameStoreProvider } from '../stores/game-store-provider'

import { EngineError } from './engine-error'
import { GameLoading } from './game-loading'
import { GameView } from './game-view'

type GameScreenProps = { setup: MatchSetup | null; onBack: () => void; onNewPlayers: () => void }

export function GameScreen({ setup, onBack, onNewPlayers }: GameScreenProps) {
	const [round, setRound] = useState(0)
	const [confirming, setConfirming] = useState(false)
	const nextRound = () => {
		setRound((current) => current + 1)
	}

	return (
		<div className="flex min-h-dvh flex-col">
			<AppBar
				title="Score 4"
				leading={<IconButton icon="arrowBack" label="Back" onClick={onBack} />}
				trailing={
					<IconButton
						icon="refresh"
						label="New game"
						onClick={() => {
							setConfirming(true)
						}}
					/>
				}
			/>
			{setup ? (
				<ErrorBoundary
					fallbackRender={({ resetErrorBoundary }) => <EngineError onRetry={resetErrorBoundary} />}
				>
					<Suspense fallback={<GameLoading setup={setup} />}>
						<LoadedGame key={round} setup={setup} onPlayAgain={nextRound} onNewPlayers={onNewPlayers} />
					</Suspense>
				</ErrorBoundary>
			) : (
				<EngineError onRetry={onBack} />
			)}
			<Dialog
				open={confirming}
				onOpenChange={setConfirming}
				title="Start a new game?"
				description="The board will be cleared. Players and colours stay the same."
				confirm="New game"
				onConfirm={nextRound}
			/>
		</div>
	)
}

type LoadedGameProps = { setup: MatchSetup; onPlayAgain: () => void; onNewPlayers: () => void }

function LoadedGame({ setup, onPlayAgain, onNewPlayers }: LoadedGameProps) {
	const engine = use(engineService.load())
	return (
		<GameStoreProvider engine={engine} setup={setup}>
			<GameView onPlayAgain={onPlayAgain} onNewPlayers={onNewPlayers} />
		</GameStoreProvider>
	)
}
