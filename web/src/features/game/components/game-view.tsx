import { Button } from '@/forest/components/button'
import { GameBoard } from '@/shared/components/board/game-board'
import { PlayerList } from '@/shared/components/player-list'

import { useStatusText } from '../hooks/use-status-text'
import {
	useAnnouncement,
	useColumns,
	useGameActions,
	useGameSetup,
	useGameStatus,
	useLastDrop,
	useTurn,
	useWinner,
	useWinningLine
} from '../stores/game-store-provider'

import { GameLayout } from './game-layout'
import { StatusHeading } from './status-heading'

type GameViewProps = { onPlayAgain: () => void; onNewPlayers: () => void }

export function GameView({ onPlayAgain, onNewPlayers }: GameViewProps) {
	const setup = useGameSetup()
	const status = useGameStatus()
	const turn = useTurn()
	const winner = useWinner()
	const { dropCoin } = useGameActions()
	const { headline, supporting } = useStatusText()
	const ended = status !== 'playing'
	const active = status === 'won' ? winner : status === 'tie' ? null : turn

	return (
		<>
			<GameLayout
				status={<StatusHeading headline={headline} supporting={supporting} result={status === 'won'} />}
				board={<LiveBoard interactive={!ended} onDrop={dropCoin} />}
				players={
					<PlayerList setup={setup} active={active} className="expanded:flex-col expanded:items-start" />
				}
				actions={
					ended ? (
						<div className="flex gap-2">
							<Button onClick={onPlayAgain}>Play again</Button>
							<Button variant="outlined" onClick={onNewPlayers}>
								New players
							</Button>
						</div>
					) : null
				}
			/>
			<Announcer />
		</>
	)
}

function LiveBoard({ interactive, onDrop }: { interactive: boolean; onDrop: (column: number) => void }) {
	const columns = useColumns()
	const winningLine = useWinningLine()
	const lastDrop = useLastDrop()
	return (
		<GameBoard
			columns={columns}
			winningLine={winningLine}
			lastDrop={lastDrop}
			interactive={interactive}
			onDrop={onDrop}
		/>
	)
}

function Announcer() {
	const announcement = useAnnouncement()
	return (
		<p className="sr-only" aria-live="polite">
			{announcement}
		</p>
	)
}
