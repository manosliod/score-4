import type { ReactNode } from 'react'

type GameLayoutProps = { status: ReactNode; board: ReactNode; players?: ReactNode; actions?: ReactNode }

export function GameLayout({ status, board, players, actions }: GameLayoutProps) {
	return (
		<main className="flex flex-1 flex-col items-center gap-6 px-4 pt-4 pb-6 expanded:flex-row expanded:items-stretch expanded:gap-6 expanded:px-6 expanded:pt-0">
			<section
				aria-label="Game"
				className="contents expanded:flex expanded:w-side-pane expanded:shrink-0 expanded:flex-col expanded:gap-8 expanded:pt-6"
			>
				<div className="order-1 w-full medium:max-w-board-expanded">{status}</div>
				{players ? <div className="order-3">{players}</div> : null}
				{actions ? <div className="order-4">{actions}</div> : null}
			</section>
			<div className="board-pane order-2 flex justify-center expanded:flex-1 expanded:items-center expanded:rounded-extra-large expanded:bg-surface-container-low">
				{board}
			</div>
		</main>
	)
}
