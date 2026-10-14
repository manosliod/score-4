import { Button } from '@/forest/components/button'
import { SegmentedButton } from '@/forest/components/segmented-button'
import { PlayerList } from '@/shared/components/player-list'
import type { Colour, MatchSetup } from '@/shared/types/game'
import { colourNames, otherPlayer, playerName } from '@/shared/types/players'

import {
	usePreviewSetup,
	useSameAge,
	useSetupActions,
	useStarter,
	useStarterColour
} from '../stores/setup-store-provider'

import { SetupHeading } from './setup-heading'

const options = [
	{ value: 'red', label: colourNames.red },
	{ value: 'yellow', label: colourNames.yellow }
] as const satisfies readonly { value: Colour; label: string }[]

export function ColourForm({ onStart }: { onStart: (setup: MatchSetup) => void }) {
	const starter = useStarter()
	const sameAge = useSameAge()
	const colour = useStarterColour()
	const preview = usePreviewSetup()
	const { pickColour, changeAges } = useSetupActions()
	const starterName = playerName(starter)
	const reason = sameAge ? 'You’re the same age, so Player 1 starts.' : `${starterName} is younger, so they start.`

	return (
		<div className="flex flex-col gap-6">
			<SetupHeading
				title={`${starterName} goes first`}
				text={`${reason} Pick their colour; ${playerName(otherPlayer(starter))} gets the other one.`}
			/>
			<SegmentedButton
				label={`${starterName}’s colour`}
				options={options}
				value={colour}
				onValueChange={pickColour}
			/>
			<PlayerList setup={preview} active={starter} className="flex-wrap" />
			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => {
						onStart(preview)
					}}
				>
					Start game
				</Button>
				<Button variant="text" onClick={changeAges}>
					Change ages
				</Button>
			</div>
		</div>
	)
}
