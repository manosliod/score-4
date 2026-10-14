import { Activity, lazy, Suspense, useState } from 'react'

import { SetupScreen } from '@/features/setup/components/setup-screen'
import { SnackbarProvider } from '@/forest/components/snackbar'
import type { MatchSetup } from '@/shared/types/game'

const loadGameScreen = () => import('@/features/game/components/game-screen')

const GameScreen = lazy(async () => ({ default: (await loadGameScreen()).GameScreen }))

type Screen = Readonly<{ name: 'setup' }> | Readonly<{ name: 'game'; setup: MatchSetup | null }>

const preloadGame = () => {
	void loadGameScreen()
}

export function App() {
	const [screen, setScreen] = useState<Screen>({ name: 'setup' })
	const [players, setPlayers] = useState(0)

	const showSetup = () => {
		setScreen({ name: 'setup' })
	}

	return (
		<SnackbarProvider>
			<Activity mode={screen.name === 'setup' ? 'visible' : 'hidden'}>
				<SetupScreen
					key={players}
					onIntent={preloadGame}
					onStart={(setup) => {
						setScreen({ name: 'game', setup })
					}}
					onEngineError={() => {
						setScreen({ name: 'game', setup: null })
					}}
				/>
			</Activity>
			{screen.name === 'game' ? (
				<Suspense>
					<GameScreen
						setup={screen.setup}
						onBack={showSetup}
						onNewPlayers={() => {
							setPlayers((current) => current + 1)
							showSetup()
						}}
					/>
				</Suspense>
			) : null}
		</SnackbarProvider>
	)
}
