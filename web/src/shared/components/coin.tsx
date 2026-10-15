import type { CSSProperties } from 'react'

import type { Colour } from '@/shared/types/game'

type CoinProps = { colour: Colour; size?: 'board' | 'small'; dropRows?: number | undefined }

const fills = {
	red: 'border-coin-red-ring bg-coin-red-fill',
	yellow: 'border-coin-yellow-ring bg-coin-yellow-fill'
} as const satisfies Record<Colour, string>

const marks = { red: 'bg-coin-red-mark', yellow: 'bg-coin-yellow-mark' } as const satisfies Record<Colour, string>

export function Coin({ colour, size = 'board', dropRows }: CoinProps) {
	const style = dropRows === undefined ? undefined : ({ '--drop-rows': dropRows } as CSSProperties)
	return (
		<span
			aria-hidden="true"
			className={`coin ${colour} coin-${size} ${fills[colour]} ${dropRows === undefined ? '' : 'dropped'} flex shrink-0 items-center justify-center rounded-full`}
			style={style}
		>
			<span className={`coin-mark ${marks[colour]}`} />
		</span>
	)
}
