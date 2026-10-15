import type { Colour, PlayerNumber } from '@/shared/types/game'
import { colourNames, playerName } from '@/shared/types/players'

import { Coin } from './coin'

type PlayerTagProps = { player: PlayerNumber; colour: Colour; active: boolean }

export function PlayerTag({ player, colour, active }: PlayerTagProps) {
	return (
		<li
			aria-current={active ? 'true' : undefined}
			className={`flex h-touch shrink-0 items-center gap-2 rounded-full pr-4 pl-3 ${active ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant'}`}
		>
			<Coin colour={colour} size="small" />
			<span className="flex flex-col whitespace-nowrap">
				<span className={`text-label-large ${active ? '' : 'text-on-surface'}`}>{playerName(player)}</span>
				<span className={`text-body-medium ${active ? '' : 'text-on-surface-variant'}`}>
					{colourNames[colour]}
				</span>
			</span>
		</li>
	)
}
