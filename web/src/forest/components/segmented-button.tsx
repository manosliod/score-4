import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'

import { Icon } from './icon'
import type { IconName } from './icon'

type Option<T extends string> = Readonly<{ value: T; label: string; icon?: IconName }>

type SegmentedButtonProps<T extends string> = {
	label: string
	options: readonly Option<T>[]
	value: T
	onValueChange: (value: T) => void
	width?: 'fill' | 'hug'
}

const widths = {
	fill: 'flex w-full',
	hug: 'inline-grid auto-cols-fr grid-flow-col'
} as const satisfies Record<NonNullable<SegmentedButtonProps<string>['width']>, string>

export function SegmentedButton<T extends string>({
	label,
	options,
	value,
	onValueChange,
	width = 'fill'
}: SegmentedButtonProps<T>) {
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
			className={`h-control rounded-full border border-outline ${widths[width]}`}
		>
			{options.map((option) => (
				<Radio.Root
					key={option.value}
					value={option.value}
					aria-label={option.label}
					className="state-layer target relative flex flex-1 cursor-pointer items-center justify-center gap-2 border-outline pr-4 pl-3 text-label-large text-on-surface first:rounded-l-full last:rounded-r-full not-first:border-l data-checked:bg-secondary-container data-checked:text-on-secondary-container"
				>
					<SegmentIcon checked={option.value === value} icon={option.icon} />
					<span aria-hidden="true">{option.label}</span>
				</Radio.Root>
			))}
		</RadioGroup>
	)
}

function SegmentIcon({ checked, icon }: { checked: boolean; icon: IconName | undefined }) {
	if (checked) {
		return <Icon name="check" className="size-icon-small" />
	}
	return icon ? <Icon name={icon} className="size-icon-small" /> : null
}
