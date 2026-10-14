import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'

import { Icon } from './icon'

type Option<T extends string> = Readonly<{ value: T; label: string }>

type SegmentedButtonProps<T extends string> = {
	label: string
	options: readonly Option<T>[]
	value: T
	onValueChange: (value: T) => void
}

export function SegmentedButton<T extends string>({ label, options, value, onValueChange }: SegmentedButtonProps<T>) {
	return (
		<RadioGroup
			aria-label={label}
			value={value}
			onValueChange={(next) => {
				const option = options.find((candidate) => candidate.value === next)
				if (option) {
					onValueChange(option.value)
				}
			}}
			className="flex h-control w-full rounded-full border border-outline"
		>
			{options.map((option) => (
				<Radio.Root
					key={option.value}
					value={option.value}
					aria-label={option.label}
					className="state-layer target relative flex flex-1 cursor-pointer items-center justify-center gap-2 border-outline text-label-large text-on-surface first:rounded-l-full last:rounded-r-full not-first:border-l data-checked:bg-secondary-container data-checked:text-on-secondary-container"
				>
					<Radio.Indicator className="flex">
						<Icon name="check" className="size-icon-small" />
					</Radio.Indicator>
					<span aria-hidden="true">{option.label}</span>
				</Radio.Root>
			))}
		</RadioGroup>
	)
}
