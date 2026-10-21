import { Activity, useState } from 'react'

import { GameScreen, preloadGame } from '@/features/game/components/game-screen'
import { SetupScreen } from '@/features/setup/components/setup-screen'
import { SnackbarProvider } from '@/forest/components/snackbar'
import { ThemePanelHost } from '@/shared/components/theme/theme-panel-host'
import type { MatchSetup } from '@/shared/types/game'

type Screen = Readonly<{ name: 'setup' }> | Readonly<{ name: 'game'; setup: MatchSetup | null }>

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
				<GameScreen
					setup={screen.setup}
					onBack={showSetup}
					onNewPlayers={() => {
						setPlayers((current) => current + 1)
						showSetup()
					}}
				/>
			) : null}
			<ThemePanelHost />
		</SnackbarProvider>
	)
}
