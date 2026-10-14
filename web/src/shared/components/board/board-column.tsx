import type { KeyboardEvent, Ref } from 'react'

import type { Column } from '@/shared/types/game'

import { BoardCell } from './board-cell'

type BoardColumnProps = {
	number: number
	cells: Column
	winningRows: readonly number[]
	droppedRow: number | null
	interactive: boolean
	playable: boolean
	tabStop: boolean
	ref: Ref<HTMLDivElement>
	onDrop: (column: number) => void
	onKeyDown: (event: KeyboardEvent<HTMLDivElement>, column: number) => void
}

export function BoardColumn({
	number,
	cells,
	winningRows,
	droppedRow,
	interactive,
	playable,
	tabStop,
	ref,
	onDrop,
	onKeyDown
}: BoardColumnProps) {
	const free = cells.filter((cell) => cell === null).length
	return (
		<div
			ref={ref}
			role="gridcell"
			aria-label={`Column ${String(number)}, ${String(free)} free`}
			aria-disabled={playable ? undefined : true}
			tabIndex={tabStop ? 0 : -1}
			className={`board-column relative flex flex-col rounded-full ${playable ? 'state-layer cursor-pointer' : ''}`}
			onClick={() => {
				if (interactive) {
					onDrop(number)
				}
			}}
			onKeyDown={(event) => {
				onKeyDown(event, number)
			}}
		>
			{cells.map((cell, row) => (
				<BoardCell
					key={row}
					content={cell}
					row={row}
					winning={winningRows.includes(row)}
					dropped={droppedRow === row}
				/>
			))}
		</div>
	)
}
