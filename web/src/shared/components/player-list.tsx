import type { MatchSetup, PlayerNumber } from '@/shared/types/game'
import { otherPlayer } from '@/shared/types/players'

import { PlayerTag } from './player-tag'

type PlayerListProps = { setup: MatchSetup; active: PlayerNumber | null; className?: string }

export function PlayerList({ setup, active, className = '' }: PlayerListProps) {
	const order = [setup.starter, otherPlayer(setup.starter)]
	return (
		<ul aria-label="Players" className={`flex gap-2 ${className}`}>
			{order.map((player) => (
				<PlayerTag key={player} player={player} colour={setup.colours[player]} active={player === active} />
			))}
		</ul>
	)
}
