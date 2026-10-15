import { Suspense, use, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AppBar } from '@/forest/components/app-bar'
import { IconButton } from '@/forest/components/icon-button'
import { engineService } from '@/shared/services/engine-service'
import { loadOnce } from '@/shared/services/load-once'
import type { MatchSetup } from '@/shared/types/game'

import { EngineError } from './engine-error'
import { GameLoading } from './game-loading'

const gameRound = loadOnce(() => import('./game-round'))
const newGameDialog = loadOnce(() => import('./new-game-dialog'))

const retryAll = () => {
	engineService.retry()
	gameRound.retry()
	newGameDialog.retry()
}

export const preloadGame = () => {
	retryAll()
	gameRound.load().catch(() => null)
	newGameDialog.load().catch(() => null)
}

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
					onReset={retryAll}
					fallbackRender={({ resetErrorBoundary }) => <EngineError onRetry={resetErrorBoundary} />}
				>
					<Suspense fallback={<GameLoading setup={setup} />}>
						<LoadedGame key={round} setup={setup} onPlayAgain={nextRound} onNewPlayers={onNewPlayers} />
					</Suspense>
				</ErrorBoundary>
			) : (
				<EngineError onRetry={onBack} />
			)}
			<ErrorBoundary fallback={null}>
				<Suspense>
					<LazyNewGameDialog open={confirming} onOpenChange={setConfirming} onConfirm={nextRound} />
				</Suspense>
			</ErrorBoundary>
		</div>
	)
}

type LoadedGameProps = { setup: MatchSetup; onPlayAgain: () => void; onNewPlayers: () => void }

function LoadedGame({ setup, onPlayAgain, onNewPlayers }: LoadedGameProps) {
	const round = gameRound.load()
	const engine = use(engineService.load())
	const { GameRound } = use(round)
	return <GameRound engine={engine} setup={setup} onPlayAgain={onPlayAgain} onNewPlayers={onNewPlayers} />
}

type LazyNewGameDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }

function LazyNewGameDialog(props: LazyNewGameDialogProps) {
	const { NewGameDialog } = use(newGameDialog.load())
	return <NewGameDialog {...props} />
}
