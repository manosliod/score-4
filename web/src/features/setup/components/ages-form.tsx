import { useActionState } from 'react'

import { Button } from '@/forest/components/button'
import { TextField } from '@/forest/components/text-field'
import type { PlayerNumber } from '@/shared/types/game'

import { useAge, useAgeError, useBothAgesEntered, useSetupActions } from '../stores/setup-store-provider'

import { SetupHeading } from './setup-heading'

type AgesFormProps = { onEngineError: () => void; onIntent: () => void }

export function AgesForm({ onEngineError, onIntent }: AgesFormProps) {
	const { submitAges } = useSetupActions()
	const ready = useBothAgesEntered()
	const [, submit, pending] = useActionState(async () => {
		onIntent()
		const result = await submitAges()
		if (result === 'engineError') {
			onEngineError()
		}
		return result
	}, null)

	return (
		<form action={submit} noValidate className="flex flex-col gap-6">
			<SetupHeading
				title="Who’s playing?"
				text="Enter both ages. The younger player goes first; if you’re the same age, Player 1 does."
			/>
			<div className="flex flex-col gap-1">
				<AgeField player={1} />
				<AgeField player={2} />
				<div className="flex justify-center pt-1 expanded:justify-start">
					<Button type="submit" disabled={!ready || pending}>
						Continue
					</Button>
				</div>
			</div>
		</form>
	)
}

function AgeField({ player }: { player: PlayerNumber }) {
	const value = useAge(player)
	const error = useAgeError(player)
	const { editAge } = useSetupActions()
	return (
		<TextField
			label={`Player ${String(player)} age`}
			supporting="Whole years"
			error={error}
			value={value}
			inputMode="numeric"
			enterKeyHint="next"
			maxLength={3}
			autoComplete="off"
			onChange={(event) => {
				editAge(player, event.target.value)
			}}
		/>
	)
}
