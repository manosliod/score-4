import { Button } from '@/forest/components/button'
import { Icon } from '@/forest/components/icon'

import { GameLayout } from './game-layout'
import { StatusHeading } from './status-heading'

export function EngineError({ onRetry }: { onRetry: () => void }) {
	return (
		<GameLayout
			status={<StatusHeading headline="Something went wrong" />}
			board={
				<div
					role="alert"
					className="board-area flex flex-col items-center justify-center gap-4 rounded-large bg-surface-container-low px-6 text-center"
				>
					<Icon name="error" className="size-control text-error" />
					<p className="text-title-large text-on-surface">The game couldn’t start</p>
					<p className="text-body-medium text-on-surface-variant">
						The game engine didn’t load. Check your connection and try again.
					</p>
					<Button onClick={onRetry}>Try again</Button>
				</div>
			}
		/>
	)
}
