import { AppBar } from '@/forest/components/app-bar'
import { IconButton } from '@/forest/components/icon-button'
import { GameBoard } from '@/shared/components/board/game-board'
import { engineService } from '@/shared/services/engine-service'
import { boardSize } from '@/shared/types/game'
import type { Column, MatchSetup } from '@/shared/types/game'

import { SetupStoreProvider, useSetupActions, useStep } from '../stores/setup-store-provider'

import { AgesForm } from './ages-form'
import { ColourForm } from './colour-form'

const emptyColumns: readonly Column[] = Array.from({ length: boardSize.columns }, () =>
	Array.from({ length: boardSize.rows }, () => null)
)

type SetupScreenProps = { onStart: (setup: MatchSetup) => void; onEngineError: () => void; onIntent: () => void }

export function SetupScreen(props: SetupScreenProps) {
	return (
		<SetupStoreProvider engine={engineService}>
			<SetupContent {...props} />
		</SetupStoreProvider>
	)
}

function SetupContent({ onStart, onEngineError, onIntent }: SetupScreenProps) {
	const step = useStep()
	const { changeAges } = useSetupActions()
	return (
		<div className="flex min-h-dvh flex-col">
			<AppBar
				title="Score 4"
				leading={step === 'colour' ? <IconButton icon="arrowBack" label="Back" onClick={changeAges} /> : null}
			/>
			<main className="flex flex-1 px-4 pt-4 pb-6 expanded:items-stretch expanded:justify-between expanded:gap-12 expanded:px-12 expanded:pt-0">
				<div className="w-full medium:mx-auto medium:max-w-form expanded:mx-0 expanded:self-center">
					{step === 'ages' ? (
						<AgesForm onEngineError={onEngineError} onIntent={onIntent} />
					) : (
						<ColourForm onStart={onStart} />
					)}
				</div>
				<div
					aria-hidden="true"
					className="hidden w-preview-pane shrink-0 items-center justify-center rounded-extra-large bg-surface-container-low expanded:flex"
				>
					<GameBoard columns={emptyColumns} alwaysCompact />
				</div>
			</main>
		</div>
	)
}
