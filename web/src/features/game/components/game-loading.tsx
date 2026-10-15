import { LoadingIndicator } from '@/forest/components/loading-indicator'
import { PlayerList } from '@/shared/components/player-list'
import type { MatchSetup } from '@/shared/types/game'
import { colourNames, playerName } from '@/shared/types/players'

import { GameLayout } from './game-layout'
import { StatusHeading } from './status-heading'

export function GameLoading({ setup }: { setup: MatchSetup }) {
	return (
		<GameLayout
			status={
				<StatusHeading
					headline="Getting ready"
					supporting={`${playerName(setup.starter)} starts as ${colourNames[setup.colours[setup.starter]]}.`}
				/>
			}
			board={
				<div className="board-area flex flex-col items-center justify-center gap-4 rounded-large bg-surface-container-low">
					<LoadingIndicator />
					<p className="text-body-medium text-on-surface-variant">Getting the board ready…</p>
				</div>
			}
			players={
				<PlayerList setup={setup} active={setup.starter} className="expanded:flex-col expanded:items-start" />
			}
		/>
	)
}
